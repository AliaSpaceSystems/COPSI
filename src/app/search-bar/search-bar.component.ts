import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Observable, Subscription } from 'rxjs';
import { ProductSearchService } from '../services/product-search.service';
import { saveAs } from 'file-saver';
import { AppConfig } from '../services/app.config';
import { HttpClient } from '@angular/common/http';

declare let $: any;
let listContainer: any;
let scrollThumb: any;

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  animations: [
    trigger('searchMenuAnimation', [
      state('open', style({
        'top': '3rem', 'opacity': 1
      })),
      state('closed', style({
        'top': '2.5rem', 'opacity': 0
      })),
      transition('closed => open', [
        animate('250ms ease-in')
      ]),
      transition('open => closed', [
        animate('250ms ease-out')
      ])
    ])
  ]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  productListSubscription!: Subscription;
  public showProductList: boolean = false;
  public productListRolled: boolean = false;

  @Input()
  public filter: string = "";

  public productList: any = {
    "@odata.count": 0,
    value: []
  };
  public fakeProductList: any;
  public productTotalNumber: number = 0;
  public productStartNumber: number = 0;
  public productEndNumber: number = 0;
  public currentPage: number = 0;
  public lastPage: number = 0;
  public prevPage: number = 0;
  public searchOptions: any;

  public listContainerTempWidth: any;
  public listIsReady: boolean = false;

  public showSimpleView: boolean = true;
  public showDetailedView: boolean = true;

  public scrollThumbPos: number = 0;
  public scrollCounter: number = 0;
  public scrollCounterThreshold: number = 1000;

  public thumbColorTimeout: any;

  constructor(private exchangeService: ExchangeService, private productSearch: ProductSearchService) {
  }

  ngOnInit(): void {
    listContainer = document.getElementById('list-items-container')!;
    let askNextPage: boolean = false;
    let askPrevPage: boolean = false;

    scrollThumb = document.getElementById('scroll-thumb');

    listContainer!.addEventListener('wheel', (e: any) => {

      if (askNextPage) {
        if (e.deltaY < 0) {
          askNextPage = false;
        }
        this.scrollCounter += e.deltaY;
        this.calcColorThumb();
        if (this.scrollCounter > this.scrollCounterThreshold) {
          this.currentPage += 1;
          this.scrollCounter = 0;
          askNextPage = false;
          this.loadPage(this.currentPage);
        }
      }
      if (askPrevPage) {
        if (e.deltaY > 0) {
          askPrevPage = false;
        }
        this.scrollCounter += e.deltaY;
        this.calcColorThumb();
        if (this.scrollCounter < -this.scrollCounterThreshold) {
          this.currentPage -= 1;
          this.scrollCounter = 0;
          askPrevPage = false;
          this.loadPage(this.currentPage);
        }
      }
    });
    listContainer!.addEventListener('scroll', (e: any) => {
      if (listContainer.offsetHeight + listContainer.scrollTop >= listContainer.scrollHeight-1) {
        if (this.currentPage < this.lastPage) {
          askNextPage = true;
        }
      }
      if (listContainer.scrollTop == 0) {
        if (this.currentPage > 0) {
          askPrevPage = true;
        }
      }
      this.calcThumbPos();
    });
  }

  ngOnDestroy(): void {
    this.productListSubscription.unsubscribe();
  }

  onSearch(event: any) {
    this.listIsReady = false;
    this.showProductList = true;
    this.currentPage = this.prevPage = 0;
    this.searchOptions = {
      filter: this.filter,
      top: AppConfig.settings.searchOptions.productsPerPage,
      skip: 0,
      order: AppConfig.settings.searchOptions.orderBy,
      sort: AppConfig.settings.searchOptions.sort
     }
    this.loadPage(this.currentPage);
    this.productListRolled = false;
    event.stopPropagation();
  }

  loadPage(page: number) {
    this.searchOptions.skip = page * this.searchOptions.top;

    let searchReturn = this.productSearch.search(this.searchOptions).subscribe(
      (res: any) => {
        this.productTotalNumber = res['@odata.count'];
        this.lastPage = Math.floor(this.productTotalNumber / this.searchOptions.top);
        console.log(res);
        if ("status" in res) { /* response error */
          this.productList = {
            "@odata.count": 0,
            value: []
          };
          this.showProductList = false;
          this.exchangeService.setProductList(this.productList);
        } else { /* got a list */
          this.productList = res;
          this.productList.value.forEach((product: any) => {
            product.tags = [];
            if ("Attributes" in product) {
              product.Attributes.forEach((attribute: any) => {
                if (attribute.Name == "platformShortName") {
                  product.platformShortName = attribute.Value;
                }
                if (attribute.Name == "platformSerialIdentifier") {
                  product.platformSerialIdentifier = attribute.Value;
                }
                AppConfig.settings.tags.forEach((tag: any) => {
                  if (attribute.Name == tag.name) {
                    product.tags.push({name: tag.name, value: attribute.Value, color: tag.color});
                  }
                });
              });
            }
          });
          this.exchangeService.setProductList(this.productList);
          this.listIsReady = true;
          this.productStartNumber = page * this.searchOptions.top + 1;
          this.productEndNumber = page * this.searchOptions.top + this.searchOptions.top;
          if (this.productEndNumber > this.productTotalNumber) {
            this.productEndNumber = this.productTotalNumber;
          }
          if (page > this.prevPage) {
            listContainer.scrollTop = 0;
          } else if (page < this.prevPage) {
            setTimeout(() => {
              listContainer.scrollTop = 99999;
            }, 10);
          } else {
            listContainer.scrollTop = 0;
          }
          this.prevPage = page;

          setTimeout(() => {
            var $listContainer = $('#list-items-container');
            var $listContainerCopy = $listContainer
                                  .clone()
                                  .css({display: 'inline', height: 'auto', visibility: 'hidden'})
                                  .appendTo('body');
            //console.log("listContainer ClientHeight: " + $listContainer.height());
            //console.log("listContainerCopy ClientHeight: " + $listContainerCopy.height());
            if ($listContainerCopy.height() > $listContainer.height() && this.productTotalNumber > 0) {
              scrollThumb.style.visibility = 'visible';
            } else {
              scrollThumb.style.visibility = 'hidden';
            }
            $listContainerCopy.remove();
            //this.calcThumbPos();
          }, 10);
        }
      }
    );
  }

  onShowHideButtonClick(event: any) {
    if (this.listIsReady) {
      let arrowIcon = document.getElementById('show-hide-list-icon')!;
      if (this.productListRolled) {
        this.productListRolled = false;
        listContainer.style.width = this.listContainerTempWidth+'px';
        scrollThumb.style.opacity = 1.0;
        arrowIcon.innerText =  "keyboard_arrow_left";
      } else {
        this.productListRolled = true;
        this.listContainerTempWidth = listContainer.offsetWidth;
        scrollThumb.style.opacity = 0.0;
        listContainer.style.width = '0';
        arrowIcon.innerText =  "keyboard_arrow_right";
      }
    }
    event.stopPropagation();
  }

  simplifyBytes(bytes: number) {
    let result: string = "";
    if (bytes > 1000000000) {
      return (bytes / 1000000000).toFixed(2) + " GB";
    } else if (bytes > 1000000) {
      return (bytes / 1000000).toFixed(2) + " MB";
    } else if (bytes > 1000) {
      return (bytes / 1000).toFixed(2) + " KB";
    }
    return result;
  }

  beautifyTag(tag:string) {
    return tag.replace(/_/g, " ");
  }

  setListView(view: string) {
    if (view === 'detailed') {
      this.showDetailedView = this.showSimpleView = true;
    } else if (view === 'simple') {
      this.showDetailedView = false;
      this.showSimpleView = true;
    } else {
      this.showDetailedView = false;
      this.showSimpleView = false;
    }
  }

  downloadProduct(id: string, name: string) {
    let downloadUrl: any = AppConfig.settings.baseUrl + `odata/v1/Products(${id})/$value`;
    this.productSearch.download(downloadUrl).subscribe(blob => saveAs(blob, name));
  }

  calcThumbPos() {
    this.scrollThumbPos = listContainer.scrollTop * (listContainer.clientHeight - scrollThumb!.clientHeight - 5) / (listContainer.scrollHeight - listContainer.offsetHeight);
    scrollThumb!.style.top = this.scrollThumbPos.toString() + 'px';
  }
  calcColorThumb() {
    clearTimeout(this.thumbColorTimeout);
    this.thumbColorTimeout = setTimeout(() => {
      this.scrollCounter = 0;
      scrollThumb!.style.backgroundColor = '#fff';
    }, 1000);
    let green = (255 - Math.round(Math.abs(this.scrollCounter) * 100 / this.scrollCounterThreshold)).toString(16).padStart(2, "0");
    let blue = (255 - Math.round(Math.abs(this.scrollCounter) * 155 / this.scrollCounterThreshold)).toString(16).padStart(2, "0");
    let color: string = '#ff' + green + blue;
    scrollThumb!.style.backgroundColor = color;
  }
}

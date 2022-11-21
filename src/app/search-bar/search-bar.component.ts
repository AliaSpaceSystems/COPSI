import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Observable, Subscription } from 'rxjs';
import { ProductSearchService } from '../services/product-search.service';
import { saveAs } from 'file-saver';
import { AppConfig } from '../services/app.config';
import { HttpClient } from '@angular/common/http';

declare let $: any;
let listDiv: any;

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
  public showSearchMenu = false;
  public showProductList = false;
  public productListRolled = false;

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
  public listContainerIsOpen: boolean = false;
  public listIsReady: boolean = false;

  public showSimpleView: boolean = true;
  public showDetailedView: boolean = true;

  constructor(private exchangeService: ExchangeService, private productSearch: ProductSearchService) {
  }

  ngOnInit(): void {
    listDiv = document.getElementById('list-items-container')!;
    let scrollPosWasMovedFromZero: boolean = false;
    let askNextPage: boolean = false;
    let askPrevPage: boolean = false;
    let scrollCounter = 0;

    document.getElementById('list-items-container')!.addEventListener('wheel', (e) => {
      if (askNextPage) {
        if (e.deltaY < 0) {
          askNextPage = false;
        }
        scrollCounter += e.deltaY;
        if (scrollCounter > 700) {
          this.currentPage += 1;
          scrollPosWasMovedFromZero = false;
          scrollCounter = 0;
          askNextPage = false;
          this.loadPage(this.currentPage);
        }
      }
      if (askPrevPage) {
        if (e.deltaY > 0) {
          askNextPage = false;
        }
        scrollCounter += e.deltaY;
        if (scrollCounter < -700) {
          this.currentPage -= 1;
          scrollPosWasMovedFromZero = false;
          scrollCounter = 0;
          askPrevPage = false;
          this.loadPage(this.currentPage);
        }
      }
    });
    document.getElementById('list-items-container')!.addEventListener('scroll', (e) => {
      if (listDiv.scrollTop > 0) {
        scrollPosWasMovedFromZero = true;
      }
      if (listDiv.offsetHeight + listDiv.scrollTop >= listDiv.scrollHeight-1) {
        if (this.currentPage < this.lastPage) {
          askNextPage = true;
        }
      }
      if (listDiv.scrollTop == 0 && scrollPosWasMovedFromZero == true) {
        if (this.currentPage > 0) {
          askPrevPage = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.productListSubscription.unsubscribe();
  }

  onSearchMenuClick(event: any) {
    this.showProductList = false;
    this.showSearchMenu = !this.showSearchMenu;
    event.stopPropagation();
  }

  onSearch(event: any) {
    this.listIsReady = false;
    this.showSearchMenu = false;
    this.showProductList = true;
    this.currentPage = 0;
    this.searchOptions = {
      filter: this.filter,
      top: 30,
      skip: 0,
      order: 'PublicationDate',
      sort: 'desc'
     }
    this.loadPage(this.currentPage);
    this.listContainerIsOpen = true;
    this.productListRolled = true;
    this.onShowHideButtonClick(event);
    event.stopPropagation();
  }

  onShowHideButtonClick(event: any) {
    let listContainer = document.getElementById('product-list-container')!;
    let listDiv = document.getElementById('product-list-div')!;
    let arrowIcon = document.getElementById('show-hide-list-icon')!;
    if (this.listContainerIsOpen) {
      if (this.productListRolled) {
        this.productListRolled = false;
        listContainer.style.width = this.listContainerTempWidth+'px';
        //listContainer.classList.remove('animate');
        listDiv.style.display = 'flex';
        arrowIcon.innerText =  "keyboard_arrow_left";
      } else {
        this.productListRolled = true;
        listContainer.style.width = '0';
        //listContainer.classList.add('animate');
        listDiv.style.display = 'none';
        arrowIcon.innerText =  "keyboard_arrow_right";
        this.listContainerTempWidth = listContainer.offsetWidth;
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

  loadPage(page: number) {
    this.searchOptions.skip = page * this.searchOptions.top;

    let searchReturn = this.productSearch.search(this.searchOptions).subscribe(
      (res: any) => {
        this.productTotalNumber = res['@odata.count'];
        this.lastPage = Math.floor(this.productTotalNumber / this.searchOptions.top);
        console.log(res);

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
                  product.tags.push({value: attribute.Value, color: tag.color});
                }
              });
            });
          }
        });
        this.exchangeService.setProductList(this.productList);
        /* this.productList.value.forEach((product: any) => {     //////////// da testare!!!
          this.productSearch.getQL(product.Id).subscribe(
            (res: any) => {
              console.log("HAS QL: " + res)
            }
          );
        }); */
        this.listIsReady = true;
        this.productStartNumber = page * this.searchOptions.top + 1;
        this.productEndNumber = page * this.searchOptions.top + this.searchOptions.top;
        if (this.productEndNumber > this.productTotalNumber) {
          this.productEndNumber = this.productTotalNumber;
        }
        if (page > this.prevPage) {
          listDiv.scrollTop = 0;
        } else if (page < this.prevPage) {
          setTimeout(() => {
            listDiv.scrollTop = 99999;
          }, 10);
        }
        this.prevPage = page;
      }
    );
  }

  downloadProduct(id: string, name: string) {
    let downloadUrl: any = AppConfig.settings.baseUrl + `odata/v1/Products(${id})/$value`;
    this.productSearch.download(downloadUrl).subscribe(blob => saveAs(blob, name));
  }

}

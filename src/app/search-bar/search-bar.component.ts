import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Observable, Subscription } from 'rxjs';
import { ProductSearchService } from '../services/product-search.service';
import { saveAs } from 'file-saver';
import { AppConfig } from '../services/app.config';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

declare let $: any;
let listContainer: any;
//let showHideButton: any;
let productListContainer: any;
let productListHeader: any;
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

  public lastViewStyle: string = "detailed";
  public showSimpleView: boolean = true;
  public showDetailedView: boolean = true;
  public lastListContainerHeight: number = 0;

  public scrollThumbPos: number = 0;
  public scrollCounter: number = 0;
  public scrollCounterThreshold: number = 750;
  public scrollThumbTempPos: number = 0;
  public scrollSize: number = 0;

  public thumbColorTimeout: any;

  constructor(
    private exchangeService: ExchangeService,
    private productSearch: ProductSearchService,
    private sanitizer: DomSanitizer
    ) {
  }

  sanitizeImageUrl(imageUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  ngOnInit(): void {
    window.addEventListener("resize", () => {this.setListView(this.lastViewStyle)});
    listContainer = document.getElementById('list-items-container')!;
    //showHideButton = document.getElementById('show-hide-button')!;
    productListHeader = document.getElementById('product-list-header');
    productListContainer = document.getElementById('product-list-container')!;
    let askNextPage: boolean = false;
    let askPrevPage: boolean = false;
    let wheelDeltaY: number = 0;
    scrollThumb = document.getElementById('scroll-thumb');
    this.dragElement(scrollThumb);

    listContainer!.addEventListener('wheel', (e: any) => {
      wheelDeltaY = e.deltaY;
      if (askNextPage) {
        if (wheelDeltaY < 0) {
          askNextPage = false;
        } else {
          this.scrollCounter += wheelDeltaY;
          this.calcColorThumb();
          if (this.scrollCounter > this.scrollCounterThreshold) {
            this.currentPage += 1;
            this.scrollCounter = 0;
            askNextPage = false;
            this.loadPage(this.currentPage);
          }
        }
      }
      if (askPrevPage) {
        if (wheelDeltaY > 0) {
          askPrevPage = false;
        } else {
          this.scrollCounter += wheelDeltaY;
          this.calcColorThumb();
          if (this.scrollCounter < -this.scrollCounterThreshold) {
            this.currentPage -= 1;
            this.scrollCounter = 0;
            askPrevPage = false;
            this.loadPage(this.currentPage);
          }
        }
      }
    });
    listContainer!.addEventListener('scroll', (e: any) => {
      askPrevPage = false;
      askNextPage = false;
      if (listContainer.offsetHeight + listContainer.scrollTop >= listContainer.scrollHeight - 1) {
        if (this.currentPage < this.lastPage) {
          askNextPage = true;
        }
      }
      if (listContainer.scrollTop < 1) {
        if (this.currentPage > 0) {
          askPrevPage = true;
        }
      }
      this.calcThumbPos();
      this.setThumbPos(this.scrollThumbPos);
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
            };
            this.productSearch.getQL(product.Id).subscribe(
              (res: any) => {
                console.log(res);
                if ("type" in res) {
                  product.hasQL = true;
                  product.qlURL = this.sanitizeImageUrl(URL.createObjectURL(res));
                  //console.log(product.qlURL);
                  // Test Search:  *S20220523T000611_N04*
                } else {
                  product.hasQl = false;
                  product.qlURL = "";
                }
              }
            );
          });
          this.exchangeService.setProductList(this.productList);
          this.listIsReady = true;
          this.productListRolled = true;
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
            //this.calcThumbSize();
            this.setListView(this.lastViewStyle);
            //this.lastListContainerHeight = buttonContainer.clientHeight;
            //console.log("Cont height: " + this.lastListContainerHeight);

            this.onShowHideButtonClick(null);
          }, 10);
          console.log("Product List:");

          console.log(this.productList);

        }
      }
    );
  }

  onShowHideButtonClick(event: any) {
    if (this.listIsReady) {
      let arrowIcon = document.getElementById('show-hide-list-icon')!;
      let listItemParentContainer = document.getElementById('list-items-parent-container');
      if (this.productListRolled) {
        this.productListRolled = false;
        listContainer.style.visibility = 'visible';
        listContainer.style.opacity = '1.0';
        productListHeader.style.visibility = 'visible';
        productListHeader.style.opacity = '1.0';
        productListContainer.style.left = '0.5rem';
        scrollThumb.style.visibility = 'visible';
        listItemParentContainer!.style.gap = '0 0.5rem';
        arrowIcon.innerText =  "keyboard_arrow_left";
      } else {
        this.productListRolled = true;
        listContainer.style.visibility = 'hidden';
        listContainer.style.opacity = '0.0';
        productListHeader.style.visibility = 'hidden';
        productListHeader.style.opacity = '0.0';
        productListContainer.style.left = (-productListContainer.clientWidth - scrollThumb.clientWidth - 2).toString() + 'px';
        scrollThumb.style.visibility = 'hidden';
        listItemParentContainer!.style.gap = '0 1.0rem';
        arrowIcon.innerText =  "keyboard_arrow_right";
      }
    }
    if (event != null) event.stopPropagation();
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
    this.lastViewStyle = view;
    setTimeout(() => {
      this.calcThumbSize();
      this.calcThumbPos();
      this.setThumbSize(this.scrollSize);
      this.setThumbPos(this.scrollThumbPos);
    }, 10);
  }

  downloadProduct(id: string, name: string) {
    let downloadUrl: any = AppConfig.settings.baseUrl + `odata/v1/Products(${id})/$value`;
    this.productSearch.download(downloadUrl).subscribe(blob => saveAs(blob, name));
  }

  calcThumbPos() {
    this.scrollThumbPos = listContainer.scrollTop * (listContainer.clientHeight - this.scrollSize - 3) / (listContainer.scrollHeight - listContainer.offsetHeight);
  }
  setThumbPos(pos: number) {
    scrollThumb!.style.top = pos.toString() + 'px';
  }
  calcThumbSize() {
    var $listContainer = $('#list-items-container');
    var $listContainerCopy = $listContainer
                          .clone()
                          .css({display: 'inline', height: 'auto', visibility: 'hidden'})
                          .appendTo('body');
    if ($listContainerCopy.height() > $listContainer.height() && this.productTotalNumber > 0) {
      scrollThumb.style.visibility = 'visible';
      this.scrollSize = $listContainer.height() * $listContainer.height() / $listContainerCopy.height();
    } else {
      scrollThumb.style.visibility = 'hidden';
    }
    $listContainerCopy.remove();
  }
  setThumbSize(size: number) {
    scrollThumb.style.height = size.toString() + "px";
  }
  calcColorThumb() {
    clearTimeout(this.thumbColorTimeout);
    this.thumbColorTimeout = setTimeout(() => {
      this.scrollCounter = 0;
      scrollThumb!.style.backgroundColor = '#fff';
    }, 500);
    let red = (255 - Math.round(Math.abs(this.scrollCounter) * 255 / this.scrollCounterThreshold)).toString(16).padStart(2, "0");
    let green = (255 - Math.round(Math.abs(this.scrollCounter) * 81 / this.scrollCounterThreshold)).toString(16).padStart(2, "0");
    let blue = (255 - Math.round(Math.abs(this.scrollCounter) * 16 / this.scrollCounterThreshold)).toString(16).padStart(2, "0");
    let color: string = '#' + red + green + blue;
    scrollThumb!.style.backgroundColor = color;
  }

  dragElement(elmnt: any) {
    var yDiff = 0, yPos = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e: any) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      yPos = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e: any) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      yDiff = yPos - e.clientY;
      yPos = e.clientY;
      // set the element's new position:
      //elmnt.style.top = (elmnt.offsetTop - yDiff) + "px";
      listContainer.scrollTop = listContainer.scrollTop - (yDiff * listContainer.scrollHeight / listContainer.clientHeight);
    }

    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}

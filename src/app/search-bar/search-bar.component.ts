import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Observable, Subscription, throwError } from 'rxjs';
import { ProductSearchService } from '../services/product-search.service';
import { saveAs } from 'file-saver';
import { AppConfig } from '../services/app.config';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastComponent } from '../toast/toast.component';
import { Download } from 'ngx-operators';

declare let $: any;
let listContainer: any;
let productListContainer: any;
let productListHeader: any;
let listItemDiv: HTMLCollectionOf<Element>;
let scrollThumb: any;
let detailedView: any;
let simpleView: any;
let minimalView: any;
let prevPageButton: any;
let nextPageButton: any;
let copsyBlueColor: string = '#00aeef';
let copsyBlueColor_RED: number = parseInt(copsyBlueColor.slice(1, 3), 16);
let copsyBlueColor_GREEN: number = parseInt(copsyBlueColor.slice(3, 5), 16);
let copsyBlueColor_BLUE: number = parseInt(copsyBlueColor.slice(5, 7), 16);

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
  public lastQlDivBGColor: string = "";
  public lastQlDivBorderColor: string = "";

  public scrollThumbPos: number = 0;
  public scrollCounter: number = 0;
  public scrollCounterThreshold: number = 750;
  public scrollThumbTempPos: number = 0;
  public scrollSize: number = 0;

  public thumbColorTimeout: any;

  download$: Observable<Download> | undefined

  constructor(
    private exchangeService: ExchangeService,
    private productSearch: ProductSearchService,
    private sanitizer: DomSanitizer,
    private clipboard: Clipboard,
    private toast: ToastComponent
    ) {
  }

  sanitizeImageUrl(imageUrl: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  ngOnInit(): void {

    window.addEventListener("resize", () => {
      this.setListView(this.lastViewStyle)
    });

    listContainer = document.getElementById('list-items-container')!;
    productListHeader = document.getElementById('product-list-header')!;
    productListContainer = document.getElementById('product-list-container')!;

    let askNextPage: boolean = false;
    let askPrevPage: boolean = false;
    let wheelDeltaY: number = 0;
    scrollThumb = document.getElementById('scroll-thumb')!;
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
      if (listContainer.clientHeight + listContainer.scrollTop >= listContainer.scrollHeight - 1) {
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
        //console.log(res);

        if ("status" in res) {
          /* response error */
          this.productList = {
            "@odata.count": 0,
            value: []
          };
          this.exchangeService.setProductList(this.productList);
        } else if (this.productTotalNumber == 0) {
          /* 0 products found */
          this.showProductList = true;
          this.listIsReady = true;
          this.productListRolled = true;

          this.productList = {
            "@odata.count": 0,
            value: []
          };
          this.exchangeService.setProductList(this.productList);

          setTimeout(() => {
            this.onShowHideButtonClick(null);
          }, 10);
        } else {
          /* got a list */
          this.productList = res;
          this.productList.value.forEach((product: any) => {
            product.download = {};
            product.tags = [];
            if ("Attributes" in product) {
              product.Attributes.forEach((attribute: any) => {
                if (attribute.Name == "platformShortName") {
                  product.platformShortName = attribute.Value;
                }
                if (attribute.Name == "platformSerialIdentifier") {
                  product.platformSerialIdentifier = attribute.Value;
                }
              });
              product.Attributes.forEach((attribute: any) => {
                AppConfig.settings.platformList.forEach((platform: any) => {
                  if (product.platformShortName == platform.name) {
                    platform.tags.forEach((tag: any) => {
                      if (attribute.Name == tag.name) {
                        product.tags.push({name: tag.name, value: attribute.Value, color: tag.color, title: tag.title});
                      }
                    });
                  }
                });
              });
            };
            this.productSearch.getQL(product.Id).subscribe(
              (res: any) => {
                //console.log(res);
                if ("type" in res) {
                  product.hasQL = true;
                  product.qlURL = this.sanitizeImageUrl(URL.createObjectURL(res));
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
            prevPageButton = document.getElementById('load-prev')!;
            nextPageButton = document.getElementById('load-next')!;

            /* Check if page buttons should be visible */
            if (this.currentPage == 0) {
              prevPageButton.style.visibility = 'hidden';
              if (this.currentPage < this.lastPage) {
                nextPageButton.style.visibility = 'visible';
              } else {
                nextPageButton.style.visibility = 'hidden';
              }
            } else if (this.currentPage == this.lastPage) {
              nextPageButton.style.visibility = 'hidden';
              if (this.currentPage > 0) {
                prevPageButton.style.visibility = 'visible';
              }
            } else {
              prevPageButton.style.visibility = nextPageButton.style.visibility = 'visible';
            }
            this.onShowHideButtonClick(null);
            this.setListView(this.lastViewStyle);
          }, 10);
        }
      }
    );
  }

  selectProduct(e:any) {
    //let selectedProductId = $(e.currentTarget).data('productid');
    //console.log("index: " + $(e.currentTarget).index());
    //this.exchangeService.selectProductOnMap(selectedProductId);
  }

  hoverProduct(e: any) {
    let hoveredProduct = $(e.currentTarget).index();
    this.exchangeService.showProductOnMap(hoveredProduct);
  }
  leaveProduct(e: any) {
    let hoveredProduct = -1;
    this.exchangeService.showProductOnMap(hoveredProduct);
  }

  loadPageFromButtons(page: number) {
    if (page == 1) {
      if (this.currentPage < this.lastPage) {
        nextPageButton.style.color = copsyBlueColor;
        this.currentPage += page;
        this.loadPage(this.currentPage);
        setTimeout(() => {nextPageButton.style.color = "white"}, 1000);
      }
    }
    if (page == -1) {
      if (this.currentPage > 0) {
        prevPageButton.style.color = copsyBlueColor;
        this.currentPage += page;
        this.loadPage(this.currentPage);
        setTimeout(() => {prevPageButton.style.color = "white"}, 1000);
      }
    }
  }

  onShowHideButtonClick(event: any) {
    if (this.listIsReady) {
      let arrowIcon = document.getElementById('show-hide-list-icon')!;
      let listItemParentContainer = document.getElementById('list-items-parent-container');
      if (this.productListRolled) {
        this.productListRolled = false;
        if (this.productTotalNumber > 0) {
          productListContainer.style.bottom = '0';
          listContainer.style.visibility = 'visible';
        } else {
          productListContainer.style.bottom = 'auto';
          listContainer.style.visibility = 'hidden';
        }
        listContainer.style.opacity = '1.0';
        productListHeader.style.visibility = 'visible';
        productListHeader.style.opacity = '1.0';
        productListContainer.style.left = '0.5rem';
        this.calcThumbSize();
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
    return tag.toString().replace(/_/g, " ");
  }

  setListView(view: string) {
    if (this.showProductList) {
      detailedView = document.getElementById('detailed-view')!;
      simpleView = document.getElementById('simple-view')!;
      minimalView = document.getElementById('minimal-view')!;
      var els = document.getElementsByClassName('ql-div')!;
      if (view === 'detailed') {
        this.showDetailedView = this.showSimpleView = true;
        detailedView.style.color = copsyBlueColor;
        simpleView.style.color = "white";
        minimalView.style.color = "white";
        [].forEach.call(els, (el:any) => {
          el.style.backgroundColor = this.lastQlDivBGColor;
          el.style.borderColor = this.lastQlDivBorderColor;
        });
      } else if (view === 'simple') {
        this.showDetailedView = false;
        this.showSimpleView = true;
        detailedView.style.color = "white";
        simpleView.style.color = copsyBlueColor;
        minimalView.style.color = "white";
        [].forEach.call(els, (el:any) => {
          el.style.backgroundColor = this.lastQlDivBGColor;
          el.style.borderColor = this.lastQlDivBorderColor;
        });
      } else {
        this.showDetailedView = false;
        this.showSimpleView = false;
        detailedView.style.color = "white";
        simpleView.style.color = "white";
        minimalView.style.color = copsyBlueColor;
        var tempEl = <HTMLElement>els[0];
        this.lastQlDivBGColor = tempEl.style.backgroundColor;
        this.lastQlDivBorderColor = tempEl.style.borderColor;
        [].forEach.call(els, (el: any)  => {
          el.style.backgroundColor = "transparent";
          el.style.border = "transparent";
        });
      }
      this.lastViewStyle = view;
      setTimeout(() => {
        this.calcThumbSize();
        this.calcThumbPos();
        this.setThumbSize(this.scrollSize);
        this.setThumbPos(this.scrollThumbPos);
      }, 10);
    }
  }

  downloadProduct(id: string, name: string) {
    this.toast.showInfoToast('success', 'PRODUCT DOWNLOADING..');
    let downloadUrl: any = AppConfig.settings.baseUrl + `odata/v1/Products(${id})/$value`;
    this.productSearch.download(downloadUrl, name).subscribe({
      next: (res: any) => {
        console.log(res);
        this.productList.value.forEach((product: any) => {
          if (product.Id == id) {
            product.download = res;
          }
        });
        //this.exchangeService.setProductList(this.productList);
      }
      , error: (e) => {
        this.productList.value.forEach((product: any) => {
          if (product.Id == id) {
            product.download = {};
          }
        });
        //this.exchangeService.setProductList(this.productList);
      }
    });
    /**/
  }

  calcThumbPos() {
    this.scrollThumbPos = listContainer.scrollTop * (listContainer.clientHeight - this.scrollSize) / (listContainer.scrollHeight - listContainer.clientHeight);
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

    let red = (255 - Math.round(Math.abs(this.scrollCounter) * (255 - copsyBlueColor_RED) / this.scrollCounterThreshold)).toString(16).padStart(2, "0");
    let green = (255 - Math.round(Math.abs(this.scrollCounter) * (255 - copsyBlueColor_GREEN) / this.scrollCounterThreshold)).toString(16).padStart(2, "0");
    let blue = (255 - Math.round(Math.abs(this.scrollCounter) * (255 - copsyBlueColor_BLUE) / this.scrollCounterThreshold)).toString(16).padStart(2, "0");
    let color: string = '#' + red + green + blue;
    scrollThumb!.style.backgroundColor = color;
  }

  dragElement(elmnt: any) {
    var yDiff = 0, yPos = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e: any) {
      e = e || window.event;
      e.preventDefault();
      yPos = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e: any) {
      e = e || window.event;
      e.preventDefault();
      yDiff = yPos - e.clientY;
      yPos = e.clientY;
      listContainer.scrollTop = listContainer.scrollTop - (yDiff * listContainer.scrollHeight / listContainer.clientHeight);
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  copyUrl(id: string) {
    let copyUrl: any = (AppConfig.settings.baseUrl) ? AppConfig.settings.baseUrl + `odata/v1/Products(${id})`: window.location.origin + `/odata/v1/Products(${id})`;
    this.clipboard.copy(copyUrl);
    this.toast.showInfoToast('success', 'PRODUCT URL COPIED!');
  }
}

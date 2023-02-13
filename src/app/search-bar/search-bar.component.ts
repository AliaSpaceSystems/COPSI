import { Component, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Observable, Subscription } from 'rxjs';
import { ProductSearchService } from '../services/product-search.service';
import { AppConfig } from '../services/app.config';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastComponent } from '../toast/toast.component';
import { Download } from 'ngx-operators';


declare let $: any;
let listContainer: any;
let productListContainer: any;
let productListHeader: any;
let productListScrollThumb: any;
let advancedSearchContainer: any;
let advancedSearchScrollThumb: any;
let filterOutputContainer: any;
let filterOutputScrollThumb: any;
let filterParsingDiv: any;
let detailedView: any;
let simpleView: any;
let minimalView: any;
let prevPageButton: any;
let nextPageButton: any;
let sensingStartEl: any;
let sensingStopEl: any;
let publicationStartEl: any;
let publicationStopEl: any;
let missionEl: any;
let copsyBlueColor: any;
let copsyBlueColor_RED: number;
let copsyBlueColor_GREEN: number;
let copsyBlueColor_BLUE: number;

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
  public productListSubscription!: Subscription;
  public showProductList: boolean = false;
  public productListRolled: boolean = false;
  public showAdvancedSearch: boolean = false;
  public sortByOptions = AppConfig.settings.searchOptions.sortByOptions;
  public sortBy: string = this.sortByOptions[0].value;
  public orderByOptions = AppConfig.settings.searchOptions.orderByOptions;
  public orderBy: string = this.orderByOptions[0].value;
  public advancedSearchElements = AppConfig.settings.advancedSearchElements;
  public advancedFilterIsActive: boolean = false;
  public advancedFilterOutputIsActive: boolean = false;
  public todayDate: string = '';

  @Input()
  public filter: string = "";
  public parsedFilter: string = "";
  public productFilter: string = "";
  public attributeFilter: string = "";
  public filterOutputIsVisible: boolean = false;
  public filterParsingDivIsPinned: boolean = false;
  public showParseFilterTimeoutId: any;

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

  public searchBarWidth: number = 0;
  public listContainerTempWidth: any;
  public listIsReady: boolean = false;

  public lastViewStyle: string = "detailed";
  public showSimpleView: boolean = true;
  public showDetailedView: boolean = true;
  public lastListContainerHeight: number = 0;
  public lastQlDivBGColor: string = "";
  public lastQlDivBorderColor: string = "";

  public scrollListThumbPos: number = 0;
  public scrollListCounter: number = 0;
  public scrollListCounterThreshold: number = 750;
  public scrollListThumbTempPos: number = 0;
  public scrollListSize: number = 0;
  public listThumbColorTimeout: any;

  public scrollSearchThumbPos: number = 0;
  public scrollSearchSize: number = 0;

  public scrollFilterThumbPos: number = 0;
  public scrollFilterSize: number = 0;

  download$: Observable<Download> | undefined
  public downloadSubscription: Map<String, Subscription> = new Map();

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
      this.setListView(this.lastViewStyle);
      this.checkAdvancedSearchThumbSize();
    });

    listContainer = document.getElementById('list-items-container')!;
    productListHeader = document.getElementById('product-list-header')!;
    productListContainer = document.getElementById('product-list-container')!;
    advancedSearchContainer = document.getElementById('advanced-search-scrollable-container')!;
    filterOutputContainer = document.getElementById('advanced-search-filter-output-scrollable-container')!;

    sensingStartEl = document.getElementById('sensing-start')!;
    sensingStopEl = document.getElementById('sensing-stop')!;
    publicationStartEl = document.getElementById('publication-start')!;
    publicationStopEl = document.getElementById('publication-stop')!;
    missionEl = document.getElementsByClassName('collapsible-section')!;

    let tempTodayDate = new Date();
    this.todayDate = [tempTodayDate.getFullYear(),
      (tempTodayDate.getMonth() + 1).toString().padStart(2, '0'),
      tempTodayDate.getDate().toString().padStart(2, '0')
    ].join('-');

    this.searchBarWidth = document.getElementById('search-bar-main-div')!.offsetWidth;
    copsyBlueColor = window.getComputedStyle(document.getElementById('get-properties-div')!).backgroundColor;
    let colorsOnly = copsyBlueColor.substring(
      copsyBlueColor.indexOf('(') + 1,
      copsyBlueColor.lastIndexOf(')')
    ).split(/,\s*/)
    copsyBlueColor_RED = colorsOnly[0];
    copsyBlueColor_GREEN = colorsOnly[1];
    copsyBlueColor_BLUE = colorsOnly[2];

    /* Product list scroll thumb */
    let askNextPage: boolean = false;
    let askPrevPage: boolean = false;
    let wheelListDeltaY: number = 0;
    productListScrollThumb = document.getElementById('product-list-scroll-thumb')!;
    this.dragElement(productListScrollThumb, listContainer);

    listContainer!.addEventListener('wheel', (e: any) => {
      wheelListDeltaY = e.deltaY;
      if (askNextPage) {
        if (wheelListDeltaY < 0) {
          askNextPage = false;
        } else {
          this.scrollListCounter += wheelListDeltaY;
          this.calcListThumbColor();
          if (this.scrollListCounter > this.scrollListCounterThreshold) {
            this.currentPage += 1;
            this.scrollListCounter = 0;
            askNextPage = false;
            this.loadPage(this.currentPage);
          }
        }
      }
      if (askPrevPage) {
        if (wheelListDeltaY > 0) {
          askPrevPage = false;
        } else {
          this.scrollListCounter += wheelListDeltaY;
          this.calcListThumbColor();
          if (this.scrollListCounter < -this.scrollListCounterThreshold) {
            this.currentPage -= 1;
            this.scrollListCounter = 0;
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
      this.scrollListThumbPos = this.calcThumbPos(listContainer, this.scrollListSize);
      this.setThumbPos(productListScrollThumb, this.scrollListThumbPos);
    });

    /* Advanced search scroll thumb */
    advancedSearchScrollThumb = document.getElementById('advanced-search-scroll-thumb')!;
    this.dragElement(advancedSearchScrollThumb, advancedSearchContainer);

    advancedSearchContainer!.addEventListener('scroll', (e: any) => {
      this.scrollSearchThumbPos = this.calcThumbPos(advancedSearchContainer, this.scrollSearchSize);
      this.setThumbPos(advancedSearchScrollThumb, this.scrollSearchThumbPos);
    });

    /* Filter Output scroll thumb */
    filterOutputScrollThumb = document.getElementById('filter-output-scroll-thumb')!;
    this.dragElement(filterOutputScrollThumb, filterOutputContainer);

    filterOutputContainer!.addEventListener('scroll', (e: any) => {
      this.scrollFilterThumbPos = this.calcThumbPos(filterOutputContainer, this.scrollFilterSize);
      this.setThumbPos(filterOutputScrollThumb, this.scrollFilterThumbPos);
    });
  }

  ngAfterViewInit(): void {
    /* Filter parsing while typing */
    filterParsingDiv = document.getElementById('filter-parsing-div')!;
    let typedFilter: any = document.getElementById('search-input')!;
    let parseFilterTimeoutId: any;

    typedFilter.addEventListener('input', (e: any) => {
      this.checkFilterParsingToggle();
      clearTimeout(parseFilterTimeoutId);
      parseFilterTimeoutId = setTimeout(() => {
        this.parsedFilter = this.productSearch.parseFilter(e.target.value);
      }, 500);
    })
  }

  ngOnDestroy(): void {
    this.productListSubscription.unsubscribe();
    if (this.downloadSubscription.size > 0) {
      this.downloadSubscription.forEach(sub => {
        sub.unsubscribe();
      });
    }
  }

  checkFilterParsingToggle() {
    if (this.showAdvancedSearch == false) {
      if (filterParsingDiv.classList.contains('filter-parsing-hidden')) {
        filterParsingDiv!.classList.replace('filter-parsing-hidden', 'filter-parsing-shown');
      }
      clearTimeout(this.showParseFilterTimeoutId);
      if (this.filterParsingDivIsPinned == false) {
        this.showParseFilterTimeoutId = setTimeout(() => {
          filterParsingDiv!.classList.replace('filter-parsing-shown', 'filter-parsing-hidden');
        }, AppConfig.settings.searchOptions.hideFilterOutputTimeout);
      }
    }
  }

  onShowAdvancedSearch(event: any) {
    let advancedSearchMenu = document.getElementById('advanced-search-menu');
    if (this.showAdvancedSearch) {
      this.showAdvancedSearch = false;
      this.productListRolled = true;
      setTimeout(() => {
        advancedSearchMenu!.style.visibility = 'hidden';
        if (this.filterParsingDivIsPinned) {
          this.checkFilterParsingToggle();
        }
      }, 250);
    } else {
      this.productListRolled = false;
      advancedSearchMenu!.style.visibility = 'visible';
      this.showAdvancedSearch = true;
      filterParsingDiv!.classList.replace('filter-parsing-shown', 'filter-parsing-hidden');
      this.checkAdvancedSearchThumbSize();
    }
    this.onShowHideButtonClick(null);


  }

  onFilterOutputToggle(event: any) {
    let filterOutput = document.getElementById('advanced-search-filter-output-scrollable-container')!;
    if (filterOutput.classList.contains('filter-output-hidden')) {
      filterOutput.classList.replace('filter-output-hidden', 'filter-output-visible');
      this.filterOutputIsVisible = true;
      setTimeout(() => {
        this.checkAdvancedSearchThumbSize();
        filterOutputScrollThumb.style.visibility = 'visible';
        advancedSearchScrollThumb.style.marginTop = '8.0rem';
      }, 300);

    } else {
      filterOutput.classList.replace('filter-output-visible', 'filter-output-hidden');
      filterOutputScrollThumb.style.visibility = 'hidden';
      this.filterOutputIsVisible = false;
      setTimeout(() => {
        this.checkAdvancedSearchThumbSize();
        advancedSearchScrollThumb.style.marginTop = '1.85rem';
      }, 300);
    }
  }

  onPushPinToggle (event: any) {
    let pinIcon = document.getElementById('pin-search-filter-output-icon')!;
    if (pinIcon.classList.contains('filter-parsing-unpinned')) {
      pinIcon.classList.replace('filter-parsing-unpinned', 'filter-parsing-pinned');
      this.filterParsingDivIsPinned = true;
      clearTimeout(this.showParseFilterTimeoutId);
    } else {
      pinIcon.classList.replace('filter-parsing-pinned', 'filter-parsing-unpinned');
      this.filterParsingDivIsPinned = false;
      this.showParseFilterTimeoutId = setTimeout(() => {
        filterParsingDiv!.classList.replace('filter-parsing-shown', 'filter-parsing-hidden');
      }, 5000);
    }
  }

  onAdvancedSearchClear(event: any) {
    let checkboxToClear = document.getElementsByClassName("checkbox");
    let selectsToClear = document.getElementsByClassName("select");
    let inputsToClear = document.getElementsByClassName("input");
    let datesToClear = document.getElementsByClassName("date");
    [].forEach.call(checkboxToClear, (el:any) => {
      if (el.checked) {
        el.click();
      }
    });
    [].forEach.call(selectsToClear, (el:any) => {
      el.selectedIndex = 0;
    });
    [].forEach.call(inputsToClear, (el:any) => {
      el.value = "";
    });
    [].forEach.call(datesToClear, (el:any) => {
      el.value = "";
    });
    this.productFilter = "";
    this.attributeFilter = "";
    this.advancedFilterOutputIsActive = false;
  }

  onAdvancedSearchSubmit(event: any) {
    this.parseAdvancedFilter();

    if (this.productFilter === "" && this.attributeFilter === "") {
      this.advancedFilterIsActive = false;
    } else {
      this.advancedFilterIsActive = true;
    }
    /* Hide Advanced Search Panel */
    let advancedSearchMenu = document.getElementById('advanced-search-menu');
    if (advancedSearchMenu!.style.visibility == 'visible') {
      this.onShowAdvancedSearch(event);
    }
    /* Send Search */
    this.onSearch(event);
  }

  onDateClicked(event: any) {
    event.target.showPicker();
  }

  onMissionFilterButtonClicked(event: any) {
    let header = event.target.closest(".collapsible-header-div");
    header.classList.toggle("active");
    var content = header.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
      let contentDiv = header.nextElementSibling;
      let selectsToClear = contentDiv.getElementsByTagName("select");
      let inputsToClear = contentDiv.getElementsByTagName("input");
      [].forEach.call(selectsToClear, (el:any) => {
        el.selectedIndex = 0;
      });
      [].forEach.call(inputsToClear, (el:any) => {
        el.value = "";
      });
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
    this.parseAdvancedFilter();
  }

  onSortByChanged(event: any) {
    this.sortBy = AppConfig.settings.searchOptions.sortByOptions.filter((option: any) => option.name === (event.target as HTMLInputElement).value)[0].value;
  }

  onOrderByChanged(event: any) {
    this.orderBy = AppConfig.settings.searchOptions.orderByOptions.filter((option: any) => option.name === (event.target as HTMLInputElement).value)[0].value;
  }

  parseAdvancedFilter() {
    /* Parse Product Filter (Content and Publication Periods) */
    this.productFilter = "";
    let bracketOpen: boolean = false;
    if (sensingStartEl.value !== "") {
      if (!bracketOpen) {
        this.productFilter += "(";
        bracketOpen = true;
      }
      this.productFilter += "ContentDate/Start ge " + sensingStartEl.value + "T00:00:00.000Z";
    }
    if (sensingStopEl.value !== "") {
      if (this.productFilter !== "") {
        this.productFilter += " and ";
      } else if (!bracketOpen) {
        this.productFilter += "(";
        bracketOpen = true;
      }
      this.productFilter += "ContentDate/End le " + sensingStopEl.value + "T23:59:59.999Z";
    }
    if (publicationStartEl.value !== "") {
      if (this.productFilter !== "") {
        this.productFilter += " and ";
      } else if (!bracketOpen) {
        this.productFilter += "(";
        bracketOpen = true;
      }
      this.productFilter += "PublicationDate ge " + publicationStopEl.value + "T00:00:00.000Z";
    }
    if (publicationStopEl.value !== "") {
      if (this.productFilter !== "") {
        this.productFilter += " and ";
      } else if (!bracketOpen) {
        this.productFilter += "(";
        bracketOpen = true;
      }
      this.productFilter += "PublicationDate le " + publicationStopEl.value + "T23:59:59.999Z";
    }
    if (bracketOpen) {
      this.productFilter += ")";
      bracketOpen = false;
    }
    //console.log("ProductFilter: " + this.productFilter);

    /* Parse Attribute Filter */
    this.attributeFilter = "";
    [].forEach.call(missionEl, (el:any, i:any) => {
      let bracketOpenInner: boolean = false;
      if (el.getElementsByTagName('input')[0].checked) {
        if (this.attributeFilter !== "") {
          this.attributeFilter += " or "
        }
        this.attributeFilter += "(";
        bracketOpenInner = true;
        this.attributeFilter += "Attributes/" + this.advancedSearchElements[i].attributeType +
          "/any(att:att/Name eq '" + this.advancedSearchElements[i].attributeName +
          "' and att/" + this.advancedSearchElements[i].attributeType + "/Value eq '" + this.advancedSearchElements[i].value + "')";
      }
      let contentDiv = el.getElementsByClassName('content');
      [].forEach.call(contentDiv, (missionDiv:any) => {
        let missionItems = missionDiv.getElementsByClassName('advanced-search-filter-div');
        [].forEach.call(missionItems, (item:any, k:any) => {
          let select = item.getElementsByTagName('select')[0];
          let value: string = "";
          if (select !== undefined) {
            value = select.value;
            if (value !== "") {
              this.attributeFilter += " and Attributes/" + this.advancedSearchElements[i].filters[k].attributeType +
                "/any(att:att/Name eq '" + this.advancedSearchElements[i].filters[k].attributeName +
                "' and att/" + this.advancedSearchElements[i].filters[k].attributeType + "/Value eq " +
                (this.advancedSearchElements[i].filters[k].attributeType === "OData.CSC.StringAttribute" ? "'" + value + "'" : value) + ")";
            }
          }

          let inputs = item.getElementsByTagName('input');
          [].forEach.call(inputs, (input:any) => {
            let gotValue: boolean = false;
            let value: string = "";
            let gotMinValue: boolean = false;
            let gotMaxValue: boolean = false;
            if (input !== undefined) {
              value = input.value;
              if (value !== "") {
                if (input.classList.contains("input-min")) {
                  gotMinValue = true;
                }
                if (input.classList.contains("input-max")) {
                  gotMaxValue = true;
                }
                gotValue = true;
              }
            }
            if (gotValue) {
              this.attributeFilter += " and Attributes/" + this.advancedSearchElements[i].filters[k].attributeType +
                "/any(att:att/Name eq '" + this.advancedSearchElements[i].filters[k].attributeName +
                "' and att/" + this.advancedSearchElements[i].filters[k].attributeType + (gotMinValue ? "/Value ge " : (gotMaxValue ? "/Value le " : "/Value eq ")) +
                (this.advancedSearchElements[i].filters[k].attributeType === "OData.CSC.StringAttribute" ? "'" + value + "'" : value) + ")";
            }
          });
        });
      });
      if (bracketOpenInner) {
        this.attributeFilter += ")";
        bracketOpenInner = false;
      }
    });
    if (this.productFilter === "" && this.attributeFilter === "") {
      this.advancedFilterOutputIsActive = false;
    } else {
      this.advancedFilterOutputIsActive = true;
    }
    //console.log("AttributeFilter: " + this.attributeFilter);
    setTimeout(() => {
      this.checkAdvancedSearchThumbSize();
    }, 200);
  }

  checkAdvancedSearchThumbSize() {
    this.calcSearchThumbSize();
    this.scrollSearchThumbPos = this.calcThumbPos(advancedSearchContainer, this.scrollSearchSize);
    this.setThumbSize(advancedSearchScrollThumb, this.scrollSearchSize);
    this.setThumbPos(advancedSearchScrollThumb, this.scrollSearchThumbPos);

    this.calcFilterThumbSize();
    this.scrollFilterThumbPos = this.calcThumbPos(filterOutputContainer, this.scrollFilterSize);
    this.setThumbSize(filterOutputScrollThumb, this.scrollFilterSize);
    this.setThumbPos(filterOutputScrollThumb, this.scrollFilterThumbPos);
  }

  onSearch(event: any) {
    this.listIsReady = false;
    this.showProductList = true;
    this.currentPage = this.prevPage = 0;
    this.searchOptions = {
      filter: this.filter,
      productFilter: this.productFilter,
      attributeFilter: this.attributeFilter,
      top: AppConfig.settings.searchOptions.productsPerPage,
      skip: 0,
      order: this.orderBy,
      sort: this.sortBy
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
            this.productSearch.getQL(product.Id).subscribe({
              next: (res: any) => {
                if ("type" in res) {
                  product.hasQL = true;
                  product.qlURL = this.sanitizeImageUrl(URL.createObjectURL(res));
                } else {
                  product.hasQl = false;
                  product.qlURL = "";
                }
              },
              error: (e) => {}
            });
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
              prevPageButton.style.opacity = '0.4';
              if (this.currentPage < this.lastPage) {
                nextPageButton.style.opacity = '1.0';
              } else {
                nextPageButton.style.opacity = '0.4';
              }
            } else if (this.currentPage == this.lastPage) {
              nextPageButton.style.opacity = '0.4';
              if (this.currentPage > 0) {
                prevPageButton.style.opacity = '1.0';
              }
            } else {
              prevPageButton.style.opacity = nextPageButton.style.opacity = '1.0';
            }
            this.onShowHideButtonClick(null);
            this.setListView(this.lastViewStyle);
          }, 10);
        }
      }
    );
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
      let listItemParentContainer = document.getElementById('list-items-parent-container')!;
      if (this.productListRolled) {
        this.productListRolled = false;
        this.showAdvancedSearch = false;
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
        this.calcListThumbSize();
        listItemParentContainer!.style.gap = '0 0.5rem';
      } else {
        this.productListRolled = true;
        listContainer.style.visibility = 'hidden';
        listContainer.style.opacity = '0.0';
        productListHeader.style.visibility = 'hidden';
        productListHeader.style.opacity = '0.0';
        productListContainer.style.left = (-productListContainer.clientWidth - productListScrollThumb.clientWidth - 2).toString() + 'px';
        productListScrollThumb.style.visibility = 'hidden';
        listItemParentContainer!.style.gap = '0 1.0rem';
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
        this.calcListThumbSize();
        this.scrollListThumbPos = this.calcThumbPos(listContainer, this.scrollListSize);
        this.setThumbSize(productListScrollThumb, this.scrollListSize);
        this.setThumbPos(productListScrollThumb, this.scrollListThumbPos);
      }, 10);
    }
  }

  downloadProduct(id: string, name: string) {
    this.toast.showInfoToast('success', 'DOWNLOADING PRODUCT...');
    let downloadUrl: any = AppConfig.settings.baseUrl + `odata/v1/Products(${id})/$value`;

    this.downloadSubscription.set(id ,this.productSearch.download(downloadUrl, name).subscribe({
        next: (res: any) => {
          this.productList.value.forEach((product: any) => {
            if (product.Id == id) {
              product.download = res;
            }
          });
        }
        , error: (e) => {
          this.productList.value.forEach((product: any) => {
            if (product.Id == id) {
              product.download = {};
            }
          });
        }
      })
    );
  }

  unsubscribeDownload(id: string) {
    if (this.downloadSubscription != null) {
      this.productList.value.forEach((product: any) => {
        if (product.Id == id) {
          product.download.state = null;
          this.downloadSubscription.get(id)!.unsubscribe();
          this.toast.showInfoToast('error', 'DOWNLOAD STOPPED!');
        }
      });
    }
  }

  calcListThumbSize() {
    if (listContainer.scrollHeight > listContainer.clientHeight) {
      productListScrollThumb.style.visibility = 'visible';
      this.scrollListSize = listContainer.clientHeight * listContainer.clientHeight / listContainer.scrollHeight;
    } else {
      productListScrollThumb.style.visibility = 'hidden';
    }
  }

  calcSearchThumbSize() {
    if (advancedSearchContainer.scrollHeight > advancedSearchContainer.clientHeight) {
      advancedSearchScrollThumb.style.visibility = 'visible';
      this.scrollSearchSize = advancedSearchContainer.clientHeight * advancedSearchContainer.clientHeight / advancedSearchContainer.scrollHeight;
    } else {
      advancedSearchScrollThumb.style.visibility = 'hidden';
    }
  }

  calcFilterThumbSize() {
    if (filterOutputContainer.scrollHeight > filterOutputContainer.clientHeight) {
      filterOutputScrollThumb.style.visibility = 'visible';
      this.scrollFilterSize = filterOutputContainer.clientHeight * filterOutputContainer.clientHeight / filterOutputContainer.scrollHeight;
    } else {
      filterOutputScrollThumb.style.visibility = 'hidden';
    }
  }

  calcListThumbColor() {
    clearTimeout(this.listThumbColorTimeout);
    this.listThumbColorTimeout = setTimeout(() => {
      this.scrollListCounter = 0;
      productListScrollThumb!.style.backgroundColor = '#fff';
    }, 500);

    let red = (255 - Math.round(Math.abs(this.scrollListCounter) * (255 - copsyBlueColor_RED) / this.scrollListCounterThreshold)).toString(16).padStart(2, "0");
    let green = (255 - Math.round(Math.abs(this.scrollListCounter) * (255 - copsyBlueColor_GREEN) / this.scrollListCounterThreshold)).toString(16).padStart(2, "0");
    let blue = (255 - Math.round(Math.abs(this.scrollListCounter) * (255 - copsyBlueColor_BLUE) / this.scrollListCounterThreshold)).toString(16).padStart(2, "0");
    let color: string = '#' + red + green + blue;
    productListScrollThumb!.style.backgroundColor = color;
  }

  calcThumbPos(container: any, scrollSize: any) {
     return container.scrollTop * (container.clientHeight - scrollSize) / (container.scrollHeight - container.clientHeight);
  }

  setThumbPos(el: any, pos: number) {
    el!.style.top = pos.toString() + 'px';
  }

  setThumbSize(el: any, size: number) {
    el.style.height = size.toString() + "px";
  }

  dragElement(elmnt: any, container: any) {
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
      container.scrollTop = container.scrollTop - (yDiff * container.scrollHeight / container.clientHeight);
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

  returnOptionNameFromValue(val: any, options: any) {
    return options.filter((option: any) => option.value === val)[0].name;
  }
}

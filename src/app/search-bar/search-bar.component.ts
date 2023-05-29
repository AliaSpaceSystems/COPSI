import { Component, Input, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { ExchangeService } from '../services/exchange.service';
import { Observable, Subscription } from 'rxjs';
import { ProductSearchService } from '../services/product-search.service';
import { AppConfig } from '../services/app.config';
import { DetailsConfig } from '../services/details.config';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastComponent } from '../toast/toast.component';
import { Download } from 'ngx-operators';

declare let $: any;
let listContainer: any;
let listItemDiv: any;
let productListContainer: any;
let productListHeader: any;
let productListScrollThumb: any;
let advancedSearchContainer: any;
let advancedSearchMenu: any;
let advancedSearchScrollThumb: any;
let filterOutputDiv: any;
let filterOutputScrollableDiv: any;
let filterOutputScrollThumb: any;
let productDetailContainer: any;
let productDetailScrollableDiv: any;
let productDetailScrollThumb: any;
let detailedView: any;
let simpleView: any;
let minimalView: any;
let prevPageButton: any;
let nextPageButton: any;
let copsyBlueColor: any;
let copsyBlueColor_RED: number;
let copsyBlueColor_GREEN: number;
let copsyBlueColor_BLUE: number;
let advancedSearchMagnifierIcon: any;
let advancedSearchSubmitIcon: any;

let footprintMenuContainer: any;
let footprintMenuScrollableDiv: any;
let footprintMenuScrollThumb: any;

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy, AfterViewInit {
  public productListSubscription!: Subscription;
  public showProductList: boolean = false;
  public productListRolled: boolean = false;
  public sortByOptions = AppConfig.settings.searchOptions.sortByOptions;
  public sortBy: string = this.sortByOptions[0].value;
  public orderByOptions = AppConfig.settings.searchOptions.orderByOptions;
  public orderBy: string = this.orderByOptions[0].value;
  public platformDetailsList = AppConfig.settings.platformDetailsList;
  public advancedFilterIsActive: boolean = false;
  public advancedFilterOutputIsActive: boolean = false;
  public todayDate: string = '';

  public sensingStartEl: any;
  public sensingStopEl: any;
  public publicationStartEl: any;
  public publicationStopEl: any;
  public missionEl: any;

  @Input()
  public filter: string = "";
  public parsedFilter: string = "";
  public productFilter: string = "";
  public attributeFilter: string = "";
  public geoFilter: string = "";
  public geoFilterIsActive: boolean = false;
  public filterOutputIsVisible: boolean = false;
  public filterOutputIsPinnedByDefault: boolean = AppConfig.settings.searchOptions.filterOutputIsPinnedByDefault;
  public filterParsingDivIsPinned: boolean = this.filterOutputIsPinnedByDefault;
  public showParseFilterTimeoutId: any;
  public filterParsingDivHeight: any;

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
  public canSubmitSearch: boolean = true;

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

  public scrollDetailThumbPos: number = 0;
  public scrollDetailSize: number = 0;

  public selectedProduct: any = [];
  public propertiesList: any = DetailsConfig.settings.Properties;
  public attributesList: any = DetailsConfig.settings.Attributes;
  //public precProductId: any;
  public Object = Object;
  public Array = Array;

  public footprintMenuTimeoutId: any;
  public hoveredProductShownArray: any[] = [];
  public footprintMenuThumbPos: number = 0;
  public footprintMenuSize: number = 0;

  download$: Observable<Download> | undefined
  public downloadSubscription: Map<String, Subscription> = new Map();

  updateGeoSearchSubscription!: Subscription;
  updateHoveredProductSubscription! : Subscription;
  zoomToListSubscription!: Subscription;
  showFootprintsMenuSubscription!: Subscription;

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
      setTimeout(() => {
        this.checkFilterOutputHeight();
        this.setListView(this.lastViewStyle);
        this.checkAdvancedSearchThumbSize();
      }, 250);
    });

    listContainer = document.getElementById('list-items-container')!;
    listItemDiv = document.getElementsByClassName('list-item-div')!;
    productListHeader = document.getElementById('product-list-header')!;
    productListContainer = document.getElementById('product-list-container')!;
    advancedSearchContainer = document.getElementById('advanced-search-scrollable-container')!;
    advancedSearchMenu = document.getElementById('advanced-search-menu')!;
    filterOutputDiv = document.getElementById('filter-output-div')!;
    filterOutputScrollableDiv = document.getElementById('filter-output-scrollable-div')!;
    this.sensingStartEl = document.getElementById('sensing-start')!;
    this.sensingStopEl = document.getElementById('sensing-stop')!;
    this.publicationStartEl = document.getElementById('publication-start')!;
    this.publicationStopEl = document.getElementById('publication-stop')!;
    this.missionEl = document.getElementsByClassName('collapsible-section')!;
    advancedSearchMagnifierIcon = document.getElementById('search-magnifier-icon')!;
    advancedSearchSubmitIcon = document.getElementById('advanced-search-submit-icon')!;
    productDetailContainer = document.getElementById('product-details-container')!;
    productDetailScrollableDiv = document.getElementById('product-details-inner-container')!;
    footprintMenuContainer = document.getElementById('footprint-menu-container')!;
    footprintMenuScrollableDiv = document.getElementById('footprint-menu-scrollable-div')!;

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
    this.dragElement(filterOutputScrollThumb, filterOutputScrollableDiv);

    filterOutputScrollableDiv!.addEventListener('scroll', (e: any) => {
      this.scrollFilterThumbPos = this.calcThumbPos(filterOutputScrollableDiv, this.scrollFilterSize);
      this.setThumbPos(filterOutputScrollThumb, this.scrollFilterThumbPos);
    });

    /* Product Detail scroll thumb */
    productDetailScrollThumb = document.getElementById('product-detail-scroll-thumb')!;
    this.dragElement(productDetailScrollThumb, productDetailScrollableDiv);

    productDetailScrollableDiv!.addEventListener('scroll', (e: any) => {
      this.scrollDetailThumbPos = this.calcThumbPos(productDetailScrollableDiv, this.scrollDetailSize);
      this.setThumbPos(productDetailScrollThumb, this.scrollDetailThumbPos);
    });

    /* Footprint Menu scroll thumb */
    footprintMenuScrollThumb = document.getElementById('footprints-menu-scroll-thumb')!;
    this.dragElement(footprintMenuScrollThumb, footprintMenuScrollableDiv);

    footprintMenuScrollableDiv!.addEventListener('scroll', (e: any) => {
      this.footprintMenuThumbPos = this.calcThumbPos(footprintMenuScrollableDiv, this.footprintMenuSize);
      this.setThumbPos(footprintMenuScrollThumb, this.footprintMenuThumbPos);
    });
  }

  ngAfterViewInit(): void {
    /* Filter parsing while typing */
    let searchFilterTextDiv: any = document.getElementById('search-input')!;
    let parseFilterTimeoutId: any;
    ['input', 'click'].forEach((inputEvent: any) => {
      searchFilterTextDiv.addEventListener(inputEvent, (e: any) => {
        this.checkFilterParsingToggle();
        clearTimeout(parseFilterTimeoutId);
        parseFilterTimeoutId = setTimeout(() => {
          this.parsedFilter = this.productSearch.parseFilter(e.target.value);
          setTimeout(() => {
            this.checkFilterOutputHeight();
          }, 50);
        }, 500);
      })
    });

    ['wheel', 'mousemove', 'click'].forEach((inputEvent: any) => {
      filterOutputDiv.addEventListener(inputEvent, (e: any) => {
        this.checkFilterParsingToggle();
        clearTimeout(parseFilterTimeoutId);
        parseFilterTimeoutId = setTimeout(() => {
          this.parsedFilter = this.productSearch.parseFilter(e.target.value);
          setTimeout(() => {
            this.checkFilterOutputHeight();
          }, 50);
        }, 500);
      })
    });

    this.updateGeoSearchSubscription = this.exchangeService.geoSearchOutputExchange.subscribe((value) => {
      if (typeof(value) === 'string') {
        this.geoSearchUpdate(value);
      }
    });
    this.updateHoveredProductSubscription = this.exchangeService.hoveredProductExchange.subscribe((value) => {
      this.updateHoveredProduct(value);
    });
    this.zoomToListSubscription = this.exchangeService.zoomToProductIdOnListExchange.subscribe((value) => {
      if (typeof(value) === 'string') {
        this.zoomToList(value);
      }
    });
    this.showFootprintsMenuSubscription = this.exchangeService.footprintMenuEventExchange.subscribe((value) => {
      this.showFootprintsMenu(value);
    });
  }

  ngOnDestroy(): void {
    this.productListSubscription.unsubscribe();
    this.updateGeoSearchSubscription.unsubscribe();
    this.updateHoveredProductSubscription.unsubscribe();
    this.zoomToListSubscription.unsubscribe();
    this.showFootprintsMenuSubscription.unsubscribe();
    if (this.downloadSubscription.size > 0) {
      this.downloadSubscription.forEach(sub => {
        sub.unsubscribe();
      });
    }
  }

  checkFilterOutputHeight() {
    this.filterParsingDivHeight = filterOutputDiv!.clientHeight;
    if (this.filterParsingDivIsPinned) {
      productListContainer!.style.top = (58 + this.filterParsingDivHeight) + 'px';
      advancedSearchMenu!.style.top = (58 + this.filterParsingDivHeight) + 'px';
      if (filterOutputDiv!.classList.contains('unpinned')) {
        filterOutputDiv!.classList.replace('unpinned', 'pinned');
      }
    }
    filterOutputScrollThumb.style.visibility = 'visible';
    this.checkFilterOutputThumbSize();
  }

  checkFilterParsingToggle() {
    /* Makes filter output visible for [configured] seconds or until it is pinned */
    if (filterOutputDiv!.classList.contains('hidden')) {
      filterOutputDiv!.classList.replace('hidden', 'visible');
    }
    clearTimeout(this.showParseFilterTimeoutId);
    if (this.filterParsingDivIsPinned == false) {
      this.showParseFilterTimeoutId = setTimeout(() => {
        filterOutputDiv!.classList.replace('visible', 'hidden');
      }, AppConfig.settings.searchOptions.hideFilterOutputTimeout);
    }
  }

  onShowAdvancedSearch(event: any) {
    if (advancedSearchMenu.classList.contains('hidden')) {
      advancedSearchMenu.classList.replace('hidden', 'visible');
      this.productListRolled = false;
    } else {
      advancedSearchMenu.classList.replace('visible', 'hidden');
      this.productListRolled = true;
    }
    this.onShowHideButtonClick(null);
    this.checkFilterOutputHeight();
    /* setTimeout(() => {
      this.checkFilterOutputHeight();
    }, 50); */
    setTimeout(() => {
      if (this.filterParsingDivIsPinned) {
        this.checkFilterParsingToggle();
      }
    }, 250);
  }

  onCopyOutputClicked (event: any) {
    let filterOutput: string = filterOutputScrollableDiv.textContent;
    //console.log(filterOutput);
    this.clipboard.copy(filterOutput);
    this.toast.showInfoToast('success', 'FILTER OUTPUT COPIED');
  }

  onPushPinToggle (event: any) {
    let pinIcon = document.getElementById('pin-search-filter-output-icon')!;
    if (pinIcon.classList.contains('unpinned')) {
      pinIcon.classList.replace('unpinned', 'pinned');
      this.filterParsingDivIsPinned = true;
      productListContainer!.style.top = (58 + this.filterParsingDivHeight) + 'px';
      advancedSearchMenu!.style.top = (58 + this.filterParsingDivHeight) + 'px';
      if (filterOutputDiv!.classList.contains('unpinned')) {
        filterOutputDiv!.classList.replace('unpinned', 'pinned');
      }
      clearTimeout(this.showParseFilterTimeoutId);
    } else {
      pinIcon.classList.replace('pinned', 'unpinned');
      this.filterParsingDivIsPinned = false;
      productListContainer!.style.top = (48) + 'px';
      advancedSearchMenu!.style.top = (48) + 'px';
      if (filterOutputDiv!.classList.contains('pinned')) {
        filterOutputDiv!.classList.replace('pinned', 'unpinned');
      }
      clearTimeout(this.showParseFilterTimeoutId);
      this.showParseFilterTimeoutId = setTimeout(() => {
        filterOutputDiv!.classList.replace('visible', 'hidden');
      }, 250);
    }
    setTimeout(() => {
      this.checkFilterOutputHeight();
      this.checkAdvancedSearchThumbSize();
    }, 300);
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
      el.setCustomValidity("");
    });
    [].forEach.call(datesToClear, (el:any) => {
      el.value = "";
      el.setCustomValidity("");
    });
    if (advancedSearchMagnifierIcon.classList.contains('invalid')) {
      advancedSearchMagnifierIcon.classList.remove('invalid');
    }
    if (advancedSearchSubmitIcon.classList.contains('invalid')) {
      advancedSearchSubmitIcon.classList.remove('invalid');
    }
    this.productFilter = "";
    this.attributeFilter = "";
    this.advancedFilterOutputIsActive = false;
  }

  onAdvancedSearchSubmit(event: any) {
    this.parseAdvancedFilter();
    if (this.canSubmitSearch) {
      if (this.productFilter === "" && this.attributeFilter === "") {
        this.advancedFilterIsActive = false;
      } else {
        this.advancedFilterIsActive = true;
      }

      /* Hide Advanced Search Panel */
      if (advancedSearchMenu.classList.contains('visible')) {
        this.onShowAdvancedSearch(event);
      }
      if (productListContainer.classList.contains('visible')) {
        this.onShowHideButtonClick(event);
      }

      /* Send Search */
      this.onSearch(event);
    } else {
      this.toast.showInfoToast('error', 'PLEASE CHECK INPUT: INVALID FIELDS');
    }
  }

  onDateClicked(event: any) {
    /* uncomment showPicker() to show picker calendar on date click */
    //event.target.showPicker();
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
    this.canSubmitSearch = true;
    if (advancedSearchSubmitIcon.classList.contains('invalid')) {
      advancedSearchSubmitIcon.classList.remove('invalid');
    }
    if (advancedSearchMagnifierIcon.classList.contains('invalid')) {
      advancedSearchMagnifierIcon.classList.remove('invalid');
    }

    if (this.sensingStartEl.value !== "") {
      if (this.sensingStopEl.value === "" || (this.sensingStartEl.value <= this.sensingStopEl.value)) {
        this.sensingStartEl.setCustomValidity("");
        if (!bracketOpen) {
          this.productFilter += "(";
          bracketOpen = true;
        }
        this.productFilter += "ContentDate/Start ge " + this.sensingStartEl.value + "T00:00:00.000Z";
      } else {
        advancedSearchSubmitIcon.classList.add('invalid');
        advancedSearchMagnifierIcon.classList.add('invalid');
        this.sensingStartEl.setCustomValidity("Please check Sensing Start Date: Start Date > Stop Date");
        this.canSubmitSearch = false;
      }
    }
    if (this.sensingStopEl.value !== "") {
      if (this.sensingStartEl.value === "" || (this.sensingStartEl.value <= this.sensingStopEl.value)) {
        this.sensingStopEl.setCustomValidity("");
        if (this.productFilter !== "") {
          this.productFilter += " and ";
        } else if (!bracketOpen) {
          this.productFilter += "(";
          bracketOpen = true;
        }
        this.productFilter += "ContentDate/End le " + this.sensingStopEl.value + "T23:59:59.999Z";
      } else {
        advancedSearchSubmitIcon.classList.add('invalid');
        advancedSearchMagnifierIcon.classList.add('invalid');
        this.sensingStopEl.setCustomValidity("Please check Sensing Stop Date: Stop Date < Start Date");
        this.canSubmitSearch = false;
      }
    }

    if (this.publicationStartEl.value !== "") {
      if (this.publicationStopEl.value === "" || (this.publicationStartEl.value <= this.publicationStopEl.value)) {
        this.publicationStartEl.setCustomValidity("");
        if (this.productFilter !== "") {
          this.productFilter += " and ";
        } else if (!bracketOpen) {
          this.productFilter += "(";
          bracketOpen = true;
        }
        this.productFilter += "PublicationDate ge " + this.publicationStartEl.value + "T00:00:00.000Z";
      } else {
        advancedSearchSubmitIcon.classList.add('invalid');
        advancedSearchMagnifierIcon.classList.add('invalid');
        this.publicationStartEl.setCustomValidity("Please check Publication Start Date: Start Date > Stop Date");
        this.canSubmitSearch = false;
      }
    }
    if (this.publicationStopEl.value !== "") {
      if (this.publicationStartEl.value === "" || (this.publicationStartEl.value <= this.publicationStopEl.value)) {
        this.publicationStopEl.setCustomValidity("");
        if (this.productFilter !== "") {
          this.productFilter += " and ";
        } else if (!bracketOpen) {
          this.productFilter += "(";
          bracketOpen = true;
        }
        this.productFilter += "PublicationDate le " + this.publicationStopEl.value + "T23:59:59.999Z";
      } else {
        advancedSearchSubmitIcon.classList.add('invalid');
        advancedSearchMagnifierIcon.classList.add('invalid');
        this.publicationStopEl.setCustomValidity("Please check Publication Stop Date: Stop Date < Start Date");
        this.canSubmitSearch = false;
      }
    }
    if (bracketOpen) {
      this.productFilter += ")";
      bracketOpen = false;
    }
    //console.log("ProductFilter: " + this.productFilter);

    /* Parse Attribute Filter */
    this.attributeFilter = "";
    [].forEach.call(this.missionEl, (el:any, i:any) => {
      let bracketOpenInner: boolean = false;
      if (el.getElementsByTagName('input')[0].checked) {
        if (this.attributeFilter !== "") {
          this.attributeFilter += " or "
        }
        this.attributeFilter += "(";
        bracketOpenInner = true;
        this.attributeFilter += "Attributes/" + this.platformDetailsList[i].attributeType +
          "/any(att:att/Name eq '" + this.platformDetailsList[i].attributeName +
          "' and att/" + this.platformDetailsList[i].attributeType + "/Value eq '" + this.platformDetailsList[i].value + "')";
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
              this.attributeFilter += " and Attributes/" + this.platformDetailsList[i].filters[k].attributeType +
                "/any(att:att/Name eq '" + this.platformDetailsList[i].filters[k].attributeName +
                "' and att/" + this.platformDetailsList[i].filters[k].attributeType + "/Value eq " +
                (this.platformDetailsList[i].filters[k].attributeType === "OData.CSC.StringAttribute" ? "'" + value + "'" : value) + ")";
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
                  let maxValueEl = this.getNextSibling(input, ".input-max")!;
                  if(maxValueEl.value === "" || Number(maxValueEl.value) >= Number(input.value)) {
                    gotMinValue = true;
                    gotValue = true;
                    input.setCustomValidity("");
                  } else {
                    advancedSearchSubmitIcon.classList.add('invalid');
                    advancedSearchMagnifierIcon.classList.add('invalid');
                    input.setCustomValidity("Please check input: Min Value > Max Value");
                    this.canSubmitSearch = false;
                  }
                }
                if (input.classList.contains("input-max")) {
                  let minValueEl = this.getPreviousSibling(input, ".input-min")!;
                  if(minValueEl.value === "" || Number(minValueEl.value) <= Number(input.value)) {
                    gotMaxValue = true;
                    gotValue = true;
                    input.setCustomValidity("");
                  } else {
                    advancedSearchSubmitIcon.classList.add('invalid');
                    advancedSearchMagnifierIcon.classList.add('invalid');
                    input.setCustomValidity("Please check input: Max Value < Min Value");
                    this.canSubmitSearch = false;
                  }
                } else {
                  gotValue = true;
                }
              }
            }
            if (gotValue) {
              this.attributeFilter += " and Attributes/" + this.platformDetailsList[i].filters[k].attributeType +
                "/any(att:att/Name eq '" + this.platformDetailsList[i].filters[k].attributeName +
                "' and att/" + this.platformDetailsList[i].filters[k].attributeType + (gotMinValue ? "/Value ge " : (gotMaxValue ? "/Value le " : "/Value eq ")) +
                (this.platformDetailsList[i].filters[k].attributeType === "OData.CSC.StringAttribute" ? "'" + value + "'" : value) + ")";
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

    this.checkFilterParsingToggle();
    setTimeout(() => {
      this.checkFilterOutputHeight();
      this.checkAdvancedSearchThumbSize();
    }, 200);
  }

  getNextSibling(elem: any, selector: any) {
    var sibling = elem.nextElementSibling;
    if (!selector) return sibling;
    while (sibling) {
      if (sibling.matches(selector)) return sibling;
      sibling = sibling.nextElementSibling
    }
  };
  getPreviousSibling(elem: any, selector: any) {
    var sibling = elem.previousElementSibling;
    if (!selector) return sibling;
    while (sibling) {
      if (sibling.matches(selector)) return sibling;
      sibling = sibling.previousElementSibling;
    }
  };


  checkAdvancedSearchThumbSize() {
    this.calcSearchThumbSize();
    this.setThumbSize(advancedSearchScrollThumb, this.scrollSearchSize);
    this.scrollSearchThumbPos = this.calcThumbPos(advancedSearchContainer, this.scrollSearchSize);
    this.setThumbPos(advancedSearchScrollThumb, this.scrollSearchThumbPos);
  }

  checkFilterOutputThumbSize() {
    this.calcFilterThumbSize();
    this.setThumbSize(filterOutputScrollThumb, this.scrollFilterSize);
    this.scrollFilterThumbPos = this.calcThumbPos(filterOutputScrollableDiv, this.scrollFilterSize);
    this.setThumbPos(filterOutputScrollThumb, this.scrollFilterThumbPos);
  }

  checkProductDetailThumbSize() {
    this.calcDetailThumbSize();
    this.setThumbSize(productDetailScrollThumb, this.scrollDetailSize);
    this.scrollDetailThumbPos = this.calcThumbPos(productDetailScrollableDiv, this.scrollDetailSize);
    this.setThumbPos(productDetailScrollThumb, this.scrollDetailThumbPos);
  }

  checkFootprintsMenuThumbSize() {
    this.calcFootprintsMenuThumbSize();
    this.setThumbSize(footprintMenuScrollThumb, this.footprintMenuSize);
    this.footprintMenuThumbPos = this.calcThumbPos(footprintMenuScrollableDiv, this.footprintMenuSize);
    this.setThumbPos(footprintMenuScrollThumb, this.footprintMenuThumbPos);
  }

  onSearch(event: any) {
    this.listIsReady = false;
    this.showProductList = true;
    this.currentPage = this.prevPage = 0;
    this.searchOptions = {
      filter: this.filter,
      productFilter: this.productFilter,
      attributeFilter: this.attributeFilter,
      geoFilter: this.geoFilter,
      top: AppConfig.settings.searchOptions.productsPerPage,
      skip: 0,
      order: this.orderBy,
      sort: this.sortBy
    }
    //console.log("SearchOptions: ", this.searchOptions);

    this.loadPage(this.currentPage);
    this.productListRolled = false;
    event.stopPropagation();
  }

  showProductListContainer() {
    if (productListContainer!.classList.contains('hidden')) {
      productListContainer!.classList.replace('hidden', 'visible');
    }
    if (this.filterParsingDivIsPinned) {
      productListContainer!.style.top = (58 + this.filterParsingDivHeight) + 'px';
    } else {
      productListContainer!.style.top = (48) + 'px';
    }
  }

  loadPage(page: number) {
    this.searchOptions.skip = page * this.searchOptions.top;

    let searchReturn = this.productSearch.search(this.searchOptions).subscribe(
      (res: any) => {
        //this.selectedProduct = {}; // don't delete on every page loading..
        //this.onHideProductDetails();
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
            this.showProductListContainer();
          }, 10);
        } else {
          /* got a list */
          this.productList = res;
          //console.log("Product List: ", this.productList);

          this.productList.value.forEach((product: any) => {
            product.isSelected = false;
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
                this.platformDetailsList.forEach((platform: any) => {
                  if (product.platformShortName == platform.value) {
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
                  product.hasQL = false;
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
            this.showProductListContainer();
          }, 10);
        }
      }
    );
  }

  hoverProduct(e: any) {
    let hoveredProduct = $(e.currentTarget).index();
    this.exchangeService.showProductOnMap(hoveredProduct);
    if ($(e.currentTarget)[0].classList.contains('hover') == false) {
      $(e.currentTarget)[0].classList.add('hover');
    }
  }
  leaveProduct(e: any) {
    let hoveredProduct = -1;
    this.exchangeService.showProductOnMap(hoveredProduct);
    if ($(e.currentTarget)[0].classList.contains('hover')) {
      $(e.currentTarget)[0].classList.remove('hover');
    }
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
      //let listItemParentContainer = document.getElementById('list-items-parent-container')!;
      if (this.productListRolled) {
        this.productListRolled = false;
        if (advancedSearchMenu.classList.contains('visible')) {
          advancedSearchMenu.classList.replace('visible', 'hidden');
        }
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
        productListContainer!.style.gap = '0';
        if (productDetailContainer.classList.contains('visible')) {
          productDetailScrollThumb.style.visibility = 'visible';
        }
      } else {
        this.productListRolled = true;
        listContainer.style.visibility = 'hidden';
        listContainer.style.opacity = '0.0';
        productListHeader.style.visibility = 'hidden';
        productListHeader.style.opacity = '0.0';
        productListContainer.style.left = (-productListContainer.clientWidth - productListScrollThumb.clientWidth - 2).toString() + 'px';
        productListScrollThumb.style.visibility = 'hidden';
        productListContainer!.style.gap = '0 0.75rem';
        productDetailScrollThumb.style.visibility = 'hidden';
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

  geoSearchUpdate(geoSearchOutput: string) {
    if (geoSearchOutput !== "") {
      this.geoFilter = geoSearchOutput;
      this.geoFilterIsActive = true;
    } else {
      this.geoFilter = "";
      this.geoFilterIsActive = false;
    }
    this.checkFilterParsingToggle();
    setTimeout(() => {
      this.checkFilterOutputHeight();
      this.checkAdvancedSearchThumbSize();
    }, 200);
  }

  updateHoveredProduct(infos: any) {
    this.removeAllHoveredProducts();
    if (infos !== undefined) {
      for (var i = 0; i < listItemDiv.length; i++) {
        infos.forEach((info: any) => {
          if (info.index === i) {
            if (listItemDiv[i].classList.contains('hover') == false) {
              listItemDiv[i].classList.add('hover');
            }
          }
        });
      };
    }
  }

  removeAllHoveredProducts() {
    for (let product of listItemDiv) {
      if (product.classList.contains('hover')) {
        product.classList.remove('hover');
      }
    };
  }

  zoomToList(id: string) {
    if (this.productListRolled) {
      this.onShowHideButtonClick(null);
      this.showProductListContainer();
    }

    let tempId = this.productList.value.findIndex((product: any) => (product.Id === id));
    let tempProductFrameHeight: number;
    let productsInClientHeight: number;
    if (this.productTotalNumber < this.searchOptions.top) {
      tempProductFrameHeight = listContainer.scrollHeight / this.productTotalNumber;
      productsInClientHeight = listContainer.clientHeight / tempProductFrameHeight;
      listContainer.scrollTop =
        ((listContainer.scrollHeight - listContainer.clientHeight) / (this.productTotalNumber - productsInClientHeight)) *
        (tempId) - Math.floor(Math.floor(productsInClientHeight/2) * tempProductFrameHeight);
    } else {
      tempProductFrameHeight = listContainer.scrollHeight / this.searchOptions.top;
      productsInClientHeight = listContainer.clientHeight / tempProductFrameHeight;
      listContainer.scrollTop =
        ((listContainer.scrollHeight - listContainer.clientHeight) / (this.searchOptions.top - productsInClientHeight)) *
        (tempId) - Math.floor(Math.floor(productsInClientHeight/2) * tempProductFrameHeight);
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
    if (filterOutputScrollableDiv.scrollHeight > filterOutputScrollableDiv.clientHeight) {
      filterOutputScrollThumb.style.visibility = 'visible';
      this.scrollFilterSize = filterOutputScrollableDiv.clientHeight * filterOutputScrollableDiv.clientHeight / filterOutputScrollableDiv.scrollHeight;
    } else {
      filterOutputScrollThumb.style.visibility = 'hidden';
    }
  }
  calcDetailThumbSize() {
    if (productDetailScrollableDiv.scrollHeight > productDetailScrollableDiv.clientHeight) {
      productDetailScrollThumb.style.visibility = 'visible';
      this.scrollDetailSize = productDetailScrollableDiv.clientHeight * productDetailScrollableDiv.clientHeight / productDetailScrollableDiv.scrollHeight;
    } else {
      productDetailScrollThumb.style.visibility = 'hidden';
    }
  }
  calcFootprintsMenuThumbSize() {
    if (footprintMenuScrollableDiv.scrollHeight > footprintMenuScrollableDiv.clientHeight) {
      footprintMenuScrollThumb.style.visibility = 'visible';
      this.footprintMenuSize = footprintMenuScrollableDiv.clientHeight * footprintMenuScrollableDiv.clientHeight / footprintMenuScrollableDiv.scrollHeight;
    } else {
      footprintMenuScrollThumb.style.visibility = 'hidden';
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
      container.style.scrollBehavior = "auto";
      e = e || window.event;
      e.preventDefault();
      yDiff = yPos - e.clientY;
      yPos = e.clientY;
      container.scrollTop = container.scrollTop - (yDiff * container.scrollHeight / container.clientHeight);
      container.style.scrollBehavior = "smooth";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  onShowProductDetails(id: string, index: number) {
    if (productDetailContainer.classList.contains('hidden')) {      // find a way for multiple panels...
      productDetailContainer.classList.replace('hidden', 'visible');
    }
    //console.log("onShowProductDetails("+id+", "+index+")");

    /* this.productList.value.forEach((product: any) => {
      product.isSelected = false;
    }); */
    this.selectedProduct.push(this.productList.value.filter((product: any) => product.Id === id)[0]);
    this.selectedProduct[this.selectedProduct.length - 1].isSelected = true;
    this.selectedProduct[this.selectedProduct.length - 1].productListIndex = index;

    listItemDiv[index].classList.add('selected');

    let tempUnfilteredProductAttributes: any = this.selectedProduct[this.selectedProduct.length - 1].Attributes;
    let tempAttributesToFilter: any = this.attributesList.filter((platformAttributeObject: any) => platformAttributeObject.platformShortName === this.selectedProduct[this.selectedProduct.length - 1].platformShortName)[0].Attributes;

    this.selectedProduct[this.selectedProduct.length - 1].Attributes = [];
    tempUnfilteredProductAttributes.forEach((unfilteredAttribute: any) => {
      tempAttributesToFilter.forEach((attributeNameToFilter: any) => {
        if (attributeNameToFilter === unfilteredAttribute.Name) {
          this.selectedProduct[this.selectedProduct.length - 1].Attributes.push(unfilteredAttribute);
        }
      });
    });

    this.exchangeService.selectProductOnMap(this.selectedProduct[this.selectedProduct.length - 1].productListIndex, true);
    this.exchangeService.setProductList(this.productList); // Check here the behaviour..
    setTimeout(() => {
      this.checkProductDetailThumbSize();
    }, 200);
//    }
  }

  onZoomToProduct(id: string) {
    this.exchangeService.zoomToProduct(id);
  }

  onHideProductDetails(id: string, index: number) {
    for (var i = 0; i < this.selectedProduct.length; i++) {
      if (this.selectedProduct[i].Id === id) {
        listItemDiv[this.selectedProduct[i].productListIndex].classList.remove('selected');
        this.exchangeService.selectProductOnMap(this.selectedProduct[i].productListIndex, false);
        this.selectedProduct[i].isSelected = false;
        this.selectedProduct.splice(i, 1);
      }
    }
    if (this.selectedProduct.length == 0) {
      this.selectedProduct = [];
      if (productDetailContainer.classList.contains('visible')) {
        productDetailContainer.classList.replace('visible', 'hidden');
        productDetailScrollThumb.style.visibility = 'hidden';
      }
    }
  }

  copyUrl(id: string) {
    let copyUrl: any = (AppConfig.settings.baseUrl) ? AppConfig.settings.baseUrl + `odata/v1/Products(${id})`: window.location.origin + `/odata/v1/Products(${id})`;
    this.clipboard.copy(copyUrl);
    this.toast.showInfoToast('success', 'PRODUCT URL COPIED!');
  }



  /* Footprints Menu */
  showFootprintsMenu(obj: {event: any, array: any[]}) {
    let event: any = obj.event;
    let hoveredProductsArray: any[] = obj.array;

    footprintMenuScrollThumb.style.visibility = 'hidden';
    if (event === null) {
      this.hideFootprintMenu();
    }
    clearTimeout(this.footprintMenuTimeoutId);
      let viewportWidth = window.innerWidth;
      let viewportHeight = window.innerHeight;
      footprintMenuContainer.style.left = (event.center.x + 20) + 'px';
      footprintMenuContainer.style.top = (event.center.y - 15) + 'px';

      this.hoveredProductShownArray = hoveredProductsArray;
      setTimeout(() => {
        if (footprintMenuContainer.classList.contains('hidden')) {
          footprintMenuContainer.classList.replace('hidden', 'visible');
        }
        if (viewportHeight - (event.center.y + footprintMenuContainer.offsetHeight) < 0) {
          footprintMenuContainer.style.top = (viewportHeight - footprintMenuContainer.offsetHeight - 8) + 'px';
        }
        if (viewportWidth - (event.center.x + footprintMenuContainer.offsetWidth) < 0) {
          footprintMenuContainer.style.left = (viewportWidth - footprintMenuContainer.offsetWidth - 8) + 'px';
        }
        setTimeout(() => {
          this.checkFootprintsMenuThumbSize();
        }, 50);
      }, 50);

      this.footprintMenuTimeoutId = setTimeout(() => {
        this.hideFootprintMenu();
      }, 3000);
  }

  onMouseEnterFootprintMenu() {
    clearTimeout(this.footprintMenuTimeoutId);
  }
  onMouseLeaveFootprintMenu() {
    this.footprintMenuTimeoutId = setTimeout(() => {
      this.hideFootprintMenu();
    }, 500);
  }
  hideFootprintMenu() {
    footprintMenuContainer.style.left = '-400px';
    footprintMenuContainer.style.top = '-400px';
    if (footprintMenuContainer.classList.contains('visible')) {
      footprintMenuContainer.classList.replace('visible', 'hidden');
    }
  }

  onMouseOverTooltipProductTable(tooltipProduct: any) {
    let tempIndex = this.productList.value.findIndex((product: any) => {
      return product.Id === tooltipProduct.Id
    });
    setTimeout(() => {
      this.exchangeService.showProductOnMap(tempIndex);
      this.updateHoveredProduct([{index: tempIndex}]);
    }, 0);
  }

  onMouseLeaveTooltipProductTable() {
    this.exchangeService.showProductOnMap(-1);
    this.updateHoveredProduct([{index: -1}]);
  }

  onClickOverTooltipProductTable(product: any) {
    this.zoomToList(product.Id);
  }



  /* Accessory functions */
  returnOptionNameFromValue(val: any, options: any) {
    return options.filter((option: any) => option.value === val)[0].name;
  }

  beautifyCamelCase(text: any) {
    let words = text.split(/(?=[A-Z])/);
    for(var i = 0; i < words.length; i++) {
      let tempWord = words[i];
      tempWord = tempWord.trim();
      words[i] = tempWord.charAt(0).toUpperCase() + tempWord.slice(1);
    }
    return words.join(" ");
  }

  getTypeOf(obj: any) {
    return typeof obj;
  }
}

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
          //listDiv.scrollTop = 0;
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
          //listDiv.scrollTop = listDiv.scrollHeight + listDiv.offsetHeight;
        }
      }
    });
    document.getElementById('list-items-container')!.addEventListener('scroll', (e) => {
      if (listDiv.scrollTop > 0) {
        scrollPosWasMovedFromZero = true;
      }
      if (listDiv.offsetHeight + listDiv.scrollTop >= listDiv.scrollHeight) {
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

    this.fakeProductList = {
      "@odata.context": "$metadata#Products",
      "@odata.count": 1234,
      value: [
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176363",
          Name: "S3B_SL_2_LST____20221019T093358_20221019T093658_20221020T055649_0179_071_364_2160_PS2_O_NT_004.SEN3",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 72903618,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('b10e216a-bb1c-4ca6-9a98-baa78ec0efcb')/$value",
          hasQL:true,
          instrument: "SLSTR",
          GeoJsonFootprint: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 1",
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [30,40],
                  [60,40],
                  [60,60],
                  [30,60],
                  [30,40],
                ]
              ]
            }
          }
        },
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176364",
          Name: "S3A_SL_2_LST____20221018T202117_20221018T202417_20221020T054232_0179_091_114_0720_PS1_O_NT_004.SEN3",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 73699097,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('eaaefe9e-8a42-48f9-ae79-a73433fb4d18')/$value",
          instrument: "SLSTR",
          color: "#ff6400",
          GeoJsonFootprint: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 2",
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [0,30],
                  [40,30],
                  [40,50],
                  [0,50],
                  [0,30],
                ]
              ]
            }
          }
        },
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176365",
          Name: "S1A_S6_OCN__2SDV_20221021T082953_20221021T083019_045538_0571A9_FF6A",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 19726517,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('37b1f367-7f70-48c6-942e-62d890f78d17')/$value",
          color: "#0000ff",
          instrument: "SAR-C"
        },
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176363",
          Name: "S3B_SL_2_LST____20221019T093358_20221019T093658_20221020T055649_0179_071_364_2160_PS2_O_NT_004.SEN3",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 72903618,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('b10e216a-bb1c-4ca6-9a98-baa78ec0efcb')/$value",
          hasQL:true,
          instrument: "SLSTR",
          GeoJsonFootprint: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 1",
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [30,40],
                  [60,40],
                  [60,60],
                  [30,60],
                  [30,40],
                ]
              ]
            }
          }
        },
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176364",
          Name: "S3A_SL_2_LST____20221018T202117_20221018T202417_20221020T054232_0179_091_114_0720_PS1_O_NT_004.SEN3",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 73699097,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('eaaefe9e-8a42-48f9-ae79-a73433fb4d18')/$value",
          instrument: "SLSTR",
          color: "#ff6400",
          GeoJsonFootprint: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 2",
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [0,30],
                  [40,30],
                  [40,50],
                  [0,50],
                  [0,30],
                ]
              ]
            }
          }
        },
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176365",
          Name: "S1A_S6_OCN__2SDV_20221021T082953_20221021T083019_045538_0571A9_FF6A",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 19726517,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('37b1f367-7f70-48c6-942e-62d890f78d17')/$value",
          color: "#0000ff",
          instrument: "SAR-C"
        },
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176363",
          Name: "S3B_SL_2_LST____20221019T093358_20221019T093658_20221020T055649_0179_071_364_2160_PS2_O_NT_004.SEN3",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 72903618,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('b10e216a-bb1c-4ca6-9a98-baa78ec0efcb')/$value",
          hasQL:true,
          instrument: "SLSTR",
          GeoJsonFootprint: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 1",
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [30,40],
                  [60,40],
                  [60,60],
                  [30,60],
                  [30,40],
                ]
              ]
            }
          }
        },
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176364",
          Name: "S3A_SL_2_LST____20221018T202117_20221018T202417_20221020T054232_0179_091_114_0720_PS1_O_NT_004.SEN3",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 73699097,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('eaaefe9e-8a42-48f9-ae79-a73433fb4d18')/$value",
          instrument: "SLSTR",
          color: "#ff6400",
          GeoJsonFootprint: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 2",
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [0,30],
                  [40,30],
                  [40,50],
                  [0,50],
                  [0,30],
                ]
              ]
            }
          }
        },
        {
          "@odata.mediaContentType": "application/octet-stream",
          Id: "66cb1646-f3bc-4be3-9328-51ac76176365",
          Name: "S1A_S6_OCN__2SDV_20221021T082953_20221021T083019_045538_0571A9_FF6A",
          ContentType: "application/zip",
          OriginDate: "2022-07-28T15:26:10.673Z",
          PublicationDate: "2022-07-31T22:49:59.367Z",
          ModificationDate: "2022-07-31T22:49:59.367Z",
          Online: true,
          EvictionDate: null,
          Checksum: [{
            Algorithm: "MD5",
            Value: "3985f5f91b55786bb7ca6d697b745826",
            ChecksumDate: "2022-07-31T22:49:59.367Z"
          }],
          ContentDate: {
            Start: "2022-07-27T19:02:24.840202Z",
            End: "2022-07-27T19:46:43.347240Z"
          },
          ContentLength: 19726517,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('37b1f367-7f70-48c6-942e-62d890f78d17')/$value",
          color: "#0000ff",
          instrument: "SAR-C"
        }
      ]
    }
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

    /* Fake data: */
    /* this.productList = this.fakeProductList;
    this.productTotalNumber = this.productList['@odata.count'];
    this.exchangeService.setProductList(this.productList); */

    /* Real data */

    let searchReturn = this.productSearch.search(this.searchOptions).subscribe(
      (res: any) => {
        this.productTotalNumber = res['@odata.count'];
        this.lastPage = Math.floor(this.productTotalNumber / this.searchOptions.top);
        console.log(res);

        this.productList = res;
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

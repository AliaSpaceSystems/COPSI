import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Subscription } from 'rxjs';
import { ProductSearchService } from '../services/product-search.service';

declare let $: any;

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
  public searchOptions: any;
  public productList: any;
  public productTotalNumber: number = 0;
  public productStartNumber: number = 0;
  public productEndNumber: number = 0;

  constructor(private exchangeService: ExchangeService, private productSearch: ProductSearchService) {
  }

  ngOnInit(): void {
    this.productList = {
      products: [
        {
          Name: "S3B_SL_2_LST____20221019T093358_20221019T093658_20221020T055649_0179_071_364_2160_PS2_O_NT_004.SEN3",
          ContentDate: {
            Start: "2022-10-19T09:33:58.097"
          },
          ContentLength: 72903618,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('b10e216a-bb1c-4ca6-9a98-baa78ec0efcb')/$value",
          hasQL:true,
          instrument: "SLSTR",
          color: "#ff6400",
          geoJson: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 1",
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [30,60],
                  [60,60],
                  [60,80],
                  [30,80],
                  [30,60],
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
          geoJson: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 2",
            },
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [0,50],
                  [40,50],
                  [40,70],
                  [0,70],
                  [0,50],
                ]
              ]
            }
          }
        },
        {
          Name: "S1A_S6_OCN__2SDV_20221021T082953_20221021T083019_045538_0571A9_FF6A",
          ContentDate: {
            Start: "2022-10-21T12:11:01.149"
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
    this.showSearchMenu = false;
    this.showProductList = !this.showProductList;
    this.searchOptions = {
      filter: "",
      top: 30,
      skip: 0,
      order: 'PublicationDate',
      sort: 'desc'
     }
    let obj = this.productSearch.search(this.searchOptions).subscribe(
      (res: any) => {
        console.log(res);
        this.productTotalNumber = res['@odata.count'];
      }
    );
    this.exchangeService.setProductList(this.productList);
    event.stopPropagation();
  }
}

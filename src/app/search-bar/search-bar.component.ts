import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../exchange.service';
import { Subscription } from 'rxjs';

declare let $: any;

export enum ScssVariables {
  Light = "light",
  Dark = "dark",
}

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
  productList: any;

  constructor(private exchangeService: ExchangeService) {
  }

  ngOnInit(): void {
    $(window).click(function() {
      document.getElementById('search-menu')!.style.display = 'none';
    });

    this.productList = {
      products: [
        {
          name: "S3B_SL_2_LST____20221019T093358_20221019T093658_20221020T055649_0179_071_364_2160_PS2_O_NT_004.SEN3",
          sensing: "2022-10-19T09:33:58.097",
          size: 72903618,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('b10e216a-bb1c-4ca6-9a98-baa78ec0efcb')/$value",
          hasQL:true,
          instrument: "SLSTR",
          color: "#2288ee",
          geoJson: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 1",
              "color": "#2288ee"
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
          name: "S3A_SL_2_LST____20221018T202117_20221018T202417_20221020T054232_0179_091_114_0720_PS1_O_NT_004.SEN3",
          sensing: "2022-10-18T20:21:16.674",
          size: 73699097,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('eaaefe9e-8a42-48f9-ae79-a73433fb4d18')/$value",
          color: "#2288ee",
          instrument: "SLSTR",
          geoJson: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 2",
              "color": "#2288ee"
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
          name: "S1A_S6_OCN__2SDV_20221021T082953_20221021T083019_045538_0571A9_FF6A",
          sensing: "2022-10-21T12:11:01.149",
          size: 19726517,
          url:"https://scihub.copernicus.eu/dhus/odata/v1/Products('37b1f367-7f70-48c6-942e-62d890f78d17')/$value",
          color: "#dc143c",
          instrument: "SAR-C"
        }
      ]
    }
  }

  ngOnDestroy(): void {
    this.productListSubscription.unsubscribe();
  }

  onSearchMenuClick(event: any) {
    this.showSearchMenu = !this.showSearchMenu;
    event.stopPropagation();
  }

  search(event: any) {
    console.log("Search: " + event.target.value);
    this.exchangeService.setProductList(this.productList);
    this.showProductList = !this.showProductList;
    event.stopPropagation();
  }

  onMenuClicked(event: any) {
    event.stopPropagation();
  }
}

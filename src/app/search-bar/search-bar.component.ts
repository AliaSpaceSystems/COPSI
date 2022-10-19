import { Component, OnDestroy, OnInit } from '@angular/core';
import { ExchangeService } from '../exchange.service';
import { Subscription } from 'rxjs';

export enum ScssVariables {
  Light = "light",
  Dark = "dark",
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  productListSubscription!: Subscription;
  productList: object = {};
  constructor(private exchangeService: ExchangeService) {
  }

  ngOnInit(): void {
    this.productList = {
      products: [
        {
          name: "prod_1",
          geoJson: {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [0,60],
                  [60,60],
                  [120,60],
                  [180,60],
                  [-120,60],
                  [-60,60],
                  [0,60],
                ]
              ]
            }
          }
        },
        {
          name: "prod_2",
          geoJson: {
            "type": "Feature",
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [40,60],
                  [60,60],
                  [60,10],
                  [40,10],
                  [40,60],
                ]
              ]
            }
          }
        }
      ]
    }
    this.exchangeService.setProductList(this.productList);
  }

  ngOnDestroy(): void {
    this.productListSubscription.unsubscribe();
  }

  onSearchBarClick() {
    document.getElementById('search-menu')!.style.display = 'none';
    if (document.getElementById('search-div')!.style.display != 'flex') {
      document.getElementById('search-div')!.style.display = 'flex';
    } else {
      document.getElementById('search-div')!.style.display = 'none';
    }
  }

  onSearchMenuClick() {
    /* hide search ? */
    //document.getElementById('search-input')!.style.display = 'none';
    if (document.getElementById('search-menu')!.style.display != 'flex') {
      document.getElementById('search-menu')!.style.display = 'flex';
    } else {
      document.getElementById('search-menu')!.style.display = 'none';
    }
  }
}

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
  productList: object = {};

  public showSearchMenu = false;

  constructor(private exchangeService: ExchangeService) {
  }

  ngOnInit(): void {
    $(window).click(function() {
      document.getElementById('search-menu')!.style.display = 'none';
    });

    this.productList = {
      products: [
        {
          name: "prod_1",
          geoJson: {
            "type": "Feature",
            "properties": {
              "name": "Footprint 1",
              "color": "#bb8822"
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
          name: "prod_2",
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

  search(el: any) {
    console.log("Search: " + el.target.value);
    this.exchangeService.setProductList(this.productList);
  }

  onMenuClicked(event: any) {
    event.stopPropagation();
  }
}

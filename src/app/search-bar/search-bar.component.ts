import { Component, OnDestroy, OnInit } from '@angular/core';
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
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  productListSubscription!: Subscription;
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
          color: "#bb8822",
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
        }
      ]
    }

  }

  ngOnDestroy(): void {
    this.productListSubscription.unsubscribe();
  }

  onSearchMenuClick(event: any) {
    if (document.getElementById('search-menu')!.style.display != 'flex') {
      document.getElementById('search-menu')!.style.display = 'flex';
    } else {
      document.getElementById('search-menu')!.style.display = 'none';
    }
    event.stopPropagation();
  }

  search(el: any) {
    console.log("Search: " + el.target.value);
    this.exchangeService.setProductList(this.productList);
    if (document.getElementById('product-list')!.style.display != 'flex') {
      document.getElementById('product-list')!.style.display = 'flex';
    } else {
      document.getElementById('product-list')!.style.display = 'none';
    }
  }
}

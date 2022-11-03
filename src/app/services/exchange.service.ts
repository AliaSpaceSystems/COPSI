import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private mapStyle = new BehaviorSubject<any>({});
  selectedMapStyle = this.mapStyle.asObservable();

  private showLabels = new BehaviorSubject<any>({});
  selectedShowLabels = this.showLabels.asObservable();

  private productList = new BehaviorSubject<any>({});
  productListExchange = this.productList.asObservable();

  constructor() { }

  setMapStyle(mapStyle: string) {
    this.mapStyle.next(mapStyle);
  }

  setShowLabels(showLabels: boolean) {
    this.showLabels.next(showLabels);
  }

  setProductList(productList: object) {
    this.productList.next(productList);
  }
}

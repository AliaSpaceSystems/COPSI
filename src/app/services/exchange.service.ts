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

  private isLogged = new BehaviorSubject<any>({});
  isLoggedExchange = this.isLogged.asObservable();

  private mapLayer = new BehaviorSubject<any>({});
  selectedMapLayer = this.mapLayer.asObservable();

  private showProductIndex = new BehaviorSubject<any>({});
  showProductOnMapExchange = this.showProductIndex.asObservable();

  private selectedProductIndex = new BehaviorSubject<any>({});
  selectProductOnMapExchange = this.selectedProductIndex.asObservable();

  private rectDrawing = new BehaviorSubject<any>({});
  startRectDrawingExchange = this.rectDrawing.asObservable();

  private polygonDrawing = new BehaviorSubject<any>({});
  startPolygonDrawingExchange = this.polygonDrawing.asObservable();

  private pointDrawing = new BehaviorSubject<any>({});
  startPointDrawingExchange = this.pointDrawing.asObservable();

  private cancelDrawing = new BehaviorSubject<any>({});
  cancelDrawingExchange = this.cancelDrawing.asObservable();

  private geoSearchOutput = new BehaviorSubject<any>({});
  geoSearchOutputExchange = this.geoSearchOutput.asObservable();

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

  setIsLogged(isLogged: boolean) {
    this.isLogged.next(isLogged);
  }

  setMapLayer(mapLayer: string) {
    this.mapLayer.next(mapLayer);
  }

  showProductOnMap(showProductIndex: any) {
    this.showProductIndex.next(showProductIndex);
  }

  selectProductOnMap(selectedProductIndex: number) {
    this.selectedProductIndex.next(selectedProductIndex);
  }

  startRectDrawing(rectDrawing: boolean) {
    this.rectDrawing.next(rectDrawing);
  }

  startPolygonDrawing(polygonDrawing: boolean) {
    this.polygonDrawing.next(polygonDrawing);
  }

  startPointDrawing(pointDrawing: boolean) {
    this.pointDrawing.next(pointDrawing);
  }

  cancelPolygonDrawing(cancelDrawing: boolean) {
    this.cancelDrawing.next(cancelDrawing);
  }

  updateGeoSearch(geoSearchOutput: string) {
    this.geoSearchOutput.next(geoSearchOutput);
  }
}

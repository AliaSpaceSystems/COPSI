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

  constructor() { }

  setMapStyle(mapStyle: any) {
    this.mapStyle.next(mapStyle);
  }

  setShowLabels(showLabels: any) {
    this.showLabels.next(showLabels);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExchangeService } from '../exchange.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public mapStyles = [
    "globe",
    "mercator",
    "equalEarth",
    "equirectangular",
    "naturalEarth",
    "winkelTripel"
  ];
  mapStyle: string = '';
  subscription!: Subscription;

  constructor(private exchangeService: ExchangeService) { }

  ngOnInit(): void {
    this.subscription = this.exchangeService.selectedMapStyle.subscribe((value) => {
      this.mapStyle = value;
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onUserMenuClick() {
    document.getElementById('settings-menu')!.style.display = 'none';
    if (document.getElementById('user-menu')!.style.display != 'flex') {
      document.getElementById('user-menu')!.style.display = 'flex';
    } else {
      document.getElementById('user-menu')!.style.display = 'none';
    }
  }

  onSettingsMenuClick() {
    document.getElementById('user-menu')!.style.display = 'none';
    if (document.getElementById('settings-menu')!.style.display != 'flex') {
      document.getElementById('settings-menu')!.style.display = 'flex';
    } else {
      document.getElementById('settings-menu')!.style.display = 'none';
    }
  }

  onMapStyleChanged(event: Event) {
    let newMapType = (event.target as HTMLInputElement).value;
    this.exchangeService.setMapStyle(newMapType);
  }

  onShowLabelCheck(event: any) {
    let showLabels = event.target.checked;
    this.exchangeService.setShowLabels(showLabels);
  }
}

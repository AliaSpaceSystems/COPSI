import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExchangeService } from '../exchange.service';
import { Subscription } from 'rxjs';

declare let $: any;

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
  mapSettingsSubscription!: Subscription;

  constructor(private exchangeService: ExchangeService) { }

  ngOnInit(): void {
    $(window).click(function() {
      document.getElementById('settings-menu')!.style.display = 'none';
      document.getElementById('user-menu')!.style.display = 'none';
    });
    this.mapSettingsSubscription = this.exchangeService.selectedMapStyle.subscribe((value) => {
      this.mapStyle = value;
    })
  }

  ngOnDestroy(): void {
    this.mapSettingsSubscription.unsubscribe();
  }

  onUserMenuClick(event: any) {
    document.getElementById('settings-menu')!.style.display = 'none';
    if (document.getElementById('user-menu')!.style.display != 'flex') {
      document.getElementById('user-menu')!.style.display = 'flex';
    } else {
      document.getElementById('user-menu')!.style.display = 'none';
    }
    event.stopPropagation();
  }

  onSettingsMenuClick(event: any) {
    document.getElementById('user-menu')!.style.display = 'none';
    if (document.getElementById('settings-menu')!.style.display != 'flex') {
      document.getElementById('settings-menu')!.style.display = 'flex';
    } else {
      document.getElementById('settings-menu')!.style.display = 'none';
    }
    event.stopPropagation();
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

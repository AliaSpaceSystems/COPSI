import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Subscription } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppConfig } from '../services/app.config';

declare let $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('headerMenuAnimation', [
      state('open', style({
        'top': '3rem', 'opacity': 1, 'visibility': 'visible'
      })),
      state('closed', style({
        'top': '2.5rem', 'opacity': 0, 'visibility': 'hidden'
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
export class HeaderComponent implements OnInit, OnDestroy {

  /* Base Map Styles Layer Data Array */
  /* Managed default OSM Tile layer */
  public mapTiles: any = { styles: [
    {
      "name": "openstreetmap",
      "url": "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
    }]
  };

  public mapStyles = [
    'globe',
    'plane'
  ];
  public mapStyle: any = '';
  public mapLayer: string = '';
  mapSettingsSubscription!: Subscription;

  public showUser: boolean = false;
  public showUserTimeoutId: any;
  public showSettings: boolean = false;
  public showSettingsTimeoutId: any;
  public name: string = '';
  public centreInfo: any = AppConfig.settings.centreInfo;

  constructor(private exchangeService: ExchangeService,
              private oauthService: OAuthService) { }

  ngOnInit(): void {
    const userClaims: any = this.oauthService.getIdentityClaims();
    this.name = (userClaims && userClaims.preferred_username) ? userClaims.preferred_username : "";
    this.mapTiles.styles = AppConfig.settings.styles;
    this.mapStyle = AppConfig.settings.mapSettings.projection;
  }

  ngOnDestroy(): void {
  }

  onUserMenuIconClick(event: any) {
    const userClaims: any = this.oauthService.getIdentityClaims();
    this.name = (userClaims && userClaims.preferred_username) ? userClaims.preferred_username : "";
    this.showUser = !this.showUser;
    this.showSettings = false;
    this.setUserMenuTimeout();
    event.stopPropagation();
  }

  onSettingsMenuIconClick(event: any) {
    this.showSettings = !this.showSettings;
    this.showUser = false;
    this.setSettingsMenuTimeout();
    event.stopPropagation();
  }

  onMapStyleChanged(event: Event) {
    let newMapStyle = (event.target as HTMLInputElement).value;
    this.exchangeService.setMapStyle(newMapStyle);
  }

  onMapLayerChanged(event: Event) {
    let newMapLayer = (event.target as HTMLInputElement).value;
    this.exchangeService.setMapLayer(newMapLayer);
  }

  onShowLabelCheck(event: any) {
    let showLabels = event.target.checked;
    this.exchangeService.setShowLabels(showLabels);
  }

  onUserMenuClicked(event: any) {
    this.setUserMenuTimeout();
    event.stopPropagation();
  }

  onSettingsMenuClicked(event: any) {
    this.setSettingsMenuTimeout();
    event.stopPropagation();
  }

  onLogoutClicked() {
    this.oauthService.logOut();
  }

  setUserMenuTimeout() {
    if (this.showUserTimeoutId) {
      clearTimeout(this.showUserTimeoutId);
    }
    this.showUserTimeoutId = setTimeout(() => {
      this.showUser = false;
    }, AppConfig.settings.headerSettings.menuAutoHideTimeout);
  }

  setSettingsMenuTimeout() {
    if (this.showSettingsTimeoutId) {
      clearTimeout(this.showSettingsTimeoutId);
    }
    this.showSettingsTimeoutId = setTimeout(() => {
      this.showSettings = false;
    }, AppConfig.settings.headerSettings.menuAutoHideTimeout);
  }
}

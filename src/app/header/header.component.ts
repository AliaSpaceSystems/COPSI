import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Subscription, throwError } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { AppConfig } from '../services/app.config';
import jwt_decode from 'jwt-decode';
import { ThisReceiver } from '@angular/compiler';

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
  public token: any;
  public name: string = '';
  public role: string = '';
  public centreInfo: any = AppConfig.settings.centreInfo;

  constructor(private exchangeService: ExchangeService,
              private oauthService: OAuthService) { }

  ngOnInit(): void {
    const userClaims: any = this.oauthService.getIdentityClaims();
    if (userClaims) {
      this.name = (userClaims && userClaims.preferred_username) ? userClaims.preferred_username : "";
      this.token = this.oauthService.getAccessToken();
      let tokenDecodedObj = this.decodeToken(this.token);
      console.log(tokenDecodedObj);

      this.role = tokenDecodedObj.resource_access[tokenDecodedObj.azp].roles[0];
    }
    this.mapTiles.styles = AppConfig.settings.styles;
    this.mapStyle = AppConfig.settings.mapSettings.projection;
  }

  ngOnDestroy(): void {
  }

  onUserMenuIconClick(event: any) {
    const userClaims: any = this.oauthService.getIdentityClaims();
    if (userClaims) {
      this.name = (userClaims.preferred_username) ? userClaims.preferred_username : "";
      this.token = this.oauthService.getAccessToken();
      let tokenDecodedObj = this.decodeToken(this.token);
      this.role = (tokenDecodedObj.hasOwnProperty('resource_access') && tokenDecodedObj.resource_access.hasOwnProperty(tokenDecodedObj.azp)) ? tokenDecodedObj.resource_access[tokenDecodedObj.azp].roles[0] : "unavailable";
    }
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

  onUserMenuHover(event: any) {
    clearTimeout(this.showUserTimeoutId);
  }

  onSettingsMenuHover(event: any) {
    clearTimeout(this.showSettingsTimeoutId);
  }

  onLogoutClicked() {
    this.oauthService.logOut();
  }

  setUserMenuTimeout() {
    this.showUserTimeoutId = setTimeout(() => {
      this.showUser = false;
    }, AppConfig.settings.headerSettings.menuAutoHideTimeout);
  }

  setSettingsMenuTimeout() {
    this.showSettingsTimeoutId = setTimeout(() => {
      this.showSettings = false;
    }, AppConfig.settings.headerSettings.menuAutoHideTimeout);
  }

  decodeToken(token: any) {
    try {
        const decodedToken:any = jwt_decode(token); //decodes and verifies the token extracted form the header
        return decodedToken;
    } catch (error) {
        console.error({ 'level': 'error', 'message': { 'Token not valid!': error } });
        return throwError(error);
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../services/exchange.service';
import { Subscription } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';

declare let $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('headerMenuAnimation', [
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
export class HeaderComponent implements OnInit, OnDestroy {

  /* Base Map Styles Layer Data Array */
  public mapTiles = {
    styles: [
      {
        name: 'openstreetmap',
        url: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      },
      {
        name: 'eoxTerrain',
        url: 'https://tiles.maps.eox.at/wmts/1.0.0/terrain_3857/default/g/{z}/{y}/{x}.jpg'
      },
      {
        name: 'eoxTerrainLight',
        url: 'https://tiles.maps.eox.at/wmts/1.0.0/terrain-light_3857/default/g/{z}/{y}/{x}.jpg'
      },
      {
        name: 'eoxBlackMarble',
        url: 'https://tiles.maps.eox.at/wmts/1.0.0/blackmarble_3857/default/g/{z}/{y}/{x}.jpg'
      },
      {
        name: 'eoxBlueMarble',
        url: 'https://tiles.maps.eox.at/wmts/1.0.0/bluemarble_3857/default/g/{z}/{y}/{x}.jpg'
      }
    ]
  };
  public mapStyles = [
    'globe',
    'plane'
  ];
  public mapStyle: string = '';
  mapSettingsSubscription!: Subscription;

  public showUser = false;
  public showSettings = false;
  public name: string = ''; 

  constructor(private exchangeService: ExchangeService,
              private oauthService: OAuthService) { }

  ngOnInit(): void {
    const userClaims: any = this.oauthService.getIdentityClaims();
    this.name = (userClaims && userClaims.preferred_username) ? userClaims.preferred_username : "";    
  }

  ngOnDestroy(): void {
  }

  onUserMenuClick(event: any) {
    this.showUser = !this.showUser;
    this.showSettings = false;
    event.stopPropagation();
  }

  onSettingsMenuClick(event: any) {
    this.showSettings = !this.showSettings;
    this.showUser = false;
    event.stopPropagation();
  }

  onMapStyleChanged(event: Event) {
    let newMapStyle = (event.target as HTMLInputElement).value;
    this.exchangeService.setMapStyle(newMapStyle);
  }

  onShowLabelCheck(event: any) {
    let showLabels = event.target.checked;
    this.exchangeService.setShowLabels(showLabels);
  }

  onMenuClicked(event: any) {
    event.stopPropagation();
  }

  onLogoutClicked() {
    this.oauthService.logOut();
  }
}

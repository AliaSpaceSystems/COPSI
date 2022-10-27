import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { ExchangeService } from '../exchange.service';
import { Subscription } from 'rxjs';

declare let $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('menuAnimation', [
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
  public mapStyles = [
    "globe",
    "plane"
  ];
  mapStyle: string = '';
  mapSettingsSubscription!: Subscription;

  public showUser = false;
  public showSettings = false;

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
    this.showUser = !this.showUser;
    this.showSettings = false;
    console.log("ShowUser: " + this.showUser);

    event.stopPropagation();
  }

  onSettingsMenuClick(event: any) {
    this.showSettings = !this.showSettings;
    this.showUser = false;
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

  onMenuClicked(event: any) {
    event.stopPropagation();
  }
}

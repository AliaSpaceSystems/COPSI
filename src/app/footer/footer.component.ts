import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate, group, state } from '@angular/animations';
import { AppConfig } from '../services/app.config';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [
    trigger('infoAnimation', [
      state('open', style({
        'bottom': '1rem', 'opacity': 1
      })),
      state('closed', style({
        'bottom': '0rem', 'opacity': 0
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
export class FooterComponent implements OnInit {

  public showInfo = false;
  public version = AppConfig.settings.version;

  constructor() { }

  ngOnInit(): void {
  }

  onInfoIconClicked(event: any) {
    this.showInfo = !this.showInfo;
    event.stopPropagation();
  }
}

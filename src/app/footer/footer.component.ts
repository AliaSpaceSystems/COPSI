import { trigger, transition, style, animate, group } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [
    trigger('info-inOut', [
      transition(':enter', [
        style({ 'bottom': '0rem', 'opacity': 0 }),
        group ([
          animate('300ms ease-in-out',
            style({ 'bottom': '1.0rem' })
          ),
          animate('150ms',
            style({ 'opacity': 1 })
          ),
        ])

      ]),
      transition(':leave', [
        animate('300ms ease-in-out',
          style({ 'bottom': '0rem', 'opacity': 0 })
        )
      ])
    ]),
    trigger('icon-inOut', [
      transition(':enter', [
        style({ 'opacity': 0 }),
        group ([
          animate('10ms 300ms ease-in-out',
            style({'opacity': 1 })
          )
        ])

      ]),
      transition(':leave', [
        animate('30ms ease-in-out',
          style({ 'opacity': 0 })
        )
      ])
    ])
  ]
})
export class FooterComponent implements OnInit {

  public showInfo = false;
  public showIcon = '';

  constructor() { }

  ngOnInit(): void {
  }

  onInfoIconClick(event: any) {

  }
}

import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [
    trigger('inOut', [
      transition('void => *', [
        style({ opacity: 0 }),           // initial styles
        animate('1000ms',
          style({ opacity: 1 })          // final style after the transition has finished
        )
      ]),
      transition('* => void', [
        animate('500ms',
          style({ opacity: 0 })          // we asume the initial style will be always opacity: 1
        )
      ])
    ])
  ]
})
export class FooterComponent implements OnInit {

  public showInfo = false;

  constructor() { }

  ngOnInit(): void {
  }

  onInfoIconClick(event: any) {

  }
}

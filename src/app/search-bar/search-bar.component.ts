import { Component, OnInit } from '@angular/core';
declare let $: any;

export enum ScssVariables {
  Light = "light",
  Dark = "dark",
}

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  public styles: { [key in ScssVariables]: string | null } = {
    light: null,
    dark: null,
  };

  constructor() {
  }

  ngOnInit(): void {
    $(document).ready(function() {
    });
  }

}

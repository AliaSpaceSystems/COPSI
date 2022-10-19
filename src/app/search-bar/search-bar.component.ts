import { Component, OnInit } from '@angular/core';

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

  value = 'Clear me';

  constructor() {
  }

  ngOnInit(): void {
  }

  onSearchBarClick() {
    document.getElementById('search-menu')!.style.display = 'none';
    if (document.getElementById('search-div')!.style.display != 'flex') {
      document.getElementById('search-div')!.style.display = 'flex';
    } else {
      document.getElementById('search-div')!.style.display = 'none';
    }
  }

  onSearchMenuClick() {
    /* hide search ? */
    //document.getElementById('search-input')!.style.display = 'none';
    if (document.getElementById('search-menu')!.style.display != 'flex') {
      document.getElementById('search-menu')!.style.display = 'flex';
    } else {
      document.getElementById('search-menu')!.style.display = 'none';
    }
  }
}

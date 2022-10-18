import { Component, OnInit } from '@angular/core';
import { MapComponent } from 'src/app/map/map.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public mapStyles = [
    "globe",
    "mercator"
  ];
  public showLabels = false;

  constructor() { }

  ngOnInit(): void {
  }

  onUserMenuClick() {
    document.getElementById('settings-menu')!.style.display = 'none';
    if (document.getElementById('user-menu')!.style.display === 'none') {
      document.getElementById('user-menu')!.style.display = 'flex';
    } else {
      document.getElementById('user-menu')!.style.display = 'none';
    }
  }

  onSettingsMenuClick() {
    document.getElementById('user-menu')!.style.display = 'none';
    if (document.getElementById('settings-menu')!.style.display === 'none') {
      document.getElementById('settings-menu')!.style.display = 'flex';
    } else {
      document.getElementById('settings-menu')!.style.display = 'none';
    }
  }

  onShowLabelCheck(event: any) {
    //document.getElementById('user-menu')!
    this.showLabels = event.target.checked;
    console.log("Show labels: " + this.showLabels);
  }
}

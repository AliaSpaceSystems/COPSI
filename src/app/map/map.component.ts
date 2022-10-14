import { Component, OnInit } from '@angular/core';
declare var mapboxgl: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3BpZGVyZGFiIiwiYSI6ImNrdTU4eTI4czI0dG4ycHBjaDhoMHkzbW8ifQ.H8sB9tbmS09MQtesveUW2Q';

    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/spiderdab/cl8wvjdk3000315liyn5a5n0g', // style URL
      center: [10.0, 45], // starting position [lng, lat]
      zoom: 4, // starting zoom
      interactive: true,
      attributionControl: false,
      antialias: true,
      renderWorldCopies: false,
      projection: 'globe' // display the map as a 3D globe
      });

      const nav = new mapboxgl.NavigationControl({
        visualizePitch: true
      });
      map.addControl(nav, 'top-right');
  }

}

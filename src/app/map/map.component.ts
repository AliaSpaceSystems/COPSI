import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ExchangeService } from '../exchange.service';
import { Subscription } from 'rxjs';

declare var mapboxgl: any;
declare let $: any;
declare let map: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  mapStyle = 'globe';
  mapStyleSubscription!: Subscription;
  showLabelsSubscription!: Subscription;

  constructor(private exchangeService: ExchangeService) {
  }

  ngOnInit(): void {
    this.mapStyleSubscription = this.exchangeService.selectedMapStyle.subscribe((value) => {
      if (typeof(value) === 'string') {
        this.mapStyle = value;
        this.initMap(this.mapStyle);
      }
    });
    this.showLabelsSubscription = this.exchangeService.selectedShowLabels.subscribe((value) => {
      if (typeof(value) === 'boolean') {
        this.changeMapDetails(value);
      }
    });

    this.initMap('globe');
  }

  ngOnDestroy(): void {
    this.mapStyleSubscription.unsubscribe();
  }

  initMap(map_style: string) {
    document.getElementById('map')!.innerHTML = "";
    mapboxgl.accessToken = environment.accessToken;
    map = new mapboxgl.Map({
      container: 'map',
      //style: 'mapbox://styles/spiderdab/cl8wvjdk3000315liyn5a5n0g',
      style: 'mapbox://styles/spiderdab/cl9cn3wtn007114mtpl68mvwd',
      center: [10.0, 45],
      zoom: 2.5,
      interactive: true,
      attributionControl: false,
      antialias: true,
      renderWorldCopies: false,
      projection: map_style // display the map as a 3D globe
    });


    map.on('load', () => {
      map.getStyle().layers.forEach((layer:any) => {
        if (layer.id.endsWith('label')) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    });

    /* map.addSource('test', coords);
      map.addLayer({
        'id': 'test',
        'type': 'fill',
        'source': 'test', // reference the data source
        'layout': {},
        'paint': {
        'fill-color': '#0080ff', // blue color fill
        'fill-opacity': 0.5
        }
      });
      map.addLayer({
        'id': 'outline',
        'type': 'line',
        'source': 'test',
        'layout': {},
        'paint': {
        'line-color': '#000',
        'line-width': 3
        }
      }); */
  }
  changeMapDetails(showLabels: boolean) {
    if (showLabels) {
      map.getStyle().layers.forEach((layer:any) => {
        if (layer.id.endsWith('label')) {
          map.setLayoutProperty(layer.id, 'visibility', 'visible');
        }
      });
    } else {
      map.getStyle().layers.forEach((layer:any) => {
        if (layer.id.endsWith('label')) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    }
  }
}

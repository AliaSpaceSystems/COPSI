import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ExchangeService } from '../services/exchange.service';
import { Subscription } from 'rxjs';
/* Map Imports */
import { Deck, MapView, _GlobeView as GlobeView, COORDINATE_SYSTEM } from '@deck.gl/core';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, GeoJsonLayer } from '@deck.gl/layers';
import { wktToGeoJSON } from '@terraformer/wkt';
import { AppConfig } from '../services/app.config';

let deckGlobe: any;
let deckPlane: any;
let mapProjection: string = 'globe';
let initialViewState: any = {
  "longitude": 2.27,
  "latitude": 38.86,
  "zoom": 1.5,
  "minZoom": 1,
  "maxZoom": 10
}

/* Data to inject to the GeoJsonLayer */
let geojsonData: any = {
  "type": "FeatureCollection",
  "features": [
  ]
};

/* Base Map Styles Layer Data Array */
/* Managed default OSM Tile layer */
let mapTiles: any = { styles: [
  {
    "name": "openstreetmap",
    "url": "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
  }]
};

let defaultMapStyle = 0;
//let testFootprint: string = "geography'SRID=4326;MultiPolygon(((-180 -85.05115, -60 -85.05115, -9.873752278028588 -85.05115, -18.697664 -84.41709, -27.291122 -83.34023, -33.327984 -82.15083, -37.678593 -80.89267, -40.903652 -79.59064, -43.35432 -78.25922, -45.256004 -76.90715, -46.758476 -75.54035, -47.962128 -74.16252, -48.936485 -72.77616, -49.731937 -71.38313, -50.38452 -69.98459, -50.920895 -68.58155, -51.36377 -67.17483, -51.40293 -67.03405, -52.28085 -67.1301, -58.67725 -67.66229, -64.64138 -67.89724, -68.03048 -67.914696, -71.67086 -67.83196, -73.95211 -67.72172, -76.583626 -67.53314, -78.33401 -67.36823, -80.456985 -67.12233, -81.93471 -66.91933, -83.80223 -66.6225, -85.15374 -66.37757, -86.92625 -66.01473, -88.256584 -65.70879, -90.06633 -65.24191, -91.47698 -64.83389, -93.47643 -64.183136, -95.10825 -63.583958, -97.55461 -62.561375, -99.69816 -61.533566, -103.27202 -59.520912, -104.76791 -58.558292, -106.7818 -59.64927, -108.93288 -60.7056, -111.231964 -61.722694, -113.68868 -62.69657, -116.312965 -63.622025, -119.112236 -64.49451, -122.09346 -65.307976, -125.260574 -66.05645, -128.61363 -66.73372, -132.1478 -67.33334, -135.85335 -67.84922, -139.71408 -68.27519, -143.70673 -68.605896, -147.80177 -68.83713, -151.96474 -68.96529, -156.15695 -68.98871, -160.338 -68.90681, -164.46829 -68.72086, -168.5109 -68.4337, -172.43407 -68.04902, -176.21161 -67.572075, -179.82462 -67.008575, -180 -66.97568745281865, -180 -85.05115)), ((59.978078453683715 -85.05115, 60 -85.05115, 180 -85.05115, 180 -66.97568745281862, 176.74023 -66.36441, 173.48944 -65.64631, 170.4247 -64.860374, 167.5449 -64.01241, 164.84296 -63.1089, 162.31201 -62.15502, 159.94377 -61.1554, 157.72752 -60.114914, 155.65385 -59.0375, 153.71202 -57.926975, 151.8929 -56.78649, 150.1863 -55.619274, 148.58449 -54.42749, 147.07875 -53.213707, 145.66074 -51.980274, 144.32428 -50.72868, 143.06284 -49.460613, 141.86986 -48.17781, 140.74072 -46.881256, 139.66994 -45.57228, 138.6534 -44.251965, 137.68661 -42.921158, 136.7659 -41.580814, 135.88834 -40.231686, 135.05026 -38.87442, 134.24951 -37.50955, 133.48267 -36.1379, 132.7479 -34.759747, 132.04297 -33.37569, 131.36601 -31.986122, 130.71481 -30.591515, 130.08818 -29.192053, 129.48448 -27.788172, 128.90224 -26.380163, 128.34015 -24.968393, 127.797066 -23.553137, 127.27201 -22.13447, 126.76364 -20.712671, 126.271355 -19.288063, 125.7943 -17.860857, 125.331406 -16.431063, 124.882256 -14.999018, 124.446 -13.564769, 124.02211 -12.128626, 123.60979 -10.690633, 123.20879 -9.250898, 122.81845 -7.8096156, 122.43829 -6.366855, 122.068016 -4.9228134, 121.70711 -3.4775922, 121.35514 -2.0312994, 121.01194 -0.58393055, 120.67694 0.8643173, 120.35023 2.3132932, 120.0314 3.7630463, 119.72011 5.213316, 119.416084 6.6642365, 119.11933 8.1155205, 118.82946 9.56723, 118.54645 11.019191, 118.27004 12.471412, 118.000206 13.923828, 117.73699 15.376323, 117.48014 16.828913, 117.22933 18.28134, 116.984856 19.733765, 116.746666 21.186062, 116.51456 22.63816, 116.28871 24.09004, 116.06896 25.54163, 115.85555 26.992859, 115.64862 28.443764, 115.44794 29.894255, 115.253914 31.344227, 115.06653 32.793766, 114.8862 34.24279, 114.713104 35.691208, 114.547005 37.13901, 114.3889 38.586246, 114.23899 40.032818, 114.09749 41.478737, 113.96502 42.923893, 113.84206 44.368294, 113.72947 45.811943, 113.62754 47.25479, 113.53778 48.6968, 113.46068 50.137936, 113.39755 51.578247, 113.35012 53.017513, 113.319435 54.45584, 113.30762 55.89312, 113.31707 57.329285, 113.35041 58.764328, 113.410446 60.198162, 113.50119 61.630615, 113.62731 63.061657, 113.79463 64.491035, 114.01004 65.91864, 114.28222 67.34423, 114.622116 68.76742, 115.04445 70.18792, 115.5675 71.60514, 116.21626 73.01839, 117.023834 74.42668, 118.03691 75.82861, 119.32079 77.22237, 120.97311 78.60485, 123.13974 79.971596, 126.05391 81.315285, 130.09726 82.623405, 135.92862 83.87316, 144.69469 85.020615, 145.12698213948613 85.05115, 60 85.05115, 0 85.05115, -56.060095777620695 85.05115, -49.12864 84.66965, -39.34633 83.7838, -34.409233 83.15651, -29.556326 82.37678, -26.715324 81.82748, -23.591007 81.128784, -21.584875 80.62072, -19.209015 79.95135, -17.581352 79.44638, -15.540834 78.75525, -14.0664 78.21274, -12.122249 77.437775, -10.646239 76.80045, -8.602081 75.839745, -6.971276 74.99877, -4.5914636 73.62653, -2.5798376 72.297066, 1.8842249721001883e-16 70.2349053338933, 0.58844405 69.76454, 1.8372046 68.567116, 5.948842 68.77987, 10.121085 68.888565, 14.314721 68.891396, 18.48928 68.78874, 22.605053 68.581795, 26.626188 68.2733, 30.522081 67.86817, 34.26726 67.37107, 37.84446 66.78796, 41.24178 66.125404, 44.453228 65.389496, 47.47825 64.58683, 50.319595 63.723335, 52.983395 62.8048, 55.477493 61.8367, 57.81113 60.82395, 59.994225 59.77103, 62.03683 58.681816, 63.949368 57.56026, 65.74095 56.40916, 67.4214 55.2318, 68.99926 54.030605, 70.48269 52.807873, 71.87913 51.565628, 73.19565 50.30573, 74.43848 49.0297, 75.61371 47.739258, 76.72617 46.435295, 77.78124 45.119316, 78.78297 43.792152, 79.73552 42.454815, 80.64244 41.108116, 81.50715 39.752747, 82.33281 38.38954, 83.12202 37.01899, 83.87726 35.641644, 84.60109 34.258106, 85.29528 32.86878, 85.96217 31.47418, 86.603134 30.074476, 87.22006 28.67026, 87.814255 27.261734, 88.387146 25.84913, 88.940155 24.432997, 89.47414 23.013319, 89.99051 21.590485, 90.49007 20.164734, 90.97366 18.736233, 91.44232 17.305239, 91.8964 15.871675, 92.33709 14.436073, 92.76476 12.998327, 93.18017 11.558766, 93.583786 10.117478, 93.9763 8.674642, 94.35807 7.230345, 94.729355 5.7846384, 95.09084 4.337777, 95.44281 2.8898368, 95.78572 1.4409462, 96.11976 -0.00887641, 96.445305 -1.4594045, 96.76236 -2.9106863, 97.071526 -4.3625445, 97.37287 -5.814838, 97.6667 -7.2675724, 97.95303 -8.720591, 98.232 -10.173911, 98.50411 -11.627272, 98.769066 -13.080772, 99.027115 -14.534309, 99.27834 -15.987841, 99.52276 -17.441135, 99.760574 -18.894215, 99.99151 -20.34718, 100.21577 -21.79981, 100.43345 -23.25192, 100.64414 -24.703695, 100.84813 -26.15499, 101.04495 -27.60581, 101.235085 -29.055925, 101.41761 -30.50546, 101.59271 -31.954296, 101.76026 -33.402454, 101.919754 -34.84979, 102.071175 -36.296288, 102.21379 -37.741943, 102.34743 -39.186695, 102.4718 -40.630463, 102.58598 -42.073257, 102.68918 -43.515118, 102.78145 -44.9558, 102.861404 -46.395306, 102.92763 -47.83374, 102.9802 -49.27088, 103.01681 -50.706776, 103.035866 -52.141453, 103.03687 -53.574593, 103.01651 -55.006363, 102.97275 -56.436577, 102.90323 -57.865135, 102.80401 -59.291946, 102.67132 -60.716896, 102.50024 -62.139755, 102.28576 -63.56042, 102.01893 -64.97858, 101.69209 -66.39395, 101.2938 -67.80623, 100.810455 -69.21483, 100.22323 -70.61916, 99.50885 -72.018394, 98.63521 -73.41142, 97.56149 -74.79679, 96.229065 -76.172226, 94.554085 -77.53482, 92.41731 -78.87998, 89.63829 -80.20078, 85.93993 -81.486015, 80.88356 -82.71711, 73.77727 -83.86179, 63.585403 -84.86226, 59.978078453683715 -85.05115)))'";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy, AfterViewInit {

  productList: object = {};
  mapStyleSubscription!: Subscription;
  mapLayerSubscription!: Subscription;
  showLabelsSubscription!: Subscription;
  productListSubscription!: Subscription;
  showProductIndexSubscription!: Subscription;
  selectedProductIdSubscription!: Subscription;

  public defaultFootprintColor: number[] = this.rgbConvertToArray(AppConfig.settings.footprints.defaultColor);
  public defaultFootprintBorderColor: number[] = this.rgbConvertToArray(AppConfig.settings.footprints.defaultBorderColor);
  public defaultFootprintBorderWidth: number = AppConfig.settings.footprints.defaultBorderWidth;
  public selectedFootprintColor: number[] = this.rgbConvertToArray(AppConfig.settings.footprints.selectedColor);
  public selectedFootprintBorderColor: number[] = this.rgbConvertToArray(AppConfig.settings.footprints.selectedBorderColor);
  public selectedFootprintBorderWidth: number = AppConfig.settings.footprints.selectedBorderWidth;
  public selectedFootprintIndex: number = -1;

  /* Base Map Layer */
  public mapLayerPlane: any;
  public mapLayerGlobe: any;

  public geojsonLayerPlane = new GeoJsonLayer({
    id: 'geojson-layer',
    data: geojsonData,
    pickable: true,
    stroked: true,
    visible: true,
    filled: true,
    extruded: false,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: this.defaultFootprintBorderWidth,
    getLineWidth: this.defaultFootprintBorderWidth,
    getFillColor: (d:any, f:any) => d.properties.Color,
    getLineColor: this.defaultFootprintBorderColor,
    getPolygonOffset: (layerIndex:any) => {
      return [0, -(layerIndex.layerIndex * 10000 + 5000000)]
    },
    wrapLongitude: true,
    highlightedObjectIndex: -1,
    fp64: true
  })

  public geojsonLayerPlaneSelected = new GeoJsonLayer({
    id: 'geojson-layer-selected',
    data: geojsonData,
    pickable: true,
    stroked: true,
    visible: true,
    filled: true,
    extruded: false,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: this.selectedFootprintBorderWidth,
    getLineWidth: this.selectedFootprintBorderWidth,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [0, 0, 0, 0],
    getPolygonOffset: (layerIndex:any) => {
      return [0, -(layerIndex.layerIndex * 10000 + 10000000)]
    },
    wrapLongitude: true,
    highlightedObjectIndex: -1,
    fp64: true
  })

  public geojsonLayerGlobe = new GeoJsonLayer({
    id: 'geojson-layer',
    data: geojsonData,
    pickable: true,
    stroked: true,
    visible: true,
    filled: true,
    extruded: false,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: this.defaultFootprintBorderWidth,
    getLineWidth: this.defaultFootprintBorderWidth,
    getFillColor: (d:any, f:any) => d.properties.Color,
    getLineColor: this.defaultFootprintBorderColor,
    getPolygonOffset: (layerIndex:any) => {
      return [0, -(layerIndex.layerIndex * 10000 + 5000000)]
    },
    wrapLongitude: true,
    highlightedObjectIndex: -1,
    fp64: true
  })

  public geojsonLayerGlobeSelected = new GeoJsonLayer({
    id: 'geojson-layer-selected',
    data: geojsonData,
    pickable: true,
    stroked: true,
    visible: true,
    filled: true,
    extruded: false,
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1,
    lineWidthMaxPixels: this.selectedFootprintBorderWidth,
    getLineWidth: this.selectedFootprintBorderWidth,
    getFillColor: [0, 0, 0, 0],
    getLineColor: [0, 0, 0, 0],
    getPolygonOffset: (layerIndex:any) => {
      return [0, -(layerIndex.layerIndex * 10000 + 10000000)]
    },
    wrapLongitude: true,
    highlightedObjectIndex: -1,
    fp64: true
  })

  constructor(private exchangeService: ExchangeService) {
    mapTiles.styles = AppConfig.settings.styles;
    mapProjection = AppConfig.settings.mapSettings.projection;
    initialViewState = AppConfig.settings.mapSettings.initialViewState;
  }

  ngOnInit(): void {
    this.initMapLayer();
    this.initMapProjection();
    this.initMap();
  }

  ngAfterViewInit(): void {
    this.mapStyleSubscription = this.exchangeService.selectedMapStyle.subscribe((value) => {
      if (typeof(value) === 'string') {
        this.changeMapProjection(value);
      }
    });
    this.showLabelsSubscription = this.exchangeService.selectedShowLabels.subscribe((value) => {
      if (typeof(value) === 'boolean') {
        this.changeMapDetails(value);
      }
    });
    this.productListSubscription = this.exchangeService.productListExchange.subscribe((value) => {
      if (typeof(value) === 'object') {
        this.productList = value;
        this.setProductList(this.productList);
      }
    });
    this.mapLayerSubscription = this.exchangeService.selectedMapLayer.subscribe((value) => {
      if (typeof(value) === 'string') {
        this.changeMapLayer(value);
      }
    });
    this.showProductIndexSubscription = this.exchangeService.showProductOnMapExchange.subscribe((value) => {
      if (typeof(value) === 'number') {
        this.showProductFootprint(value);
      }
    });
    this.selectedProductIdSubscription = this.exchangeService.selectProductOnMapExchange.subscribe((value) => {
      if (typeof(value) === 'string') {
        //this.selectProductFootprint(value);
        console.log(value);
      }
    });
  }

  ngOnDestroy(): void {
    this.mapStyleSubscription.unsubscribe();
    this.mapLayerSubscription.unsubscribe();
    this.showLabelsSubscription.unsubscribe();
    this.productListSubscription.unsubscribe();
  }

  initMapLayer(): void {
    this.mapLayerPlane = new TileLayer({
      data: mapTiles.styles[defaultMapStyle].url,     //// Change here the default map style
      maxZoom: 14,
      tileSize: 256,

      renderSubLayers: (props: any) => {
        const {
          bbox: {west, south, east, north}
        } = props.tile;

        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          bounds: [west, south, east, north]
        });
      },
      getPolygonOffset: (z: any) => {
        return [500, 5]
      },
    })
  }

  initMapProjection(): void {
    this.mapLayerGlobe = new TileLayer({
      data: mapTiles.styles[defaultMapStyle].url,     //// Change here the default map style
      maxZoom: 14,
      tileSize: 256,

      renderSubLayers: (props: any) => {
        const {
          bbox: {west, south, east, north}
        } = props.tile;

        return new BitmapLayer(props, {
          data: null,
          image: props.data,
          _imageCoordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          bounds: [west, south, east, north]
        });
      },
      getPolygonOffset: (z: any) => {
        return [500, 5]
      },
    })

  }


  initMap() {
    deckGlobe = new Deck({
      parameters: {
        cull: true
      },
      initialViewState: initialViewState,
      views: new GlobeView({
          id: 'globe',
          resolution: 1,
          nearZMultiplier: 1.4, // 1.4 max near limit
          farZMultiplier: 2.0, // use 2.0
          controller: {keyboard: false, inertia: true},
          clear: true
        }),
      canvas: 'map-globe',
      style: {display: mapProjection === 'globe' ? 'block' : 'none'},
      layers: [
        /* Base Map Layer */
        this.mapLayerGlobe,
        /* Footprint geojson layer */
        this.geojsonLayerGlobe,
        /* Selected footprint layer */
        this.geojsonLayerGlobeSelected
      ],
      wrapLongitude: true
    });

    deckPlane = new Deck({
      parameters: {
        cull: true
      },
      initialViewState: initialViewState,
      views: new MapView({
        id: 'plane',
        controller: true,
        repeat: false,
        orthographic: false,
        bearing: 0,
        pitch: 0
      }),
      canvas: 'map-plane',
      style: {display: mapProjection === 'plane' ? 'block' : 'none'},
      layers: [
        /* Base Map Layer */
        this.mapLayerPlane,
        /* Footprint geojson layer */
        this.geojsonLayerPlane,
        /* Selected footprint layer */
        this.geojsonLayerPlaneSelected
      ]
    });
  }

  changeMapDetails(showLabels: boolean) {
    if (showLabels) {
    } else {
    }
  }

  changeMapProjection(projection: string) {
    if (projection === 'globe') {
      document.getElementById('map-plane')!.style.display = 'none';
      document.getElementById('map-globe')!.style.display = 'block';
    } else {
      document.getElementById('map-globe')!.style.display = 'none';
      document.getElementById('map-plane')!.style.display = 'block';
    }
  }

  changeMapLayer(layer: string) {
    defaultMapStyle = mapTiles.styles.findIndex(function(item: any, i: any){
      return item.name === layer
    });
    this.mapLayerPlane = this.mapLayerPlane.clone({
      data: mapTiles.styles[defaultMapStyle].url
    });
    this.mapLayerGlobe = this.mapLayerGlobe.clone({
      data: mapTiles.styles[defaultMapStyle].url
    });
    /* Update Plane View */
    const layersPlane =  [
      /* Base Map Layer */
      this.mapLayerPlane,
      /* Footprint geojson layer */
      this.geojsonLayerPlane,
      this.geojsonLayerPlaneSelected
    ]
    deckPlane.setProps({layers: layersPlane});

    /* Update Globe View */
    const layersGlobe =  [
      /* Base Map Layer */
      this.mapLayerGlobe,
      /* Footprint geojson layer */
      this.geojsonLayerGlobe.clone({
        visible: true
      }),
      this.geojsonLayerGlobeSelected.clone({
        visible: true
      })
    ]
    deckGlobe.setProps({layers: layersGlobe});

  }

  setProductList(productList: any) {
    if ("@odata.count" in productList) {
      //console.log(JSON.stringify(productList.products[0].geoJson, null, 2));
      let featureList: any[] = [];
      productList.value.forEach((product: any, index: number) => {
        if (product.GeoFootprint != null) {
          //console.log("Footprint format is: GeoJSON.");
          let tempGeojson = this.getGeojsonFromGeoFootprint(product.GeoFootprint);
          featureList.push(tempGeojson);
        } else if (product.Footprint != null) {
          //console.log("Footprint is present.");
          //console.log("Index: " + index);
          //console.log("Name: " + product.Name);

          let tempGeojson = this.getGeojsonFromWKT(product.Footprint);
          featureList.push(tempGeojson);
        } else {
          //console.log("NO Footprint present....");
          featureList.push({
            "type": "Feature",
            "properties": {},
            "geometry": {
              type: "Point",
              coordinates: [180,90] // fake point so deck.gl will not return a warning..
            }
          });
        }

        featureList[featureList.length-1].properties = {
          'Id': product.Id,
          'Name': product.Name,
          'Color': this.defaultFootprintColor,
        }
      });
      geojsonData = {
        "type": "FeatureCollection",
        "features": featureList
      };
      //console.log("GEOJSONDATA: " + JSON.stringify(geojsonData, null, 2));

      this.geojsonLayerGlobe = this.geojsonLayerGlobe.clone({
        data: geojsonData
      })
      this.geojsonLayerGlobeSelected = this.geojsonLayerGlobeSelected.clone({
        data: geojsonData
      })
      this.geojsonLayerPlane = this.geojsonLayerPlane.clone({
        data: geojsonData
      })
      this.geojsonLayerPlaneSelected = this.geojsonLayerPlaneSelected.clone({
        data: geojsonData
      })
      /* Update Plane View */
      const layersPlane =  [
        /* Base Map Layer */
        this.mapLayerPlane,
        /* Footprint geojson layer */
        this.geojsonLayerPlane,
        /* Selected footprints layer */
        this.geojsonLayerPlaneSelected
      ]
      deckPlane.setProps({layers: layersPlane});

      /* Update Globe View */
      const layersGlobe =  [
        /* Base Map Layer */
        this.mapLayerGlobe,
        /* Footprint geojson layer */
        this.geojsonLayerGlobe,
        /* Selected footprints layer */
        this.geojsonLayerGlobeSelected
      ]
      deckGlobe.setProps({layers: layersGlobe});
    }
  }

  showProductFootprint(showProductIndex: number) {
    this.selectedFootprintIndex = showProductIndex;
    this.geojsonLayerGlobe = this.geojsonLayerGlobe.clone({
      id: 'geojson-layer',
      data: geojsonData,
      pickable: true,
      stroked: true,
      visible: true,
      filled: true,
      extruded: false,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      lineWidthMaxPixels: this.defaultFootprintBorderWidth,
      getLineWidth: this.defaultFootprintBorderWidth,
      getFillColor: this.defaultFootprintColor,
      getLineColor: this.defaultFootprintBorderColor,
      getPolygonOffset: (layerIndex:any) => {
        return [0, -(layerIndex.layerIndex * 10000 + 5000000)]
      },
      wrapLongitude: true,
      fp64: true
    })

    this.geojsonLayerGlobeSelected = this.geojsonLayerGlobeSelected.clone({
      id: 'geojson-layer-selected',
      data: geojsonData,
      pickable: true,
      stroked: true,
      visible: true,
      filled: true,
      extruded: false,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      lineWidthMaxPixels: this.selectedFootprintBorderWidth,
      getLineWidth: (d: any, f:any) => {
        let ret: number = 1;
        if (f.index == this.selectedFootprintIndex) ret = this.selectedFootprintBorderWidth;
        return ret;
      },
      getFillColor: (d:any, f:any) => {
        let tempCol = [0, 0, 0, 0];
        if (f.index == this.selectedFootprintIndex) tempCol = this.selectedFootprintColor;
        return tempCol;
      },
      getLineColor: (d:any, f:any) => {
        let tempCol = [0, 0, 0, 0];
        if (f.index == this.selectedFootprintIndex) tempCol = this.selectedFootprintBorderColor;
        return tempCol;
      },
      getPolygonOffset: (layerIndex:any) => {
        return [0, -(layerIndex.layerIndex * 10000 + 10000000)]
      },
      wrapLongitude: true,
      fp64: true,
      updateTriggers: {
        getFillColor: [this.selectedFootprintIndex],
        getLineWidth: [this.selectedFootprintIndex],
        getLineColor: [this.selectedFootprintIndex]
      }
    })

    this.geojsonLayerPlane = this.geojsonLayerPlane.clone({
      id: 'geojson-layer',
      data: geojsonData,
      pickable: true,
      stroked: true,
      visible: true,
      filled: true,
      extruded: false,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      lineWidthMaxPixels: this.defaultFootprintBorderWidth,
      getLineWidth: this.defaultFootprintBorderWidth,
      getFillColor: this.defaultFootprintColor,
      getLineColor: this.defaultFootprintBorderColor,
      getPolygonOffset: (layerIndex:any) => {
        return [0, -(layerIndex.layerIndex * 10000 + 5000000)]
      },
      wrapLongitude: true,
      fp64: true
    })

    this.geojsonLayerPlaneSelected = this.geojsonLayerPlaneSelected.clone({
      id: 'geojson-layer-selected',
      data: geojsonData,
      pickable: true,
      stroked: true,
      visible: true,
      filled: true,
      extruded: false,
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      lineWidthMaxPixels: this.selectedFootprintBorderWidth,
      getLineWidth: (d: any, f:any) => {
        let ret: number = 1;
        if (f.index == this.selectedFootprintIndex) ret = this.selectedFootprintBorderWidth;
        return ret;
      },
      getFillColor: (d:any, f:any) => {
        let tempCol = [0, 0, 0, 0];
        if (f.index == this.selectedFootprintIndex) tempCol = this.selectedFootprintColor;
        return tempCol;
      },
      getLineColor: (d:any, f:any) => {
        let tempCol = [0, 0, 0, 0];
        if (f.index == this.selectedFootprintIndex) tempCol = this.selectedFootprintBorderColor;
        return tempCol;
      },
      getPolygonOffset: (layerIndex:any) => {
        return [0, -(layerIndex.layerIndex * 10000 + 10000000)]
      },
      wrapLongitude: true,
      fp64: true,
      updateTriggers: {
        getFillColor: [this.selectedFootprintIndex],
        getLineWidth: [this.selectedFootprintIndex],
        getLineColor: [this.selectedFootprintIndex]
      }
    })

    const layersPlane =  [
      this.mapLayerPlane,
      this.geojsonLayerPlane,
      this.geojsonLayerPlaneSelected
    ]
    deckPlane.setProps({layers: layersPlane});

    const layersGlobe =  [
      this.mapLayerGlobe,
      this.geojsonLayerGlobe,
      this.geojsonLayerGlobeSelected
    ]
    deckGlobe.setProps({layers: layersGlobe});
  }

  /* Convert WKT footprints to geojson Feature */
  getGeojsonFromWKT(footprint: string) {
    /* Footprint example */
    //let footprint = "geography'SRID=4326;MultiPolygon(((-180 -85.05115, -60 -85.05115, -9.873752278028588 -85.05115, -18.697664 -84.41709, -27.291122 -83.34023, -33.327984 -82.15083, -37.678593 -80.89267, -40.903652 -79.59064, -43.35432 -78.25922, -45.256004 -76.90715, -46.758476 -75.54035, -47.962128 -74.16252, -48.936485 -72.77616, -49.731937 -71.38313, -50.38452 -69.98459, -50.920895 -68.58155, -51.36377 -67.17483, -51.40293 -67.03405, -52.28085 -67.1301, -58.67725 -67.66229, -64.64138 -67.89724, -68.03048 -67.914696, -71.67086 -67.83196, -73.95211 -67.72172, -76.583626 -67.53314, -78.33401 -67.36823, -80.456985 -67.12233, -81.93471 -66.91933, -83.80223 -66.6225, -85.15374 -66.37757, -86.92625 -66.01473, -88.256584 -65.70879, -90.06633 -65.24191, -91.47698 -64.83389, -93.47643 -64.183136, -95.10825 -63.583958, -97.55461 -62.561375, -99.69816 -61.533566, -103.27202 -59.520912, -104.76791 -58.558292, -106.7818 -59.64927, -108.93288 -60.7056, -111.231964 -61.722694, -113.68868 -62.69657, -116.312965 -63.622025, -119.112236 -64.49451, -122.09346 -65.307976, -125.260574 -66.05645, -128.61363 -66.73372, -132.1478 -67.33334, -135.85335 -67.84922, -139.71408 -68.27519, -143.70673 -68.605896, -147.80177 -68.83713, -151.96474 -68.96529, -156.15695 -68.98871, -160.338 -68.90681, -164.46829 -68.72086, -168.5109 -68.4337, -172.43407 -68.04902, -176.21161 -67.572075, -179.82462 -67.008575, -180 -66.97568745281865, -180 -85.05115)), ((59.978078453683715 -85.05115, 60 -85.05115, 180 -85.05115, 180 -66.97568745281862, 176.74023 -66.36441, 173.48944 -65.64631, 170.4247 -64.860374, 167.5449 -64.01241, 164.84296 -63.1089, 162.31201 -62.15502, 159.94377 -61.1554, 157.72752 -60.114914, 155.65385 -59.0375, 153.71202 -57.926975, 151.8929 -56.78649, 150.1863 -55.619274, 148.58449 -54.42749, 147.07875 -53.213707, 145.66074 -51.980274, 144.32428 -50.72868, 143.06284 -49.460613, 141.86986 -48.17781, 140.74072 -46.881256, 139.66994 -45.57228, 138.6534 -44.251965, 137.68661 -42.921158, 136.7659 -41.580814, 135.88834 -40.231686, 135.05026 -38.87442, 134.24951 -37.50955, 133.48267 -36.1379, 132.7479 -34.759747, 132.04297 -33.37569, 131.36601 -31.986122, 130.71481 -30.591515, 130.08818 -29.192053, 129.48448 -27.788172, 128.90224 -26.380163, 128.34015 -24.968393, 127.797066 -23.553137, 127.27201 -22.13447, 126.76364 -20.712671, 126.271355 -19.288063, 125.7943 -17.860857, 125.331406 -16.431063, 124.882256 -14.999018, 124.446 -13.564769, 124.02211 -12.128626, 123.60979 -10.690633, 123.20879 -9.250898, 122.81845 -7.8096156, 122.43829 -6.366855, 122.068016 -4.9228134, 121.70711 -3.4775922, 121.35514 -2.0312994, 121.01194 -0.58393055, 120.67694 0.8643173, 120.35023 2.3132932, 120.0314 3.7630463, 119.72011 5.213316, 119.416084 6.6642365, 119.11933 8.1155205, 118.82946 9.56723, 118.54645 11.019191, 118.27004 12.471412, 118.000206 13.923828, 117.73699 15.376323, 117.48014 16.828913, 117.22933 18.28134, 116.984856 19.733765, 116.746666 21.186062, 116.51456 22.63816, 116.28871 24.09004, 116.06896 25.54163, 115.85555 26.992859, 115.64862 28.443764, 115.44794 29.894255, 115.253914 31.344227, 115.06653 32.793766, 114.8862 34.24279, 114.713104 35.691208, 114.547005 37.13901, 114.3889 38.586246, 114.23899 40.032818, 114.09749 41.478737, 113.96502 42.923893, 113.84206 44.368294, 113.72947 45.811943, 113.62754 47.25479, 113.53778 48.6968, 113.46068 50.137936, 113.39755 51.578247, 113.35012 53.017513, 113.319435 54.45584, 113.30762 55.89312, 113.31707 57.329285, 113.35041 58.764328, 113.410446 60.198162, 113.50119 61.630615, 113.62731 63.061657, 113.79463 64.491035, 114.01004 65.91864, 114.28222 67.34423, 114.622116 68.76742, 115.04445 70.18792, 115.5675 71.60514, 116.21626 73.01839, 117.023834 74.42668, 118.03691 75.82861, 119.32079 77.22237, 120.97311 78.60485, 123.13974 79.971596, 126.05391 81.315285, 130.09726 82.623405, 135.92862 83.87316, 144.69469 85.020615, 145.12698213948613 85.05115, 60 85.05115, 0 85.05115, -56.060095777620695 85.05115, -49.12864 84.66965, -39.34633 83.7838, -34.409233 83.15651, -29.556326 82.37678, -26.715324 81.82748, -23.591007 81.128784, -21.584875 80.62072, -19.209015 79.95135, -17.581352 79.44638, -15.540834 78.75525, -14.0664 78.21274, -12.122249 77.437775, -10.646239 76.80045, -8.602081 75.839745, -6.971276 74.99877, -4.5914636 73.62653, -2.5798376 72.297066, 1.8842249721001883e-16 70.2349053338933, 0.58844405 69.76454, 1.8372046 68.567116, 5.948842 68.77987, 10.121085 68.888565, 14.314721 68.891396, 18.48928 68.78874, 22.605053 68.581795, 26.626188 68.2733, 30.522081 67.86817, 34.26726 67.37107, 37.84446 66.78796, 41.24178 66.125404, 44.453228 65.389496, 47.47825 64.58683, 50.319595 63.723335, 52.983395 62.8048, 55.477493 61.8367, 57.81113 60.82395, 59.994225 59.77103, 62.03683 58.681816, 63.949368 57.56026, 65.74095 56.40916, 67.4214 55.2318, 68.99926 54.030605, 70.48269 52.807873, 71.87913 51.565628, 73.19565 50.30573, 74.43848 49.0297, 75.61371 47.739258, 76.72617 46.435295, 77.78124 45.119316, 78.78297 43.792152, 79.73552 42.454815, 80.64244 41.108116, 81.50715 39.752747, 82.33281 38.38954, 83.12202 37.01899, 83.87726 35.641644, 84.60109 34.258106, 85.29528 32.86878, 85.96217 31.47418, 86.603134 30.074476, 87.22006 28.67026, 87.814255 27.261734, 88.387146 25.84913, 88.940155 24.432997, 89.47414 23.013319, 89.99051 21.590485, 90.49007 20.164734, 90.97366 18.736233, 91.44232 17.305239, 91.8964 15.871675, 92.33709 14.436073, 92.76476 12.998327, 93.18017 11.558766, 93.583786 10.117478, 93.9763 8.674642, 94.35807 7.230345, 94.729355 5.7846384, 95.09084 4.337777, 95.44281 2.8898368, 95.78572 1.4409462, 96.11976 -0.00887641, 96.445305 -1.4594045, 96.76236 -2.9106863, 97.071526 -4.3625445, 97.37287 -5.814838, 97.6667 -7.2675724, 97.95303 -8.720591, 98.232 -10.173911, 98.50411 -11.627272, 98.769066 -13.080772, 99.027115 -14.534309, 99.27834 -15.987841, 99.52276 -17.441135, 99.760574 -18.894215, 99.99151 -20.34718, 100.21577 -21.79981, 100.43345 -23.25192, 100.64414 -24.703695, 100.84813 -26.15499, 101.04495 -27.60581, 101.235085 -29.055925, 101.41761 -30.50546, 101.59271 -31.954296, 101.76026 -33.402454, 101.919754 -34.84979, 102.071175 -36.296288, 102.21379 -37.741943, 102.34743 -39.186695, 102.4718 -40.630463, 102.58598 -42.073257, 102.68918 -43.515118, 102.78145 -44.9558, 102.861404 -46.395306, 102.92763 -47.83374, 102.9802 -49.27088, 103.01681 -50.706776, 103.035866 -52.141453, 103.03687 -53.574593, 103.01651 -55.006363, 102.97275 -56.436577, 102.90323 -57.865135, 102.80401 -59.291946, 102.67132 -60.716896, 102.50024 -62.139755, 102.28576 -63.56042, 102.01893 -64.97858, 101.69209 -66.39395, 101.2938 -67.80623, 100.810455 -69.21483, 100.22323 -70.61916, 99.50885 -72.018394, 98.63521 -73.41142, 97.56149 -74.79679, 96.229065 -76.172226, 94.554085 -77.53482, 92.41731 -78.87998, 89.63829 -80.20078, 85.93993 -81.486015, 80.88356 -82.71711, 73.77727 -83.86179, 63.585403 -84.86226, 59.978078453683715 -85.05115)))'";
    /*
    footprint to test:
    *S3B_SY_2_VGP____20221120T222919_20221120T231334_20221121T034631_2655_073_058______PS2_O_ST_002.SEN3.zip*
    *S3B_SY_2_VGP____20221121T133814_20221121T142229_20221121T185711_2655_073_067______PS2_O_ST_002.SEN3.zip*
    *S3B_OL_2_LRR____20221120T222919_20221120T231334_20221121T123057_2655_073_058______PS2_O_NT_002.SEN3.zip*

    *S3B_TM_0_NAT____20211118T122835_20211118T140815_20211118T142217_5979_059_209______SVL_O_AL_002.SEN3.zip*

    *S3B_TM_0_HKM____20220118T060353_20220118T074526_20220118T080326_6093_061_305______SVL_O_NR_002.SEN3.zip*


    *S1A_EW_RAW__0ADH_20211202T084415_20211202T084842_040827_04D8CF_A976.SAFE.zip*

    from mock prip:
    *S2B_OPER_MSI_L1C_TL_2BPS_20220523T002058_A027212_T01WCR_N04.00-less.tar*
    */
     let geojsonCoords: any = {};
    if (footprint) {
      footprint = footprint.toUpperCase();
      if (footprint.includes('MULTIPOLYGON')) {
        geojsonCoords = wktToGeoJSON(footprint.substring(footprint.search('MULTIPOLYGON'), footprint.length-1));
      } else if (footprint.includes('POLYGON')) {
        geojsonCoords = wktToGeoJSON(footprint.substring(footprint.search('POLYGON'), footprint.length-1));
      }
    }

    return this.getGeojsonFromGeoFootprint(geojsonCoords);
  }

  /* Convert GeoFootprint footprints to geojson Feature */
  getGeojsonFromGeoFootprint(footprint: any) {


    if (footprint.type === "Polygon") {
      //console.log("Input footprint:");
      //console.log(footprint);
      //console.log(footprint.coordinates[0]);
      let polygons: Array<any> = [];
      /*
        Check if footprint is crossing the daytime line.
        Method:
          - Check if crosses on -180.0
          - Check if it is a single polygon or a malformed multipolygon:
            -> Single polygon:
          - Divide it on the antimeridian line
          - Check and adjust longitude sign
          - Add missing points
            -> Malformed multipolygon:
          - Divide coords array on every FirstPoint recurrence
          - If more than one recurrence modify GeoFootprint to MultiPolygon
      */
      for (var i = 0; i < footprint.coordinates[0].length - 1; i++) {
        if (this.checkDaylineCrossing([footprint.coordinates[0][i], footprint.coordinates[0][i+1]])) {
          if (this.arrayEquals(footprint.coordinates[0][i], footprint.coordinates[0][0])) {
            //console.log("Fix Crossing MultiPolygon:");
            polygons = this.fixCrossingMultiPolygon(footprint);
          } else {
            //console.log("Fix Crossing Single Polygon:");
            polygons = this.fixCrossingPolygon(footprint);
          }
        }
      }
      //console.log("Polygons:");
      //console.log(polygons);
      if (polygons.length > 1) {
        footprint.type = "MultiPolygon";
        let tempCoord: Array<any> = [];
        for (var i = 0; i < polygons.length; i++) {
          tempCoord.push([polygons[i]]);
        }
        //console.log(tempCoord);
        footprint.coordinates = tempCoord;
      }
    }

    /* Create Geojson Feature */
    let geojsonFeature = {
      "type": "Feature",
      "geometry": footprint
    };
    //console.log(JSON.stringify(geojsonFeature, null, 2));
    return geojsonFeature;
  }

  fixCrossingPolygon(footprint: any): Array<any> {
    let tempPolygons: Array<any> = [];
    let precIndex: number = 0;
    for (var i = 0; i < footprint.coordinates[0].length - 1; i++) {
      if (this.checkDaylineCrossing([footprint.coordinates[0][i], footprint.coordinates[0][i+1]])) {
        //console.log("Crossing at index: " + i);
        let point = this.calcCrossPoint([footprint.coordinates[0][i], footprint.coordinates[0][i+1]]);
        //console.log("Calculated point: ");
        //console.log(point);
        let tempArray = JSON.parse(JSON.stringify(footprint.coordinates[0].slice(precIndex, i).concat([point])));
        //console.log("PrecIndex: " + precIndex);
        //console.log("First point of array:");
        //console.log(footprint.coordinates[0][precIndex]);
        //console.log("First point of tempArray:");
        //console.log(tempArray[0]);
        if (point[0] < 0) {
          //console.log("point[0] < 0");
          tempArray[0][0] = -tempArray[0][0];
        }
        //console.log("TempArray POST:");
        //console.log(tempArray);
        tempPolygons.push(tempArray);
        precIndex = i;
      }
    }
    return tempPolygons;
  }

  fixCrossingMultiPolygon(footprint: any): Array<any> {
    let tempPolygons: Array<any> = [];
    let precIndex: number = 0;
    let firstPoint = footprint.coordinates[0][0];
    /* footprint.coordinates[0].forEach((point: any, index: number) => {
      if (this.arrayEquals(point, firstPoint) && index > 0) {
        tempPolygons.push(footprint.coordinates[0].slice(precIndex, index + 1));
        precIndex = index + 1;
      }
    }); */
    for (var i = 1; i < footprint.coordinates[0].length; i++) {
      if (this.arrayEquals(footprint.coordinates[0][i], firstPoint)) {
        tempPolygons.push(footprint.coordinates[0].slice(precIndex, i + 1));
        precIndex = i + 1;
      }
    }
    tempPolygons.push(footprint.coordinates[0].slice(precIndex));
    //console.log("Polygons:");
    //console.log(polygons);
    /* if (tempPolygons.length > 1) {
      footprint.type = "MultiPolygon";
      let tempPolygonsArray: Array<any> = [];
      tempPolygons.forEach((polygon: any) => {
        tempPolygonsArray.push([polygon]);
      });
      footprint.coordinates = tempPolygonsArray;
      //console.log("MultiPolygon Footprint:");
      //console.log(footprint);
    } */
    return tempPolygons;
  }

  checkDaylineCrossing(line: Array<Array<number>>, angleThreshold: number = 180.0): boolean {
    //console.log("Line:");
    //console.log(line);
    //console.log(line[1][0]);
    //console.log(line[0][0]);
    //console.log(Math.abs(line[1][0] - line[0][0]) + " is > " + angleThreshold + " ?");
    if (Math.abs(line[1][0] - line[0][0]) > angleThreshold) {
      //console.log(Math.abs(line[1][0] - line[0][0]) + " is > " + angleThreshold);
      return true;
    }
    return false;
  }

  calcCrossPoint(line: Array<Array<number>>): Array<number> {
    let point: Array<number> = [];
    if (line[0][0] == 180.0) {
      //console.log("Lon[i] == 180.0");
      point = line[0];
    } else if (line[0][0] == -180.0) {
      //console.log("Lon[i] == -180.0");
      point = line[0];
    } else if (line[1][0] == 180.0) {
      //console.log("Lon[i+1] == 180.0");
      point = [-line[1][0], line[1][1]];
    } else if (line[1][0] == -180.0) {
      //console.log("Lon[i+1] == -180.0");
      point = [-line[1][0], line[1][1]];
    } else {
      //console.log("Calculating cross point..");
      let deltaLon = 360 - Math.abs(line[1][0] - line[0][0]);
      let refLon = deltaLon - (180 - Math.abs(line[0][0]));
      let deltaLat = Math.abs(line[1][1] - line[0][1]);
      let calcLat = line[0][1] + (deltaLat * refLon / deltaLon);
      if (line[1][0] < line[0][0]) {
        point.push(180.0, calcLat);
      } else {
        point.push(-180.0, calcLat);
      }
    }
    return point;
  }

  arrayEquals(a: any, b: any) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  /* Function to convert [r, g, b] or [r, g, b, a] colors to html string: "#rrggbb" or "#rrggbbaa" */
  rgbConvertToString(arrayColor: any) {
    let stringColor: string = '#ff0000';
    if (typeof(arrayColor) == typeof([Number, Number, Number])) {
      stringColor = "#" + arrayColor[0].toString(16).padStart(2, '0') + arrayColor[1].toString(16).padStart(2, '0') + arrayColor[2].toString(16).padStart(2, '0');
      return stringColor;
    } else if (typeof(arrayColor) == typeof([Number, Number, Number, Number])) {
      stringColor = "#" + arrayColor[0].toString(16).padStart(2, '0') + arrayColor[1].toString(16).padStart(2, '0') + arrayColor[2].toString(16).padStart(2, '0') + arrayColor[3].toString(16).padStart(2, '0');
      return stringColor;
    } else return stringColor;
  }

  /* Function to convert #rrggbb or #rrggbbaa colors to array: [r, g, b] or [r, g, b, a] */
  rgbConvertToArray(stringColor: string) {
    if (stringColor.length == 7) {
      if (stringColor.charAt(0) != '#') return [255, 0, 0];
      var r = parseInt(stringColor.substring(1, 3), 16);
      var g = parseInt(stringColor.substring(3, 5), 16);
      var b = parseInt(stringColor.substring(5, 7), 16);
      let arrayColor = [r, g, b];
      return arrayColor;
    } else if (stringColor.length == 9) {
      if (stringColor.charAt(0) != '#') return [255, 0, 0];
      var r = parseInt(stringColor.substring(1, 3), 16);
      var g = parseInt(stringColor.substring(3, 5), 16);
      var b = parseInt(stringColor.substring(5, 7), 16);
      var a = parseInt(stringColor.substring(7, 9), 16);
      let arrayColor = [r, g, b, a];
      return arrayColor;
    } else {
      return [255, 100, 100];
    }
  }
}

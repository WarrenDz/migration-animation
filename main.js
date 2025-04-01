import FeatureLayer from "https://js.arcgis.com/4.32/@arcgis/core/layers/FeatureLayer.js";
import Map from "https://js.arcgis.com/4.32/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.32/@arcgis/core/views/MapView.js";
import VectorTileLayer from "https://js.arcgis.com/4.32/@arcgis/core/layers/VectorTileLayer.js";
import WebMap from "https://js.arcgis.com/4.32/@arcgis/core/WebMap.js";

// Define the map and bookmarks components
const mapElement = document.querySelector("arcgis-map");
const bookmarksElement = document.querySelector("arcgis-bookmarks");

// Define a the mapping between slides and time ranges
const choreographyMapping = {
    "#slide1": { start: "2016-08-15T00:00:00Z", end: "2016-10-06T00:00:00Z", bookmark: "Ohio" },
    "#slide2": { start: "2016-10-06T00:00:00Z", end: "2016-10-20T00:00:00Z", bookmark: "Cuba" },
    "#slide3": { start: "2016-10-20T00:00:00Z", end: "2016-11-21T00:00:00Z", bookmark: "Maracaibo" },
}

mapElement.addEventListener("arcgisViewReadyChange", (event) => {
  if (event.target.ready) {
    const view = mapElement.view; // Access the MapView from the arcgis-map component
    const map = view.map; // Access the WebMap instance from the view

    // Access the layers in the map
    const layers = map.layers;

    // Find a specific layer by title or id
    const targetLayer = layers.find((layer) => layer.title === "Osprey Points"); // Replace with your layer's title

    if (targetLayer) {
      console.log("Layer found");
      targetLayer.visible = true;
      targetLayer.timeInfo = {
        startField: "timestamp",
        trackIdField: "tag_local_identifier"
      };
      targetLayer.trackInfo = {
        enabled: true,
        timeField: "startTimeField",
        latestObservations: {
          visible: true,
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-marker",
              style: "circle",
              color: "red",
              size: 10
            }
          }
        },
        previousObservations: {
          enabled: false,
          visible: false,
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-marker",
              style: "circle",
              color: "white",
              size: 2
            }
          }
        },
        trackLines: {
          visible: true,
          enabled: true,
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-line",
              color: "black",
              width: 6
            }
          }
        }
      };
      
    } else {
      console.error("Layer not found.");
    }
  }
});



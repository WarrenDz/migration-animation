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

const migrationLayer = new FeatureLayer({
  url: "https://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/Migration_Routes/FeatureServer/2",
  timeInfo: {
    startField: "timestamp",
    trackIdField: "tag_local_identifier"
  }
});

mapElement.addEventListener("arcgisViewReadyChange", (event) => {
  if (event.target.ready) {
    const view = mapElement.view; // Access the MapView from the arcgis-map component
    const map = view.map; // Access the WebMap instance from the view

    // Access the layers in the map
    const layers = map.layers;

    // Find a specific layer by title or id
    const targetLayer = layers.find((layer) => layer.title === "Osprey Points Feature"); // Replace with your layer's title

    if (targetLayer) {
      console.log("Layer found:", targetLayer);

    } else {
      console.log("Layer not found.");
    }
  }
});


// // Create the vector tile layer
// const vectorTileLayer = new VectorTileLayer({
//     portalItem: {
//       id: "494ccea29f50437bafd6942391de358d" // Replace with your vector tile layer ID
//     }
//   });
  
//   const wtr = new VectorTileLayer({
//     portalItem: {
//       id: "14fbc125ccc9488888b014db09f35f67" // Replace with your vector tile layer ID
//     }
//   });

//   const hs = new VectorTileLayer({
//     portalItem: {
//       id: "1b243539f4514b6ba35e7d995890db1d" // Replace with your vector tile layer ID
//     }
//   });

//   // Create the map and add the vector tile layer as the basemap
//   const map = new Map({
//     basemap: {
//       baseLayers: [vectorTileLayer,wtr,hs] // Use the vector tile layer as the basemap
//     }
//   });
  
//   // Create the MapView
//   const view = new MapView({
//     container: "container", // ID of the HTML element where the map will be displayed
//     map: map,
//     center: [-95, 40], // Set the initial center (longitude, latitude)
//     zoom: 4 // Set the initial zoom level
//   });






// // Wait for the arcgis-map element to initialize its view
// arcgisMap.addEventListener("arcgisViewReadyChange", (event) => {
//   if (event.target.ready) {
//     const view = arcgisMap.view; // Access the MapView from the arcgis-map component
//     const map = view.map; // Access the map instance from the view
//     console.log("Is migrationLayer a valid Layer?", migrationLayer instanceof FeatureLayer);
//     console.log("Map instance:", map);
//     // Add the migration layer to the map
//     map.add(migrationLayer);

//     console.log("Migration layer added to the map.");
//   }
// });


// view.whenLayerView(migrationLayer).then((layerView)=>{
//   if (migrationLayer.timeInfo) {
//     migrationLayer.timeInfo.trackIdField = "tag_local_identifier";
//     migrationLayer.trackInfo = {
//       enabled: true,
//       timeField: "startTimeField",
//       latestObservations: {
//         visible: true,
//         renderer: {
//           type: "simple",
//           symbol: {
//             type: "simple-marker",
//             style: "circle",
//             color: "red",
//             size: 10
//           }
//         }
//       },
//       previousObservations: {
//         enabled: false,
//         visible: false,
//         renderer: {
//           type: "simple",
//           symbol: {
//             type: "simple-marker",
//             style: "circle",
//             color: "white",
//             size: 2
//           }
//         }
//       },
//       trackLines: {
//         visible: true,
//         enabled: true,
//         renderer: {
//           type: "simple",
//           symbol: {
//             type: "simple-line",
//             color: "black",
//             width: 6
//           }
//         }
//       }
//     }
//   };
// })
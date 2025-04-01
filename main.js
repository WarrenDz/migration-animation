// Define the map and bookmarks components
const mapElement = document.querySelector("arcgis-map");
const bookmarksElement = document.querySelector("arcgis-bookmarks");
const timeSlider = document.querySelector("arcgis-time-slider");

// Define a the mapping between slides and time ranges
const choreographyMapping = {
    "#slide1": { trackLayer: "Osprey Points", layersOn: [], layersOff: ['Art'], start: "2016-08-15T00:00:00Z", end: "2016-10-06T00:00:00Z", bookmark: "Ohio" },
    "#slide2": { trackLayer: "Osprey Points", layersOn: [], layersOff: [], start: "2016-10-06T00:00:00Z", end: "2016-10-20T00:00:00Z", bookmark: "Cuba" },
    "#slide3": { trackLayer: "Osprey Points", layersOn: [], layersOff: [], start: "2016-10-20T00:00:00Z", end: "2016-11-21T00:00:00Z", bookmark: "Maracaibo" },
}
// Wait for a change in readiness from the map element
mapElement.addEventListener("arcgisViewReadyChange", (event) => {
  // When the map is ready...
  if (event.target.ready) {
    // Access the MapView from the arcgis-map component
    const view = mapElement.view;
    // Access the WebMap instance from the view
    const map = view.map;

    // MASTER MAP CHOREOGRAPHY FUNCTION
    function updateMapChoreography() {
      // Get the current hash of the browser window
      const hash = window.location.hash;
      const hashTrackLayer = choreographyMapping[hash].trackLayer
      const hashBookmark = choreographyMapping[hash].bookmark
      const hashLayersOn = choreographyMapping[hash].layersOn
      const hashLayersOff = choreographyMapping[hash].layersOff

      // Access the layers within the map
      const layers = map.layers;

      // Configure the track layer
      // Find the name of the desired track layer in the map layers
      const trackLayer = layers.find((layer) => layer.title === hashTrackLayer);

      // If found configure the track renderer
      function applyTrackRender() {
        if (trackLayer) {
          console.log("Found track layer named:", hashTrackLayer)
          console.log("Found track layer has time field:", trackLayer.timeInfo.startField)
          const trackStartField = trackLayer.timeInfo.startField
          // Wait for the layer to load before modifying its properties
          trackLayer.when(() => {
            trackLayer.visible = true; // Make the layer visible
            // Apply the track renderer to the layer
            targetLayer.timeInfo = {
              startField: trackStartField,
              trackIdField: "tag_local_identifier",
              interval: {
                unit: "hours", // set time interval to one hour
                value: 1
              }
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
                    color: "White",
                    size: 10
                  }
                }
              },
              previousObservations: {
                enabled: true,
                visible: true,
                renderer: {
                  type: "simple",
                  symbol: {
                    type: "simple-marker",
                    style: "circle",
                    color: "white",
                    size: 3
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
                    width: 4
                  }
                }
              }
            }
          })
        }
      }

      // Function to toggle the visibility of layers OFF based on a list of layer names
      function toggleLayerVisibility(layersOff, layersOn, layers) {
        //const layers = map.layers; // Access the layers in the map

        // Iterate through the layers and toggle visibility OFF for matching titles
        layers.forEach((layer) => {
          if (layersOff.includes(layer.title)) {
            layer.visible = false; // Set visibility to false
            console.log(`Toggled layer "${layer.title}" visibility set to OFF.`);
          }
        });

        // Iterate through the layers and toggle visibility ON for matching titles
        layers.forEach((layer) => {
          if (layersOn.includes(layer.title)) {
            layer.visible = true; // Set visibility to false
            console.log(`Toggled layer "${layer.title}" visibility set to OFF.`);
          }
        });
      }


      applyTrackRender()
      toggleLayersVisibility(hashLayersOff, hashLayersOn, layers)

    }
    
    // Access the layers in the map
    const layers = map.layers;

    // Find a specific layer by title or id
    const targetLayer = layers.find((layer) => layer.title === "Osprey Points"); // Replace with your layer's title
    if (targetLayer) {
      console.log("Layer found");
      // Wait for the layer to load before modifying its properties
      targetLayer.when(() => {
        targetLayer.visible = true; // Make the layer visible
        console.log(targetLayer.title, "is now visible.");
        // Apply the track renderer
        targetLayer.timeInfo = {
          startField: "timestamp",
          trackIdField: "tag_local_identifier",
          interval: {
            unit: "hours", // set time interval to one hour
            value: 1
          }
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
                color: "White",
                size: 10
              }
            }
          },
          previousObservations: {
            enabled: true,
            visible: true,
            renderer: {
              type: "simple",
              symbol: {
                type: "simple-marker",
                style: "circle",
                color: "white",
                size: 3
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
                width: 4
              }
            }
          }
        }
      // 
      // Define the time slider component
      
      // Define function to update the choreography based on the hash
      function updateChoreographyFromHash() {
        const hash = window.location.hash;
        console.log(`Hash: ${hash}`);
        if (choreographyMapping[hash]) {
          // Set the initial map extent by the bookmarkStart
          const bookmark = choreographyMapping[hash].bookmark;
          const bookmarks = Array.from(bookmarksElement.bookmarks);
          const targetBookmark = bookmarks.find(b => b.name === bookmark);

          // Configure the time sliders full extent with the start and end time from choreography
          const startFrame = new Date(choreographyMapping[hash].start);
          const endFrame = new Date(choreographyMapping[hash].end);
          timeSlider.fullTimeExtent = {start: startFrame, end: endFrame};

          // Set the time slider's stops to 1 day intervals
          timeSlider.stops = {
            interval: {
              value: 1,
              unit: "hours"
            }
          };
          
          // Start a TimeSlider animation if not already playing
          if (timeSlider.state === "ready") {
            timeSlider.play();
          }

          // Find the bookmark by name
          // If the bookmark exists, navigate to it
          if (targetBookmark) {
            mapElement.goTo(targetBookmark.viewpoint, { duration: 6000 });  // Navigates to the bookmark view
          } else {
            console.error(`Bookmark "${bookmark}" not found!`);
          } 
        }
    }
    //updateChoreographyFromHash();
    updateMapChoreography()

    // Listen for hash changes to update the choreography
    window.addEventListener("hashchange", updateMapChoreography);



    }).catch((error) => {
      console.error("Error loading the layer:", error);
    });
    } else {
      console.log("Layer not found.");
    }
  }
});
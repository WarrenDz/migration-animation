// Define the map and bookmarks components
const mapElement = document.querySelector("arcgis-map");
const bookmarksElement = document.querySelector("arcgis-bookmarks");
const timeSlider = document.querySelector("arcgis-time-slider");

// Define a the mapping between slides and time ranges
const choreographyMapping = {
  "#slide1": {
    trackLayer: "Deer Points",
    trackField: "mig",
    trackLabelField: "event_id_str",
    trackLabelIds: ["1", "732"],
    mapBookmark: "Deer",
    mapLayersOn: ["Deer Supporting Layers", "Deer Lines Feature","DOES THIS TOGGLE"],
    mapLayersOff: ["Whale Points", "Whale Traffic Corridor", "Global Ship Density", "Osprey Points", "Osprey Lines Feature", "Whale Lines Feature"],
    mapTimeSyncedLayers: [{
      layer: "Deer Highway Annotation",
      visibleFrom: "2016-05-21T00:00:00Z"
    }],
    timeSliderStart: "2016-03-20T00:00:00Z",
    timeSliderEnd: "2016-06-18T00:00:00Z",
    timeSliderUnit: "hours",
    timeSliderStep: 4
  },
  "#slide2": {
    trackLayer: "Osprey Points",
    trackField: "tag_local_identifier",
    trackLabelField: "event_id",
    trackLabelIds: ["1828224806", "1999613313", "2012515059", "2017197455"],
    mapBookmark: "Osprey",
    mapLayersOn: [],
    mapLayersOff: ["DOES THIS TOGGLE", "Deer Points", "Deer Highway Annotation", "Whale Points", "Whale Traffic Corridor", "Global Ship Density", "Deer Supporting Layers", "Deer Lines Feature", "Whale Lines Feature"],
    mapTimeSyncedLayers: [{
      layer: "Osprey Caesar Creek",
      visibleFrom: "2016-09-01T00:00:00Z"
    },
    { layer: "Osprey Maracaibo",
      visibleFrom: "2016-10-23T00:00:00Z"
    }],
    timeSliderStart: "2016-08-15T00:00:00Z",
    timeSliderEnd: "2016-11-21T00:00:00Z",
    timeSliderUnit: "hours",
    timeSliderStep: 4
  },
  "#slide3": {
    trackLayer: "Whale Points",
    trackField: "id",
    trackLabelField: "event_id",
    trackLabelIds: ["825", "1109"],
    mapBookmark: "Whale",
    mapLayersOn: ["Global Ship Density", "Whale Lines Feature"],
    mapLayersOff: ["Deer Points", "Osprey Points", "Deer Highway Annotation", "Deer Supporting Layers", "Deer Lines Feature", "Osprey Lines Feature"], 
    mapTimeSyncedLayers: [{
      layer: "Whale Traffic Corridor",
      visibleFrom: "2019-03-16T00:00:00Z"
    }],
    timeSliderStart: "2019-03-14T00:00:00Z",
    timeSliderEnd: "2019-03-28T00:00:00Z",
    timeSliderUnit: "hours",
    timeSliderStep: 0.5
  }
}
// Wait for a change in readiness from the map element
mapElement.addEventListener("arcgisViewReadyChange", (event) => {
  // When the map is ready...
  if (event.target.ready) {
    // Access the MapView from the arcgis-map component
    const view = mapElement.view;

    // Disable map navigation
    // view.on("mouse-wheel", (event) => {
    //   event.stopPropagation();
    // });
    // view.on("drag", (event) => {
    //   event.stopPropagation();
    // });

    // Access the WebMap instance from the view
    const map = view.map;
    let previousHash = null;
    // MAIN CHOREOGRAPHY FUNCTION
    async function updateMapChoreography() {
      // Get the current hash of the browser window
      // Pull map choreography info
      let hash = window.location.hash || "#slide1"; // if no has is present use #slide1
      console.log("Current hash:", hash);

      // Access the layers within the map
      const layers = map.layers;

      // Configure the track layer
      // Find the name of the desired track layer in the map layers
      let trackLayer = layers.find((layer) => layer.title === choreographyMapping[hash].trackLayer);

      // If found configure the track renderer
      async function applyTrackRender(trackLayerName, trackLayerField, trackLabelField, trackLabelIds) {
        if (trackLayer) {
          // these are an attempt to do a hard reset on the renderer when we switch
          map.remove(trackLayer);
          trackLayer = trackLayer.clone();
          map.add(trackLayer);
          //
          console.log("Found track layer named:", trackLayerName);
          await trackLayer.when(); // Wait for the layer to load
          const trackStartField = trackLayer.timeInfo.startField;
          trackLayer.visible = true; // Make the layer visible
          trackLayer.timeInfo = {
            startField: trackStartField,
            trackIdField: trackLayerField,
            interval: {
              unit: choreographyMapping[hash].timeSliderUnit,
              value: choreographyMapping[hash].timeSliderStep
            }
          };
          let whereClause = trackLabelField + ` IN (${trackLabelIds.map(id => `'${id}'`).join(",")})`;
          trackLayer.trackInfo = {
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
                  size: 10,
                  outline: {
                    color: "black",
                    width: 2
                  }
                }
              }
            },
            previousObservations: {
              enabled: true,
              visible: true,
              labelsVisible: true,
              labelingInfo: [
                {
                  symbol: {
                    type: "text",
                    color: "white",
                    haloColor: "black",
                    haloSize: 1.5,
                    font: {
                      family: "sans-serif",
                      size: 10
                    }
                  },
                  labelPlacement: "above-right",
                  labelExpressionInfo: {
                    expression: "Text($feature." + trackStartField + ", 'dddd, MMMM D, Y')"
                  },
                  where: whereClause
                }
              ],
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
                  width: 3
                }
              }
            }
          };
        }
      }

      // Function to update the map bookmark
      function updateMapBookmark(bookmarkName) {
        if (choreographyMapping[hash]) {
          // Set the initial map extent by the bookmarkStart
          const bookmarks = Array.from(bookmarksElement.bookmarks);
          const targetBookmark = bookmarks.find(b => b.name === bookmarkName);
          // Find the bookmark by name
          // If the bookmark exists, navigate to it
          if (targetBookmark) {
            mapElement.goTo(targetBookmark.viewpoint, { duration: 6000 });  // Navigates to the bookmark view
          } else {
            console.error(`Bookmark "${bookmarkName}" not found!`);
          } 
        }
      }
      // Function to toggle the visibility of layers OFF based on a list of layer names
      function toggleLayerVisibility(layers, layersOn, layersOff) {
        // Iterate through the layers and toggle visibility OFF for matching titles
        if (layersOff && layersOff.length > 0) {
          layers.forEach((layer) => {
            if (layersOff.includes(layer.title)) {
              layer.visible = false; // Set visibility to false
              // console.log("(-)", layer.title, "is now hidden");
            }
          });
        }

        // Iterate through the layers and toggle visibility ON for matching titles
        if (layersOn && layersOn.length > 0) {
          layers.forEach((layer) => {
            if (layersOn.includes(layer.title)) {
              layer.visible = true; // Set visibility to true
              // console.log("(+)", layer.title, "is now visible");
            }
          });
        }
      }

      function manageTimeSyncedLayers(currentTimeSynced, previousTimeSynced, currentTime, layers) {
        // Turn off previous time-synced layers
        if (previousTimeSynced && previousTimeSynced.length > 0) {
          previousTimeSynced.forEach((sync) => {
            const layer = layers.find((layer) => layer.title === sync.layer);
            if (layer) {
              layer.visible = false; // Turn off the layer
              // console.log("(-)", layer.title, "has been turned off (previous time-synced layer).");
            }
          });
        }
      
        // Update visibility for current time-synced layers
        if (currentTimeSynced && currentTimeSynced.length > 0) {
          currentTimeSynced.forEach((sync) => {
            const layer = layers.find((layer) => layer.title === sync.layer);
            if (layer) {
              const visibleFrom = new Date(sync.visibleFrom);
              layer.visible = currentTime >= visibleFrom; // Set visibility based on the current time
              // console.log(
              //   layer.visible
              //     ? "(+)" + layer.title + " is now visible (current time-synced layer)."
              //     : "(-)" + layer.title + " remains hidden (current time-synced layer)."
              // );
            }
          });
        }
      }

      // Function to define and start the timeSlider component of the animation
      function updateTimeSlider(timeStart, timeEnd, timeUnit, timeStep, timeSynced, layers, previousTimeSynced) {
        // Configure the time sliders full extent with the start and end time from choreographyMapping
        const startFrame = new Date(timeStart);
        const endFrame = new Date(timeEnd);
        timeSlider.fullTimeExtent = {start: startFrame, end: endFrame};
        timeSlider.timeExtent = {start: null, end: startFrame}
        // Set the timeSlider stops
        timeSlider.stops = {
          interval: {
            unit: timeUnit,
            value: timeStep
          }
        };
        // Listen for time extent changes
        if (timeSynced && timeSynced.length > 0) {
          timeSlider.addEventListener("arcgisPropertyChange", async (event) => {
            let currentTime = timeSlider.timeExtent.end;
            // Update time-synced layers
            manageTimeSyncedLayers(timeSynced, previousTimeSynced, currentTime, layers);
          });
        }
        
        // Start a TimeSlider animation if not already playing
        if (timeSlider.state === "ready") {
          timeSlider.play();
        }
      }
      // Call functions
      try {
        await applyTrackRender(
          choreographyMapping[hash].trackLayer,
          choreographyMapping[hash].trackField,
          choreographyMapping[hash].trackLabelField,
          choreographyMapping[hash].trackLabelIds
        ); // Wait for the track renderer to be applied

        updateMapBookmark(choreographyMapping[hash].mapBookmark);

        updateTimeSlider(
          choreographyMapping[hash].timeSliderStart,
          choreographyMapping[hash].timeSliderEnd,
          choreographyMapping[hash].timeSliderUnit,
          choreographyMapping[hash].timeSliderStep,
          choreographyMapping[hash].mapTimeSyncedLayers,
          layers,
          choreographyMapping[previousHash]?.mapTimeSyncedLayers || []
        );

        toggleLayerVisibility(
          layers,
          choreographyMapping[hash].mapLayersOn,
          choreographyMapping[hash].mapLayersOff
        );

        // Update the previous hash
        previousHash = hash;

        console.log("Map choreography updated successfully.");
      } catch (error) {
        console.error("Error updating map choreography:", error);
      }
    }
    //updateChoreographyFromHash();
    updateMapChoreography()
    // Listen for hash changes to update the choreography
    window.addEventListener("hashchange", async () => {
      await updateMapChoreography(); // Reapply choreography logic
    });
  }
});
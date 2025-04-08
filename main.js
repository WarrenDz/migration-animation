// Define the map and bookmarks components
const mapElement = document.querySelector("arcgis-map");
const bookmarksElement = document.querySelector("arcgis-bookmarks");
const timeSlider = document.querySelector("arcgis-time-slider");

// Define a the mapping between slides and time ranges
const choreographyMapping = {
  "#slide1": { trackLayer: "Deer Points", trackField: "mig", trackLabelField: "event_id_str", trackLabelIds: ["1", "732"], bookmark: "Deer", layersOn: ["Deer Labels", "Deer Sketch", "Transportation", "NPS Boundary", "USA Bureau of Land Management Lands"], layersOff: ["Whale Points", "Whale Labels", "Whale Sketch", "Global Ship Density", "Osprey Labels", "Osprey Sketch", "Osprey Points"], start: "2016-03-20T00:00:00Z", end: "2016-06-18T00:00:00Z", playRate: 10, timeSynced: [{ layer: "DEER TIME SYNCED", visibleFrom: "2016-05-20T00:00:00Z" }, { layer: "Osprey Sketch", visibleFrom: "2016-10-01T00:00:00Z" }]},
  "#slide2": { trackLayer: "Osprey Points", trackField: "tag_local_identifier", trackLabelField: "event_id", trackLabelIds: ["1828224806","1935895822", "1999613313", "2008282395", "2012515059", "2017197455"], bookmark: "Osprey", layersOn: ["Osprey Labels", "Osprey Sketch"], layersOff: ["Deer Points", "Deer Labels", "Deer Sketch", "Whale Points", "Whale Labels", "Whale Sketch", "Global Ship Density", "Transportation", "NPS Boundary", "USA Bureau of Land Management Lands"], start: "2016-08-15T00:00:00Z", end: "2016-11-21T00:00:00Z", playRate: 5 },
  "#slide3": { trackLayer: "Whale Points", trackField: "id", trackLabelField: "event_id", trackLabelIds: ["825", "1109"], bookmark: "Whale", layersOn: ["Whale Labels", "Whale Sketch", "Global Ship Density"], layersOff: ["Transportation", "Deer Points", "Deer Labels", "Deer Sketch", "NPS Boundary", "USA Bureau of Land Management Lands"], start: "2019-03-14T00:00:00Z", end: "2019-03-28T00:00:00Z", playRate: 100 }
}
// Wait for a change in readiness from the map element
mapElement.addEventListener("arcgisViewReadyChange", (event) => {
  // When the map is ready...
  if (event.target.ready) {
    // Access the MapView from the arcgis-map component
    const view = mapElement.view;
    // Disable map navigation
    view.on("mouse-wheel", (event) => {
      event.stopPropagation();
    });
    view.on("drag", (event) => {
      event.stopPropagation();
    });
    // Access the WebMap instance from the view
    const map = view.map;

    // MAIN CHOREOGRAPHY FUNCTION
    async function updateMapChoreography() {
      // Get the current hash of the browser window
      // Pull map choreography info
      const hash = window.location.hash;
      console.log("Current hash:", hash);
      const hashTrackLayer = choreographyMapping[hash].trackLayer
      const hashTrackField = choreographyMapping[hash].trackField
      const hashTrackLabelField = choreographyMapping[hash].trackLabelField
      const hashTrackLabelIds = choreographyMapping[hash].trackLabelIds
      const hashBookmark = choreographyMapping[hash].bookmark
      const hashLayersOn = choreographyMapping[hash].layersOn
      const hashLayersOff = choreographyMapping[hash].layersOff
      const hashTimeSynced = choreographyMapping[hash].timeSynced;

      // Access the layers within the map
      const layers = map.layers;

      // Configure the track layer
      // Find the name of the desired track layer in the map layers
      const trackLayer = layers.find((layer) => layer.title === hashTrackLayer);

      // If found configure the track renderer
      async function applyTrackRender(trackLayerName, trackLayerField, trackLabelField, trackLabelIds) {
        if (trackLayer) {
          console.log("Found track layer named:", trackLayerName);
          await trackLayer.when(); // Wait for the layer to load
          console.log("Found track layer has time field:", trackLayer.timeInfo.startField);
          const trackStartField = trackLayer.timeInfo.startField;
          trackLayer.visible = true; // Make the layer visible
          trackLayer.timeInfo = {
            startField: trackStartField,
            trackIdField: trackLayerField,
            interval: {
              unit: "hours",
              value: 1
            }
          };
          const whereClause = trackLabelField + ` IN (${trackLabelIds.map(id => `'${id}'`).join(",")})`;
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
                      family: "Oswald",
                      size: 12
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
          console.log("Track renderer applied to layer:", trackLayer.title);
        }
      }

      // Function to toggle the visibility of layers OFF based on a list of layer names
      function toggleLayerVisibility(layers, layersOn, layersOff) {

        // Iterate through the layers and toggle visibility OFF for matching titles
        layers.forEach((layer) => {
          if (layersOff.includes(layer.title)) {
            layer.visible = false; // Set visibility to false
            // console.log(`Toggled layer "${layer.title}" visibility set to OFF.`);
          }
        });
        // Iterate through the layers and toggle visibility ON for matching titles
        layers.forEach((layer) => {
          if (layersOn.includes(layer.title)) {
            layer.visible = true; // Set visibility to true
            // console.log(`Toggled layer "${layer.title}" visibility set to ON.`);
          }
        });
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

      // Time synced layers function
      function updateTimeSyncedLayers(timeSynced, currentTime, layers) {
        timeSynced.forEach((sync) => {
          const layer = layers.find((layer) => layer.title === sync.layer);
          if (layer) {
            const visibleFrom = new Date(sync.visibleFrom);
            layer.visible = currentTime >= visibleFrom;
          }
        });
      }


      // Function to define and start the timeSlider component of the animation
      function updateTimeSlider(timeStart, timeEnd, timeSynced, layers) {
          // Configure the time sliders full extent with the start and end time from choreographyMapping
          const startFrame = new Date(timeStart);
          const endFrame = new Date(timeEnd);
          timeSlider.fullTimeExtent = {start: startFrame, end: endFrame};
          // Set the timeSlider stops
          timeSlider.stops = {
            interval: {
              value: 1,
              unit: "hours"
            }
          };

          // Listen for time extent changes
          timeSlider.addEventListener("arcgisPropertyChange", async (event) => {
            const currentTime = timeSlider.timeExtent.end;
            // Update time-synced layers
            updateTimeSyncedLayers(timeSynced, currentTime, layers);
          });
          
          // Start a TimeSlider animation if not already playing
          if (timeSlider.state === "ready") {
            timeSlider.play();
          }
      }
      // Call functions
      try {
        await applyTrackRender(hashTrackLayer, hashTrackField, hashTrackLabelField, hashTrackLabelIds); // Wait for the track renderer to be applied
        toggleLayerVisibility(layers, hashLayersOn, hashLayersOff);
        updateMapBookmark(hashBookmark);
        updateTimeSlider(choreographyMapping[hash].start, choreographyMapping[hash].end, hashTimeSynced, layers);
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
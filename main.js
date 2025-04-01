// Define the map and bookmarks components
const mapElement = document.querySelector("arcgis-map");
const bookmarksElement = document.querySelector("arcgis-bookmarks");
const timeSlider = document.querySelector("arcgis-time-slider");

// Define a the mapping between slides and time ranges
const choreographyMapping = {
    "#slide1": { trackLayer: "Osprey Points", trackField: "tag_local_identifier", trackLabelField: "event_id", trackLabelIds: ['1712299077','1990601353'], layersOn: [], layersOff: [], start: "2016-08-15T00:00:00Z", end: "2016-10-06T00:00:00Z", bookmark: "Ohio" },
    "#slide2": { trackLayer: "Osprey Points", trackField: "tag_local_identifier", trackLabelField: "event_id", trackLabelIds: ['1992557794','2012515057'], layersOn: [], layersOff: [], start: "2016-10-06T00:00:00Z", end: "2016-10-20T00:00:00Z", bookmark: "Cuba" },
    "#slide3": { trackLayer: "Osprey Points", trackField: "tag_local_identifier", trackLabelField: "event_id", trackLabelIds: ['2013411694', '2098442143'], layersOn: [], layersOff: [], start: "2016-10-20T00:00:00Z", end: "2016-11-21T00:00:00Z", bookmark: "Maracaibo" },
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
      // Pull map choreography info
      const hash = window.location.hash;
      const hashTrackLayer = choreographyMapping[hash].trackLayer
      const hashTrackField = choreographyMapping[hash].trackField
      const hashTrackLabelField = choreographyMapping[hash].trackLabelField
      const hashTrackLabelIds = choreographyMapping[hash].trackLabelIds
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
          // Wait for the layer to load before modifying its properties
          trackLayer.when(() => {
            console.log("Found track layer has time field:", trackLayer.timeInfo.startField)
            const trackStartField = trackLayer.timeInfo.startField
            trackLayer.visible = true; // Make the layer visible
            // Apply the track renderer to the layer
            trackLayer.timeInfo = {
              startField: trackStartField, // dynamically set the time field used by the trackLayer
              trackIdField: hashTrackField, // dynamically set the track field used by the trackLayer
              interval: {
                unit: "hours", // set time interval to one hour
                value: 1
              }
            };
            // Set the label ids and expression
            // Construct the 'where' clause dynamically
            const whereClause = hashTrackLabelField + ` IN (${hashTrackLabelIds.map(id => `'${id}'`).join(",")})`;
            console.log("label filter:", whereClause)
            // Update the trackInfo for the layer
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
                    size: 10
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
                      expression: "Text($feature." + trackStartField + ", 'dddd, MMMM D, Y')" // Substitute the time field into the label
                    },
                    where: whereClause // Use the dynamically constructed 'where' clause
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
            layer.visible = true; // Set visibility to true
            console.log(`Toggled layer "${layer.title}" visibility set to OFF.`);
          }
        });
      }

      // Function to update the map bookmark
      function updateMapBookmark() {
        console.log(`Hash: ${hash}`);
        if (choreographyMapping[hash]) {
          // Set the initial map extent by the bookmarkStart
          const bookmarks = Array.from(bookmarksElement.bookmarks);
          const targetBookmark = bookmarks.find(b => b.name === hashBookmark);
          // Find the bookmark by name
          // If the bookmark exists, navigate to it
          if (targetBookmark) {
            mapElement.goTo(targetBookmark.viewpoint, { duration: 6000 });  // Navigates to the bookmark view
          } else {
            console.error(`Bookmark "${bookmark}" not found!`);
          } 
        }
      }

      // Function to define and start the timeSlider component of the animation
      function updateTimeSlider() {
          // Configure the time sliders full extent with the start and end time from choreographyMapping
          const startFrame = new Date(choreographyMapping[hash].start);
          const endFrame = new Date(choreographyMapping[hash].end);
          timeSlider.fullTimeExtent = {start: startFrame, end: endFrame};
          // Set the timeSlider stops
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
      }
      // Call functions
      applyTrackRender() // apply the track renderer to the desired tracklayer as defined in choreographyMapping
      toggleLayerVisibility(hashLayersOff, hashLayersOn, layers) // toggle supporting layers on/off as defined in choreographyMapping
      updateTimeSlider() // update the timeSlider element based on the start/end times and autoplay as defined in choreographyMapping
      updateMapBookmark() // update the map bookmark as defined in the choreographyMapping
    }
    //updateChoreographyFromHash();
    updateMapChoreography()

  }
});
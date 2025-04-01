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
      // Wait for the layer to load before modifying its properties
      targetLayer.when(() => {
        targetLayer.visible = true; // Make the layer visible
        console.log(targetLayer.title, "is now visible.");
        // Apply the track renderer
        targetLayer.timeInfo = {
          startField: "startTimeField",
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
        }
      // 
      // Define the time slider component
      const timeSlider = document.querySelector("arcgis-time-slider");
          // Define function to update the choreography based on the hash
          function updateChoreographyFromHash() {
            const hash = window.location.hash;
            console.log(`Hash: ${hash}`);
            if (choreographyMapping[hash]) {
              // Set the initial map extent by the bookmarkStart
              const bookmark = choreographyMapping[hash].bookmark;
              const bookmarks = Array.from(bookmarksElement.bookmarks);
              const targetBookmark = bookmarks.find(b => b.name === bookmark);

              // Find the bookmark by name
              // If the bookmark exists, navigate to it
              if (targetBookmark) {
                mapElement.goTo(targetBookmark.viewpoint, { duration: 6000 });  // Navigates to the bookmark view
              } else {
                console.error(`Bookmark "${bookmark}" not found!`);
              } 

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

              // Set the time slider initial time extent
              let start = startFrame
              let end = new Date(startFrame.getTime() + 24 * 60 * 60 * 1000);
              timeSlider.timeExtent = { start, end };
              
              // Start a TimeSlider animation if not already playing
              if (timeSlider.state === "ready") {
                timeSlider.play();
              }
            }
        }
        updateChoreographyFromHash();

        // Listen for hash changes to update the choreography
        window.addEventListener("hashchange", updateChoreographyFromHash);



      }).catch((error) => {
        console.error("Error loading the layer:", error);
      });
    } else {
      console.log("Layer not found.");
    }
  }
});
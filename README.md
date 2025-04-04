# Migration Animation

This repository contains an R&D effort aimed at exploring the use of the [ArcGIS SDK for JavaScript](https://developers.arcgis.com/javascript/latest/) within [ArcGIS StoryMaps](https://www.esri.com/en-us/arcgis/products/arcgis-storymaps/overview). The goal is to create a dynamic and interactive map experience leveraging the [track renderer](https://developers.arcgis.com/javascript/latest/release-notes/#track-rendering-beta) that integrates seamlessly within a story and achieves dynamic [map choreography](https://www.esri.com/arcgis-blog/products/arcgis-storymaps/mapping/choreograph-your-maps-with-arcgis-storymaps).

## Concept
This project leverages an existing webmap containing a time-enabled layer(s) and the associated time slider as an animation "timeline" for choreographed map actions. The logic of this map choreography are stored in an object with a corresponding [url hash](https://developer.mozilla.org/en-US/docs/Web/API/URL/hash). As this hash changes it can trigger actions such as:
- Changing the range of the time slider
- Changing map extent
- Adjusting layer visibility
- Animating the map

When integrated into the sidecar [block](https://doc.arcgis.com/en/arcgis-storymaps/author-and-share/add-sidecars.htm) of an ArcGIS StoryMap, these actions achieve a form of map choreography.

## File overview
### 1. `index.html`

The `index.html` file serves as the entry point for the application. It defines the structure of the web page and integrates the [ArcGIS JS SDK components](https://developers.arcgis.com/javascript/latest/components/).

#### Key Features:
- **ArcGIS Map Component**: The `<arcgis-map>` element loads a custom web map using its `item-id` attribute.
- **Time Slider and Bookmarks**: The `<arcgis-time-slider>` and `<arcgis-bookmarks>` components are embedded within an `<arcgis-expand>` widget for discrete UI organization.
---
### 2. `main.js`

The `main.js` file contains the core logic for the application. It handles map interactions, layer visibility, time slider animations, and map choreography.

#### Key Features:
- **Map Initialization**: Listens for the `arcgisViewReadyChange` event to ensure the map is fully loaded before interacting with it.
- **Track Renderer**: Implements the [track renderer](https://developers.arcgis.com/javascript/latest/release-notes/#track-rendering-beta) to visualize time-enabled data with features like latest observations and track lines.
- **Layer Visibility Management**: Dynamically toggles layer visibility based on the current hash/slide in the story.
- **Bookmark Navigation**: Pans and zooms the map to bookmarks defined in the webmap based on the current has/slide in the story.

## Getting Started

### Prerequisites
- An ArcGIS Online account with access to the required web map and feature layers.
> [!NOTE]
> The webmap should contain all the layers, bookmarks, etc. you intend to display in your story. Those layers should also be configured with the desired label expressions.

- Some familiarity with the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/latest/).

### Installation
1. Clone/download the repository.
2. Edit the `index.html` file and provide the `item-id` of your webmap. You may also like to configure the `zoom` and `center`.
```html
<arcgis-map item-id="<YOUR-WEBMAP-ITEM-ID>" zoom="3" center="-85.512764, 32.04355">
```
3. Open the `main.js` file and inspect the `choreographyMapping`. Update the key-value pairs with the values relevant to the story you want to tell with your data. The specifics of each key-value pair and the effect they have is described in [detail below](#choreographymapping).
```js
const choreographyMapping = {
    "#slide1": { trackLayer: "Osprey Points", trackField: "tag_local_identifier", trackLabelField: "event_id", trackLabelIds: ['1712299077','1990601351'], layersOn: [], layersOff: ['Global Ship Density'], start: "2016-08-15T00:00:00Z", end: "2016-10-06T00:00:00Z", bookmark: "Ohio" }
  }
```
4. Once published/hosted, the url can be embedded across a sequence of slides within a sidecar of an ArcGIS StoryMap using the hashes.

#### choreographyMapping
This **`choreographyMapping`** object contains a list of url hashes representing the slides of a ArcGIS StoryMap sidecar sequence ex. `#slide1`.

Each of these named hashes contains a number of **key-value** pairs describing what layer will be rendered with the track renderer, the bookmark of the map, and other aspects described below.

`trackLayer`: Defines the layer that will be rendered with the track renderer. This layer is referenced by it's name as it appears in the layer list of the webmap defined in the `<arcgis-map>` element within the `index.html` file.

`trackField`: Defines the field within the `trackLayer` that will be used to identify and group unique track values within the data. This will be provided to the track renderer `trackIdField`.

`trackLabelField`: Defines the field in the `trackLayer` that will be used to label or annotate specific data points.

`trackLabelIds`: Defines a list of values that appear within the `trackLabelField`. Only data points within the `trackLayer` that have these values in the `trackLabelField` will be annotated. Defining these values allows for the selective labelling of specific data points.

> [!NOTE]
> The label expression and formatting should be defined in the webmap. This field is strictly used to selectively highlight points within the current slide.

`layersOn`: Defines the layers that should be toggled **ON** for this specific slide. These layers are referenced by their names as it appears in the layer list of the webmap defined in the `<arcgis-map>` element within the `index.html` file.

`layersOff`: Defines the layers that should be toggled **OFF** for this specific slide. These layers are referenced by their names as it appears in the layer list of the webmap defined in the `<arcgis-map>` element within the `index.html` file.

`start`: Defines the timepoint at which the time slider should **START** for the given slide.

`end`: Defines the timepoint at which the time slider should **END** for the given slide.

`bookmark`: Defines the bookmark (map extent) that the map will be focused on during the given slide. These are referenced by their name as saved within the webmap.

---
## License
This project is licensed under the [Apache 2.0](LICENSE).
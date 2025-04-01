# migration-animation
This repo contains an R&D project aimed to determine whether a webmap built with the [ArcGIS SDK for JavaScript](https://developers.arcgis.com/javascript/latest/) can be choreographed within [ArcGIS StoryMaps](https://www.esri.com/en-us/arcgis/products/arcgis-storymaps/overview).

The concept is that a map containing a [time-enabled layer](https://support.esri.com/en-us/knowledge-base/how-to-enable-time-on-a-layer-in-arcgis-online-and-crea-000024836) and associated time slider effectively provides the 'timeline' of traditional animation software. By using steps within the time slider as ['keyframes'](https://en.wikipedia.org/wiki/Key_frame), the app could be triggered to perform actions such as changing extent, layer visibility, etc. These actions, when split between sidecar slides within an ArcGIS StoryMap could constitute a more advanced form of [map choreography](https://www.esri.com/arcgis-blog/products/arcgis-storymaps/mapping/choreograph-your-maps-with-arcgis-storymaps).

## WIP Task List
This is a list of the functionality that needs to be incorporated into the app or implemented when embedded within ArcGIS StoryMaps.
- [x] **Load custom webmap**
- [x] **Load time-enabled feature layer**
- [x] **Autoplay time slider on load**
```js
          // Start a TimeSlider animation if not already playing.
          if (timeSlider.state === "ready") {
            timeSlider.play();
          }
```
- [x] **Tuck time slider within the `<arcgis-expand>`** (Once the track renderer is implemented, we shouldn't need the time slider filter function and the UI can be hidden - right now if hidden the past observations don't inherit ghosting effect)
- [x] **Implement [track renderer](https://developers.arcgis.com/javascript/latest/release-notes/#track-rendering-beta)** (track, latest observation, etc.)
- [x] **Implement the pan/zoom to bookmarks on time slider 'steps'** (ex. On step or at time X of time slider -> pan/zoom to bookmark Y...)
- [x] **Embed the map into an ArcGIS StoryMaps sidecar sequence** (Can this be done using the url/#s? so that if the time-enabled layer spans 2010 -> 2020 we can configure the app to show 2010 -> 2013 in sidecar 1, 2013 -> 2017 in sidecar 2, and so on...)
- [ ] **Implement choreography that can turn layers on/off as required and re-assign track layer**
- [ ] **How can we work around the embed on mobile devices?**
- [ ] **Get the whole thing code reviewed by someone who knows what they're doing**
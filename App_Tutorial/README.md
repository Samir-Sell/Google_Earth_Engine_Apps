# Google Earth Engine App Tutorial

This tutorial will cover the basics of creating your own Earth Engine Apps. We will go through the process of creating a simple front-end with the Google Earth Engine Javascript API. A front-end will allow you to make no-code remote sensing solutions for for users who do not want to code or may be less Javascript savvy. In this tutorial, we will go through the process of creating a simplified version of the band math app that can be found the apps folder of this repository. 

### Organization

I personally found it useful to divide my apps into different sections: 

- Map set up and global variables
- Functions
- UI elements
- Event listeners (Thse are functions that can "listen" for events such as a button being pushed, or the map being clicked. These functions can then activate another function known as a callback function)
- Adding UI elements

### Map Set Up and Global Variables

The first step is remove some of the default UI to prevent it from interfering with our UI. 

```
  Map.setControlVisibility({
  fullscreenControl: false, // Remove full screen option (This breaks the app)
  drawingToolsControl: false, // Remove drawing controls
  mapTypeControl: false // Remove option to change default map imagery
})
```

The next step is to define a global variable which will contain all the information about the various images we want to present to our users. In this example, I have already defined some locations and corresponding imagery. 

```
var locations = {
  ottawa: { 
    long: -75.70,
    lat: 45.41,
    zoom: 11,
    geometry: ee.Geometry.Point([-75.70, 45.41]),
    image_tag: "LANDSAT/LC08/C01/T1/LC08_016028_20200618"
  },
  
  toronto: {
    long:-79.3889,
    lat : 43.6519,
    zoom: 11,
    geometry: ee.Geometry.Point([-80.2618, 43.9768]),
    image_tag: "LANDSAT/LC08/C01/T1/LC08_018030_20160418"
  },
    glacier: {
    long: -146.9637,
    lat: 61.1758,
    zoom: 11,
    geometry: ee.Geometry.Point([-146.9637, 61.1758]),
    image_tag: "LANDSAT/LC08/C01/T1/LC08_066017_20180323"
  }
}
```

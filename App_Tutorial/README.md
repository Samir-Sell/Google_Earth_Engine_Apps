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

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

```javascript
Map.setControlVisibility({
  fullscreenControl: false, // Remove full screen option (This breaks the app)
  drawingToolsControl: false, // Remove drawing controls
  mapTypeControl: false // Remove option to change default map imagery
})
```

The next step is to define a global variable which will contain all the information about the various images we want to present to our users. In this example, I have already defined some locations and corresponding imagery. 

```javascript
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

### Creating & Adding UI Elements

The UI Documentation for Earth Engine can be found here under the code editor tab with methods starting with "ui.":https://developers.google.com/earth-engine/apidocs

The first step will be to create a UI Elements section and a white panel where we can put all of our UI elements. We will use this panel to add things to like textboxes, buttons and drop down menus. 

```javascript
// Creating UI elements
//---------------------------------------------------------------------

// Create Side Panel for Control
var side_panel = ui.Panel({
   layout: ui.Panel.Layout.flow('vertical', true), // Make the elements in the panel flow vertically and to ensure it will wrap text if a text element is too long
   style: { // Define the style of our panel
      height: '90%', // Take up 90% of the users screen
      width: '400px', // Make the panel 400 pixels of width 
      position: "bottom-left"
    }
});
```

Next we create a label which allows us to display text.

```javascript
// Create title label 
var intro_label = ui.Label({
  value: "Landsat-8 Band Math Calculator", // This is what the label will display 
  style: {
    stretch: "horizontal", // Stretch the label horizontally
    fontWeight: "bold" // Depict the label as bold
  }
})
```

We want to now test if our label and panel worked. We have them created as an object, but we want to add these UI objects to the screen so that users can see them. To do this, we will create the "Adding UI Elements" section of our code and then we will add our panel to the map and our label to the panel. When making UI objects in the future, it really helps to assign them super descriptive names. 

```javascript
// Adding UI Elements
//---------------------------------------------------------------------

// Side Panel UI  
Map.add(side_panel);
```

You should now be able to run your program and see the beginnings of your UI! We will now need to create an instructions label for the app, an instructions label for the imagery selector and the imagery selector itself. Earth Engine has a ui.Select function built in that allows for a drop down menu to be created. 


```javascript
// Instructions
var instructions_label = ui.Label({
  value: "This app allows you to perform band math using operators such as +, -, /, sqrt and ** for exponents. The band codes are in the bottom right of the page. Use the band codes and the operators to calculate indices. Your calculation contains an error if no image appears." 
})

// Location label
var choose_location_label = ui.Label({
  value: "Please choose a location:"
})

// Location Selector
var choose_location_selector = ui.Select({
  items: ["Ottawa / Gatineau", // The items are the options that will be shown to the user
          "Toronto",
          "Columbia Glacier"],
  placeholder: "Select a Location" // This will be the default text displayed to the user 
})
```

Once the selector UI element is created, we will need to actually write some code to make it do something when the user changes the value of the selector box. We will need to use an event listener to check for changes in the selector box. Each UI element in Earth Engine has its own event listeners. More information can be found here: https://developers.google.com/earth-engine/guides/ui_events . We will be using an event listener called .onChange which is applied to the selector box. 

### Making the Selector Box Work

We will now add our event listener section.

```javascript
// Event Listenrs
//---------------------------------------------------------------------

// Detect changes in location selector box
choose_location_selector.onChange(prepare_location) //The event listener is applied to our selector box and when triggered will call the function prepare location which we will make next.
```


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
Map.add(side_panel); // Add the side panel to the map
side_panel.add(intro_label); // Add the intro_label to the side_panel

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
choose_location_selector.onChange(prepare_location) //The event listener is applied to our selector box and when triggered will call the function prepare_location which we will make next.
```

Finally, we will create our Funtions section in our code which will start with the prepare_location function we loaded into our selector box event listener. This function will handle the display of imagery to the user. When the user changes the selector box, the image, zoom and location of the map will change. Within this function is another function we have not written yet. It is called remove_all_layers(). This is important to have in our function as we want the previous images to be removed when a user selects a new image. 

```javascript
// Functions
//---------------------------------------------------------------------

// Function to load various locations
function prepare_location(){
  
  var location_selected = choose_location_selector.getValue() // We use a .getValue() call to retrieve the value of the selector box
  
  // Declaring variables
  var viz = "";
  var image = {};
  
  // The logic to handle image loading depending on what the location selected in the selector box is
  if (location_selected == "Ottawa / Gatineau"){ // Check if the location is Ottawa / Gatineau
    image = ee.Image(locations.ottawa.image_tag) // If the location is Ottawa, assign the image to the Ottawa image ID
    Map.setCenter(locations.ottawa.long, locations.ottawa.lat, locations.ottawa.zoom) // Use the metadata in locations variable to center the map around.
    viz = {bands: ['B4', 'B3', 'B2'], min: 5522, max: 12892} // Declare visualization parameters for the image
  }
  else if (location_selected == "Toronto"){
    image = ee.Image(locations.toronto.image_tag)
    Map.setCenter(locations.toronto.long, locations.toronto.lat, locations.toronto.zoom)
    viz = {bands: ['B4', 'B3', 'B2'], min: 5522, max: 12892}
  }
  else if (location_selected == "Columbia Glacier"){
    image = ee.Image(locations.glacier.image_tag)
    Map.setCenter(locations.glacier.long, locations.glacier.lat, locations.glacier.zoom)
    viz = {bands: ['B4', 'B3', 'B2'], min: -5948, max: 40764}
  }
  
  remove_all_layers() // This is a function call that will be talked about next
  
  Map.addLayer(image, viz, "Base RGB Image") // Add the chosen image to the display
}
```

We will now write a quick function to remove all the currently displayed layers. We will do this with a while loop that will run until the amount of map layers is 0. 

```javascript
// Function to remove all layers from the map
function remove_all_layers(){
    while (Map.layers().length() > 0) { // Create a while loop that continues while the number of layers on the map is above 0
      var layer = Map.layers().get(0); // Get the map layer with an index of 0
      Map.layers().remove(layer); // Delete the layer with an index of 0
    }
}
```

To complte the selector box, we just have to add it to the side panel. Navigate to your adding UI elements section and add the following snippet. 

```javascript
side_panel.add(choose_location_label);
```

Awesome! Run this and test that it works for you. We have a functional dropdown menu that can allow our users to switch aroud to view different images. We are going to want to add some functionality to our app. In this case, we are going to add some more labels and a textbox that will allow users to write their own band math equations. 

We are going to put the following snippets of code into our UI elements section. We are going to add a description label, a textbox for user input and a button. 

```javascript
// Label for equation
var prompt_equation_label = ui.Label({
  value: "Please Enter a Valid Equation:"
})

// Band math textbox
var band_math_calc = ui.Textbox({
  placeholder: "Enter Band Math Equation",
  style: {stretch: "horizontal"}
})

// Calculate button
var calculate_button = ui.Button({
  label: "Calculate",
  style: {stretch: "horizontal"}
});
```
Now we will add these new UI elements onto the display. Navigate to your adding UI elements section and add the below snippet. 

```javascript
side_panel.add(prompt_equation_label);
side_panel.add(band_math_calc);
side_panel.add(calculate_button);
```

You have just added a new description label, a textbox for user input regarding band math equations and a button that will be used to action a calculation. To make the button do something, we have to add an event listener that will listen for the button being clicked. 

Navigate to your event listner section and add. In the next step, we will be defining the function do_math(). 

```javascript
calculate_button.onClick(do_math) // Event listener to action a function on detection of a button click. 
```

The code below will define the function do_math() which will be intended to apply band math to the currently displayed image. Additionally, the function will also have to remove the previous displayed band math layer if there is one. 

```
// Function to perform the band math
function do_math(){
  
  var layers = Map.layers() // Grab the active layers on the map
  var image = layers.get(0).getEeObject(); // The image will always be the first layer which has an index of 0. 
  print(image) 
  
  var expression_value = band_math_calc.getValue() // Use .getValue of the textbox to grab the current equation that the textbox contains. 
    // Create a new calculation image that uses .expression to perform band math. 
    var calculation = image.expression( 
        expression_value, { // Create dictionary of bands for ease of use
          "COAST": image.select("B1"), 
          "BLUE": image.select("B2"),
          "GREEN": image.select("B3"),
          "RED": image.select("B4"),
          "NIR": image.select("B5"),
          "SWIR1": image.select("B6"),
          "SWIR2": image.select("B7"),
          "PAN": image.select("B8"),
          "CIR": image.select("B9"),
          "TIRS1": image.select("B10"),
          "TIRS2": image.select("B11")
    });
    
   // A function within a function to remove the potential previous band math layers
   function remove_previous_layers(){
        if (Map.layers().length() > 0) { // If there is more than one layer on the map, execute this logic
          var layer = Map.layers().get(1); // Get the map layer with an index of 1
          Map.layers().remove(layer); // Delete the layer with an index of 1
        }
      }
    
   // Call function to remove previous band math layer 
   remove_previous_layers()
```






// Map setup 
//---------------------------------------------------------------------

// Remove drawing function, leftover UI and full screen
Map.clear(); // Remove any default UI
Map.setControlVisibility({
  fullscreenControl: false,
  drawingToolsControl: false,
  mapTypeControl: false
})


// Functions
//---------------------------------------------------------------------

// Function to load various location 
function prepare_location(){
  
  var location_selected = choose_location_selector.getValue()
  var viz = "";
  var image = {};
  
  if (location_selected == "Ottawa / Gatineau"){
    image = ee.Image(locations.ottawa.image_tag)
    Map.setCenter(locations.ottawa.long, locations.ottawa.lat, locations.ottawa.zoom)
    viz = {bands: ['B4', 'B3', 'B2'], min: 5522, max: 12892}
  }
  else if (location_selected == "Toronto"){
    image = ee.Image(locations.toronto.image_tag)
    Map.setCenter(locations.toronto.long, locations.toronto.lat, locations.toronto.zoom)
    viz = {bands: ['B4', 'B3', 'B2'], min: 5522, max: 12892}
  }
  else if (location_selected == "Amazon Rainforest"){
    image = ee.Image(locations.amazon.image_tag)
    Map.setCenter(locations.amazon.long, locations.amazon.lat, locations.amazon.zoom)
    viz = {bands: ['B4', 'B3', 'B2'], min: 5522, max: 12000}
  }
  else if (location_selected == "The Nile"){
    image = ee.Image(locations.nile.image_tag)
    Map.setCenter(locations.nile.long, locations.nile.lat, locations.nile.zoom)
    viz = {bands: ['B4', 'B3', 'B2'], min: 7789, max: 23027}
  }
  else if (location_selected == "Columbia Glacier"){
    image = ee.Image(locations.glacier.image_tag)
    Map.setCenter(locations.glacier.long, locations.glacier.lat, locations.glacier.zoom)
    viz = {bands: ['B4', 'B3', 'B2'], min: -5948, max: 40764}
  }
  
  // Function to remove previous layers 
  var removepreviouslayer = function(name) {
    var layers = Map.layers();
    var names = [];
    layers.forEach(function(lay){
      var lay_name = lay.getName();
      names.push(lay_name)
    var length = names.length;
    if (length > 0) {
      var layer_to_remove = layers.get(0);
      Map.remove(layer_to_remove);
      }
    try {
      if (length > 0) {
        var second_to_remove = layers.get(0);
        Map.remove(second_to_remove);
      }
    }
    catch (err){
      print("No second layer")
    }
    })
    }
  removepreviouslayer() // Call the remove previous layer function
  // Add Layer
  Map.addLayer(image, viz, "Base RGB Image")
}

// Function to handle select box change and to load calculation text box
function insert_equation(){
  var select_value = indices_selector.getValue()
  print(select_value)
  
  if (select_value == "Normalized Difference Vegetation Index (NDVI)"){
    band_math_calc.setValue("(NIR - RED) / (NIR + RED)")
  }
  else if (select_value == "Normalized Difference Moisture Index (NDMI)"){
    band_math_calc.setValue("(NIR - SWIR1) / (NIR + SWIR1)")
  }
  else if (select_value == "Soil Adjusted Vegetation Index (SAVI)"){
    band_math_calc.setValue("((NIR - RED) / (NIR + RED + 0.5)) * (1.5)")
  }
  else if (select_value == "Enhanced Vegetation Index (EVI)"){
    band_math_calc.setValue("2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))")
  }
  else if (select_value == "Soil Composition Index (SCI)"){
    band_math_calc.setValue("(SWIR1-NIR)/(SWIR1 + NIR)")
  }
  else if (select_value == "Chlorophyll Index Green (CIG)"){
    band_math_calc.setValue("(NIR/GREEN) - 1")
  }
  else if (select_value == "Wide Dynamic Range Vegetation Index (WDRVI)"){
    band_math_calc.setValue("((0.1*NIR) - RED) / ((0.1*NIR) + RED)")
  }
  else if (select_value == "Soil Background Line (SBL)"){
    band_math_calc.setValue("NIR - (2.4*RED)")
  }
  else if (select_value == "Modified Soil Adjusted Vegetation Index (MSAVI)"){
    band_math_calc.setValue("((2*NIR + 1) - sqrt((2*NIR+1)**2 - 8*(NIR - RED))) / 2")
  }
  else if (select_value == "Built Up Index (BU)"){
    band_math_calc.setValue("(SWIR1 - NIR) / (SWIR1 + NIR) - ((NIR - RED) / (NIR + RED))")
  }
  else if (select_value == "Normalized Difference Water Index (NDWI)"){
    band_math_calc.setValue("(NIR - SWIR1) / (NIR + SWIR1)")
  }
  else if (select_value == "Normalized Difference Snow Index (NDSI)"){
    band_math_calc.setValue("(GREEN - SWIR1) / (GREEN + SWIR1)")
  }
}

// Function to perform the band math
function do_math(){
  
  var layers = Map.layers()
  var image = layers.get(0).getEeObject();
  print(image)
  
  var expression_value = band_math_calc.getValue()
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
   
    // Grab geometry for region reduction
    var geo = image.geometry()

    // Calculate STD and Mean of index calculated and rename the keys to be used in viz
    var meanStdDev = calculation.reduceRegion({
            reducer: ee.Reducer.mean().combine({reducer2:ee.Reducer.stdDev(), outputPrefix: null, sharedInputs: true}), geometry: geo, scale: 30, bestEffort: true});
    meanStdDev = meanStdDev.rename(meanStdDev.keys(), ['mean1','stdDev1'])
  
  
    // Function to create min and max params  
    meanStdDev.evaluate(function(val){
    var color_choice = change_colors.getValue().split(" ") // Turn into list for palette
    print(color_choice)
      var viz = {
          min: val.mean1 - (val.stdDev1 * 3),
          max: val.mean1 + (val.stdDev1 * 3),
          palette: color_choice
      };
      
      print("viz", viz)
      
      // Function to grab current layers and input them into a list and then delete the old layer
      var removepreviouslayer = function(name) {
        var layers = Map.layers();
        var names = [];
        layers.forEach(function(lay){
          var lay_name = lay.getName();
          names.push(lay_name)
        var length = names.length;
        if (length > 1) {
          var layer_to_remove = layers.get(1);
          Map.remove(layer_to_remove);
          }
        })
       //removelayer end  
       }
       removepreviouslayer() // Call the remove previous layer function
       if (indices_selector.getValue() == "Enhanced Vegetation Index (EVI)"){
        viz = {palette: change_colors.getValue().split(" "), min: -1, max: 1};
      }
      // Add layer to map
      Map.addLayer(calculation, viz, "Band Math Result");
    });
}


// Defining locations and metadata
//---------------------------------------------------------------------
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
  amazon: {
    long: -63.4580,
    lat: -3.1437,
    zoom: 11,
    geometry: ee.Geometry.Point([-62.7680, -2.7161]),
    image_tag: "LANDSAT/LC08/C01/T1/LC08_233062_20170728"
  },
  nile: {
    long: 33.0122,
    lat: 26.0073,
    zoom: 11,
    geometry: ee.Geometry.Point([32.6014, 25.6586]),
    image_tag: "LANDSAT/LC08/C01/T1/LC08_174042_20130408"
  },
  glacier: {
    long: -146.9637,
    lat: 61.1758,
    zoom: 11,
    geometry: ee.Geometry.Point([-146.9637, 61.1758]),
    image_tag: "LANDSAT/LC08/C01/T1/LC08_066017_20180323"
  }
}


var image_collection = ee.ImageCollection("LANDSAT/LC08/C01/T1")
  .filterBounds(locations.glacier.geometry)
  .filterDate("2012-01-01", "2020-01-01")
  .sort("CLOUD_COVER")
print(image_collection)


// Creating UI elements
//---------------------------------------------------------------------

// Create side panel for band list
var band_panel = ui.Panel({
   layout: ui.Panel.Layout.flow('vertical', true),
   style: {
      height: '360px',
      width: '250px',
      position: "bottom-right"
    }
});

// Create Side Panel for Control
var side_panel = ui.Panel({
   layout: ui.Panel.Layout.flow('vertical', true),
   style: {
      height: '90%',
      width: '400px',
      position: "bottom-left"
    }
});

// Create title label 
var intro_label = ui.Label({
  value: "Landsat-8 Band Math Calculator",
  style: {
    stretch: "horizontal",
    fontWeight: "bold"
  }
})

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
  items: ["Ottawa / Gatineau",
          "Toronto",
          "Amazon Rainforest",
          "The Nile",
          "Columbia Glacier"],
  placeholder: "Select a Location"
})

// Label for equation
var prompt_equation_label = ui.Label({
  value: "Please Enter a Valid Equation:"
})

// Define styles for band list
var band_list_styles = {
  fontSize:"12px"
}

// Define labels
var band1_label = ui.Label({
  value: "Band 1 - Coast Aerosol --> 'COAST'",
  style: band_list_styles
})
var band2_label = ui.Label({
  value: "Band 2 - Blue --> 'BLUE'",
  style: band_list_styles
})
var band3_label = ui.Label({
  value: "Band 3 - Green --> 'GREEN'",
  style: band_list_styles
})
var band4_label = ui.Label({
  value: "Band 4 - Red --> 'RED'",
  style: band_list_styles
})
var band5_label = ui.Label({
  value: "Band 5 - Near Infrared --> 'NIR'",
  style: band_list_styles
})
var band6_label = ui.Label({
  value: "Band 6 - SWIR 1 --> 'SWIR1'",
  style: band_list_styles
})
var band7_label = ui.Label({
  value: "Band 7 - SWIR 2 --> 'SWIR2'",
  style: band_list_styles
})
var band8_label = ui.Label({
  value: "Band 8 - Panchromatic --> 'PAN'",
  style: band_list_styles
})
var band9_label = ui.Label({
  value: "Band 9 - Cirrus --> 'CIR'",
  style: band_list_styles
})
var band10_label = ui.Label({
  value: "Band 10 - Thermal Infrared 1 --> 'TIRS1'",
  style: band_list_styles
})
var band11_label = ui.Label({
  value: "Band 11 - Thermal Infrared 2 --> 'TIRS2'",
  style: band_list_styles
})

// Calculate button
var calculate_button = ui.Button({
  label: "Calculate",
  style: {stretch: "horizontal"}
});

// Band math textbox
var band_math_calc = ui.Textbox({
  placeholder: "Enter Band Math Equation",
  style: {stretch: "horizontal"}
})

// Preloaded description label
var preload_label = ui.Label({
  value: "Choose from a list of indices to preload equations:",
})

// Indices selector to preload
var indices_selector = ui.Select({
  items: ["Normalized Difference Vegetation Index (NDVI)", 
          "Normalized Difference Moisture Index (NDMI)", 
          "Soil Adjusted Vegetation Index (SAVI)",
          "Enhanced Vegetation Index (EVI)",
          "Soil Composition Index (SCI)",
          "Chlorophyll Index Green (CIG)",
          "Wide Dynamic Range Vegetation Index (WDRVI)",
          "Soil Background Line (SBL)",
          "Modified Soil Adjusted Vegetation Index (MSAVI)",
          "Built Up Index (BU)",
          "Normalized Difference Water Index (NDWI)",
          "Normalized Difference Snow Index (NDSI)"],
          placeholder: "Select an Index"
})

// Label for color palette
var color_label = ui.Label({
  value: "Choose a color palette:"
});

// Select color options
var change_colors = ui.Select({
  items: ["Blue White Green", "White Blue Green Orange Red", 
    "Blue White Purple", "Blue White Red", "Green Purple Orange", 
    "Blue White Yellow", "White Orange Green", "Blue Red Green", 
    "White Green", "White Red", "Grey Red", "Grey Green",
    "White Orange Red Pink"],
  value: "Blue White Green"
  
});


// Event Listenrs
//---------------------------------------------------------------------

// Detect changes in index select menu
indices_selector.onChange(insert_equation)

//Detect changes in location selector box
choose_location_selector.onChange(prepare_location)

// Logic for band math pull
calculate_button.onClick(do_math)

// Adding UI Elements
//---------------------------------------------------------------------

// Side Panel UI  
Map.add(side_panel);
side_panel.add(intro_label);
side_panel.add(instructions_label);
side_panel.add(choose_location_label);
side_panel.add(choose_location_selector);
side_panel.add(prompt_equation_label);
side_panel.add(band_math_calc);
side_panel.add(calculate_button);
side_panel.add(preload_label);
side_panel.add(indices_selector);
side_panel.add(color_label);
side_panel.add(change_colors);

// Band Panel UI
Map.add(band_panel);
band_panel.add(band1_label);
band_panel.add(band2_label);
band_panel.add(band3_label);
band_panel.add(band4_label);
band_panel.add(band5_label);
band_panel.add(band6_label);
band_panel.add(band7_label);
band_panel.add(band8_label);
band_panel.add(band9_label);
band_panel.add(band10_label);
band_panel.add(band11_label);

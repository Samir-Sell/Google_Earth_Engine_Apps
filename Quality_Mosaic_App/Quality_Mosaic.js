// Remove drawing function, leftover UI and full screen
Map.clear(); // Remove any default UI
Map.setControlVisibility({
  fullscreenControl: false,
  drawingToolsControl: false,
  mapTypeControl: false
});

// Initializing global variables
var drawing_tools = Map.drawingTools();  
var polygon_copy = {};
var draw_counter = 0;


// Functions
//------------------------------------------------

// Function to remove previously drawn geometries between new user drawings
function clear_geometry() {
  var layers = drawing_tools.layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}

// Generate polygon copy of drawn polygon
function generate_repeat(){
  var aoi = drawing_tools.layers().get(0).getEeObject(); // Grab current layer 
  polygon_copy = {copy: aoi.union(aoi)} // Use union to create a copy
}

// Function to draw a polygon
function draw_polygon() {
  clear_geometry();
  drawing_tools.setShape('polygon');
  drawing_tools.draw();
  draw_counter = 0
}

// Function to test what polygon value should be used for the aoi
function determine_polygon_value(draw_counter){
  // Logic to determine if the aoi should be defined as current imported object, or as the polygon copy
  if (draw_counter === 0){
      var aoi = drawing_tools.layers().get(0).getEeObject();
    }
    else {
      var aoi = polygon_copy.copy
      print("Polygon_Copy", polygon_copy.copy)
    }
  return aoi
}
// Function to disable drawing tools after polygon has been drawn
function disable_draw() {
  drawing_tools.setShape(null);
}

// Function to remove previous layer
function remove_previous_layer() {
  var layers = Map.layers(); // Grab all map layers as an object
  var names = []; // Create empty list
  layers.forEach(function(lay){ // For each layer
    var lay_name = lay.getName(); // Grab the name
    names.push(lay_name); // Append it to the names list
  var length = names.length; // Grab the length of the list of layers
  if (length > 0) { // If there is at least one layer, trigger this
    var layer_to_remove = layers.get(0); // Grab the first layer
    Map.remove(layer_to_remove); // Remove the previously grabbed layer
    }
  });
 }

// Function to parse year from years textbox
function parse_years() {
  var raw_years = year_date_textbox.getValue();
  var years_to_list = raw_years.split("-");
  return years_to_list;
}

// Function to parse months from month textbox
function parse_months() {
  var raw_months = month_date_textbox.getValue();
  var months_to_list = raw_months.split("-");
  return months_to_list;
}

// Function to perform a cloud mask and make a quality band out of least cloudy pixels
var cloudless_mosaic = function(image) {
  
  // If the cloud bit (4) is set and the cloud confidence (6) is high
  // or the cloud shadow bit is set (8), then it's a bad pixel.
  var bqa = image.select("BQA");
  var cloud = bqa.bitwiseAnd(1 << 4)
                  .and(bqa.bitwiseAnd(1 << 6))
                  .or(bqa.bitwiseAnd(1 << 8));

  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  
  // Invert the mask and update the image
  var processed = image.updateMask(cloud.not()).updateMask(mask2);
  
  // Get drawing tools and current polygon. Then clip image
  var drawing_tools = Map.drawingTools(); // Get drawing tools
  var aoi = determine_polygon_value(draw_counter)
  var clipped = processed.clip(aoi); // Clip images
  return clipped;
};

// Function to perform a cloud mask and make a quality band out of greenest pixel (NDVI)
function add_ndvi(image) {
  
  // Calculate NDVI and name the band NDVI
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  return image.addBands(ndvi); // Add band to image
}

// Function and logic to generate quality mosaic based on provided parameters
function generate_mosaic() {
  remove_previous_layer(); // Call the remove previous layer function
  var years_list = parse_years(); // Parse the years input
  var months_list = parse_months(); // Parse the months input
  print("Years List:", years_list, "Months list", months_list); // Testing
  
  // Prepare date variables
  var start_year = parseInt(years_list.slice(0,1));
  var end_year = parseInt(years_list.slice(1,2));
  var start_month = parseInt(months_list.slice(0,1));
  var end_month = parseInt(months_list.slice(1,2));

  
  // Get drawing tools and get polyhon
  var drawingTools = Map.drawingTools(); 
  var aoi = drawingTools.layers().get(0).getEeObject();


  // Logic to handle selection box for Q mosaic type
  //-----------------------------------------------------
  
  // Placeholder for image collection
  var collection = {}; 
  
  // Define Visualization Parameters
  var viz = {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.4, gamma: 1.5};
  
  print(draw_counter) // Debuggin pruposes
  
  aoi = determine_polygon_value(draw_counter) // Determine what polygon to use for the AOI
  
  // Cloudless Q Mosaic
  if (type_mosaic_select.getValue() == "Cloudless Quality Mosaic") {
    print("Cloudless Start");
    collection = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA") // Load LS8 TOA
      .filterBounds(aoi) // Filter for images by polygon
      .filter(ee.Filter.calendarRange(start_year, end_year, "year")) // Filter for years
      .filter(ee.Filter.calendarRange(start_month, end_month, 'month')) // Filter for months
      .map(cloudless_mosaic); // Send each image to the cloudless mosaic function
    clear_geometry(); // Call clear geometry function
    Map.addLayer(collection, viz, "Cloudless Quality Mosaic"); // Add layer
  }
  // Greenest pixel (NDVI) mosaic
  else if (type_mosaic_select.getValue() == "NDVI Quality Mosaic") {
    print("NDVI Start");
    collection = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA") // Load LS8 TOA
      .filterBounds(aoi) // Filter for images by polygon
      .filter(ee.Filter.calendarRange(start_year, end_year, "year")) // Filter for years
      .filter(ee.Filter.calendarRange(start_month, end_month, 'month')) // Filter for months
      .map(add_ndvi); // Send images to the add NDVI function
    var greenest = collection.qualityMosaic('NDVI'); //Create a quality mosaic based on the NDVI function
    var clipped_greenest= greenest.clip(aoi); // Clip the Q mosaic 
    clear_geometry(); // Call clear geometry function

    // Add NDVI mosaic to the map
    Map.addLayer(clipped_greenest, viz, "NDVI Quality Mosaic");
  }
  
  draw_counter = draw_counter + 1 // Add 1 to the draw counter to indicate repeated queries in same area
  
  print(draw_counter) // For deubbing purposes
}

// UI Variables
//------------------------------------------------

// Side panel for control
var side_panel_control = ui.Panel({
   layout: ui.Panel.Layout.flow('vertical', true),
   style: {
      height: '90%',
      width: '400px',
      position: "bottom-left"
    }
});

// Title label
var title_label = ui.Label({
  value: "Quality Mosaic Creator App",
  style: {fontSize: "24px", fontWeight: "bold"}
});

// Instructions Label
var instructions_label = ui.Label({
  value: "This app generates quality mosaics. Entering a date range, a location and then choosing a paramter will allow you to generate and customize quality mosaics. "
});

// Date label prompting for the years to build Q mosaic
var years_date_label = ui.Label({
  value: "Enter the years (2014-2021) you want to use for the quality mosaic: ",
  style: {fontWeight: "bold"}
});

// Date textbox accepting year dates to build Q mosaic
var year_date_textbox = ui.Textbox({
  placeholder: 'Ex. "2015-2020"',
  style: {stretch: "horizontal"}
});

// Date label prompting for the months to build Q mosaic
var month_date_label = ui.Label({
  value: "Enter the month range you want to use for the quality mosaic: ",
  style: {fontWeight: "bold"}
});

// Date textbox accepting month dates to build Q mosaic
var month_date_textbox = ui.Textbox({
  placeholder: 'Ex. "4-9"',
  style: {stretch: "horizontal"}
});

// Button drawing AOI 
var button_drawing_aoi = ui.Button({
  label: "Draw Area of Interest for Quality Mosaic"
});

// Label for type of Q mosaic
var type_mosaic_label = ui.Label({
  value: "Choose what to build quality mosaic on:",
  style: {fontWeight: "bold"}
});

// Selector for choice of Q mosaic 
var type_mosaic_select = ui.Select({
  items: ["Cloudless Quality Mosaic",
          "NDVI Quality Mosaic"]
});

// Generate Q mosaic label
var generate_mosaic_label = ui.Label({
  value: "Generate Quality Mosaic",
  style: {fontWeight: "bold"}
});

// Generate Q mosaic button
var generate_mosaic_button = ui.Button({
  label: "Generate Quality Mosaic",
});

// Assign drawing tools to variable 
var drawing_tools = Map.drawingTools(); // Get drawing tools

// Delete any previous geometries from an old session
while (drawing_tools.layers().length() > 0) { // Grab layers from geom list and get length
  var layer = drawing_tools.layers().get(0); // Get first layer from list 
  drawing_tools.layers().remove(layer); // Delete first layer 
}

// Create a dummy geometry to prevent crashes
var dummy_geometry =
    ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '23cba7'});
drawing_tools.layers().add(dummy_geometry);

// Event Listeners
//------------------------------------------------
button_drawing_aoi.onClick(draw_polygon) // Draw AOI lister
drawing_tools.onDraw(ui.util.debounce(disable_draw, 250)); // Disable drawing AOI listener
generate_mosaic_button.onClick(generate_mosaic) // Create Mosaic listener
drawing_tools.onDraw(ui.util.debounce(generate_repeat, 1000)) // Event listener to detect a new drawing

// Add side panel
Map.add(side_panel_control);
// Add UI
side_panel_control.add(title_label);
side_panel_control.add(instructions_label)
side_panel_control.add(years_date_label);
side_panel_control.add(year_date_textbox);
side_panel_control.add(month_date_label);
side_panel_control.add(month_date_textbox);
side_panel_control.add(button_drawing_aoi);
side_panel_control.add(type_mosaic_label);
side_panel_control.add(type_mosaic_select);
side_panel_control.add(generate_mosaic_label);
side_panel_control.add(generate_mosaic_button);




// Create options for sensor selection as an object
// The key value is the value displayed to the user
var sensor_options = {
  landsat_8: ["LANDSAT/LC08/C01/T1"],
  landsat_7: ["LANDSAT/LE07/C01/T1"],
  sentinel_2: ["COPERNICUS/S2_SR"]
};

// Initialize some variables for later use in sensor options function
var chosen_sensor = "";
var bands = [];
var band_collection = "";

// Create select function UI feature to handle user input
var sensor_options = ui.Select({
  style: {stretch: 'horizontal'}, // Increase size of button to stretch horizontally
  items: Object.keys(sensor_options), // Use the object keys as the items for the drop down list
  onChange: function(key) { // Event listener to detect change in selection
    // Landsat-8 user selection
    if (key == "landsat_8"){
      chosen_sensor = "LANDSAT/LC08/C01/T1"; // Create chosen sensor string
      band_collection = ee.ImageCollection(chosen_sensor).first(); // Initiate first image to scrape band info 
      // Function to remove BQA band
      band_collection.bandNames().evaluate(function(bands) {
        // Function to aid in removing values from list
        function arrayRemove(arr, value) { 
         return arr.filter(function(ele){ 
              return ele != value});
        }
        var bqa_removed_bands = arrayRemove(bands, "BQA"); // Call remove function to remove BQA from list
        // Send updated band list to select drop down menus
        first_band.items().reset(bqa_removed_bands);
        second_band.items().reset(bqa_removed_bands);
        third_band.items().reset(bqa_removed_bands);

      });
      // debuggin print 
      print(chosen_sensor);

      // Landsat-7 user selection  
    } else if (key == "landsat_7"){
      chosen_sensor = "LANDSAT/LE07/C01/T1"; // Create chosen sensor string
      band_collection = ee.ImageCollection(chosen_sensor).first(); // Initiate first image to scrape band info 
      // Function to remove BQA band
      band_collection.bandNames().evaluate(function(bands) {
        // Function to aid in removing values from list
        function arrayRemove(arr, value) { 
         return arr.filter(function(ele){ 
              return ele != value});
        }
        var bqa_removed_bands = arrayRemove(bands, "BQA");// Call remove function to remove BQA from list
        // Send updated band list to select drop down menus
        first_band.items().reset(bqa_removed_bands);
        second_band.items().reset(bqa_removed_bands);
        third_band.items().reset(bqa_removed_bands);
      });
      
      //Sentinel-2 user selection
    } else if (key == "sentinel_2"){
      chosen_sensor = "COPERNICUS/S2_SR"; // Create chosen sensor string
      band_collection = ee.ImageCollection(chosen_sensor).first(); // Initiate first image to scrape band info 
      var sen2_band_list = band_collection.bandNames().slice(0,12) // Grab needed bands as list
      // Function to send bands to selector
      sen2_band_list.evaluate(function(bands) {
        // Send updated band list to select drop down menus
        first_band.items().reset(bands);
        second_band.items().reset(bands);
        third_band.items().reset(bands);
      });
    }
  } 
  });

// Date selection
var first_range = ui.Textbox({
  placeholder: "First Date",
  value: "2015-06-01"
})
var second_range = ui.Textbox({
  placeholder: "Second Date",
  value: "2015-10-1"
})

// Location selection
var lat_location = ui.Textbox ({
  placeholder: "Lat Coordinates",
  value: 180
})
var long_location = ui.Textbox ({
  placeholder: "long Coordinates",
  value: 180
})
function map_click(loc_obj){
   var lat = (loc_obj.lat).toFixed(3); // Get lat and limit decimal place
   var long = (loc_obj.lon).toFixed(3); // Get long and limit decimal place
   lat_location.setValue(lat); // Assign lat to lat textbox
   long_location.setValue(long); // Assign long to lat textbox
}
Map.onClick(map_click)

// Make a drop-down menu of bands.
var first_band = ui.Select({
    style: {stretch: 'horizontal'},
    placeholder: "Select First Band (R)"
});
var second_band = ui.Select({
    style: {stretch: 'horizontal'},
    placeholder: "Select Second Band (G)"
});
var third_band = ui.Select({
    style: {stretch: 'horizontal'},
    placeholder: "Select Third Band (B)"
});

// Allow user to choose max threshold for pixel cloud percentage
var cloud_thresh = ui.Textbox ({
  value: 100
})

// load image
function load_images(){

    // Generate image and visualization paramters based on sensor
    var visParams = "";
    var raw_collection = ""
    
    // Landsat-8 option
    if (chosen_sensor == "LANDSAT/LC08/C01/T1"){
      // Filter images in collection for paramters 
      raw_collection = ee.ImageCollection(chosen_sensor)
        .filterBounds(ee.Geometry.Point(Number(long_location.getValue()), Number(lat_location.getValue())))
        .filterDate(first_range.getValue(), second_range.getValue())
        .filterMetadata("CLOUD_COVER", "less_than", Number(cloud_thresh.getValue()));
      // Assign vis parameters
      visParams = {
         bands: [first_band.getValue(), second_band.getValue(), third_band.getValue()],
         max:16000
      }
     } 
     // Landsat-7 option
     else if (chosen_sensor == "LANDSAT/LE07/C01/T1" ) {
      raw_collection = ee.ImageCollection(chosen_sensor)
        .filterBounds(ee.Geometry.Point(Number(long_location.getValue()), Number(lat_location.getValue())))
        .filterDate(first_range.getValue(), second_range.getValue())
        .filterMetadata("CLOUD_COVER", "less_than", Number(cloud_thresh.getValue()));
       // Assign vis parameters
       visParams = {
         bands: [first_band.getValue(), second_band.getValue(), third_band.getValue()],
         max:70
      };
     }
     
     // Sentinel-2 Option
     else if (chosen_sensor == "COPERNICUS/S2_SR" ) {
       raw_collection = ee.ImageCollection(chosen_sensor)
        .filterBounds(ee.Geometry.Point(Number(long_location.getValue()), Number(lat_location.getValue())))
        .filterDate(first_range.getValue(), second_range.getValue())
        .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", Number(cloud_thresh.getValue()));
       // Assign vis parameters
       visParams = {
         bands: [first_band.getValue(), second_band.getValue(), third_band.getValue()],
         max:7000
      };
     }
    
    print(raw_collection);
    var mos_image = raw_collection.mosaic();
    print("test", mos_image);
    

    // Function to remove BQA band from images
    function remove_bqa(mos_image) {
      return mos_image.select(
        mos_image.bandNames().filter(
          ee.Filter.stringEndsWith('item', 'BQA').not()));
    }
    
    // Function to strip sentinel 2 bands
    function sentinel2_strip(mos_image) {
      return mos_image.select(
        mos_image.bandNames().filter(
          ee.Filter.stringStartsWith('item', 'B')));
    }
    
    // Logic to strip unneeded bands 
    var final_image = "";
    if (chosen_sensor == "LANDSAT/LE07/C01/T1") {
      final_image = remove_bqa(mos_image);
     } 
    else if (chosen_sensor == "LANDSAT/LC08/C01/T1") {
      final_image = remove_bqa(mos_image);
    } 
    else if (chosen_sensor == "COPERNICUS/S2_SR") {
      final_image = sentinel2_strip(mos_image);
    }

    // Add layer to map
    Map.addLayer(final_image, visParams);

    // Function to grab current layers and input them into a list and then delete the old layer
    var removepreviouslayer = function(name) {
      var layers = Map.layers();
      var names = [];
      layers.forEach(function(lay){
        var lay_name = lay.getName();
        names.push(lay_name)
      var length = names.length;
      if (length > 1) {
        var layer_to_remove = layers.get(0);
        Map.remove(layer_to_remove);
        }
      })
    }
    removepreviouslayer() // Call the remove previous layer function
  }

// Create load button ui object  
var load = ui.Button({
  label:"Load Imagery",
  style: {stretch: 'horizontal'}});
  
// When the bload button is clicked run the load button callback function  
load.onClick(load_images);

var drawingTools = Map.drawingTools(); // Get drawing tools
drawingTools.setShown(false); // Disable drawing tools

// Delete any previous geometries from an old session
while (drawingTools.layers().length() > 0) {
  var layer = drawingTools.layers().get(0);
  drawingTools.layers().remove(layer);
}

// Create a dummy geometry
var dummyGeometry =
    ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '23cba7'});
drawingTools.layers().add(dummyGeometry);

// Function to remove previously drawn geometries between new user drawings
function clearGeometry() {
  var layers = drawingTools.layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}

// Function to draw a polygon
function drawPolygon() {
  clearGeometry();
  drawingTools.setShape('polygon');
  drawingTools.draw();
}

// Specify symbol for button
var symbol = {
  polygon: '🔺'
}

// Function to draw histogram by utilizing the user drawn polyon as the area of interest for the histogram (Called region)
function draw_histo(){
    // Get geom as layer
    var aoi = drawingTools.layers().get(0).getEeObject();
    // Disable the drawing cursor
    drawingTools.setShape(null);
    // Reduce to scale to ensure the histogram does not fail to create
    var mapScale = Map.getScale();
    var scale = mapScale > 5000 ? mapScale * 2 : 5000;
    var image = Map.layers().get(0).get("eeObject");
    // Generate the histogram
    var drawn_histo = ui.Chart.image.histogram(image, aoi, scale)
    // Reset histogram with new info from drawn polygon (its position is 17)
    side_panel.widgets().set(17, drawn_histo); 
}
// Trigger draw histogram function with a 0.5 second delay
drawingTools.onDraw(ui.util.debounce(draw_histo, 500));
drawingTools.onEdit(ui.util.debounce(draw_histo, 500));

//Create histogram button with polygon shape to generate histogram
var histo_button = ui.Button({
  label: symbol.polygon + " Draw Histogram Polygon",
  onClick: drawPolygon,
  style: {stretch: 'horizontal'}
})

// Add UI selection features
// Create Side Panel for UI elements
var side_panel = ui.Panel({
   layout: ui.Panel.Layout.flow('vertical', true),
   style: {
     
      height: '90%',
      width: '400px',
      position: "bottom-left"
    }
});

// Add all UI elements and side panel 
Map.add(side_panel);
side_panel.add(ui.Label({
  value:"Please choose a sensor", 
  style: {
      fontWeight: 'bold',
      position: 'top-center',
      textAlign: 'right'
    }
}));
sensor_options.setPlaceholder('Choose a Sensor...');
side_panel.add(sensor_options);
side_panel.add(ui.Label("Please enter a beginning date range and an end date range in the format (yyyy-mm-dd)"))
side_panel.add(first_range)
side_panel.add(second_range)
side_panel.add(ui.Label("Please click on map to enter coordinates"))
side_panel.add(lat_location)
side_panel.add(long_location)
side_panel.add(ui.Label("Please enter the bands you want displayed"))
side_panel.add(first_band)
side_panel.add(second_band)
side_panel.add(third_band)
side_panel.add(ui.Label("Please enter the maximum cloud threshold for images"))
side_panel.add(cloud_thresh)
side_panel.add(load)
side_panel.add(ui.Label("Draw a polygon to generate a band histogram for a chosen area"))
side_panel.add(histo_button)

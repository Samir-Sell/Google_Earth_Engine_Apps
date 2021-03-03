// Remove drawing function, leftover UI and full screen
Map.clear(); // Remove any default UI
Map.setControlVisibility({
  fullscreenControl: false,
  drawingToolsControl: false,
  mapTypeControl: false
});

// Initializing global variables
var drawing_tools = Map.drawingTools(); 
var bands = []
var style_colors = [];
var classified = null
var fc = null;
var clipped_image = null;
var current_draw_option = null;
var feature_class_1 = null;
var land_class_1_button_click = 0;
var feature_class_2 = null;
var land_class_2_button_click = 0;
var feature_class_3 = null;
var land_class_3_button_click = 0;
var feature_class_4 = null;
var land_class_4_button_click = 0;
var series_names = null 
var color_list = null 
var testing_features = null


// Functions
//--------------------------------------------

// Function to delete last drawn geometry layer
function delete_last_training_point(){
  
  var layers = drawing_tools.layers();
  var index_to_delete = (layers.get(0).geometries().length())-1
  layers.get(0).geometries().remove(layers.get(0).geometries().get(index_to_delete));
  
}


// Function to determine how many series names should be in training data comparison chart
function null_checker(){
  

  if (feature_class_4 !== null){
    series_names = [land_class_1_name.getValue(), land_class_2_name.getValue(), land_class_3_name.getValue(), land_class_4_name.getValue()]
    color_list = [land_class_1_color_selector.getValue(), land_class_2_color_selector.getValue(), land_class_3_color_selector.getValue(), land_class_4_color_selector.getValue()]
    testing_features = [feature_class_1 , feature_class_2 , feature_class_3 , feature_class_4]
    
  }
  else if (feature_class_3 !== null){
    series_names = [land_class_1_name.getValue(), land_class_2_name.getValue(), land_class_3_name.getValue()]
    color_list = [land_class_1_color_selector.getValue(), land_class_2_color_selector.getValue(), land_class_3_color_selector.getValue()]
    testing_features = [feature_class_1, feature_class_2,  feature_class_3]
    
  }
  else {
    series_names = [land_class_1_name.getValue(), land_class_2_name.getValue()];
    color_list = [land_class_1_color_selector.getValue(), land_class_2_color_selector.getValue()]
    testing_features = [feature_class_1, feature_class_2]
  }
  
  

  //return series_names, color_list, testing_features;
}

// Function to draw seperation chart
function spec_chart(){
  
  // Define band list
  var test_bands = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B8A",
           "B11", "B12", "NDVI"]
  
  // Determine length of of series, colors and features
  null_checker()

  
  // Create feature collection
  var testing_collection = ee.FeatureCollection(testing_features)

  
  // Create training data by sampling with points
  var tester_training = clipped_image.select(test_bands).sampleRegions({
    collection: testing_collection,
    scale: 10
  });
  
  print(tester_training)
  
  
  // var pixelVals = clipped_image.reduceRegion(
  //   {reducer: ee.Reducer.toList(), geometry: testing_collection, scale: 10});
    
  // print(pixelVals)
  
  // var xValues = ee.List(pixelVals.get(band_1_selector.getValue()));
  // var yValues = pixelVals.toArray([band_2_selector.getValue(), band_2_selector.getValue()])

  // print(xValues)
  // print(yValues)
  
  // var chart = ui.Chart.array.values({array: yValues, axis: 1, xLabels: xValues})
  //   .setSeriesNames(series_names)
  //   .setChartType('ScatterChart')
  //   .setOptions({
  //     title: "Spectral Comparison Chart",
  //     colors: color_list,
  //     hAxis:
  //       {title: band_1_selector.getValue(), 
  //       titleTextStyle: {italic: false, bold: true}},
  //     vAxis: {
  //       title: band_2_selector.getValue(),
  //       titleTextStyle: {italic: false, bold: true}}
  //   })

  // print(chart)

  // Generate Chart  
  var comparison_chart =
      ui.Chart.feature
          .groups({
            features: tester_training,
            xProperty: band_1_selector.getValue(),
            yProperty: band_2_selector.getValue(),
            seriesProperty: "classID"
          })
          //.setSeriesNames(series_names)
          .setChartType('ScatterChart')
          .setOptions({
            title: "Spectral Comparison Chart",
            //colors: color_list,
            hAxis:
              {title: band_1_selector.getValue(), 
              titleTextStyle: {italic: false, bold: true}},
            vAxis: {
              title: band_2_selector.getValue(),
              titleTextStyle: {italic: false, bold: true}}
          })
          
  side_panel_control.widgets().set(26, comparison_chart)
  

}

// Function to generate legend rows
function add_legend_line(color, name){
  // Create an empty text label but fill the background
  var color_box = ui.Label({
    style: {
      backgroundColor: color,
      padding: '8px',
      margin: '0 0 4px 0'
      }
  });
  
  // Generate label with landclass name
  var description = ui.Label({
    value: name,
    style: {margin: '0 0 4px 6px'}
  });
  
  // return the panel with the legend line added 
  return ui.Panel({
    widgets: [color_box, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
  
}

// Function to remove landclass layers from the map
function remove_landclass(name) {
  var layers = Map.layers();
  // list of layers names
  var names = [];
  layers.forEach(function(lay) {
    var lay_name = lay.getName();
    names.push(lay_name);
  })
  // get index
  var index = names.indexOf(name)
  if (index > -1) {
    // if name in names
    var layer = layers.get(index)
    Map.remove(layer)
  } else {
    print('Layer '+name+' not found');
  }
}



// Function to delete all training Data
function delete_training_data() {
  
  // Reset all classes
  feature_class_1 = null;
  feature_class_2 = null;
  feature_class_3 = null;
  feature_class_4 = null;
  
  // Reset all feature class counters
  land_class_1_button_click = 0;
  land_class_2_button_click = 0;
  land_class_3_button_click = 0;
  land_class_4_button_click = 0;
  
  // In case user is in process of drawing, remove all geometry
  clear_all_geometry()
  
  // Remove all current land classes
  remove_landclass(land_class_1_name.getValue())
  remove_landclass(land_class_2_name.getValue())
  remove_landclass(land_class_3_name.getValue())
  remove_landclass(land_class_4_name.getValue())

  
  // Reconfigure button disables and labels
  land_class_1_button.setDisabled(false);
  land_class_1_button.setLabel("Land Class 1")
  land_class_1_name.setDisabled(false)
  land_class_2_button.setDisabled(true);
  land_class_2_button.setLabel("Land Class 2")
  land_class_2_name.setDisabled(true)
  land_class_3_button.setDisabled(true);
  land_class_3_button.setLabel("Land Class 3")
  land_class_3_name.setDisabled(true)
  land_class_4_button.setDisabled(true);
  land_class_4_button.setLabel("Land Class 4")
  land_class_4_name.setDisabled(true)
}

// Function to download user data
function download_data(){
  
  // Get length of current widgets
  var widget_length = side_panel_control.widgets().length()

  // Generate the download URL for training data
  var download_url = fc.getDownloadURL({
    format: "json",
    filename: "Training_Data"
  })
  
  // Generate the download URL for classification
  var geotiff_download = classified.getDownloadURL({
    name: "Classified_Image"
  })
  
  // Change display label to prompt user
  train_classify_label.setValue("GeoJSON Training Data:");
  
  
  // Apply link to the label
  download_link_label.setUrl(download_url);
  download_geotiff_link_label.setUrl(geotiff_download);
  
  // Add label to UI that contains link
  side_panel_control.widgets().set((widget_length-2), download_link_label);
  side_panel_control.widgets().set((widget_length-3), download_geotiff_link_label);

}

// Function to train and classify 
function train_classify() {
  
  // Create a list of the features
  var features_list = [feature_class_1, feature_class_2,
      feature_class_3, feature_class_4];

  // Create a feature collection from the features list
  fc = ee.FeatureCollection(features_list);
  
  // Create class ID and specify wanted bands
  var class_id = "classID"
  
  // Logic to assemble band list for classification
  bands = [];
  if (b1_box.getValue() === true){
    bands.push("B1")
  }
  if (b2_box.getValue() === true){
    bands.push("B2")
  }  
  if (b3_box.getValue() === true){
    bands.push("B3")
  } 
  if (b4_box.getValue() === true){
    bands.push("B4")
  }  
  if (b5_box.getValue() === true){
    bands.push("B5")
  }
  if (b6_box.getValue() === true){
    bands.push("B6")
  }
  if (b7_box.getValue() === true){
    bands.push("B7")
  } 
  if (b8_box.getValue() === true){
    bands.push("B8")
  }  
  if (b8a_box.getValue() === true){
    bands.push("B8A")
  }  
  // if (b9_box.getValue() === true){
  //   bands.push("B9")
  // } 
  if (b11_box.getValue() === true){
    bands.push("B11")
  }  
  if (b12_box.getValue() === true){
    bands.push("B12")
  }  
  if (ndvi_box.getValue() === true){
    bands.push("NDVI");
  }  
  
  // Create training data by sampling with points
  var training = clipped_image.select(bands).sampleRegions({
    collection: fc,
    scale: 10
  });
  
  

  // Train classifier 
  var trained = ee.Classifier.smileRandomForest(250).train(training, class_id, bands);

  // Create dictionary that stores the variable importance values from the smileRF classifier
  var dict = trained.explain();
  var variable_importance = ee.Feature(null, ee.Dictionary(dict).get('importance'));

  var test_dict = variable_importance.toDictionary()

  
  // Generate importance chart
  var importance_chart =
    ui.Chart.feature.byProperty(variable_importance)
      .setChartType('ColumnChart')
      .setOptions({
        title: 'Random Forest Variable Importance',
        legend: {position: 'none'},
        hAxis: {title: 'Bands'},
        vAxis: {title: 'Importance'}
      });
  

  // Classify the image with the same bands used for training
  classified = clipped_image.select(bands).classify(trained);

  // Get length of widgets
  var widget_length = side_panel_control.widgets().length()

  
  // Add chart to bottom of widget list
  side_panel_control.widgets().set(widget_length, importance_chart); 
  
  
  // Classification colors
  var land_class_1_color = land_class_1_color_selector.getValue();
  var land_class_2_color = land_class_2_color_selector.getValue();
  var land_class_3_color = land_class_3_color_selector.getValue();
  var land_class_4_color = land_class_4_color_selector.getValue();
  
  // Logic for vis params
  var vis_params = {};
  var land_class_legend_list = [];
  if (feature_class_3 === null) {
    style_colors = [land_class_1_color, land_class_2_color];
    vis_params = {min: 1, max: 2, palette: style_colors};
    land_class_legend_list = [land_class_1_name.getValue(), land_class_2_name.getValue()];
  }
  else if (feature_class_4 === null) {
    style_colors = [land_class_1_color, land_class_2_color,
      land_class_3_color]
    vis_params = {min: 1, max: 3, palette: style_colors}
    land_class_legend_list = [land_class_1_name.getValue(), land_class_2_name.getValue(), land_class_3_name.getValue()]
  }
  else if (feature_class_4 !== null) {
    style_colors = [land_class_1_color, land_class_2_color,
      land_class_3_color, land_class_4_color]
    vis_params = {min: 1, max: 4, palette: style_colors}
    land_class_legend_list = [land_class_1_name.getValue(), land_class_2_name.getValue(), land_class_3_name.getValue(), land_class_4_name.getValue()]
  }
  

  // Add the classified layer to map
  Map.addLayer(classified,
               vis_params,
               'Classification');
  
  // Update label value with new instructions for the download button / add download button          
  train_classify_label.setValue("Use the button below to download your training data:");
  side_panel_control.widgets().set((widget_length-1), download_data_button); 
  
  // Disable training buttons and delete button
  delete_training_button.setDisabled(true);
  land_class_1_button.setDisabled(true);
  land_class_2_button.setDisabled(true);
  land_class_3_button.setDisabled(true);
  land_class_4_button.setDisabled(true);


  // Add legend
  
  // Assemble lists of names and colors
  var legend_colors = style_colors;
  var legend_names = land_class_legend_list
  
  // Grab length for for loop
  var to_stop = legend_colors.length;
  
  // Add title to legend
  legend_panel.add(legend_title_label)
  
  // For loop to iterate through lenth of info for legend
  for (var x = 0; x < to_stop; x++){
    legend_panel.add(add_legend_line(legend_colors[x], legend_names[x]));
  }

  // Add legend to map
  Map.add(legend_panel)
}

// Function to handle land class 1 on button click
function land_class_1(){
  var land_class_1_color = land_class_1_color_selector.getValue()
  delete_last_training.setDisabled(false)
  if (land_class_1_button_click === 0){
    current_draw_option = "point_class_1"
    drawing_tools.setShape('point');
    var feature = drawing_tools.draw();
    land_class_1_button_click = land_class_1_button_click + 1
    
    // Disable previous buttons to prevent breaking the program
    draw_aoi_button.setDisabled(true)
    query_imagery_button.setDisabled(true)
  }
  else {
    point_logic()
    drawing_tools.setShape(null);
    land_class_1_name.setDisabled(true)
    land_class_2_name.setDisabled(false)
    land_class_1_button.setDisabled(true)
    land_class_2_button.setDisabled(false)
    land_class_1_button.setLabel("Finished")
    clear_all_geometry()
    Map.addLayer(feature_class_1, {color: land_class_1_color}, land_class_1_name.getValue())
  }
}

// Function to handle land class 2 on button click
function land_class_2(){
  var land_class_2_color = land_class_2_color_selector.getValue()
  if (land_class_2_button_click === 0){
    current_draw_option = "point_class_2"
    drawing_tools.setShape('point');
    var feature = drawing_tools.draw();
    land_class_2_button_click = land_class_2_button_click + 1
  }
  else {
    point_logic()
    drawing_tools.setShape(null);
    land_class_2_name.setDisabled(true)
    land_class_3_name.setDisabled(false)
    land_class_2_button.setDisabled(true)
    land_class_3_button.setDisabled(false)
    test_training_button.setDisabled(false)
    train_classify_button.setDisabled(false)
    land_class_2_button.setLabel("Finished")
    clear_all_geometry()
    Map.addLayer(feature_class_2, {color: land_class_2_color}, land_class_2_name.getValue())

  }
}

// Function to handle land class 3 on button click
function land_class_3(){
  var land_class_3_color = land_class_3_color_selector.getValue()
  if (land_class_3_button_click === 0){
    current_draw_option = "point_class_3"
    drawing_tools.setShape('point');
    var feature = drawing_tools.draw();
    land_class_3_button_click = land_class_3_button_click + 1
  }
  else {
    point_logic()
    drawing_tools.setShape(null);
    land_class_3_name.setDisabled(true);
    land_class_4_name.setDisabled(false)
    land_class_3_button.setDisabled(true)
    land_class_4_button.setDisabled(false)
    land_class_3_button.setLabel("Finished")
    clear_all_geometry()
    Map.addLayer(feature_class_3, {color: land_class_3_color}, land_class_3_name.getValue())

  }
}

// Function to handle land class 4 on button click
function land_class_4(){
  var land_class_4_color = land_class_4_color_selector.getValue()
  if (land_class_4_button_click === 0){
    current_draw_option = "point_class_4"
    drawing_tools.setShape('point');
    var feature = drawing_tools.draw();
    land_class_4_button_click = land_class_4_button_click + 1
  }
  else {
    point_logic()
    drawing_tools.setShape(null);
    land_class_4_name.setDisabled(true)
    land_class_4_button.setDisabled(true)
    land_class_4_button.setLabel("Finished")
    clear_all_geometry()
    Map.addLayer(feature_class_4, {color: land_class_4_color}, land_class_4_name.getValue());

  }
}

// Function to remove all layers
function remove_all_layers(){
  while (Map.layers().length() > 0) { // Grab layers from geom list and get length
    var layer = Map.layers().get(0); // Get first layer from list 
    Map.layers().remove(layer); // Delete first layer 
  }
}

// Function to clear all geoemtry
function clear_all_geometry() {
  while (drawing_tools.layers().length() > 0) { // Grab layers from geom list and get length
    var layer = drawing_tools.layers().get(0); // Get first layer from list 
    drawing_tools.layers().remove(layer); // Delete first layer 
  }
}

// Function to query imagery
function query_imagery(){
  
  // Enable delete button
  delete_training_button.setDisabled(false);
  
  // Enable first rename textbox
  land_class_1_name.setDisabled(false)
  
  // Enable the first land class button to allow for training  
  land_class_1_button.setDisabled(false)
  
  // Remove all previous layers 
  remove_all_layers()
  
  // Grab current layer 
  var aoi = drawing_tools.layers().get(0).getEeObject(); // Grab current layer 
  
  // Image collection call to grab best image
  var image = ee.ImageCollection("COPERNICUS/S2_SR")
    .filterBounds(aoi)
    .filterDate(first_date_select.getValue(), second_date_select.getValue())
    .sort("CLOUDY_PIXEL_PERCENTAGE")
    .first()
  
  // Clip image to the user drawn aoi
  clipped_image = image.clip(aoi)
  
  // Grab cooridnates for user drawn aoi and generate a linear ring geometry
  // Coordinates have to be flattened for the linearring method to work
  var coords_for_bounds = aoi.coordinates();
  var polygon_for_bounds = ee.Geometry.LinearRing(coords_for_bounds.flatten());
  
  // Add NDVI index to image
  var ndvi_band = clipped_image.normalizedDifference(['B8', 'B4']).rename('NDVI');
  clipped_image = clipped_image.addBands(ndvi_band);
  
  // Remove previous user drawn  polygon
  clear_geometry();
  
  // Add new linearing 'polygon'
  Map.addLayer(polygon_for_bounds, null, "Area of Interest Boundary");
  
  // Add clipped image
  Map.addLayer(clipped_image, {bands: ["B4", "B3", "B2"], min: -76.652, max:1100.600}, "Area of Interest" )
}

function point_logic(){
    if (current_draw_option == "point_class_1"){
      var class_1 = drawing_tools.layers().get(0).getEeObject(); // Grab current layer
      feature_class_1 = ee.Feature(class_1).set('classID', 1);
    }
    else if (current_draw_option == "point_class_2"){
      var class_2 = drawing_tools.layers().get(0).getEeObject(); // Grab current layer
      feature_class_2 = ee.Feature(class_2).set('classID', 2);
    }
    else if (current_draw_option == "point_class_3"){
      var class_3 = drawing_tools.layers().get(0).getEeObject(); // Grab current layer
      feature_class_3 = ee.Feature(class_3).set('classID', 3);
    }
    else if (current_draw_option == "point_class_4"){
      var class_4 = drawing_tools.layers().get(0).getEeObject(); // Grab current layer
      feature_class_4 = ee.Feature(class_4).set('classID', 4);
    }
}

// Function for draw logic on the event of geo added
function draw_logic(){
    if (current_draw_option == "rectangle"){
      drawing_tools.setShape(null);
    }
    else{
    }
    // else if (current_draw_option == "point_class_1"){
    //   var class_1 = drawing_tools.layers().get(0).getEeObject(); // Grab current layer
    //   feature_class_1 = ee.Feature(class_1).set('classID', 1);
    // }
    // else if (current_draw_option == "point_class_2"){
    //   var class_2 = drawing_tools.layers().get(0).getEeObject(); // Grab current layer
    //   feature_class_2 = ee.Feature(class_2).set('classID', 2);
    // }
    // else if (current_draw_option == "point_class_3"){
    //   var class_3 = drawing_tools.layers().get(0).getEeObject(); // Grab current layer
    //   feature_class_3 = ee.Feature(class_3).set('classID', 3);
    // }
    // else if (current_draw_option == "point_class_4"){
    //   var class_4 = drawing_tools.layers().get(0).getEeObject(); // Grab current layer
    //   feature_class_4 = ee.Feature(class_4).set('classID', 4);
    // }
}

// Function to draw AOI polygon
function draw_aoi(){
  clear_geometry();
  current_draw_option = "rectangle"
  drawing_tools.setShape('rectangle');
  drawing_tools.draw();
}

// Function to remove previously drawn geometries between new user drawings
function clear_geometry() {
  var layers = drawing_tools.layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}

// Geometry Drawning Requirments
//------------------------------------------------

// Delete any previous geometries from an old session
clear_all_geometry()

// Create a dummy geometry to prevent crashes
var dummy_geometry =
    ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '23cba7'});
drawing_tools.layers().add(dummy_geometry);

// UI Variables 
//------------------------------------------------

// Side panel for control
var side_panel_control = ui.Panel({
   layout: ui.Panel.Layout.flow('horizontal', true),
   style: {
      height: '90%',
      width: '450px',
      position: "bottom-left"
    }
});

// Title label
var title_label = ui.Label({
  value: "Sentinel-2 Classification App",
  style: {fontSize: "26px", fontWeight: "bold"}
});

// Instructions Label
var instructions_label = ui.Label({
  value: "This app will guide you through the process of a simple classification of Sentinel-2 data by using the Smile Random Forest classification method.",
  style: {
    maxWidth: "400px",
  }
});

// Date selection label with instructions
var first_date_selection_label = ui.Label({
  value: "Please select a date range in the format of YYYYMMDD:",
  style: {
    textAlign: "center",
    fontWeight: "bold"
  }
})

// First date selection textbox
var first_date_select = ui.Textbox({
  placeholder: "YYYY-MM-DD",
  value: "2019-04-01"

})

// Second date selection textbox
var second_date_select = ui.Textbox({
  placeholder: "YYYY-MM-DD",
  value: "2020-04-01"
})

// AOI Instructions
var aoi_label = ui.Label({
  value: "Please draw an area of interest to use for classification:",
  style: {
    fontWeight: "bold"
  }
})

// Draw aoi button 
var draw_aoi_button = ui.Button({
  label: "Draw AOI",
  style: {
    width: "400px"
  }
})

// Draw imagery button label
var query_imagery_label = ui.Label({
  value: "Press to query imagery:",
  style: {
    fontWeight: "bold"
  }
})

// Draw imagery button 
var query_imagery_button = ui.Button({
  label: "Query Imagery",
  style: {
    width: "400px"
  }
})

// Land classes label
var land_classes_label = ui.Label({
  value: "Please click the buttons to start gathering land class training data. When you are done with a class, click the button again to disable it.",
  style: {
    fontWeight:"bold",
    maxWidth: "400px"
  }
  
});

// Land class 1 button
var land_class_1_button = ui.Button({
  label: "Land Class 1",
  disabled: true,
  style: {
    width: "180px"
  }
})

// Color selector for landclass 1
var land_class_1_color_selector = ui.Select({
  items: ["Blue", "Green", "Yellow", "Purple", "White", "Orange"],
  value: "Blue",
  style: {
    width: "85px"
  }
})

// Text box to name land class 1
var land_class_1_name = ui.Textbox({
  placeholder: "Name",
  value: "Land Class 1",
  disabled: true,
  style: {
    width: "95px"
  }
})

// Land class 2 button
var land_class_2_button = ui.Button({
  label: "Land Class 2",
  disabled: true,
  style: {
    width: "180px"
  }
})

// Color selector for landclass 2
var land_class_2_color_selector = ui.Select({
  items: ["Blue", "Green", "Yellow", "Purple", "White", "Orange"],
  value: "Green",
  style: {
    width: "85px"
  }
})

// Text box to name land class 2
var land_class_2_name = ui.Textbox({
  placeholder: "Name",
  value: "Land Class 2",
  disabled: true,
  style: {
    width: "95px"
  }
})

// Land class 3 button
var land_class_3_button = ui.Button({
  label: "Land Class 3",
  disabled: true,
  style: {
    width: "180px"
  }
})

// Color selector for landclass 3
var land_class_3_color_selector = ui.Select({
  items: ["Blue", "Green", "Yellow", "Purple", "White", "Orange"],
  value: "Purple",
  style: {
    width: "85px"
  }
})

// Text box to name land class 3
var land_class_3_name = ui.Textbox({
  placeholder: "Name",
  value: "Land Class 3",
  disabled: true,
  style: {
    width: "95px"
  }
})

// Land class 4 button
var land_class_4_button = ui.Button({
  label: "Land Class 4",
  disabled: true,
  style: {
    width: "180px"
  }
})

// Color selector for landclass 4
var land_class_4_color_selector = ui.Select({
  items: ["Blue", "Green", "Yellow", "Purple", "White", "Orange"],
  value: "Orange",
  style: {
    width: "85px"
  }
})

// Text box to name land class 4
var land_class_4_name = ui.Textbox({
  placeholder: "Name",
  value: "Land Class 4",
  disabled: true,
  style: {
    width: "95px"
  }
})

// Clear training data collections label
var delete_training_label = ui.Label({
  value: "The buttons below can be used to delete your last training point added or erase all of your current training data allowing you to restart the process:",
  style: {
    fontWeight:"bold",
    maxWidth: "400px"
  }
})

// Delete training data button
var delete_last_training = ui.Button({
  label: "Delete Last Point",
  disabled: true,
  style: {
    width: "150px"
  }
})

// Delete training data button
var delete_training_button = ui.Button({
  label: "Delete All Training Data",
  disabled: true,
  style: {
    width: "150px"
  }
})

// Test Training Data label
var test_training_label = ui.Label({
  value: "Generate a chart to assess separability of training data within specific bands: ",
  style: {
    fontWeight:"bold",
    maxWidth: "400px"
  }
})

// Test training data button
var test_training_button = ui.Button({
  label: "Test Training Data",
  disabled: true,
  style: {
    width: "120px"
  }
})

// First band selector
var band_1_selector = ui.Select({
  items: ["B1", "B2", "B3", "B4",
      "B5", "B6", "B7", "B8", 
      "B8A", "B11", "B12", "NDVI"],
  placeholder: "x-Axis",
  style: {
    width: "100px"
  }
})

// Second band selector
var band_2_selector = ui.Select({
  items: ["B1", "B2", "B3", "B4",
      "B5", "B6", "B7", "B8", 
      "B8A", "B11", "B12", "NDVI"],
  placeholder: "y-Axis",
  style: {
    width: "100px"
  }
})

var placeholder_chart_comp_label = ui.Label({
  value:" "
})

// Instruction label for band and index selection
var band_index_instruction_label = ui.Label({
  value: "The next step is to choose which bands and indices you want included in the classification:",
  style: {
    width: "400px",
    fontWeight: "bold"
  }
})

// Radio boxes for band and indices selections
var b1_box = ui.Checkbox({
  label: "Band 1 (Aerosols)",
  value: true,
  style: {
    padding: "0px 45px 0px 0px"
  }
})

var b2_box = ui.Checkbox({
  label: "Band 2 (Blue)",
  value: true,
  style: {
    padding: "0px 30px 0px 0px"
  }
})

var b3_box = ui.Checkbox({
  label: "Band 3 (Green)",
  value: true,
  style: {
    padding: "0px 63px 0px 0px"
  }
})

var b4_box = ui.Checkbox({
  label: "Band 4 (Red)",
  value: true,
  style: {
    padding: "0px 30px 0px 0px"
  }
})

var b5_box = ui.Checkbox({
  label: "Band 5 (Red Edge 1)",
  value: true,
  style: {
    padding: "0px 30px 0px 0px"
  }
})

var b6_box = ui.Checkbox({
  label: "Band 6 (Red Edge 2)",
  value: true
})

var b7_box = ui.Checkbox({
  label: "Band 7 (Red Edge 3)",
  value: true,
  style: {
    padding: "0px 30px 0px 0px"
  }
})

var b8_box = ui.Checkbox({
  label: "Band 8 (NIR)",
  value: true,
  style: {
    padding: "0px 30px 0px 0px"
  }
})
var b8a_box = ui.Checkbox({
  label: "Band 8A (Red Edge 4)",
  value: true,
  style: {
    padding: "0px 22px 0px 0px"
  }
})
var b11_box = ui.Checkbox({
  label: "Band 11 (SWIR 1)",
  value: true,
  style: {
    padding: "0px 46px 0px 0px"
  }
})
var b12_box = ui.Checkbox({
  label: "Band 12 (SWIR 2)",
  value: true,
  style: {
    padding: "0px 49px 0px 0px"
  }
})
var ndvi_box = ui.Checkbox({
  label: "NDVI",
  value: true,
  style: {
    padding: "0px 30px 0px 0px"
  }
})
// Label to explain classification and training
var train_classify_label = ui.Label({
  value: "The next step is to use your points to train the classifier. The model is then used to classify your image segment.",
  style: {
    width: "400px",
    fontWeight: "bold"
  }
})

// Train and classify button
var train_classify_button = ui.Button({
  label: "Train & Classify",
  disabled: true,
  style: {
    width: "400px"
  }
})

// Grab download url button
var download_data_button = ui.Button({
  label: "Download Data",
  style: {
    width: "400px"
  }
})

// Download URL link label
var download_link_label = ui.Label({
  value: "Click to download your training data"
})

// Download URL geotiff link label
var download_geotiff_link_label = ui.Label({
  value: "Click to download your classified Geotiff"
})

// Legend panel
var legend_panel = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px'
  }
});

// Create legend title label
var legend_title_label = ui.Label({
  value: 'Land Class Legend',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});

// Event Listeners
//------------------------------------------------
draw_aoi_button.onClick(draw_aoi);
drawing_tools.onDraw(ui.util.debounce(draw_logic, 300));
query_imagery_button.onClick(query_imagery);
land_class_1_button.onClick(land_class_1);
land_class_2_button.onClick(land_class_2);
land_class_3_button.onClick(land_class_3);
land_class_4_button.onClick(land_class_4);
delete_last_training.onClick(delete_last_training_point)
delete_training_button.onClick(delete_training_data);
train_classify_button.onClick(train_classify);
test_training_button.onClick(spec_chart);
download_data_button.onClick(download_data);

// Adding UI
//------------------------------------------------
Map.add(side_panel_control);
side_panel_control.add(title_label);
side_panel_control.add(instructions_label);
side_panel_control.add(first_date_selection_label);
side_panel_control.add(first_date_select);
side_panel_control.add(second_date_select);
side_panel_control.add(aoi_label);
side_panel_control.add(draw_aoi_button);
side_panel_control.add(query_imagery_label);
side_panel_control.add(query_imagery_button);
side_panel_control.add(land_classes_label);
side_panel_control.add(land_class_1_button);
side_panel_control.add(land_class_1_color_selector);
side_panel_control.add(land_class_1_name);
side_panel_control.add(land_class_2_button);
side_panel_control.add(land_class_2_color_selector);
side_panel_control.add(land_class_2_name);
side_panel_control.add(land_class_3_button);
side_panel_control.add(land_class_3_color_selector);
side_panel_control.add(land_class_3_name);
side_panel_control.add(land_class_4_button);
side_panel_control.add(land_class_4_color_selector);
side_panel_control.add(land_class_4_name);
side_panel_control.add(test_training_label);
side_panel_control.add(test_training_button);
side_panel_control.add(band_1_selector);
side_panel_control.add(band_2_selector);
side_panel_control.add(placeholder_chart_comp_label);
side_panel_control.add(delete_training_label);
side_panel_control.add(delete_last_training);
side_panel_control.add(delete_training_button);
side_panel_control.add(band_index_instruction_label);
side_panel_control.add(b1_box);
side_panel_control.add(b2_box);
side_panel_control.add(b3_box);
side_panel_control.add(b4_box);
side_panel_control.add(b5_box);
side_panel_control.add(b6_box);
side_panel_control.add(b7_box);
side_panel_control.add(b8_box);
side_panel_control.add(b8a_box);
side_panel_control.add(b11_box);
side_panel_control.add(b12_box);
side_panel_control.add(ndvi_box);
side_panel_control.add(train_classify_label);
side_panel_control.add(train_classify_button);

// A collection of handy Earth Engine functions to make life easier and shorten lengthy code bases
// To use these you have to import the script 
// var SC = require('users/samirsellars/shortcuts_library:sc');
// Then you can call functions like SC.remove_first_geo() 

// ------------------------------------------------------------------------------------------------

// Function to remove the first geometry
var remove_first_geo = function() {
  var layers = Map.drawingTools().layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}
exports.remove_first_geo = remove_first_geo

// ------------------------------------------------------------------------------------------------

// Function to delete last drawn geoemtry
function delete_last_geo(){
  var layers = drawing_tools.layers();
  var index_to_delete = (layers.get(0).geometries().length())-1
  layers.get(0).geometries().remove(layers.get(0).geometries().get(index_to_delete));
}
exports.delete_last_geo = delete_last_geo

// ------------------------------------------------------------------------------------------------


// Function to remove all layers (Not Geometry)
function remove_all_layers(){
  while (Map.layers().length() > 0) { // Grab layers from geom list and get length
    var layer = Map.layers().get(0); // Get first layer from list 
    Map.layers().remove(layer); // Delete first layer 
  }
}
exports.remove_all_layers = remove_all_layers

// ------------------------------------------------------------------------------------------------

// Function to clear all geoemtry (Not Layers)
function clear_all_geometry() {
  while (drawing_tools.layers().length() > 0) { // Grab layers from geom list and get length
    var layer = drawing_tools.layers().get(0); // Get first layer from list 
    drawing_tools.layers().remove(layer); // Delete first layer 
  }
}
exports.clear_all_geometry = clear_all_geometry

// ------------------------------------------------------------------------------------------------

// Function to parse year from a textbox in the format of (yyyy-mm-dd) and return the values in a iterable list
// Requires the textbox as input
function parse_years(year_date_textbox) {
  var raw_years = year_date_textbox.getValue();
  var years_to_list = raw_years.split("-");
  return years_to_list;
}
exports.parse_years = parse_years

// ------------------------------------------------------------------------------------------------

// Function to parse a range of months from a textbox in the format of (mm-mm) and return the values in a iterable list
// Requires the textbox as input
function parse_months(month_date_textbox) {
  var raw_months = month_date_textbox.getValue();
  var months_to_list = raw_months.split("-");
  return months_to_list;
}
exports.parse_months = parse_months

// ------------------------------------------------------------------------------------------------

// Function to cloud mask Sentinel-2 imagery
// Requires the image as input
function sen_2_cloudless_mosaic_clip (image, aoi) {
  
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
    
  return processed;
};
exports.sen_2_cloudless_mosaic_clip = sen_2_cloudless_mosaic_clip

// ------------------------------------------------------------------------------------------------

// Function to calculate TWI using the flow accumulation 3 arc second dataset in EE
// Requres a DEM as input and the resolution of the DEM
function calculate_twi(dem, dem_scale){

  // 3 Arc Second flow accumulation derivative of 3 arc second WWF HydroSHED Data
  var flow_acc = ee.ImageCollection('users/imerg/flow_acc_3s').mosaic() 
  
  // Calculate Slope of user image
  var slope = ee.Terrain.slope(dem)
  
  // Clip flow accumulation to user DEM
  var clipped_acc = flow_acc.clip(slope.geometry())
  
  // Remove 0 and below values from the slope and replace with the value of 1
  var mod_slope = slope.where(slope.lte(0),1)
  
  //  Debgging reducer to check slope min (SHOULD NOT BE 0 OR LOWER)
  var mod_slope_min = mod_slope.reduceRegion({
    reducer: ee.Reducer.min(),
    geometry: mod_slope.geometry(),
    scale: dem_scale,
    maxPixels: 1e9
  });    
  
  // Convert slope mod to radiance
  var slope_radi = mod_slope.expression("ELE * 0.01745", {"ELE": mod_slope.select('slope')})
  
  // Rename Bands
  var combined = slope_radi.addBands(clipped_acc).rename(["Slope_Rad", "Flow_Acc"])
  
  // Calculate TWI
  var twi = combined.expression("log((Flow_Acc +" + dem_scale + ")/ tan(Slope_Rad))", 
    {"Flow_Acc": combined.select("Flow_Acc"),
     "Slope_Rad": combined.select("Slope_Rad")}).rename(["TWI"])
  
  // Return TWI image
  return twi
}
exports.calculate_twi = calculate_twi

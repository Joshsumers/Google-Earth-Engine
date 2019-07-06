//Landsat 7 NDVI 2000-2019 Fay, AR
//NDVI = (NIR - Red) / (NIR +Red)
//Red = Landsat 7 Band 3
//NIR = LandSat 7 Band 4

//Import Landsat8 Imagery
var L7_1999 =  ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");
var L7_2019 =  ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");

//Study Area
var StudyArea = Fay;

//Set Imagery to Study area
var L7_2000_SA = L7_1999.filterBounds(StudyArea);
var L7_2019_SA = L7_2019.filterBounds(StudyArea);


//Filter only 2015
var  L7_2000_SA_Oct = L7_2000_SA.filterDate('2000-03-01', '2000-04-30');
var L7_2019_SA_Oct = L7_2019_SA.filterDate('2019-03-01', '2019-04-30');

//cloud likelihood threshold
var cloud_thres = 50;

//cloud masking function
var cloudMask = function(image) {
  var qa = image.select('pixel_qa');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};

//mask clouds from all images
var l7_2000_NC = L7_2000_SA_Oct.map(cloudMask);
var l7_2019_NC = L7_2019_SA_Oct.map(cloudMask);

//NDVI Function
var addNDVI = function(image) {
var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
var landsat_ndvi = image.addBands(ndvi);
return landsat_ndvi;
}

//Add NDVI
var l7_2000_NC_NDVI = l7_2000_NC.map(addNDVI);
var l7_2019_NC_NDVI = l7_2019_NC.map(addNDVI);

//print NDVI Information for both
print("2000:", l7_2000_NC_NDVI);
print("2019:",l7_2019_NC_NDVI);

//Set NDVI Parameters
var NDVI_P = {bands: 'NDVI', min: -1, max: 1, palette:['red', 'white', 'green']};

//select NDVI bands
var l7_2000_NDVI_CO = l7_2000_NC_NDVI.select('NDVI');
var l7_2019_NDVI_CO = l7_2019_NC_NDVI.select('NDVI');

//Condense to one NDVI by median
var l7_2000_NDVI = l7_2000_NDVI_CO.median();
var l7_2019_NDVI = l7_2019_NDVI_CO.median();

//clip imagery to study area
var l7_2000_NDVI_C = l7_2000_NDVI.clip(StudyArea);
var l7_2019_NDVI_C = l7_2019_NDVI.clip(StudyArea);

var NDVIDIF = l7_2019_NDVI_C.subtract(l7_2000_NDVI_C);

//Map layer
Map.addLayer(NDVIDIF, NDVI_P, 'NDVI Difference');
Map.addLayer(l7_2000_NDVI_C, NDVI_P, 'Landsat 2000 NDVI');
Map.addLayer(l7_2019_NDVI_C, NDVI_P, 'Landsat 2019 NDVI')
Map.centerObject(Fay, 10);

//export image
Export.image.toDrive({
image: NDVIDIF,
description: "NDVI Dif 2000-2019",
maxPixels: 1e10,
crs: "EPSG:3857",
scale: 30,
fileFormat: 'GeoTIFF',
});

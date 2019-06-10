//Landsat 7 NDVI 1999
//NDVI = (NIR - Red) / (NIR +Red)
//Red = Landsat7 Band 3
//NIR = LandSat 7 Band 4

//Import Landsat8 Imagery
var L7_1999 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");
var L7_2018 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");

//Study Area
var StudyArea = /* color: #00ffff */ee.Geometry.Polygon(
        [[[-94.45142137513346, 35.37523533226942],
          [-94.42944871888346, 33.673681915156486],
          [-94.34155809388346, 33.5455858341855],
          [-94.03394090638346, 33.5455858341855],
          [-93.98999559388346, 32.99445325922183],
          [-91.08960496888346, 32.99445325922183],
          [-91.15552293763346, 33.43563782528855],
          [-90.76001512513346, 34.27499140363539],
          [-90.21069871888346, 34.90807687421593],
          [-89.66138231263346, 36.01762799845294],
          [-90.34253465638346, 36.01762799845294],
          [-90.07886278138346, 36.3899608850634],
          [-90.27661668763346, 36.49601605374671],
          [-94.62720262513346, 36.49601605374671]]]);

//Set Imagery to Study area
var L7_1999_SA = L7_1999.filterBounds(StudyArea);
var L7_2018_SA = L7_2018.filterBounds(StudyArea);


//Filter only 1999
var  L7_1999_SA_Oct = L7_1999_SA.filterDate('1999-10-01', '1999-10-31');
var L7_2018_SA_Oct = L7_2018_SA.filterDate('2018-10-01', '2018-10-31');
//cloud likelihood threshold
//var cloud_thres = 50;

//cloud masking function
//var maskclouds = function(image) {
//var cloudscore = ee.Algorithms.Landsat.simpleCloudScore(image);
//var cloudLikeLihood = cloudscore.select('cloud');
//var cloudpixels = cloudLikeLihood.lt(cloud_thres);
//var landsat_SA_15_NC_SS = image.updateMask(cloudpixels);
//return landsat_SA_15_NC_SS;
//}

//mask clouds from all images
//var L7_1999_NC = L7_1999_SA_Oct.map(maskclouds);
//var L7_2018_NC = L7_2018_SA_Oct.map(maskclouds);

//NDVI Function
var addNDVI = function(image) {
var ndvi = image.normalizedDifference(['B4', 'B3']).rename('NDVI');
var landsat_ndvi = image.addBands(ndvi);
return landsat_ndvi;
}

//Add NDVI
var L7_1999_NC_NDVI = L7_1999_SA_Oct.map(addNDVI);
var L7_2018_NC_NDVI = L7_2018_SA_Oct.map(addNDVI);

//print NDVI Information for both
print(L7_1999_NC_NDVI);
print(L7_2018_NC_NDVI);

//Set NDVI Parameters
var NDVI_P = {bands: 'NDVI', min: -1, max: 1, palette:['blue', 'white', 'green']};

//select NDVI bands
var L7_1999_NDVI_CO = L7_1999_NC_NDVI.select('NDVI');
var L7_2018_NDVI_CO = L7_2018_NC_NDVI.select('NDVI');

//Condense to one NDVI by median
var L7_1999_NDVI = L7_1999_NDVI_CO.median();
var L7_2018_NDVI = L7_2018_NDVI_CO.median();

//clip imagery to study area
var L7_1999_NDVI_C = L7_1999_NDVI.clip(StudyArea);
var L7_2018_NDVI_C = L7_2018_NDVI.clip(StudyArea);

//calculate difference in NDVI
var vegdif = L7_2018_NDVI_C.subtract(L7_1999_NDVI_C);

//Map layer
Map.addLayer (vegdif, NDVI_P, 'NDVI Difference');
Map.addLayer(L7_1999_NDVI_C, NDVI_P, 'Landsat 1999 NDVI');
Map.addLayer(L7_2018_NDVI_C, NDVI_P, 'Landsat 2018 NDVI');
Map.centerObject(L7_2018_NDVI_C, 7);

//export image
//Export.image.toDrive({
//image: landsat_NC_NDVIOC,
//description: "NDVI image of L7 study area",
//maxPixels: 1e10,
//crs: "EPSG:3857",
//scale: 30,
//fileFormat: 'GeoTIFF',
//});

//Landsat 8 NDVI 2015
//NDVI = (NIR - Red) / (NIR +Red)
//Red = Landsat8 Band 4
//NIR = LandSat 8 Band 5

//Import Landsat8 Imagery
var L8_2015 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");
var L8_2018 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");

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
var L8_2015_SA = L8_2015.filterBounds(StudyArea);
var L8_2018_SA = L8_2018.filterBounds(StudyArea);


//Filter only 2015
var  L8_2015_SA_Oct = L8_2015_SA.filterDate('2015-10-01', '2015-10-31');
var L8_2018_SA_Oct = L8_2018_SA.filterDate('2018-10-01', '2018-10-31');
//cloud likelihood threshold
var cloud_thres = 50;

//cloud masking function
var maskclouds = function(image) {
var cloudscore = ee.Algorithms.Landsat.simpleCloudScore(image);
var cloudLikeLihood = cloudscore.select('cloud');
var cloudpixels = cloudLikeLihood.lt(cloud_thres);
var landsat_SA_15_NC_SS = image.updateMask(cloudpixels);
return landsat_SA_15_NC_SS;
}

//mask clouds from all images
var l8_2015_NC = L8_2015_SA_Oct.map(maskclouds);
var l8_2018_NC = L8_2018_SA_Oct.map(maskclouds);

//NDVI Function
var addNDVI = function(image) {
var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
var landsat_ndvi = image.addBands(ndvi);
return landsat_ndvi;
}

//Add NDVI
var l8_2015_NC_NDVI = l8_2015_NC.map(addNDVI);
var l8_2018_NC_NDVI = l8_2018_NC.map(addNDVI);

//print NDVI Information for both
print(l8_2015_NC_NDVI);
print(l8_2018_NC_NDVI);

//Set NDVI Parameters
var NDVI_P = {bands: 'NDVI', min: -1, max: 1, palette:['blue', 'white', 'green']};

//select NDVI bands
var l8_2015_NDVI_CO = l8_2015_NC_NDVI.select('NDVI');
var l8_2018_NDVI_CO = l8_2018_NC_NDVI.select('NDVI');

//Condense to one NDVI by median
var l8_2015_NDVI = l8_2015_NDVI_CO.median();
var l8_2018_NDVI = l8_2018_NDVI_CO.median();

//clip imagery to study area
var l8_2015_NDVI_C = l8_2015_NDVI.clip(StudyArea);
var l8_2018_NDVI_C = l8_2018_NDVI.clip(StudyArea);

//Map layer
Map.addLayer(l8_2015_NDVI_C, NDVI_P, 'Landsat 2015 NDVI');
Map.addLayer(l8_2018_NDVI_C, NDVI_P, 'Landsat 2018 NDVI')
Map.centerObject(l8_2018_NDVI_C, 7);

//export image
//Export.image.toDrive({
//image: landsat_NC_NDVIOC,
//description: "NDVI image of L8 study area",
//maxPixels: 1e10,
//crs: "EPSG:3857",
//scale: 30,
//fileFormat: 'GeoTIFF',
//});

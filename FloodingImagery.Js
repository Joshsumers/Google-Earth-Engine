var AOI =
    ee.Geometry.Polygon(
        [[[-93.12187180863282, 35.182296857046765],
          [-93.12187180863282, 35.10958752994982],
          [-92.99106583939454, 35.10958752994982],
          [-92.99106583939454, 35.182296857046765]]], null, false);
//import Sent Data
var Sent = ee.ImageCollection("COPERNICUS/S2");
//import Landsat 8 Data
var L8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");

//filter by bounds
var SentAOI = Sent.filterBounds(AOI);
var L8AOI = L8.filterBounds(AOI);

//filter to one year ago
var SentAOI18 = SentAOI.filterDate('2018-05-01', '2018-06-01');
var L8AOI18 = L8AOI.filterDate('2018-05-01', '2018-06-01');

//filter to 2019
var SentAOISort = SentAOI.sort('GENERATION_TIME');
var L8AOISort = L8AOI.sort('DATE_ACQUIRED');

//select most recent images
var SentAOIMR = ee.Image(SentAOISort.first());
var L8AOIMR = ee.Image(L8AOISort.first());

//median for images
var SentAOI18M = SentAOI18.median();
var L8AOI18M = L8AOI18.median();

//clip
var SentMRC = SentAOIMR.clip(AOI);
var L8MRC = L8AOIMR.clip(AOI);
var L818C = L8AOI18M.clip(AOI);
var Sent18C = SentAOI18M.clip(AOI);

//filter to 3 bands
var SentRC = SentMRC.select('B4','B3','B2');
var L8RC = L8MRC.select('B4','B3','B2');
var Sent18RC = Sent18C.select('B4','B3','B2');
var L818RC = L818C.select('B4','B3','B2');

//map objects
Map.addLayer (SentRC, {bands: 'B4,B3,B2', min: 0.05, max: 4000, gamma: 1.6}, 'Sent Most Recent');
Map.addLayer (Sent18RC, {bands: 'B4,B3,B2', min: 0.05, max: 4000, gamma: 1.6}, 'Sent 18');
//Map.addLayer (L8RC, {bands: 'B4,B3,B2', min: 0.05, max: 0.8, gamma: 1.6}, 'L8 Most Recent');
//Map.addLayer (L818RC, {bands: 'B4,B3,B2', min: 0.05, max: 0.8, gamma: 1.6}, 'L8 18');

//center objects
Map.centerObject(SentRC, 12);

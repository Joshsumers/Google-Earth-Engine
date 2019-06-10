//sea surface temperature difference calculation
//March 2001 - March 2017
//Done by Joshua Sumers
//using NOAA Data

// call data
var data = ee.ImageCollection('NOAA/CDR/SST_WHOI/V2');
//seperate into date ranges
var data2001 = data.filterDate('2001-03-01','2001-03-20');
var data2017 = data.filterDate('2017-03-01','2017-03-20');
//select surface temperature table
var seaSurfaceTemperature01 = data2001.select('sea_surface_temperature');
var seaSurfaceTemperature17 = data2017.select('sea_surface_temperature');

//condense into just mean temperature for each year
var mediantemp01 = seaSurfaceTemperature01.median();
var mediantemp17 = seaSurfaceTemperature17.median();

//calculate difference in means
var mediantempdif = mediantemp17.subtract(mediantemp01);



var visParams = {
  min: -30.0,
  max: 30.0,
  palette: [
    'red', 'white', 'green'
  ],
};
Map.centerObject(mediantempdif, 1);
Map.addLayer(mediantempdif, visParams, 'Median Sea Surface temperature difference');
print(meantempdif);
//export image
Export.image.toDrive({
image: mediantempdif,
description: "Median Ocean Temperature Difference",
maxPixels: 1e10,
crs: "EPSG:3857",
scale: 500,
fileFormat: 'GeoTIFF',
});

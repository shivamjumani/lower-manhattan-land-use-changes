// sets up my mapbox access token so they can track my usage of their basemap services
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hpdmFtOTk3IiwiYSI6ImNqdWQ5ZDBicDB3bmE0ZHJ2NzF0Zjd4MHAifQ.klvBSqkgGNt7aNjxU7x0Gg';

// instantiate the map
var map = new mapboxgl.Map({
  container: 'mapContainer',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-74.017553,40.711442],
  zoom: 14.25,
  bearing: 31,
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// a helper function for looking up colors and descriptions for NYC land use codes
var LandUseLookup = (code) => {
  switch (code) {
    case 1:
      return {
        color: '#DDA0DD',
        description: '1 & 2 Family',
      };
    case 2:
      return {
        color: '#EE82EE',
        description: 'Multifamily Walk-up',
      };
    case 3:
      return {
        color: '#9400D3',
        description: 'Multifamily Elevator',
      };
    case 4:
      return {
        color: '#9370DB',
        description: 'Mixed Res. & Commercial',
      };
    case 5:
      return {
        color: '#ea6661',
        description: 'Commercial & Office',
      };
    case 6:
      return {
        color: '#FFFACD',
        description: 'Industrial & Manufacturing',
      };
    case 7:
      return {
        color: '#778899',
        description: 'Transportation & Utility',
      };
    case 8:
      return {
        color: '#5CA2D1',
        description: 'Public Facilities & Institutions',
      };
    case 9:
      return {
        color: '#8ece7c',
        description: 'Open Space & Outdoor Recreation',
      };
    case 10:
      return {
        color: '#808080',
        description: 'Parking Facilities',
      };
    case 11:
      return {
        color: '#A9A9A9',
        description: 'Vacant Land',
      };
    case 12:
      return {
        color: '#A9A9A9',
        description: 'Other',
      };
    default:
      return {
        color: '#A9A9A9',
        description: 'Other',
      };
  }
};

// use jquery to programmatically create a Legend
// for numbers 1 - 11, get the land use color and description
for (var i=1; i<12; i++) {
  // lookup the landuse info for the current iteration
  const landuseInfo = LandUseLookup(i);

  // this is a simple jQuery template, it will append a div to the legend with the color and description
  $('.legend').append(`
    <div>
      <div class="legend-color-box" style="background-color:${landuseInfo.color};"></div>
      ${landuseInfo.description}
    </div>
  `)
}

// a little object for looking up neighborhood center points
// var neighborHoodLookup = {
//   'park-slope': [-73.979702, 40.671199],
//   'morningside-heights': [-73.962750, 40.809099],
//   'fidi': [-74.007468, 40.710800],
//   'greenpoint': [-73.951,40.732169],
// }


// we can't add our own sources and layers until the base style is finished loading
map.on('style.load', function() {
  // add a button click listener that will control the map
  // we have 4 buttons, but can listen for clicks on any of them with just one listener
  // $('.flyto').on('click', function(e) {
  //   // pull out the data attribute for the neighborhood using query
  //   var neighborhood = $(e.target).data('neighborhood');
  //
  //   // this is a useful notation for looking up a key in an object using a variable
  //   var center = neighborHoodLookup[neighborhood];
  //
  //   // fly to the neighborhood's center point
  //   map.flyTo({center: center, zoom: 14});
  // });

  // let's hack the basemap style a bit
  // you can use map.getStyle() in the console to inspect the basemap layers
  map.setPaintProperty('water', 'fill-color', '#a4bee8')

  $('.2002').on('click', function() {
    map.setLayoutProperty('lower-manhattan-2002-lots-fill', 'visibility', 'visible')
    map.setLayoutProperty('lower-manhattan-2010-lots-fill', 'visibility', 'none')
    map.setLayoutProperty('lower-manhattan-2018-lots-fill', 'visibility', 'none')
  // this sets up the geojson as a source in the map, which I can use to add visual layers
    map.addSource('lower-manhattan-2002-pluto', {
      type: 'geojson',
      data: './data/lower_manhattan_2002.geojson',
    });

    // add a custom-styled layer for tax lots
    map.addLayer({
      id: 'lower-manhattan-2002-lots-fill',
      type: 'fill',
      source: 'lower-manhattan-2002-pluto',
      paint: {
        'fill-opacity': 0.7,
        'fill-color': {
          type: 'categorical',
          property: 'landUse2',
          stops: [
              [
                '01',
                LandUseLookup(1).color,
              ],
              [
                "02",
                LandUseLookup(2).color,
              ],
              [
                "03",
                LandUseLookup(3).color,
              ],
              [
                "04",
                LandUseLookup(4).color,
              ],
              [
                "05",
                LandUseLookup(5).color,
              ],
              [
                "06",
                LandUseLookup(6).color,
              ],
              [
                "07",
                LandUseLookup(7).color,
              ],
              [
                "08",
                LandUseLookup(8).color,
              ],
              [
                "09",
                LandUseLookup(9).color,
              ],
              [
                "10",
                LandUseLookup(10).color,
              ],
              [
                "11",
                LandUseLookup(11).color,
              ],
            ]
          }
      }
    }, 'waterway-label')

    // add an outline to the tax lots which is only visible after zoom level 14.8
    map.addLayer({
      id: 'lower-manhattan-2002-lots-line',
      type: 'line',
      source: 'lower-manhattan-2002-pluto',
      paint: {
        'line-opacity': 0.7,
        'line-color': 'gray',
        'line-opacity': {
          stops: [[14, 0], [14.8, 1]], // zoom-dependent opacity, the lines will fade in between zoom level 14 and 14.8
        }
      }
    });

    // add an empty data source, which we will use to highlight the lot the user is hovering over
    map.addSource('highlight-feature-2002', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // add a layer for the highlighted lot
    map.addLayer({
      id: 'highlight-line-2002',
      type: 'line',
      source: 'highlight-feature-2002',
      paint: {
        'line-width': 3,
        'line-opacity': 0.9,
        'line-color': 'black',
      }
    });

    // when the mouse moves, do stuff!
    map.on('mousemove', function (e) {
      // query for the features under the mouse, but only in the lots layer
      var features = map.queryRenderedFeatures(e.point, {
          layers: ['lower-manhattan-2002-lots-fill'],
      });

      // get the first feature from the array of returned features.
      var lot = features[0]

      if (lot) {  // if there's a lot under the mouse, do stuff
        map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

        // lookup the corresponding description for the land use code
        var landuseDescription = LandUseLookup(parseInt(lot.properties.landUse2)).description;

        // use jquery to display the address and land use description to the sidebar
        $('#address').text(lot.properties.address);
        $('#landuse').text(landuseDescription);
        $('#yearBuilt').text(lot.properties.yearBuilt);
        $('#resiUnits').text(lot.properties.unitsRes);
        document.getElementById("interactive-box").style.backgroundColor = LandUseLookup(parseInt(lot.properties.landUse2)).color;
        document.getElementById("interactive-box").style.opacity = '0.7'

        // set this lot's polygon feature as the data for the highlight source
        map.getSource('highlight-feature-2002').setData(lot.geometry);
      } else {
        map.getCanvas().style.cursor = 'default'; // make the cursor default

        // reset the highlight source to an empty featurecollection
        map.getSource('highlight-feature-2002').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    })
  })


  $('.2010').on('click', function() {

    map.setLayoutProperty('lower-manhattan-2010-lots-fill', 'visibility', 'visible')
    map.setLayoutProperty('lower-manhattan-2002-lots-fill', 'visibility', 'none')
    map.setLayoutProperty('lower-manhattan-2018-lots-fill', 'visibility', 'none')
  // this sets up the geojson as a source in the map, which I can use to add visual layers
    map.addSource('lower-manhattan-2010-pluto', {
      type: 'geojson',
      data: './data/lower_manhattan_2010.geojson',
    });

    // add a custom-styled layer for tax lots
    map.addLayer({
      id: 'lower-manhattan-2010-lots-fill',
      type: 'fill',
      source: 'lower-manhattan-2010-pluto',
      paint: {
        'fill-opacity': 0.7,
        'fill-color': {
          type: 'categorical',
          property: 'LandUse',
          stops: [
              [
                '01',
                LandUseLookup(1).color,
              ],
              [
                "02",
                LandUseLookup(2).color,
              ],
              [
                "03",
                LandUseLookup(3).color,
              ],
              [
                "04",
                LandUseLookup(4).color,
              ],
              [
                "05",
                LandUseLookup(5).color,
              ],
              [
                "06",
                LandUseLookup(6).color,
              ],
              [
                "07",
                LandUseLookup(7).color,
              ],
              [
                "08",
                LandUseLookup(8).color,
              ],
              [
                "09",
                LandUseLookup(9).color,
              ],
              [
                "10",
                LandUseLookup(10).color,
              ],
              [
                "11",
                LandUseLookup(11).color,
              ],
            ]
          }
      }
    }, 'waterway-label')

    // add an outline to the tax lots which is only visible after zoom level 14.8
    map.addLayer({
      id: 'lower-manhattan-2010-lots-line',
      type: 'line',
      source: 'lower-manhattan-2010-pluto',
      paint: {
        'line-opacity': 0.7,
        'line-color': 'gray',
        'line-opacity': {
          stops: [[14, 0], [14.8, 1]], // zoom-dependent opacity, the lines will fade in between zoom level 14 and 14.8
        }
      }
    });

    // add an empty data source, which we will use to highlight the lot the user is hovering over
    map.addSource('highlight-feature-2010', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // add a layer for the highlighted lot
    map.addLayer({
      id: 'highlight-line-2010',
      type: 'line',
      source: 'highlight-feature-2010',
      paint: {
        'line-width': 3,
        'line-opacity': 0.9,
        'line-color': 'black',
      }
    });

    // when the mouse moves, do stuff!
    map.on('mousemove', function (e) {
      // query for the features under the mouse, but only in the lots layer
      var features = map.queryRenderedFeatures(e.point, {
          layers: ['lower-manhattan-2010-lots-fill'],
      });

      // get the first feature from the array of returned features.
      var lot = features[0]

      if (lot) {  // if there's a lot under the mouse, do stuff
        map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

        // lookup the corresponding description for the land use code
        var landuseDescription = LandUseLookup(parseInt(lot.properties.LandUse)).description;

        // use jquery to display the address and land use description to the sidebar
        $('#address').text(lot.properties.Address);
        $('#landuse').text(landuseDescription);
        $('#yearBuilt').text(lot.properties.YearBuilt);
        $('#resiUnits').text(lot.properties.UnitsRes);
        document.getElementById("interactive-box").style.backgroundColor = LandUseLookup(parseInt(lot.properties.LandUse)).color
        document.getElementById("interactive-box").style.opacity = '0.7'

        // set this lot's polygon feature as the data for the highlight source
        map.getSource('highlight-feature-2010').setData(lot.geometry);
      } else {
        map.getCanvas().style.cursor = 'default'; // make the cursor default

        // reset the highlight source to an empty featurecollection
        map.getSource('highlight-feature-2010').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    })
  })

  $('.2018').on('click', function() {

    map.setLayoutProperty('lower-manhattan-2018-lots-fill', 'visibility', 'visible')
    map.setLayoutProperty('lower-manhattan-2002-lots-fill', 'visibility', 'none')
    map.setLayoutProperty('lower-manhattan-2010-lots-fill', 'visibility', 'none')
  // this sets up the geojson as a source in the map, which I can use to add visual layers
    map.addSource('lower-manhattan-2018-pluto', {
      type: 'geojson',
      data: './data/lower_manhattan_2018.geojson',
    });

    // add a custom-styled layer for tax lots
    map.addLayer({
      id: 'lower-manhattan-2018-lots-fill',
      type: 'fill',
      source: 'lower-manhattan-2018-pluto',
      paint: {
        'fill-opacity': 0.7,
        'fill-color': {
          type: 'categorical',
          property: 'LandUse',
          stops: [
              [
                '01',
                LandUseLookup(1).color,
              ],
              [
                "02",
                LandUseLookup(2).color,
              ],
              [
                "03",
                LandUseLookup(3).color,
              ],
              [
                "04",
                LandUseLookup(4).color,
              ],
              [
                "05",
                LandUseLookup(5).color,
              ],
              [
                "06",
                LandUseLookup(6).color,
              ],
              [
                "07",
                LandUseLookup(7).color,
              ],
              [
                "08",
                LandUseLookup(8).color,
              ],
              [
                "09",
                LandUseLookup(9).color,
              ],
              [
                "10",
                LandUseLookup(10).color,
              ],
              [
                "11",
                LandUseLookup(11).color,
              ],
            ]
          }
      }
    }, 'waterway-label')

    // add an outline to the tax lots which is only visible after zoom level 14.8
    map.addLayer({
      id: 'lower-manhattan-2018-lots-line',
      type: 'line',
      source: 'lower-manhattan-2018-pluto',
      paint: {
        'line-opacity': 0.7,
        'line-color': 'gray',
        'line-opacity': {
          stops: [[14, 0], [14.8, 1]], // zoom-dependent opacity, the lines will fade in between zoom level 14 and 14.8
        }
      }
    });

    // add an empty data source, which we will use to highlight the lot the user is hovering over
    map.addSource('highlight-feature-2018', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // add a layer for the highlighted lot
    map.addLayer({
      id: 'highlight-line-2018',
      type: 'line',
      source: 'highlight-feature-2018',
      paint: {
        'line-width': 3,
        'line-opacity': 0.9,
        'line-color': 'black',
      }
    });

    // when the mouse moves, do stuff!
    map.on('mousemove', function (e) {
      // query for the features under the mouse, but only in the lots layer
      var features = map.queryRenderedFeatures(e.point, {
          layers: ['lower-manhattan-2018-lots-fill'],
      });

      // get the first feature from the array of returned features.
      var lot = features[0]

      if (lot) {  // if there's a lot under the mouse, do stuff
        map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

        // lookup the corresponding description for the land use code
        var landuseDescription = LandUseLookup(parseInt(lot.properties.LandUse)).description;

        // use jquery to display the address and land use description to the sidebar
        $('#address').text(lot.properties.Address);
        $('#landuse').text(landuseDescription);
        $('#yearBuilt').text(lot.properties.YearBuilt);
        $('#resiUnits').text(lot.properties.UnitsRes);
        document.getElementById("interactive-box").style.backgroundColor = LandUseLookup(parseInt(lot.properties.LandUse)).color
        document.getElementById("interactive-box").style.opacity = '0.7'

        // set this lot's polygon feature as the data for the highlight source
        map.getSource('highlight-feature-2018').setData(lot.geometry);
      } else {
        map.getCanvas().style.cursor = 'default'; // make the cursor default

        // reset the highlight source to an empty featurecollection
        map.getSource('highlight-feature-2018').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    })
  })
})

function myFunction2002() {
  $('#total-com-area').text("106 million");
  $('#total-res-area').text("16 million");
  $('#total-res-units').text("17,450");
  $('#percent-res').text("12.7%");
  $('#build-height').text("11.9 floors");
}

function myFunction2010() {
  $('#total-com-area').text("105 million");
  $('#total-res-area').text("33 million");
  $('#total-res-units').text("30,000");
  $('#percent-res').text("23.9%");
  $('#build-height').text("13.1 floors");
}

function myFunction2018() {
  $('#total-com-area').text("103 million");
  $('#total-res-area').text("37 million");
  $('#total-res-units').text("36,200");
  $('#percent-res').text("25.9%");
  $('#build-height').text("14.2 floors");
}

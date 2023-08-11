// Define the ows URL for the WFS layer, use geojson format -> in this way we can use styles based on properties

//
// version=1.0.0&request=GetFeature&typeName=master_plan%3Aprg&outputFormat=text%2Fjavascript&format_options=callback%3AgetJson&srsName=EPSG%3A4326&callback=getJson&_=1689328522202
// version=1.0.0&request=GetFeature&typeName=master_plan%3Aprg&maxFeatures=50&outputFormat=application%2Fjson
const owsRootUrl = 'http://localhost:8585/geoserver/master_plan_pg/ows';
// const owsRootUrl = 'https://maps.gcc.tas.gov.au/geoserver/ows';
const defaultParameters = {
    "service": 'WFS',
    "version": '1.0.0',
    "request": 'GetFeature',
    "typeName": 'master_plan_pg:particelle',
    "outputFormat": 'text/javascript',
    "format_options": "callback:getJson",
    "srsName": 'EPSG:4326'
};

let WFSLayer = null;
const parameters = L.Util.extend(defaultParameters);
const prg_parameters = L.Util.extend({...defaultParameters, typeName: 'master_plan_pg:prg'});
const OWS_URL = owsRootUrl + L.Util.getParamString(parameters);
const OWS_URL_PRG = owsRootUrl + L.Util.getParamString(prg_parameters);

// map crosshair size etc:
const crosshairPath = 'lib/focus-black.svg';
const crosshairSize = 50;


let simTreeData = [];
const gLoadedFiles = new Set();
const gVisibleLayers = new Set();
const gCollection = {};
const firstRunDone = false; // for preventing 3-time calling of mapStops() on startup.


// ######################################
// Initiate Leaflet MAP
// background layers, using Leaflet-providers plugin. See https://github.com/leaflet-extras/leaflet-providers
const OSM = L.tileLayer.provider('OpenStreetMap.Mapnik');
const cartoVoyager = L.tileLayer.provider('CartoDB.VoyagerLabelsUnder');
const cartoPositron = L.tileLayer.provider('CartoDB.Positron');
const cartoDark = L.tileLayer.provider('CartoDB.DarkMatter');
const esriWorld = L.tileLayer.provider('Esri.WorldImagery');
const gStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
const gHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

const baseLayers = {
    "CartoDB Light": cartoPositron,
    "CartoDB Dark": cartoDark,
    "OpenStreetMap.org": OSM,
    "CartoDB Voyager": cartoVoyager,
    "ESRI Satellite": esriWorld,
    "gStreets": gStreets,
    "gHybrid": gHybrid
};

const map = new L.Map('map', {
    center: STARTLOCATION,
    zoom: STARTZOOM,
    layers: [cartoPositron],
    scrollWheelZoom: true,
    // maxZoom: MAXZOOM,
    // minZoom: MINZOOM,
    // maxBounds: BOUNDS,
    // maxBoundsViscosity: MAXBOUNDSVISCOSITY
});

const sidebar = L.control.sidebar('sidebar').addTo(map);

$('.leaflet-container').css('cursor', 'crosshair'); // from https://stackoverflow.com/a/28724847/4355695 Changing mouse cursor to crosshairs

L.control.scale({metric: true, imperial: false}).addTo(map);


// map panes
map.createPane('planPane');
map.getPane('planPane').style.zIndex = 540;
map.createPane('linePane');
map.getPane('linePane').style.zIndex = 550;
map.createPane('submittedPane');
map.getPane('submittedPane').style.zIndex = 610;
map.createPane('approvedPane');
map.getPane('approvedPane').style.zIndex = 620;

// layers
const planLayer = new L.layerGroup(null, {pane: 'planPane'});
const submittedLayer = new L.layerGroup(null, {pane: 'submittedPane'});
const approvedLayer = new L.layerGroup(null, {pane: 'approvedPane'});

// SVG renderer
const myRenderer = L.canvas({padding: 0.5, pane: 'planPane'});
// var myRendererLine = L.canvas({ padding: 0.5, pane: 'linePane' });


const wmsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/master_plan/wms?', {
    layers: 'master_plan:idrofsdafsagrafia-belluno',
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    attribution: 'Your attribution goes here'
});

// const wmsLayer2 = L.tileLayer.wms('http://localhost:8080/geoserver/master_plan/wms?', {
//     layers: 'master_plan:Particelle7540',
//     format: 'image/png',
//     transparent: true,
//     version: '1.1.0',
//     attribution: 'Your attribution goes here',
// });

const wmsLayer3 = L.tileLayer.wms('http://localhost:8585/geoserver/master_plan/wms?', {
    layers: 'master_plan:prg',
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    attribution: 'Your attribution goes here'
});


const overlays = {
    "Draft Plan": planLayer,
    "Submitted Inputs": submittedLayer,
    "Approved Inputs": approvedLayer,
};

planLayer.addTo(map);

const layerControl = L.control.layers(baseLayers, overlays, {collapsed: true, autoZIndex: false}).addTo(map);

// Add in a crosshair for the map. From https://gis.stackexchange.com/a/90230/44746
const crosshairIcon = L.icon({
    iconUrl: crosshairPath,
    iconSize: [crosshairSize, crosshairSize], // size of the icon
    iconAnchor: [crosshairSize / 2, crosshairSize / 2], // point of the icon which will correspond to marker's location
});

crosshair = new L.marker(map.getCenter(), {icon: crosshairIcon, interactive: false});
crosshair.addTo(map);
// Move the crosshair to the center of the map when the user pans
map.on('move', function (e) {
    const currentLocation = map.getCenter();
    crosshair.setLatLng(currentLocation);
    if (map.getZoom() <= 13) {
        $('#latlong').html(`Zoom in for a proper location`);
        document.getElementById('submitButton').disabled = true;
    } else {
        $('#latlong').html(`${currentLocation.lat.toFixed(4)},${currentLocation.lng.toFixed(4)}`);
        document.getElementById('submitButton').disabled = false;
    }
});

// lat, long in url
const hash = new L.Hash(map);


// ######################################
// RUN ON PAGE LOAD

$(document).ready(function () {

    setTimeout(function () {
        sidebar.open('home');
    }, 500);
    resetForm();
    loadCSV();
    fetchInputs();

});

// ######################################
// FUNCTIONS

function loadCSV() {
    // papa parse load csv
    Papa.parse(LAYERS_CSV, {
        download: true,
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // this reads numbers as numerical; set false to read everything as string
        complete: function (results, file) {
            loadLayers(results.data);
        }, // end of complete
        error: function (err, file, inputElem, reason) {
            alert(`Failed to load ${LAYERS_CSV}. Please check LAYERS_CSV in config.js`);
        },

    });

}

const group = new L.featureGroup().addTo(map);

function getJson(response) {
    console.log("FFFFFF", undefined)
    return response;
}
const zonaColors = {
    "B1.2": "#FF0000",
    "strada": "#00FF00",
    "P2_es": "#0000FF",
    "F1": "#FFFF00",
    "B1.1": "#FF00FF",
    "D1": "#00FFFF",
    "P6": "#800080",
    "Dsna": "#008000",
    "B3.1": "#000080",
    "F3": "#808000",
    "P4": "#800000",
    "P4_es": "#008080",
    "ferrovia": "#808080",
    "D3": "#C0C0C0",
    "P5": "#FFA500",
    "F5_IC": "#FFC0CB",
    "canale albani": "#800080",
    "F5_M": "#008000",
    "A": "#FFA500",
    "D5": "#FF0000",
    "B2.3": "#0000FF",
    "STRADE": "#000000",
    "PARTICELLE": "#979797",
};

$.ajax({
    jsonpCallback: 'getJson',
    type: 'GET',
    url: OWS_URL,
    async: false,
    dataType: 'jsonp',
    jsonp: false,
    success: function (response) {
        console.log(response)
        WFSLayer = L.geoJson(response, {
            style: function (feature) {
                return {
                    'color': zonaColors[feature.properties.livello],
                    'strokeLinecap':"round",
                    'strokeLinejoin':"round",
                    'fillOpacity': feature.properties.livello === "STRADE" ? "0.5" : "0.2",
                    'fillRule': "evenodd"
                }
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup("Number: " + feature.properties.numero);
            }
        }).addTo(group);
        map.fitBounds(group.getBounds());

    },
    error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR, textStatus, errorThrown);
    }
})




const kossher = [
    {
        "id": 'ROAD_RAILWAY_METRO_LINES_HSR_Alignment.geojson',
        "pid": 'Road Railway Metro',
        "name": "HSR Alignment <span style=\"background-color: #fdb462; float: left; width: 20px; height: 80%; margin: 5px; \"></span>",
        "shapefile": 'ROAD_RAILWAY_METRO_LINES_HSR_Alignment.geojson',
        "origname": "HSR Alignment",
        "type": "LineString"
    }
]
const layers_state = {};
for (let mp_layer in kossher) {
    layers_state[mp_layer.id] = false;
}

simTree({
    el: '#tree',
    check: true,
    linkParent: true,
    data: kossher,
    onClick: function (item) {
        console.log("1");
    },
    onChange: function (item) {
        // Send Ajax request to fetch the layers and add to map


        if (layers_state[item.id]) {
            layers_state[item.id] = false;
            // map.removeLayer(wmsLayer);
            // map.removeLayer(wmsLayer2);
            // map.removeLayer(wmsLayer3);

        } else {
            layers_state[item.id] = true;
            $.ajax({
                jsonpCallback: 'getJson',
                type: 'GET',
                url: OWS_URL_PRG,
                async: false,
                dataType: 'jsonp',
                jsonp: false,
                success: function (response) {
                    WFSLayer = L.geoJson(response, {
                        style: function (feature) {
                            return {
                                color: zonaColors[feature.properties.zona],
                            }
                        },
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup("Zone: " + feature.properties.zona);
                        }
                    }).addTo(group);
                    map.fitBounds(group.getBounds());
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR, textStatus, errorThrown);
                }
            })
            console.log("2")
            // wmsLayer3.addTo(planLayer);
        }
    }
});

function loadLayers(data) {
    // console.log(data);
    const groupsList = [];
    simTreeData = [];
    data.forEach(r => {
        if (!groupsList.includes(r.group)) {
            simTreeData.push({
                "id": r.group,
                "pid": "",
                "name": r.group,
                "type": 'grouping'
            });
            groupsList.push(r.group);
        }
        let row = {
            "id": r.shapefile,
            "pid": r.group,
            "name": `${r.name} <span style="background-color: ${r.color}; float: left; width: 20px; height: 80%; margin: 5px; "></span>`,
            "shapefile": r.shapefile,
            "color": r.color,
            "type": r.type,
            "origname": r.name
        };
        simTreeData.push(row);
    }); // end of forEach loop
    // console.log(simTreeData);
    // now, lunch simTree:
    // simTree({
    //     el: '#tree',
    //     check: true,
    //     linkParent: true,
    //     data: simTreeData,
    //     onClick: function (item) {
    //         //console.log(item);
    //     },
    //     onChange: function (item) {
    //         //console.log(item);
    //         updateMapLayers(item);
    //         wmsLayer.bringToFront();
    //     }
    // });
    //
    // // Auto-select one layer
    // setTimeout(function () {
    //     data.forEach(r => {
    //         if (r.default === 'Y') {
    //             document.querySelectorAll(`[data-id="${r.shapefile}"] > a`)[0].click();
    //         }
    //     });
    // }, 1000);

    // $('#status').html(`Loaded layers`);
}

function updateMapLayers(selectedLayers) {
    // filtering out group names
    const newSelection = new Set();
    selectedLayers.forEach(r => {
        if (r.type === 'grouping') {
            return;
        }
        console.log(r.shapefile);
        newSelection.add(r);
    });
    // console.log('newSelection', newSelection);

    newSelection.forEach(r => {
        // console.log(r.shapefile, 'in newSelection');
        // check if geojson has already been loaded
        if (gLoadedFiles.has(r)) {
            console.log(r.shapefile, "already loaded.");

            if (!gVisibleLayers.has(r)) {
                // geojson is already loaded, but not visible. Now that it's enabled, make it visible
                planLayer.addLayer(gCollection[r.shapefile]);
                console.log(`making ${r.shapefile} visible`);
                gVisibleLayers.add(r);
            }
        } else {
            loadGeojson(r); // make it visible also
        }

    });

    // make unselected layers invisible
    const removeLayersSet = new Set([...gVisibleLayers].filter(x => !newSelection.has(x)));
    removeLayersSet.forEach(r => {
        console.log('Have to remove from visible:', r.shapefile);
        planLayer.removeLayer(gCollection[r.shapefile]);
        gVisibleLayers.delete(r);
    });

}

function loadGeojson(r) {
    console.log("loading geojson:", r.shapefile);
    gLoadedFiles.add(r);
    const filename = `${SHAPES_FOLDER}${r.shapefile}`;
    // https://stackoverflow.com/a/5048056/4355695
    $.getJSON(filename)
        .done(function (geo) {
            if (r.type === 'Polygon' || r.type === 'MultiPolygon') {
                gCollection[r.shapefile] = L.geoJson(geo, {
                    style: function (feature) {
                        return {
                            stroke: true,
                            color: '#000000',
                            opacity: 0.5,
                            weight: 0.5,
                            fillColor: r.color,
                            fillOpacity: 0.6,
                            renderer: myRenderer
                        };
                    }
                }).bindTooltip(`${r.origname}`, {sticky: true, opacity: 0.5})
                    .bindPopup(`${r.origname}<br>Group: ${r.pid}`, {sticky: true, opacity: 0.5});
            } else {
                gCollection[r.shapefile] = L.geoJson(geo, {
                    style: function (feature) {
                        return {
                            stroke: true,
                            color: r.color,
                            weight: 3,
                            opacity: 0.6
                            // renderer: myRendererLine
                        };
                    }
                }).bindTooltip(`${r.origname}`, {sticky: true, opacity: 0.5})
                    .bindPopup(`${r.origname}<br>Group: ${r.pid}`, {sticky: true, opacity: 0.5});
            }
            planLayer.addLayer(gCollection[r.shapefile]);
            gLoadedFiles.add(r);
            gVisibleLayers.add(r);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            let message = `Failed to load ${r.shapefile}. Check SHAPES_FOLDER in config.js for correct path. Include / at end.`;
            console.log(message);
            alert(message);
        });
}


function tabulatorRedraw() {
}


function mapInputs(data) {

    $('#approvedNum').html(data.approved.length);
    $('#submittedNum').html(data.submitted.length + data.approved.length);

    const circleMarkerOptions_submit = {
        // renderer: myRenderer,
        radius: 5,
        fillColor: 'yellow',
        color: 'gray',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        pane: 'submittedPane'
    };

    data.submitted.forEach(r => {
        let lat = parseFloat(r.lat);
        let lon = parseFloat(r.lon);
        let tooltipContent = `${r.category} | ${r.name}`;
        const marker = L.circleMarker([lat, lon], circleMarkerOptions_submit)
            .bindTooltip(tooltipContent, {direction: 'top', offset: [0, -5]});
        marker.properties = r;
        marker.addTo(submittedLayer);
        marker.on('click', function () {
            const content = `<p>Category: <b>${r.category}</b></br>
            <div class="alert alert-secondary">${r.message}</div>
            Shared by: <b>${r.name}</b><br>
            <small>Shared on ${r.created_on}</b><br>
            Location: ${lat},${lon} <small><button class="btn btn-link" onclick="map.panTo([${lat},${lon}])">go there</button></small><br>
            ID: ${r.mid}<br><br>
            <span class="alert alert-warning">Not approved yet</span>
            </small></p>
            `;
            $('#displayMessage').html(content);

            map.panTo([lat, lon]);
            sidebar.open('messages');
        });

    });
    if (!map.hasLayer(submittedLayer)) {
        map.addLayer(submittedLayer);
    }

    const circleMarkerOptions_approved = {
        // renderer: myRenderer,
        radius: 5,
        fillColor: 'blue',
        color: 'gray',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        pane: 'approvedPane'
    };

    data.approved.forEach(r => {
        let lat = parseFloat(r.lat);
        let lon = parseFloat(r.lon);
        let tooltipContent = `${r.category} | ${r.name}`;
        const marker = L.circleMarker([lat, lon], circleMarkerOptions_approved)
            .bindTooltip(tooltipContent, {direction: 'top', offset: [0, -5]});
        marker.properties = r;
        marker.addTo(approvedLayer);
        marker.on('click', function () {
            const content = `<p>Category: <b>${r.category}</b></br>
            <div class="alert alert-secondary">${r.message}</div>
            Shared by: <b>${r.name}</b><br>
            <small>Shared on ${r.created_on}</b><br>
            Location: ${lat},${lon} <small><button class="btn btn-link" onclick="map.panTo([${lat},${lon}])">go there</button></small><br>
            ID: ${r.mid}<br><br>
            <span class="alert alert-success">Approved by mods</span>
            </small></p>
            `;
            $('#displayMessage').html(content);

            map.panTo([lat, lon]);
            sidebar.open('messages');
        });

    });
    if (!map.hasLayer(approvedLayer)) {
        map.addLayer(approvedLayer);
    }


    $('#fetchInputs_status').html(`Citizens Inputs loaded.`);
}

// shp2pgsql -I -D Particelle_transformed.sh particelle | psql -U postgres -d master_plan
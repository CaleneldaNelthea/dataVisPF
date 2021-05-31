// Connection with mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsZW5lbGRhIiwiYSI6ImNrNzRxempiNzBvcmszZHQweWU5MnQ2bnAifQ.j8fqiLOTxYsuUn3288rW5A';
// Create a new map with the set style and center
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [18.064856, 59.332772],
    zoom: 11
});

let layerList = document.getElementById('menu');
let inputs = layerList.getElementsByTagName('input');
// Set geojson type and location to use it with the map
let geoJSON = {
    type: 'vector',
    url: 'mapbox://calenelda.7cvz1y8i'
};
let sourceUse = 'IP';
let sourcelayerUse = 'data-1rn7tg';
let propertyUse = "latest_bandwidth";
//Settings for zoomed out. Makes high density of points blur into a bigger blob.
let IPheat =
    {
        "id": "IP-Heat",
        "type": "heatmap",
        "source": sourceUse,
        "source-layer": sourcelayerUse,
        "maxzoom": 15,
        "filter": ["<=", ["get", propertyUse], 1],
        "layout": {},
        "paint": {
            "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                5,
                22,
                30
            ],
            "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", propertyUse],
                0.02,
                0,
                65.45,
                1
            ],
            "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1,
                22,
                10
            ],
            "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(0, 0, 255, 0)",
                0.1,
                "hsl(56, 100%, 57%)",
                0.3,
                "hsl(36, 100%, 50%)",
                0.5,
                "hsl(26, 100%, 50%)",
                0.7,
                "hsl(6, 100%, 50%)",
                1,
                "red"
            ]
        }
    };
// set the dots for when zoomed in
let IPpoint = {
    'id': 'IP-point',
    'type': 'circle',
    'source': sourceUse,
    'source-layer': sourcelayerUse,
    "filter": ["<=", ["get", propertyUse], 1],
    'minzoom': 14,
    'paint': {
        // increase the radius of the circle as the zoom level and speed value increases
        'circle-radius':
            ['interpolate',
                ['linear'],
                ['zoom'],
                7,
                ['interpolate', ['linear'], ['get', propertyUse], 1, 1, 6, 4],
                16,
                ['interpolate', ['linear'], ['get', propertyUse], 1, 5, 6, 50]
            ],
        'circle-color':
            ['interpolate',
                ['linear'],
                ['get', propertyUse],
                0,
                'rgba(255, 247, 0,0)',
                4,
                'rgb(255, 247, 0)',
                8,
                'rgb(255, 208, 0)',
                10,
                'rgb(255, 170, 0)',
                15,
                'rgb(255, 115, 0)',
                20,
                'rgb(255, 42, 0)',
                60,
                'rgb(204, 37, 4)'
            ],
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        'circle-opacity':
            ['interpolate',
                ['linear'],
                ['zoom'],
                7,
                0,
                8,
                1
            ]
    }
};

// When the map loads set an interval that runs a function on a set interval
map.on('load', function () {
    let interval = setInterval(setHeatmap, 5000);
});

// Create the heatmap and build the layers for it
function setHeatmap() {

    map.addSource('IP', geoJSON);
    map.addLayer(IPheat, 'waterway-label');
    map.addLayer(IPpoint, 'waterway-label');
    // When zoomed in, points are clickable. This handles the click event
    map.on('click', 'IP-point', function (e) {
        new mapboxgl.Popup()
            .setLngLat(e.features[0].geometry.coordinates)
            .setHTML('<b>Bandwidth:</b> ' + e.features[0].properties.bandwidth)
            .addTo(map);
    });
}

// When zoomed in, points are clickable. This handles the click event
map.on('click', 'IP-point', function (e) {
    // What page to load when clicked
    window.document.location = '/display';
    // Store the data in session storage. This keeps the storage only while the session is active
    sessionStorage.setItem('timestamp', e.features[0].properties.timestamp);
    sessionStorage.setItem('bandwidths', e.features[0].properties.bandwidth);
    sessionStorage.setItem('isp', e.features[0].properties.isp);
    // With this displayData can see where the data is coming from
    let fileName = location.pathname.split("/").slice(-1);
    sessionStorage.setItem('link', fileName.toString());
});

// Function to switch between map styles
function switchLayer(layer) {
    var layerId = layer.target.id;
    map.setStyle('mapbox://styles/mapbox/' + layerId);
}

// When clicked, switch to the selected layer
for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}
mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsZW5lbGRhIiwiYSI6ImNrNzRxempiNzBvcmszZHQweWU5MnQ2bnAifQ.j8fqiLOTxYsuUn3288rW5A';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 12,
    center: [18.086157,59.834519]
});
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');
var geoJSON = {
    type: 'vector',
    url: 'mapbox://calenelda.7cvz1y8i'
}
var sourceUse = 'IP';
var sourcelayerUse = 'data-1rn7tg';
var propertyUse = 'latest_bandwidth';
var dotLayer = {
    'id': 'IP-point',
    'type': 'circle',
    'source': sourceUse,
    'source-layer': sourcelayerUse,
    'paint': {
        // make circles larger as the user zooms from z12 to z22
        'circle-radius': {
            'base': 1.75,
            'stops': [[12, 3], [19, 180]]
        },
        // color circles by bandwidth
        'circle-color': {
            property: propertyUse,
            type: 'exponential',
            stops: [
                [0, 'rgb(255,0,0)'],
                [5, 'rgb(255,255,0)'],
                [15, 'rgb(0,255,0)']
            ]
        }
    }
}

map.on('load', function() {
    var intervalDots = setInterval(createDots, 5000);
    var intervalBuildings = setInterval(createBuildings, 5000);

});

map.on('click', 'IP-point', function(e) {

    sessionStorage.setItem('timestamp', e.features[0].properties.timestamp);
    sessionStorage.setItem('bandwidths', e.features[0].properties.bandwidth);
    sessionStorage.setItem('isp', e.features[0].properties.isp);
    let fileName = location.pathname.split("/").slice(-1);
    sessionStorage.setItem('link', fileName.toString());
    window.document.location = '/display';
});

function createDots () {
    map.addSource(sourceUse, geoJSON);
    map.addLayer(dotLayer);
}

function createBuildings () {
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    map.addLayer(
        {
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',

                // use an 'interpolate' expression to add a smooth transition effect to the
                // buildings as the user zooms in
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        },
        labelLayerId
    );
}

function switchLayer(layer) {
    var layerId = layer.target.id;
    map.setStyle('mapbox://styles/mapbox/' + layerId);
}

for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}
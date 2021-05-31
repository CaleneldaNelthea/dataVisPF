let select_value = "avg";
let clusterRadius = 5;
let clusterMaxZoom = 14;
//Property of geojson data I want to aggregate on.  Must be numeric for this example
let propertyToAggregate = "latest_bandwidth"
let data_url = '/static/data_utf.json';
let mydata;
let dataToKeep = {};
let currentZoom;
let color = 'YlOrRd';
let clusterData;
let worldBounds = [-180.0000, -90.0000, 180.0000, 90.0000];
let geoJSON = {
    type: 'vector',
    url: 'mapbox://calenelda.7cvz1y8i'
}

// HELPER FUNCTIONS
function getFeatureDomain(geojson_data, myproperty) {
    let data_domain = []
    turf.propEach(geojson_data, function(currentProperties, featureIndex) {
        data_domain.push(Math.round(Number(currentProperties[myproperty]))  * 100 / 100)
    })
    return data_domain
}

function createDensityStops(stops_domain, scale) {
    let stops = []
    let i = 0.1;
    let length = stops_domain.length
    stops_domain.forEach(function(d) {
        stops.push([d, (i / length)])
        i++;
    });

    return stops
}

function createRadiusStops(stops_domain, min_radius, max_radius) {
    let stops = []
    let stops_len = stops_domain.length
    let count = 1
    stops_domain.forEach(function(d) {
        stops.push([d, min_radius + (count / stops_len * (max_radius - min_radius))])
        count += 1
    });
    return stops
}

function createColorStops(stops_domain, scale) {
    let stops = []
    stops_domain.forEach(function(d) {
        stops.push([d, scale(d).hex()])
    });
    return stops
}

//Supercluster with property aggregation
var cluster = new Supercluster({
    radius: clusterRadius,
    maxZoom: clusterMaxZoom,
    initial: function() {
        return {
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity
        };
    },
    map: function(properties) {
        return {
            count: 1,
            sum: Number(properties[propertyToAggregate]),
            min: Number(properties[propertyToAggregate]),
            max: Number(properties[propertyToAggregate])
        };
    },
    reduce: function(accumulated, properties) {
        accumulated.sum += Math.round(properties.sum * 100) / 100;
        accumulated.count += properties.count;
        accumulated.min = Math.round(Math.min(accumulated.min, properties.min) * 100) / 100;
        accumulated.max = Math.round(Math.max(accumulated.max, properties.max) * 100) / 100;
        accumulated.avg = Math.round(100 * accumulated.sum / accumulated.count) / 100;
    }
});

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsZW5lbGRhIiwiYSI6ImNrNzRxempiNzBvcmszZHQweWU5MnQ2bnAifQ.j8fqiLOTxYsuUn3288rW5A';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9?optimize=true',
    center: [18.064856,59.332772],
    zoom: 5,
    hash: true
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {
    fetch(data_url)
        .then(res => res.json())
        .then((out) => {
            mydata = out;
            cluster.load(mydata.features);
            initmap();
        })
        .catch(err => console.error(err));
});

var densityStops, radiusStops, colorStops;

function updateClusters(repaint) {
    currentZoom = map.getZoom();
    clusterData = turf.featureCollection(cluster.getClusters(worldBounds, Math.floor(currentZoom)));

    let stops_domain = chroma.limits(getFeatureDomain(clusterData, select_value), 'e', 8);

    var scale = chroma.scale(color).domain(stops_domain).mode('lab');

    densityStops = createDensityStops(stops_domain, scale);
    colorStops = createColorStops(stops_domain, scale);
    radiusStops = createRadiusStops(stops_domain, 10, 25);

    if (repaint) {
        map.setPaintProperty('clusters', 'heatmap-weight', {
            property: select_value,
            stops: densityStops
        });

        map.setPaintProperty('unclustered-point', 'circle-color', {
            property: propertyToAggregate,
            stops: colorStops
        });

        map.setPaintProperty('unclustered-point', 'circle-radius', {
            property: propertyToAggregate,
            stops: radiusStops
        });
    }
}

function initmap() {
    updateClusters(false);

    map.addSource("IP", {
        type: "geojson",
        data: clusterData,
        buffer: 0
    });

    map.addSource("IPV", geoJSON);

    map.addLayer({
        id: "clusters",
        type: "heatmap",
        source: "IP",
        filter: ["has", "point_count"],
        maxzoom: 15,
        paint: {
            "heatmap-weight": {
                property: select_value,
                stops: densityStops
            },
            "heatmap-radius": {
                stops: [
                    [10, 50],
                    [15, 80]
                ]
            },
            "heatmap-intensity": 2,
            "heatmap-opacity": {
                stops: [
                    [0, 1],
                    [14, 1],
                    [15, 0]
                ]
            }
        }
    }, "waterway-label");

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "IP",
        filter: ["!has", "point_count"],
        minzoom: 14,
        maxZoom: 9,
        paint: {
            "circle-color": {
                property: propertyToAggregate,
                stops: colorStops
            },
            "circle-radius": {
                property: propertyToAggregate,
                stops: radiusStops
            },
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
            "circle-opacity": {
                stops: [
                    [0, 0],
                    [14, 0],
                    [15, 1]
                ]
            }
        }
    }, "waterway-label");

    map.addLayer({
        id: "IP-point",
        type: "circle",
        source: "IPV",
        'source-layer': 'data-1rn7tg',
        minzoom: 8,
        paint: {
            // increase the radius of the circle as the zoom level and bandwidth value increases
            "circle-radius": {
                property: propertyToAggregate,
                type: "exponential",
                stops: radiusStops
            },
            "circle-color": {
                property: propertyToAggregate,
                type: "exponential",
                stops: [
                    [0, 'rgb(255,0,0)'],
                    [5, 'rgb(255,255,0)'],
                    [15, 'rgb(0,255,0)']
                ]
            },
            "circle-stroke-color": 'white',
            "circle-stroke-width": 1,
            "circle-opacity": {
                stops: [
                    [14, 0],
                    [15, 1]
                ]
            }
        }
    }, 'waterway-label');

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('zoom', function() {
        newZoom = map.getZoom();
        if (Math.floor(currentZoom) == 0) {
            currentZoom = 1
        };
        if (Math.floor(newZoom) != Math.floor(currentZoom)) {
            currentZoom = newZoom
            updateClusters(true);
            map.getSource("IP").setData(clusterData)
        }
    });

    map.on('click', 'IP-point', function(e) {
        window.document.location = '/display';
        sessionStorage.setItem('timestamp', e.features[0].properties.timestamp);
        sessionStorage.setItem('bandwidths', e.features[0].properties.bandwidth);
        sessionStorage.setItem('isp', e.features[0].properties.isp);
        let fileName = location.pathname.split("/").slice(-1);
        sessionStorage.setItem('link', fileName.toString());
    });
};
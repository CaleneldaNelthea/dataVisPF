"Use strict";

let bgColor = ['#50B432', '#DDDF00', '#EF8354', '#ED561B' ];
let BWArray = [];
let chart2;
let clientNodes = [];
let clientNodesToSort = [];
let count = 0;
let critBW = [];
let dataArray = [];
let hoverColor = ['#a4f786', '#fcfc90', '#eba383', '#e86161' ];
let highBW = [];
let lowBW = [];
let midBW = [];
let names = ['high', 'medium', 'low', 'critical'];
let prev;

// JQuery
// load the JSON and make it available with json
$.getJSON("/static/data_utf.json", function (json) {

// JavaScript
    // Get the nodes from JSON and sort them
    function setAndSortNodes() {
        // Iterate through the JSON file and push the server values to the clientNodesToSort array
        for (let i = 0; i < json.features.length; i++) {
            clientNodesToSort.push(json.features[i].properties.client_ip.toString());
        }
        // Sort the array on order
        clientNodesToSort.sort();
        // Iterate through the newly filled array
        for (let i = 0; i < clientNodesToSort.length; i++) {
            // If the value of the current selection doesn't equal prev, push it to clientNodes and set it's value as prev
            if (clientNodesToSort[i] !== prev) {
                clientNodes.push(clientNodesToSort[i]);
            }
            prev = clientNodesToSort[i];
        }
    }

    // Set the length for the bandwidth arrays
    function setBandwidthArraysLength() {
        setAndSortNodes();
        // Iterate through clientNodes and on the current position, set the value of the arrays to 0
        for (let j = 0; j < clientNodes.length; j++) {
            highBW[j] = 0;
            midBW[j] = 0;
            lowBW[j] = 0;
            critBW[j] = 0;
        }
    }

    // Fill the set arrays
    function fillBandwidthArrays() {
        setBandwidthArraysLength();
        // Iterate through the parameter
        for (let j = 0; j < clientNodes.length; j++) {
            // Iterate through the JSON file
            for (let i = 0; i < json.features.length; i++) {
                // If the client_ip property of the entry equals the clientNode in the current position of the array and the bandwidth property is greater than 10,
                // the value of the highBW array at current position is increased by 1.
                if ((json.features[i].properties.client_ip.toString() === clientNodes[j].toString()) && json.features[i].properties.latest_bandwidth > 10) {
                    highBW[j]++;
                }
            }
            // After the JSON has been iterated through, the highBW array is pushed to BWArray, which is an array of arrays
            BWArray.push(highBW);

            // Same as above but for bandwidth values between 11 and 3 and for midBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.client_ip.toString() === clientNodes[j].toString() && (json.features[i].properties.latest_bandwidth <= 10 && json.features[i].properties.latest_bandwidth > 3)) {
                    midBW[j]++;
                }
            }
            BWArray.push(midBW);

            // Same as above but for bandwidth values between 4 and 1 and for lowBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.client_ip.toString() === clientNodes[j].toString() && (json.features[i].properties.latest_bandwidth <= 3 && json.features[i].properties.latest_bandwidth > 1)) {
                    lowBW[j]++;
                }
            }
            BWArray.push(lowBW);

            // Same as above but for values from 1 and lower and for critBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.client_ip.toString() === clientNodes[j].toString() && json.features[i].properties.latest_bandwidth <= 1) {
                    critBW[j]++;
                }
            }
            BWArray.push(critBW);
        }
    }

    // Create a usable data set for the chart
    function createDataSetChartJS(BWArray) {
        // Iterate through the set array names
        for (let i = 0; i < names.length; i++) {
            // Set the dataArray on the current position
            // label is the bandwidth criteria (high, mid, low, crit), data is provided through a parameter and is set to either counties or cities,
            // The background and hoverbackground color is predefined to provide a visual representation of the latency.
            dataArray[i] = {label: names[i], data: BWArray[i], backgroundColor: bgColor[i],
                hoverBackgroundColor: hoverColor[i],
                hoverBorderWidth: 2};
        }
    }
    // Initiate
    fillBandwidthArrays();
    createDataSetChartJS(BWArray);

    //ChartJS
    // Options for the chart, set in a let so it can be re-used.
    let barOptions_stacked = {
        // Show tooltips
        tooltips: {
            mode: 'index',
            intersect: false
        },
        // Show tooltips on hover over
        hover: {
            mode: 'index',
            intersect: false
        },
        // Options for the bars and labels. fontFamily, fontSize, barThickness and color is set here, as well as making the graph stacked
        scales: {
            xAxes: [{
                ticks: {
                    beginAtZero:true,
                    fontFamily: "'Open Sans Bold', sans-serif",
                    fontSize:12,
                },
                scaleLabel:{
                    display:true,
                },
                gridLines: {
                },
                stacked: true
            }],
            yAxes: [{
                barThickness: 20,
                gridLines: {
                    display:false,
                    color: "#fff",
                    zeroLineColor: "#fff",
                    zeroLineWidth: 0
                },
                ticks: {
                    fontFamily: "'Open Sans Bold', sans-serif",
                    fontSize:14,
                    autoSkip: false
                },
                stacked: true
            }]
        },
        // Show the legend
        legend:{
            display: true
        },

        pointLabelFontFamily : "Quadon Extra Bold",
        scaleFontFamily : "Quadon Extra Bold",
    };

    // set the label
    document.getElementById("containerP").innerHTML = "Server Performance on Bandwidths";
    // Get the canvas for the chart
    let ctx = document.getElementById("chartjs").getContext('2d');
    // Set the chart height
    ctx.height = setChartHeight(regionNames);
    // Create the chart with regionNames and dataArray
    let bwChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: clientNodes,

            datasets: dataArray
        },

        options: barOptions_stacked,
    });

});
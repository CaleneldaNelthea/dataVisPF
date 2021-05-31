"Use strict";

let bgColor = ['#50B432', '#DDDF00', '#EF8354', '#ED561B' ];
let cityBWArray = [];
let citiesToSort = [];
let cityNames = [];
let countiesSweden = ["Stockholm","Västra Götaland","Skåne","Östergötland","Jönköping","Uppsala","Gävleborg","Dalarna","Örebro","Halland","Värmland","Norrbotten","Västmanland","Västerbotten"
    ,"Södermanland","Västernorrland","Kalmar","Kronoberg","Blekinge","Jämtland","Gotland"];
let critBW = [];
let dataArray = [];
let highBW = [];
let hoverColor = ['#a4f786', '#fcfc90', '#eba383', '#e86161' ];
let lowBW = [];
let midBW = [];
let names = ['high','medium','low','critical'];
let prev;
let regionBWArray = [];
let regionNames = [];
let regionsToSort = [];
let selectedCounties = [];
const reset = document.querySelector('.reset');
const show = document.querySelector('.show');
const toggle = document.querySelector('.toggleSwedenOnly');

// JQuery
// load the JSON and make it available with json
$.getJSON("/static/data_utf.json", function (json) {

    //Javascript
    // Get the selected Counties in the Listbox (dashboard.html)
    function selectcounties() {
        // Get the selected options of the first element with the id selCounty.
        let elem = document.querySelector("#selCounty").selectedOptions;
        // slice creates an empty array, with call the selection of elem is appended to this array
        let arr = [].slice.call(elem);
        // Map the new array arr to a usable array selectedCounties
        selectedCounties = arr.map(function(el){
            return el.value;
        });
    }

    // Get the cities of the selected counties
    function setCitiesToSort() {
        selectcounties();
        // Iterate through the JSON file
        for (let i = 0; i < json.features.length; i++) {
            // If the JSON entry has a regionName property that is in the selectedCounties array the city from this entry is pushed to the citiesToSort array.
            if (selectedCounties.includes(json.features[i].properties.regionName)) {
                citiesToSort.push(json.features[i].properties.city.toString())
            }
        // Set the array in alphabetical order
        } citiesToSort.sort();
    }

    // Remove duplicates
    function filterCities() {
        setCitiesToSort();
        // Iterate through the citiesToSort array
        for (let i = 0; i < citiesToSort.length; i++) {
            // If the selected city doesn't equal prev, push it to cityNames
            if (citiesToSort[i] !== prev) {
                cityNames.push(citiesToSort[i]);
            }
            // Set prev to the recently added entry
            prev = citiesToSort[i];
        // Sort alphabetically
        } cityNames.sort();
    }

    // Create the bandwidthsarray for the cities
    function fillCityBandwidthArrays() {
        filterCities();
        // Call the funtion and pass the created cityNames array along. This sets the required length for the array
        setBandwidthArraysLength(cityNames);
        // Iterate through the cityNames array
        for (let j = 0; j < cityNames.length; j++) {
            // Iterate through the JSON file
            for (let i = 0; i < json.features.length; i++) {
                // If the city property of the entry equals the city in the current position of the array and the bandwidth property is greater than 10,
                // the value of the highBW array at current position is increased by 1.
                if ((json.features[i].properties.city.toString() === cityNames[j].toString()) && json.features[i].properties.latest_bandwidth > 10) {
                    highBW[j]++;
                }
            }
            // After the JSON has been iterated through, the highBW array is pushed to cityBWArray, which is an array of arrays
            cityBWArray.push(highBW);

            // Same as above but for bandwidth values between 11 and 3 and for midBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.city.toString() === cityNames[j].toString() && (json.features[i].properties.latest_bandwidth <= 10 && json.features[i].properties.latest_bandwidth > 3)) {
                    midBW[j]++;
                }
            }
            cityBWArray.push(midBW);

            // Same as above but for bandwidth values between 4 and 1 and for lowBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.city.toString() === cityNames[j].toString() && (json.features[i].properties.latest_bandwidth <= 3 && json.features[i].properties.latest_bandwidth > 1)) {
                    lowBW[j]++;
                }
            }
            cityBWArray.push(lowBW);

            // Same as above but for values from 1 and lower and for critBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.city.toString() === cityNames[j].toString() && json.features[i].properties.latest_bandwidth <= 1) {
                    critBW[j]++;
                }
            }
            cityBWArray.push(critBW);
        }
    }

    function setCityChart() {
        // calling fillCityBandwidthArrays will call all the required functions
        fillCityBandwidthArrays();
        // passing the created cityBWArray to createDataSetChartJS will create a usable array to pass in the creation of the chart
        createDataSetChartJS(cityBWArray);

    }

    function setRegions() {
        // Iterate through JSON file and push the regionName to the regionsToSort array
        for (let i = 0; i < json.features.length; i++) {
            regionsToSort.push(json.features[i].properties.regionName.toString());
        }
        // Sort the array alphabetically
        regionsToSort.sort();
        // Remove doubles
        // Iterate through the regionsToSort array
        for (let i = 0; i < regionsToSort.length; i++) {
            // If the entry doesn't equal prev, push it to the regionNames array
            if (regionsToSort[i] !== prev) {
                regionNames.push(regionsToSort[i]);
            }
            // Set the value of prev to the entry
            prev = regionsToSort[i];
        // Sort the array alphabetically
        } regionNames.sort();
    }

    function clearBandwidthsArraysLength() {
        // Using splice and setting the start to 0 and end to the array length will clear any entries, resulting in an empty array
        cityBWArray.splice(0, cityBWArray.length);
        cityNames.splice(0, cityNames.length);
        citiesToSort.splice(0, citiesToSort.length);
        selectedCounties.splice(0, selectedCounties.length);
        highBW.splice(0, highBW.length);
        midBW.splice(0, midBW.length);
        lowBW.splice(0, lowBW.length);
        critBW.splice(0, critBW.length);
        dataArray.splice(0, dataArray.length);

    }

    function setBandwidthArraysLength(category) {
        // Iterate through parameter and on the current position, set the value of the arrays to 0
        for (let j = 0; j < category.length; j++) {
            highBW[j] = 0;
            midBW[j] = 0;
            lowBW[j] = 0;
            critBW[j] = 0;
        }
    }

    function fillBandwidthArrays(counties) {
        // Iterate through the parameter
        for (let j = 0; j < counties.length; j++) {
            // Iterate through the JSON file
            for (let i = 0; i < json.features.length; i++) {
                // If the region property of the entry equals the county in the current position of the array and the bandwidth property is greater than 10,
                // the value of the highBW array at current position is increased by 1.
                if ((json.features[i].properties.regionName.toString() === counties[j].toString()) && json.features[i].properties.latest_bandwidth > 10) {
                    highBW[j]++;
                }
            }
            // After the JSON has been iterated through, the highBW array is pushed to regionBWArray, which is an array of arrays
            regionBWArray.push(highBW);

            // Same as above but for bandwidth values between 11 and 3 and for midBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.regionName.toString() === counties[j].toString() && (json.features[i].properties.latest_bandwidth <= 10 && json.features[i].properties.latest_bandwidth > 3)) {
                    midBW[j]++;
                }
            }
            regionBWArray.push(midBW);

            // Same as above but for bandwidth values between 4 and 1 and for lowBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.regionName.toString() === counties[j].toString() && (json.features[i].properties.latest_bandwidth <= 3 && json.features[i].properties.latest_bandwidth > 1)) {
                    lowBW[j]++;
                }
            }
            regionBWArray.push(lowBW);

            // Same as above but for values from 1 and lower and for critBW
            for (let i = 0; i < json.features.length; i++) {
                if (json.features[i].properties.regionName.toString() === counties[j].toString() && json.features[i].properties.latest_bandwidth <= 1) {
                    critBW[j]++;
                }
            }
            regionBWArray.push(critBW);
        }
    }

    //ChartJS
    // Create a usable array for the chart creation
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

    // There doesn't seem to be a valuable option to set the space between labels or bars. This workaround sets the chart height dynamically
    function setChartHeight(labels) {
        return labels.length * 20;
    }

    // The chart needs to be rebuild based on which data is fed to it. This function does just that
    function rebuildChart(labels, dataset) {
        // Destroy the current chart
        bwChart.destroy();
        // Set the chart height based on the passed parameter
        ctx.height = setChartHeight(labels);
        // create a new chart with the two passed parameters
        bwChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: labels,

                datasets: dataset
            },

            options: barOptions_stacked,
        });
    }

    // Set and create a barchart based on all the counties worldwide
    setRegions();
    setBandwidthArraysLength(regionNames);
    fillBandwidthArrays(regionNames);
    createDataSetChartJS(regionBWArray);

    // Settings for the show button
    show.addEventListener('click', event => {
        // Set the Graphs label to the selected cit(y)(ies)
        document.getElementById("container3P").innerHTML = "Bandwidths per Swedish Counties: " + selectedCounties.toString();
        // Clear the arrays to remove conflicting data
        clearBandwidthsArraysLength();
        // Initiate the required functions to Get and set the data needed for the city chart
        setCityChart();
        // Rebuild the chart with the created data
        rebuildChart(cityNames, dataArray);
    });

    // Settings for the reset button
    reset.addEventListener('click', event => {
        // Set the Graphs label to Global County
        document.getElementById("container3P").innerHTML = "Bandwidths per Global County";
        // Clear the arrays to remove conflicting data
        clearBandwidthsArraysLength();
        // Initiate the required functions to Get and set the data needed for the global chart
        setBandwidthArraysLength(regionNames);
        fillBandwidthArrays(regionNames);
        createDataSetChartJS(regionBWArray);
        // Rebuild the chart with the created data
        rebuildChart(regionNames, dataArray);
    });

    // Settings for the toggle button
    toggle.addEventListener('click', event => {
        // If the value is Toggle Sweden, do this
        if (document.getElementById("toggle").innerHTML === "Toggle Sweden") {
            // Set value to Toggle World
            document.getElementById("toggle").innerHTML = "Toggle World";
            // Set the Graphs label to Swedish County
            document.getElementById("container3P").innerHTML = "Bandwidths per Swedish County";
            // Sort the countiesSweden array alphabetically
            countiesSweden.sort();
            // Clear the region BWArray
            regionBWArray.splice(0, regionBWArray.length);
            // Clear the other arrays
            clearBandwidthsArraysLength();
            // Call the function to set the length of the arrays with the countiesSweden Array
            setBandwidthArraysLength(countiesSweden);
            // Fill the bandwidtharrays with passing the countiesSweden array
            fillBandwidthArrays(countiesSweden);
            // Make the dataset to use with the chart creation
            createDataSetChartJS(regionBWArray);
            // Rebuild the chart
            rebuildChart(countiesSweden, dataArray);
        // If the value is Toggle Wordl, do this
        } else {
            // Set value to Toggle Sweden
            document.getElementById("toggle").innerHTML = "Toggle Sweden";
            // Set the Graphs label to Global County
            document.getElementById("container3P").innerHTML = "Bandwidths per Global County";
            // Clear the region BWArray
            regionBWArray.splice(0, regionBWArray.length);
            // Clear the other arrays
            clearBandwidthsArraysLength();
            // Call the function to set the length of the arrays with the regionNames Array
            setBandwidthArraysLength(regionNames);
            // Fill the bandwidtharrays with passing the regionNames array
            fillBandwidthArrays(regionNames);
            // Make the dataset to use with the chart creation
            createDataSetChartJS(regionBWArray);
            // Rebuild the chart
            rebuildChart(regionNames, dataArray);
        }

    });

    //ChartJS
    // Set the Graphs label to Global County
    document.getElementById("container3P").innerHTML = "Bandwidths per Global County";
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

    // Get the canvas for the chart
    let ctx = document.getElementById("chartjs3").getContext('2d');
    // Set the chart height
    ctx.height = setChartHeight(regionNames);
    // Create the chart with regionNames and dataArray
    let bwChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: regionNames,

            datasets: dataArray
        },

        options: barOptions_stacked,
    });
});
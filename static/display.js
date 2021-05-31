let dates = [], times = [], newBandwidthArray = [], newTimeStampArray = [];
let startDate, endDate, startTime, endTime;
let datesString, chartType, bandwidthNumbers;
let bandwidth = sessionStorage.getItem('bandwidths').slice(1, -1).split(',');
let timestamp = sessionStorage.getItem('timestamp');
let link = sessionStorage.getItem('link');
let isp = sessionStorage.getItem('isp');
let date = new Date();
// Set the current date
let datestring = date.toISOString().slice(0, -5);
const button = document.querySelector('button');
// Set the start and end date to the current date
document.getElementById("startdate").value = datestring;
document.getElementById("enddate").value = datestring;
// Set the value of the Back button to the page leading to this one
document.getElementById("link").href = link;
document.getElementById("link").innerHTML = "Back To " + link.substring(0, link.indexOf('.'));

// JQuery
// load the JSON and make it available with json
$.getJSON("/static/data_utf.json", function (json) {

    //JavaScript
    // Function to split the selection in Date and Time. Times is used to set the x-axis labels on the graph
    function splitDateTime(timestamp) {
        let timestampArray = timestamp.slice(1, -1).split(',');
        for (let i = 0; i < timestampArray.length; i++) {
            let position = timestampArray[i];
            dates[i] = position.substring(1, position.indexOf('T'));
            times[i] = position.substring(position.indexOf('T') + 1, position.length - 6);
        }
        times.sort();
    }

    //Split start and end dates in date and time
    function calculateStartEndDateTime(start, end) {
        startDate = start.substring(1, start.indexOf('T'));
        startTime = start.substring(start.indexOf('T') + 1, start.length - 6);
        endDate = end.substring(1, end.indexOf('T'));
        endTime = end.substring(end.indexOf('T') + 1, end.length - 6);
    }

    // Set and send the dataset for the selected dates
    function getDatasetNewDate(start, end) {
        let index, value, result = [], newBandwidths = [], newTimestamps = [], tempTimestampArray = [],
            tempBandwidthArray = [];
        // convert timestamp data to an array of useable strings
        tempTimestampArray = timestamp.slice(1, -1).split(',');
        tempTimestampArray.sort();
        //Set the dates in tittle
        if (start.substring(0, start.indexOf('T')) === end.substring(0, start.indexOf('T'))) {
            datesString = "Date: " + start.substring(0, start.indexOf('T'));
        } else {
            datesString = "Dates: " + start.substring(0, start.indexOf('T')) + " to " + end.substring(0, start.indexOf('T'));
        }
        //Test if selected dates are valid
        if (start > date.toLocaleString() || end > date.toLocaleString()) {
            alert("Start and/or end date cannot be in the future")
        } else {
            //Dates are valid - proceed to get data
            //Get indexes from array corresponding with the date
            for (index = 0; index < tempTimestampArray.length; index++) {
                value = tempTimestampArray[index];
                //compare to the selected times
                //length - 9 takes the hours and minutes and cuts seconds
                if ((value.substring(1, value.length - 6) >= start.toLocaleString()) &&
                    (value.substring(1, value.length - 6) <= end.toLocaleString())) {

                    // Push the corresponding number to the results array, later used to fetch bandwidths
                    result.push(index);
                    // Set the date and time to a string
                    // Push the timestamp to a new timestamp array
                    value = "Date: " + value.substring(1, value.indexOf('T')) + " Time: " + value.substring(value.indexOf('T') + 1, value.length - 6);
                    newTimestamps.push(value);

                }
            }
            // Set to global variable to be used
            newTimeStampArray = newTimestamps;
            // Iterate through index and get the value on position result
            for (index = 0; index < bandwidth.length; index++) {
                if (index >= result[0] && index <= result[result.length - 1]) {
                    // Push the retrieved value to the newBandwidths array
                    newBandwidths.push(bandwidth[index]);
                }
            }
            if (newBandwidths.length > 1) {
                chartType = 'line';
            } else {
                chartType = 'bar';
            }
            return newBandwidths;
        }
    }

    // Get the data for today
    function getDatasetToday() {
        let index, value, result = [], newBandwidths = [];
        for (index = 0; index < timestamp.length; index++) {
            value = timestamp[index];
            if (value.substring(0, 11) === date.toLocaleString().substring(0, 11)) {
                result.push(index);
            }
        }
        for (index = 0; index < bandwidth.length; index++) {
            if (index >= result[0] && index <= result[index.length]) {
                newBandwidths.push(bandwidth[index])
            }
        }
        datesString = "Date: " + date.toLocaleString().substring(0, date.toLocaleString().indexOf('T'));

        return newBandwidths.toString().slice(1, -1).split(',');
    }

    function setISPLabel() {
        document.getElementById('identifier').innerHTML = isp.toLocaleString();
    }

    setISPLabel();

    // What the show button does
    button.addEventListener('click', event => {
        // Get the start and end date
        startDate = document.getElementById("startdate").value;
        endDate = document.getElementById("enddate").value;
        // Get the bandwidths associated with the dates
        newBandwidthArray = getDatasetNewDate(startDate, endDate);
        // Add bandwidths and timestamp to data and labels and update
        massPopChart.destroy();
        massPopChart = new Chart(mychart, {
            type: chartType,
            data: {
                labels: newTimeStampArray,
                datasets: [
                    {
                        label: 'Bandwidth',
                        data: newBandwidthArray,
                        backgroundColor: 'darkorange'
                    }
                ]
            },
            options: {
                title: {
                    display: true,
                    text: datesString,
                    fontSize: 25
                },
                legend: {
                    position: 'right'
                }
            }
        });
    });

    //Initiate
    splitDateTime(timestamp);
    bandwidthNumbers = getDatasetToday();
    // Select the canvas where to build the chart
    let mychart = document.getElementById('dataChart').getContext('2d');
    //Set the type to line or bar, depending on how many data points are set
    if (bandwidthNumbers.length > 1) {
        chartType = 'line';
    } else {
        chartType = 'bar';
    }
    //Create the chart
    let massPopChart = new Chart(mychart, {
        type: chartType,
        data: {
            labels: times,
            datasets: [
                {
                    label: 'Bandwidth',
                    data:  bandwidthNumbers,
                    backgroundColor: 'darkorange'
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: datesString,
                fontSize: 25
            },
            legend: {
                position: 'right'
            }
        }
    });
});
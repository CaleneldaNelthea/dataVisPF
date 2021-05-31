"Use strict";

let clientNodesToSort = [];
let clientNodes = [];
let avgBW = [];
let data = [];
let prev;
let chart1;

// JQuery
// load the JSON and make it available with json
$.getJSON("/static/data_utf.json", function (json) {
    //JavaScript
    //Calculate the average bandwidths per server. Server's are passed through a parameter
    function calculateAverage(node) {
        let count = 0;
        let average = 0;
        //Iterate through the JSON file
        for (let i = 0; i < json.features.length; i++) {
            //If the current selection equals the provided parameter add it's average bandwidth to average and increase count with 1
            if (json.features[i].properties.client_ip.toString() === node) {
                average += json.features[i].properties.avg_bandwidth;
                count++;
            }
        }
        //return the overal average
        return average / count;
    }

    //Set the averageBW array
    function setAverageBWArray() {
        //Iterate through the JSON file and push the values of the server IP to the array to sort them
        for (let i = 0; i < json.features.length; i++) {
            clientNodesToSort.push(json.features[i].properties.client_ip.toString());
        }
        //Sort the array in order
        clientNodesToSort.sort();
        //Iterate through the array
        for (let i = 0; i < clientNodesToSort.length; i++) {
            //If the current selection doesn't equal prev, push it to clientNodes and set it's value to prev
            if (clientNodesToSort[i] !== prev) {
                clientNodes.push(clientNodesToSort[i]);
            }
            prev = clientNodesToSort[i];
        }
        //Iterate through the newly filled array and call calculateAverage on the current selection, then push the returned value to the avgBW array.
        for (let i = 0; i < clientNodes.length; i++) {
            avgBW.push(calculateAverage(clientNodes[i]));
        }
    }
    //Initiate
    setAverageBWArray();



    // Set the Graphs label
    document.getElementById("container2P").innerHTML = "Server Performance on Average Bandwidth";
    //Highcharts
    //Create the graph in the selected container. This is a polar graph
    chart1 = new Highcharts.Chart('container2', {
        chart: {
            polar: true,
            type: 'line',
            backgroundColor: 'rgba(0,0,0,0)'
        },

        accessibility: {
            description: 'The chart shows which of the servers has the highest amount of average bandwidth, and which has the lowest. Depending on these values certain actions might need to be taken.'
        },

        title: {
            text: 'Average bandwidth per server',
            x: -80
        },

        pane: {
            size: '80%'
        },

        xAxis: {
            categories: clientNodes,
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}</b><br/>'
        },

        legend: {
            align: 'right',
            verticalAlign: 'middle',
            layout: 'vertical',
            reversed: true,
            itemStyle: {"color": "#DCDCDC"}
        },

        series: [{
            name: 'Average bandwidth in total',
            data: avgBW,
            pointPlacement: 'on'
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    pane: {
                        size: '70%'
                    }
                }
            }]
        }
    });
});

function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`

    // Use `.html("") to clear any existing metadata

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

function buildPieChart(data) {
  let pieArea = d3.select('#pie');
  let pieData = [{
    values: data.values.slice(0, 10),
    labels: data.labels.slice(0, 10),
    type: 'pie',
    name: `Top 10 Bacteria for Sample ${data.id}`,
    hoverInfo: 'label+percent',
    hoverlabel: {
      namelength: 10
    },
    showlegend: true   
  }];
  // let pieLayout = {
  //   height: 400,
  //   width: 400
  // }
  Plotly.react(pieArea.node(), pieData);
}

function buildScatterPlot(data) {

}

function buildCharts(sample) {
  d3.json(`/samples/${sample}`).then(data => {
    buildPieChart(data);
    buildScatterPlot(data);
  })
  // @TODO: Use `d3.json` to fetch the sample data for the plots

    // @TODO: Build a Bubble Chart using the sample data

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
}

function init() {
  var selector = d3.select("#selector");

  selector.on('change', onSampleChanged)

  d3.json("/names").then(data => {
    for (let id of data) {
      selector
        .append('option')
        .text(id)
        .property('value', id);
    };
    
    const firstSample = data[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function onSampleChanged() {
  let sample = d3.event.target.value;
  // Fetch new data each time a new sample is selected
  buildCharts(sample);
  buildMetadata(sample);
}

init();

function buildMetadata(sample_id) {
  d3.json(`/metadata/${sample_id}`).then(sample => {    
    let metadataBody = d3.select('#sample-metadata');
    metadataBody.html('');
    for (let [key, value] of Object.entries(sample)){
      metadataBody.append('p')
        .text(`${key.toUpperCase()}: ${value}`)
        .classed('meta-text', true);
    }
  });
}

function buildHoverText(str, thresholdLength) {  
  let words = str.split(';');
  let name = '';
  let length = 0;
  for (let word of words) {
    if (name.length > 0){
      name +=', ';
      length += 2;
    }
    if (thresholdLength && length > thresholdLength) {
      name += '<br>';
      length = 0;
    }
    name += word;
    length += word.length + 2;
  }  
  return name;
}

function buildPieChart(data) {
  let hovertext = data.labels.slice(0, 10).map(l => buildHoverText(l, 30));
  let trace = {
    values: data.values.slice(0, 10),
    labels: data.ids.slice(0, 10).map(x => `OTU ${x}`),
    type: 'pie',
    title: `Top 10 Bacteria for Sample ${data.id}<br> `,
    titlefont: {
      size: 18
    },
    text: hovertext,
    hovertext: hovertext,
    hoverinfo: 'text+value',
    textinfo: 'percent'
  };
  let layout = { 
    height: 300,
    margin: {
      t: 10,
      r: 10,
      b: 10,
      l: 0
    }    
  };
  Plotly.react('pie', [trace], layout, { responsive: true });
}

function buildScatterPlot(data) {
  let hovertext = data.labels.map(l => buildHoverText(l));
  let trace = {
    x: data.ids,
    y: data.values,
    mode: 'markers',
    type: 'scatter',
    title: `Relative Size of All Bacteria Samples for Sample ${data.id}<br> `,
    titlefont: {
      size: 18
    },
    marker: {
      size: data.values,
      colorscale: 'Earth',
      color: data.ids,
      opacity: 0.8
    },
    text: hovertext,
    hovertext: hovertext,
    hoverinfo: 'text+value'
  };
  let layout = { 
    height: 400,
    margin: {
      t: 20,
      r: 10,
      b: 50,
      l: 50
    }, 
    xaxis: {
      title: 'OTU ID',
      titlefont: {
        size: 14
      }
    },   
  };
  Plotly.react('scatter', [trace], layout, { responsive: true });
}

function buildCharts(sample_id) {
  d3.json(`/samples/${sample_id}`).then(data => {
    buildPieChart(data);
    buildScatterPlot(data);
  });
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

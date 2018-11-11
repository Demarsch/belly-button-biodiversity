function buildMetadata(sample_id) {
  d3.json(`/metadata/${sample_id}`).then(sample => {    
    let metadataBody = d3.select('#sample-metadata');
    metadataBody.html('');
    for (let [key, value] of Object.entries(sample)){
      metadataBody.append('p')
        .text(`${key.toUpperCase()}: ${value}`)
        .classed('meta-text', true);
    }    
    buildGaugeChart(sample);
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
    title: `<b>Top 10 Bacteria for Sample ${data.id}</b><br> `,
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

const maxWfreq = 9;

function buildGaugeChart(sample) {
  // Calculating the angle we should rotate the arrow to
  let wfreqToMaxRatio = 1 - Math.min(sample.wfreq, maxWfreq) / maxWfreq;
  let arrowLength = 0.6;
  let radians = Math.PI * wfreqToMaxRatio;
  let x = arrowLength * Math.cos(radians);
  let y = arrowLength * Math.sin(radians);

  // Path represent a triangle arrow
  let path  = `M0,-0.025 L0,0.025 L${x},${y} Z`;

  let data = [
    //A red circle on the arrow start
    { type: 'scatter',
    x: [0], y:[0],
      marker: {size: 12, color:'850000'},
      showlegend: false,
      name: 'Washing Frequency',
      text: sample.wfreq,
      hoverinfo: 'text+name'},
    //9 equal sectors (together take half of the ring), one sector takes another half
    { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
    rotation: 90,
    text: ['8+', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgb(132, 181, 137)',  //8+
                     'rgb(137, 188, 141)',  //7-8
                     'rgb(138, 192, 134)',  //6-7
                     'rgb(183, 205, 143)',  //5-6
                     'rgb(213, 229, 153)',  //4-5
                     'rgb(229, 232, 176)',  //3-4
                     'rgb(233, 230, 201)',  //2-3
                     'rgb(244, 241, 228)',  //1-2
                     'rgb(248, 233, 236)',  //0-1
                     'rgba(255, 255, 255, 0)' //Empty
                    ]},
    labels: ['8+', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week<br> ',
    height: 350,
    xaxis: {
      zeroline:false,
      showticklabels:false,
      showgrid: false,
      range: [-1, 1],
      //automargin: true
    },
    yaxis: {
      zeroline:false,
      showticklabels:false,
      showgrid: false, 
      range: [-1, 1],
      //automargin: true
    },
    margin: {
      t: 65,
      r: 0,
      b: 0,
      l: 0
    }, 
  };

  Plotly.react('gauge', data, layout, { responsive: true });
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

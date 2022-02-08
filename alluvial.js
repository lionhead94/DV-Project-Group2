{
	var margin = {top: 10, right: 150, bottom: 10, left: 130},
  width = 800 - margin.left - margin.right,
	height = 1000 - margin.top - margin.bottom;  

	var color;

  // append the svg object to the body of the page
  var svg = d3.select("#alluvial").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set the sankey diagram properties
  var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(7)
    .size([width, height]);

  var path = sankey.links();
  var groupMap = {};

  groups.then(function(data) {
    let sankeydata = {"nodes": [], "links": []};
    let i = 0;
    let group_idx = data.length;
    let nodes = []
    let groups = [];
    data.forEach(function(d){
      sankeydata.nodes[i] = {"node": i, "name": d.Brand};
      nodes[i] = d.Brand
      if (!groups.includes(d.Group)){
        sankeydata.nodes[group_idx] = {"node": group_idx, "name": d.Group};
        groups.push(d.Group);
        nodes[group_idx++] = d.Group;
      }
      sankeydata.links.push({"source": i++, "target": nodes.indexOf(d.Group, data.length), "value": d.Cardinality});
      groupMap[d.Brand] = d.Group;
    });
    color = d3.scaleOrdinal()
            .domain(groups)
            .range([
                getComputedStyle(document.body).getPropertyValue("--blue"),
                getComputedStyle(document.body).getPropertyValue("--purple"),
                getComputedStyle(document.body).getPropertyValue("--light-purple"),
                getComputedStyle(document.body).getPropertyValue("--magenta"),
                getComputedStyle(document.body).getPropertyValue("--fuchsia"),
                getComputedStyle(document.body).getPropertyValue("--orange"),
                getComputedStyle(document.body).getPropertyValue("--dark-yellow"),
                getComputedStyle(document.body).getPropertyValue("--yellow")
            ])
    return sankeydata;
  }).then(function(sankeydata){
    graph = sankey(sankeydata);
      
  // add in the links
  var link = svg.append("g").selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", function(d) { 
      return d.width;
    });

  // add in the nodes
  var node = svg.append("g").selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("g")
    .attr("class", "node");

  // add the rectangles for the nodes
  node.append("rect")
    .attr("x", function(d) { return d.x0; })
    .attr("y", function(d) { return d.y0; })
    .attr("height", function(d){return d.y1 - d.y0; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) {
      if (d.x0 < width/2)
		    return d.color = color(groupMap[d.name].replace(/ .*/, ""));
      else
        return d.color = color(d.name.replace(/ .*/, "")); 
      })
    .style("stroke", function(d) {
	      return d3.rgb(d.color).darker(2); 
    });

  // add in the title for the nodes
  node.append("text")
    .attr("class", "plotTextAlluvial")
    .attr("x", function(d) { return d.x0 + sankey.nodeWidth() + 10; })
    .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .text(function(d) { return d.name; })
    .filter(function(d) { return d.x0 < width / 2; })
    .attr("x", function(d) { return d.x1 - sankey.nodeWidth() - 10; })
    .attr("text-anchor", "end");
  });

  function groups_update(){
    svg.selectAll("*")
      .remove();
    groups.then(function(data) {
      let sankeydata = {"nodes": [], "links": []};
      let i = 0;
      let group_idx = data.length;
      let nodes = []
      let groups = [];
      data.forEach(function(d){
        sankeydata.nodes[i] = {"node": i, "name": d.Brand};
        nodes[i] = d.Brand
        if (!groups.includes(d.Group)){
          sankeydata.nodes[group_idx] = {"node": group_idx, "name": d.Group};
          groups.push(d.Group);
          nodes[group_idx++] = d.Group;
        }
        sankeydata.links.push({"source": i++, "target": nodes.indexOf(d.Group, data.length), "value": d.Cardinality});
        groupMap[d.Brand] = d.Group;
      });
      color = d3.scaleOrdinal()
              .domain(groups)
              .range([
                  getComputedStyle(document.body).getPropertyValue("--blue"),
                  getComputedStyle(document.body).getPropertyValue("--purple"),
                  getComputedStyle(document.body).getPropertyValue("--light-purple"),
                  getComputedStyle(document.body).getPropertyValue("--magenta"),
                  getComputedStyle(document.body).getPropertyValue("--fuchsia"),
                  getComputedStyle(document.body).getPropertyValue("--orange"),
                  getComputedStyle(document.body).getPropertyValue("--dark-yellow"),
                  getComputedStyle(document.body).getPropertyValue("--yellow")
              ])
      return sankeydata;
    }).then(function(sankeydata){
      graph = sankey(sankeydata);
        
    var link = svg.append("g").selectAll(".link")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke-width", function(d) { 
        return d.width;
      });
  
    var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node");
  
    node.append("rect")
      .attr("x", function(d) { return d.x0; })
      .attr("y", function(d) { return d.y0; })
      .attr("height", function(d){return d.y1 - d.y0; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
        if (d.x0 < width/2)
          return d.color = color(groupMap[d.name].replace(/ .*/, ""));
        else
          return d.color = color(d.name.replace(/ .*/, "")); 
        })
      .style("stroke", function(d) {
          return d3.rgb(d.color).darker(2); 
      });
  
    node.append("text")
      .attr("class", "plotTextAlluvial")
      .attr("x", function(d) { return d.x0 + sankey.nodeWidth() + 10; })
      .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .text(function(d) { return d.name; })
      .filter(function(d) { return d.x0 < width / 2; })
      .attr("x", function(d) { return d.x1 - sankey.nodeWidth() - 10; })
      .attr("text-anchor", "end");
    });
  }
}
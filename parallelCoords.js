{
    const margin = {top: 30, right: 50, bottom: 50, left: 70},
    width = 1200 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom,
    plotHeight = height - 450;

    // append the svg 
    const svg = d3.select("#parallelCoords")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);

    var brandPos;
    var hStatic = [];
    for(var i=0; i<36; i++){
        hStatic.push(plotHeight + ((height - plotHeight) / 36 * i) + 20);
    };
    
    // Parse the Data
    percentageBySec_scores.then( function(data) {
        let brands = data.sort((a,b) => d3.ascending(a["Index Score"], b["Index Score"]))
            .map(d => d.Brand);
        for(var j=1; j<=brands.length; j++)
            brands[j-1] = brands.length - j + 1 + ". " + brands[j-1];

        brandPos = d3.scaleBand()
            .domain(brands)
            .range([height, plotHeight]);

        const color = d3.scaleLinear()
            .domain([0, 0.2, 0.3, 0.8])
            .range([
                getComputedStyle(document.body).getPropertyValue("--dark-blue"),
                getComputedStyle(document.body).getPropertyValue("--purple"),
                getComputedStyle(document.body).getPropertyValue("--fuchsia"),
                getComputedStyle(document.body).getPropertyValue("--yellow"),
            ])

        var columns = data.columns.slice(2)

        // build a linear scale for each axis
        const y = {}
        for (var i in columns) {
            var name = columns[i]
            y[name] = d3.scaleLinear()
                .domain( [0,1] ) // --> Same axis range for each group
                // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
                .range([plotHeight, 0])
        }

        // x scale
        x = d3.scalePoint()
            .range([0, width])
            .domain(columns);
        
        // given a brand returns its total index score
        const getTotal = function(brand){
            var total = percentageBySec_scores.then(function(data){
                for(var j=0; j<data.length; j++){
                    if(data[j].Brand == brand){
                        return data[j]["Index Score"];
                    }
                }
            });
            return total;
        }

        // highlights the line of the hovered brand
        const highlight = function(event, d){
            var selectedBrand = d.split(".")[1].slice(1)
            var selectedClass = selectedBrand.replaceAll("&", "").replaceAll("'", "").replaceAll(" ", "");

            // gray all the lines
            d3.selectAll(".line")
                .transition().duration(100)
                .style("stroke", "lightgrey")
                .style("opacity", "0.2");
            // color just the selected line
            getTotal(selectedBrand).then(function(total){
                d3.selectAll("." + selectedClass)
                    .transition().duration(100)
                    .style("stroke", color(total))
                    .style("opacity", "1");
            })
        }

        // resets the colors
        const doNotHighlight = function(event, d){
            d3.selectAll(".line")
                .transition().duration(200)
                .style("stroke", function(d){ return( color(d["Index Score"]))} )
                .style("opacity", "1")
        }

        // Given csv row returns x and y positions for the line
        function path(d) {
            return d3.line()(columns.map(function(p) { return [x(p), y[p](d[p])]; }));
        }

        // draw the lines
        svg.selectAll("myPath")
            .data(data)
            .join("path")
                .attr("class", function (d) { return "line " + d.Brand.replaceAll("&", "").replaceAll("'", "").replaceAll(" ", "") } ) // 2 class for each line: 'line' and the group name
                .attr("d",  path)
                .style("fill", "none" )
                .style("stroke", function(d){ return( color(d["Index Score"]))} )
                .style("stroke-width", 3)
                .style("opacity", 0.5)

        var columnsAxis = columns;
        columnsAxis.unshift("Lines");
        
        // draw the axis
        svg.selectAll("myAxis")
            .data(columnsAxis)
            .enter()
            .append("g")
            .attr("class", function(d){
                if(d == columnsAxis[0])
                    return "axisGrid";
                return "legend";
            })
            .attr("transform", function(d) {    // translation to the correct x pos
                if(d == columnsAxis[0]) 
                    return `translate(${x(columnsAxis[1])})`;
                return `translate(${x(d)})`;
            })
            .each(function(d) { // build axis
                if(d == columnsAxis[0]){
                    d3.select(this)
                    .call(d3.axisLeft()
                        .tickFormat(" ")
                        .ticks(5)
                        .tickSize(-width)
                        .scale(y[columnsAxis[1]]));
                }
                else if(d == columnsAxis[1]){ // on first axis place the numbers (at idx 0 we have the brand)
                    d3.select(this)
                        .call(d3.axisLeft()
                            .tickFormat(function(d){return d * 100})
                            .ticks(5)
                            .scale(y[d]));
                }
                else{
                    d3.select(this)
                        .call(d3.axisLeft()
                            .ticks(0)
                            .tickSizeOuter(0)
                            .scale(y[d]))
                        .style("path", 1.5);
                }
            })
            // axis title
            .append("text")
                .style("text-anchor", "middle")
                .attr("y", -9)
                .text(function(d) {if (d != columnsAxis[0]) return d; })
                .style("fill", "black");

        // brand name columns
        let col1=35, col2=35, col3=35, col4=34, col5=35, col6=35, col7=34;
        svg.selectAll("brandLabel")
            .data(brands)
            .enter()
            .append("text")
            .text(function(d){ return d; })
            .attr("class", "brandLabel")
            .attr("x", function(d){
                let h = brandPos(d);
                let hRel = h - plotHeight;
                let hRef = height - plotHeight;
                if(hRel > hRef / 7 && hRel < hRef / 7 * 2)
                    return width / 7;
                else if(hRel > hRef / 7 * 2 && hRel < hRef / 7 * 3)
                    return width / 7 * 2;
                else if(hRel > hRef / 7 * 3 && hRel < hRef / 7 * 4)
                    return width / 7 * 3;
                else if(hRel > hRef / 7 * 4 && hRel < hRef / 7 * 5)
                    return width / 7 * 4;
                else if(hRel > hRef / 7 * 5 && hRel < hRef / 7 * 6)
                    return width / 7 * 5;
                else if(hRel > hRef / 7 * 6)
                    return width / 7 * 6 ;
                return 0;
            })
            .attr("y", function(d){ 
                let h = brandPos(d);
                let hRel = h - plotHeight;
                let hRef = height - plotHeight;
                if(hRel > hRef / 7 && hRel < hRef / 7 * 2)
                    return hStatic[col2--];
                else if(hRel > hRef / 7 * 2 && hRel < hRef / 7 * 3)
                    return hStatic[col3--];
                else if(hRel > hRef / 7 * 3 && hRel < hRef / 7 * 4)
                    return hStatic[col4--];
                else if(hRel > hRef / 7 * 4 && hRel < hRef / 7 * 5)
                    return hStatic[col5--];
                else if(hRel > hRef / 7 * 4 && hRel < hRef / 7 * 6)
                    return hStatic[col6--];
                else if(hRel > hRef / 7 * 6)
                    return hStatic[col7--];
                return hStatic[col1--];
            })
            .on("mouseover", highlight)
            .on("mouseleave", doNotHighlight)
    })

    function parallelCoords_update(){
        // cleanup before drawing again using a different palette
        svg.selectAll("*")
            .remove();

        percentageBySec_scores.then( function(data) {
            let brands = data.sort((a,b) => d3.ascending(a["Index Score"], b["Index Score"]))
                .map(d => d.Brand);
            for(var j=1; j<=brands.length; j++)
                brands[j-1] = brands.length - j + 1 + ". " + brands[j-1];

            brandPos = d3.scaleBand()
                .domain(brands)
                .range([height, plotHeight]);

            const color = d3.scaleLinear()
                .domain([0, 0.2, 0.3, 0.8])
                .range([
                    getComputedStyle(document.body).getPropertyValue("--dark-blue"),
                    getComputedStyle(document.body).getPropertyValue("--purple"),
                    getComputedStyle(document.body).getPropertyValue("--fuchsia"),
                    getComputedStyle(document.body).getPropertyValue("--yellow"),
                ])

            var columns = data.columns.slice(2)

            const y = {}
            for (var i in columns) {
                var name = columns[i]
                y[name] = d3.scaleLinear()
                    .domain( [0,1] )
                    .range([plotHeight, 0])
            }

            x = d3.scalePoint()
                .range([0, width])
                .domain(columns);
            
            const getTotal = function(brand){
                var total = percentageBySec_scores.then(function(data){
                    for(var j=0; j<data.length; j++){
                        if(data[j].Brand == brand){
                            return data[j]["Index Score"];
                        }
                    }
                });
                return total;
            }

            const highlight = function(event, d){
                var selectedBrand = d.split(".")[1].slice(1)
                var selectedClass = selectedBrand.replaceAll("&", "").replaceAll("'", "").replaceAll(" ", "");

                d3.selectAll(".line")
                    .transition().duration(100)
                    .style("stroke", "lightgrey")
                    .style("opacity", "0.2");
                getTotal(selectedBrand).then(function(total){
                    d3.selectAll("." + selectedClass)
                        .transition().duration(100)
                        .style("stroke", color(total))
                        .style("opacity", "1");
                })
            }

            const doNotHighlight = function(event, d){
                d3.selectAll(".line")
                    .transition().duration(200)
                    .style("stroke", function(d){ return( color(d["Index Score"]))} )
                    .style("opacity", "1")
            }

            function path(d) {
                return d3.line()(columns.map(function(p) { return [x(p), y[p](d[p])]; }));
            }

            svg.selectAll("myPath")
                .data(data)
                .join("path")
                    .attr("class", function (d) { return "line " + d.Brand.replaceAll("&", "").replaceAll("'", "").replaceAll(" ", "") } ) // 2 class for each line: 'line' and the group name
                    .attr("d",  path)
                    .style("fill", "none" )
                    .style("stroke", function(d){ return( color(d["Index Score"]))} )
                    .style("stroke-width", 3)
                    .style("opacity", 0.5)

            var columnsAxis = columns;
            columnsAxis.unshift("Lines");
            
            svg.selectAll("myAxis")
                .data(columnsAxis)
                .enter()
                .append("g")
                .attr("class", function(d){
                    if(d == columnsAxis[0])
                        return "axisGrid";
                    return "legend";
                })
                .attr("transform", function(d) {
                    if(d == columnsAxis[0]) 
                        return `translate(${x(columnsAxis[1])})`;
                    return `translate(${x(d)})`;
                })
                .each(function(d) {
                    if(d == columnsAxis[0]){
                        d3.select(this)
                        .call(d3.axisLeft()
                            .tickFormat(" ")
                            .ticks(5)
                            .tickSize(-width)
                            .scale(y[columnsAxis[1]]));
                    }
                    else if(d == columnsAxis[1]){
                        d3.select(this)
                            .call(d3.axisLeft()
                                .tickFormat(function(d){return d * 100})
                                .ticks(5)
                                .scale(y[d]));
                    }
                    else{
                        d3.select(this)
                            .call(d3.axisLeft()
                                .ticks(0)
                                .tickSizeOuter(0)
                                .scale(y[d]))
                            .style("path", 1.5);
                    }
                })
                .append("text")
                    .style("text-anchor", "middle")
                    .attr("y", -9)
                    .text(function(d) {if (d != columnsAxis[0]) return d; })
                    .style("fill", "black");

            let col1=35, col2=35, col3=35, col4=34, col5=35, col6=35, col7=34;
            svg.selectAll("brandLabel")
                .data(brands)
                .enter()
                .append("text")
                .text(function(d){ return d; })
                .attr("class", "brandLabel")
                .attr("x", function(d){
                    let h = brandPos(d);
                    let hRel = h - plotHeight;
                    let hRef = height - plotHeight;
                    if(hRel > hRef / 7 && hRel < hRef / 7 * 2)
                        return width / 7;
                    else if(hRel > hRef / 7 * 2 && hRel < hRef / 7 * 3)
                        return width / 7 * 2;
                    else if(hRel > hRef / 7 * 3 && hRel < hRef / 7 * 4)
                        return width / 7 * 3;
                    else if(hRel > hRef / 7 * 4 && hRel < hRef / 7 * 5)
                        return width / 7 * 4;
                    else if(hRel > hRef / 7 * 5 && hRel < hRef / 7 * 6)
                        return width / 7 * 5;
                    else if(hRel > hRef / 7 * 6)
                        return width / 7 * 6 ;
                    return 0;
                })
                .attr("y", function(d){ 
                    let h = brandPos(d);
                    let hRel = h - plotHeight;
                    let hRef = height - plotHeight;
                    if(hRel > hRef / 7 && hRel < hRef / 7 * 2)
                        return hStatic[col2--];
                    else if(hRel > hRef / 7 * 2 && hRel < hRef / 7 * 3)
                        return hStatic[col3--];
                    else if(hRel > hRef / 7 * 3 && hRel < hRef / 7 * 4)
                        return hStatic[col4--];
                    else if(hRel > hRef / 7 * 4 && hRel < hRef / 7 * 5)
                        return hStatic[col5--];
                    else if(hRel > hRef / 7 * 4 && hRel < hRef / 7 * 6)
                        return hStatic[col6--];
                    else if(hRel > hRef / 7 * 6)
                        return hStatic[col7--];
                    return hStatic[col1--];
                })
                .on("mouseover", highlight)
                .on("mouseleave", doNotHighlight)
        })
    }
}
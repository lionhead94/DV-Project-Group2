{
    const margin = {top: 50, right: 60, bottom: 50, left: 60},
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

    var x, y, yAxisGrid;
    // append the svg object to the body of the page
    const svg = d3.select("#scoreByYear")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .append("g")
        .attr("transform",`translate(${margin.left},${margin.top})`);
    
    percentageByYear.then(function(data){
        x = d3.scaleBand()
            .domain(data.map(d => d.Year).sort(d3.ascending))
            .range([ 0, width ]);
        svg.append("g")
            .attr("class","plotText")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Add Y axis
        y = d3.scaleLinear()
            .domain( [0, 1])
            .range([ height, 0 ]);
        svg.append("g")
            .attr("class", "plotText")
            .call(d3.axisLeft(y).tickFormat(function(d){return d * 100}));
        
        yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat('');
        svg.append('g')
            .attr('class', 'axisGrid')
            .call(yAxisGrid)

        svg.append("path")
            .datum(data)
            .attr("class", "linePath")
            .attr("fill", "none")
            .attr("stroke", getComputedStyle(document.body).getPropertyValue("--med-blue"))
            .attr("stroke-width", 3)
            .attr("d", d3.line()
                .curve(d3.curveNatural) // interpolating smooth line
                .x(d => x(d.Year) + x.bandwidth()/2)
                .y(d => y(d["Abercrombie & Fitch"]))
            )
        svg.append("text")
            .text("Index across the years")
            .attr("text-anchor", "middle")
            .attr("x", width/2)
            .attr("y", -15)
            .attr("class", "plotTitle")
        
        svg.append("text")
            .attr("class", "plotText")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .text("Year");

        svg.append("text")
            .attr("class", "plotText")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20)
            .text("Score (%)");
    });

    // create a tooltip
    const tooltip = d3.select("#scoreByYear")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

    function scoreLine_update(selectedBrand){
        let line = d3.line()
            .defined(d => parseInt(d[selectedBrand]) !== -1);
        
        percentageByYear.then(function(data){
            x = d3.scaleBand()
                .domain(data.map(d => d.Year).sort(d3.ascending))
                .range([ 0, width ]);
            
            // update the line
            svg.selectAll(".linePath")
                .datum(data)
                .join("path")
                .attr("class", "linePath")
                .attr("fill", "none")
                .attr("stroke", getComputedStyle(document.body).getPropertyValue("--med-blue"))
                .attr("stroke-width", 3)
                .attr("d", line.curve(d3.curveNatural)
                    .x(d => x(d.Year) + x.bandwidth()/2)
                    .y(d => y(d[selectedBrand]))
                )

            // Three functions that change the tooltip when user hover / move / leave a cell
            const mouseover = function(event, d) {
                tooltip.style("opacity", 1)
            }
            const mousemove = function(event, d) {
                tooltip.html("Index score: " + Math.round(d[selectedBrand] * 100) + "%")
                    .style("left", `${event.pageX+20}px`)
                    .style("top", `${event.pageY+30}px`)
            }
            const mouseleave = function(event, d) {
                tooltip.style("opacity", 0)
            }    

            // add the points
            svg.selectAll(".myCircle")
                .data(data)
                .join("circle")
                .attr("class", "myCircle")
                .attr("cx", d => x(d.Year) + x.bandwidth()/2)
                .attr("cy", d => y(d[selectedBrand]))
                .attr("r", 8)
                .attr("fill", getComputedStyle(document.body).getPropertyValue("--med-blue"))
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
        })
    }
}
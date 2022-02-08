{
    let margin = {top: 40, right: 10, bottom: 30, left: 70},
    width = 900 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // get the selected year
    let selectedYear = document.getElementById("year_scoreByCategory").value;

    // append the svg object to the body of the page
    let svg = d3.select("#scoreByCategory")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg.append("text")
        .attr("class", "plotText")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -15)
        .text("Score (%)");

    let x, y, yAxisGrid;

    scoreByCategory.then( function(data) {
        // x axis scale
        x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) { return d.Category; }))
            .padding(1);

        // add the x axis
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "plotText")
            .call(d3.axisBottom(x));
        
        // y axis scale
        y = d3.scaleLinear()
            .range([ height, 0])
            .domain([0, 1]);

        // add the y axis
        svg.append("g")
            .attr("class", "plotText")
            .call(d3.axisLeft(y).tickFormat(function(d){return d * 100}).tickSize(0))
            .call(g => g.select(".domain").remove());
        
        // add the horizontal grid
        yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat('');
        svg.append('g')
            .attr('class', 'axisGrid')
            .call(yAxisGrid)
            .call(g => g.select(".domain").remove());

        // add the lines
        svg.selectAll(".lollipopLine")
            .data(data)
            .join("line")
            .attr("class", function(d){
                if(d.Category == "Average index")
                    return "lollipopLine lollipopLineTotal";
                return "lollipopLine";
            })
            .attr("x1", function(d) { return x(d.Category); })
            .attr("x2", function(d) { return x(d.Category); })
            .attr("y1", y(0))
            .attr("y2", function(d) { return y(d[selectedYear]); })

        // add the dots 
        svg.selectAll(".lollipopDot")
            .data(data)
            .join("circle")
            .attr("cx", function(d) { return x(d.Category); })
            .attr("cy", function(d) { return y(d[selectedYear]); })
            .attr("r", 8)
            .attr("class", function(d){
                if(d.Category == "Average index")
                    return "lollipopDot lollipopDotTotal";
                return "lollipopDot";
            })
    })


    function scoreByCategory_update() {
        selectedYear = document.getElementById("year_scoreByCategory").value;
        scoreByCategory.then( function(data) {
            // update the lines
            svg.selectAll(".lollipopLine")
                .data(data)
                .join("line")
                .attr("class", function(d){
                    if(d.Category == "Average index")
                        return "lollipopLine lollipopLineTotal";
                    return "lollipopLine";
                })
                .transition()
                .duration(750)
                .ease(d3.easeBounce)
                .attr("x1", function(d) { return x(d.Category); })
                .attr("x2", function(d) { return x(d.Category); })
                .attr("y1", y(0))
                .attr("y2", function(d) { return y(d[selectedYear]); })

            // update circles
            svg.selectAll("circle")
                .data(data)
                .join(".lollipopDot")
                .transition()
                .duration(750)
                .ease(d3.easeBounce)
                .attr("cx", function(d) { return x(d.Category); })
                .attr("cy", function(d) { return y(d[selectedYear]); })
                .attr("r", 8)
                .attr("class", function(d){
                    if(d.Category == "Average index")
                        return "lollipopDot lollipopDotTotal";
                    return "lollipopDot";
                })
        })
    }
}
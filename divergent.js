{
    function order(selected){
        switch(selected){
            case "score_asc":
                return (a, b) => d3.ascending(a.Index, b.Index);
            case "score_des":
                return (a, b) => d3.descending(a.Index, b.Index);
            case "inc_asc":
                return (a, b) => d3.ascending(a.Income, b.Income);
            case "inc_des":
                return (a, b) => d3.descending(a.Income, b.Income);
            case "alpha_asc":
                return (a, b) => d3.ascending(a.Brand, b.Brand);
            case "alpha_des":
                return (a, b) => d3.descending(a.Brand, b.Brand);
            default:
                console.log("Unexpected sorting key");
        };
    };

    let margin = {top: 20, right: 20, bottom: 50, left: 50},
        width = 800 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // append the svg object
    let svg = d3.select("#divergent")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    let xLeft, xRight, y, yAxis, sorting;

    money_ranking.then(function(data){
        sorting = document.getElementById("sorting_divergent").value;

        svg.append("rect")
            .attr("x", width / 2 + 10)
            .attr("y",-15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legendSquare")
            .style("fill", getComputedStyle(document.body).getPropertyValue("--med-blue"))
        svg.append("rect")
            .attr("x", width / 2 - 20)
            .attr("y",-15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legendSquare")
            .style("fill", getComputedStyle(document.body).getPropertyValue("--dark-yellow"))
        svg.append("text")
            .attr("x", width / 2 + 30)
            .attr("y", -5)
            .text("Fashion Transparency Index")
            .attr("class", "legend")
        svg.append("text")
            .attr("x", width / 2 - 30)
            .attr("y", -5)
            .attr("text-anchor", "end")
            .text("2021 Income")
            .attr("class", "legend")

        // add the two  axes
        let maxIncome = d3.max(data.map(d => parseInt(d.Income)));

        xLeft = d3.scaleLinear()
            .domain([maxIncome+10000, 0])
            .range([ 0, width/2]);
        xRight = d3.scaleLinear()
            .domain([0, 1])
            .range([width/2, width]);

        svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xLeft).tickFormat(function(d){return parseInt(parseInt(d)/1000); })
        );
        svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xRight)
                .tickFormat(function(d){return parseFloat(d) * 100})    
            );

        // add the labels
        svg.append("text")
            .attr("class", "legend")
            .attr("text-anchor", "end")
            .attr("x", width+10)
            .attr("y", height+45)
            .text("(%)");
        svg.append("text")
            .attr("class", "legend")
            .attr("x", 0)
            .attr("y", height+45)
            .text("(Billion $)");

        data = data.sort(order(sorting));

        // y axis
        y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(d => d.Brand))
            .padding(.1);
        
        // bars sx
        svg.selectAll(".myRectIncome")
            .data(data)
            .join("rect")
            .attr("x", d => xLeft(d.Income))
            .attr("y", d => y(d.Brand))
            .attr("width", d => xLeft(0) - xLeft(d.Income))
            .attr("height", y.bandwidth())
            .attr("class", "barIncome");

        // bars dx
        svg.selectAll(".myRectIndex")
            .data(data)
            .join("rect")
            .attr("x", xRight(0))
            .attr("y", d => y(d.Brand))
            .attr("width", d => xRight(d.Index) - xRight(0))
            .attr("height", y.bandwidth())
            .attr("class", "barIndex");
        
        // generate y axis
        yAxis = svg.append("g")
            .attr("class", "legendDivergent")
            .attr("transform", `translate(${width/2}, 0)`)
            .call(d3.axisLeft(y).tickSize(0))
            .style("path", 1.5);;

        // add the detail texts
        svg.selectAll(".plotTextIndex")
            .data(data)
            .join("text")
            .attr("class", "plotTextIndex")
            .attr("x", d => xRight(d.Index))
            .attr("y", d => y(d.Brand) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("dx", "10px")
            .text(d => Math.round(d.Index * 100) + "%")
        
            svg.selectAll(".plotTextIncome")
            .data(data)
            .join("text")
            .attr("class", "plotTextIncome")
            .attr("x", d => xLeft(d.Income))
            .attr("y", d => y(d.Brand) + y.bandwidth() / 2)
            .attr("dy", "0.5em")
            .attr("dx", "-60px")
            .text(d => (d.Income / 1000).toFixed(2) + " B$")
    });

    function divergent_update(){
        sorting = document.getElementById("sorting_divergent").value;
        money_ranking.then(function(data){
            data = data.sort(order(sorting));

            y = d3.scaleBand()
                .range([ 0, height ])
                .domain(data.map(d => d.Brand))
                .padding(.1);
            
            svg.selectAll(".barIncome")
                .data(data)
                .join("rect")
                .transition()
                .duration(500)
                .attr("x", d => xLeft(d.Income))
                .attr("y", d => y(d.Brand))
                .attr("width", d => xLeft(0) - xLeft(d.Income))
                .attr("height", y.bandwidth())
                .attr("class", "barIncome");

            svg.selectAll(".barIndex")
                .data(data)
                .join("rect")
                .transition()
                .duration(500)
                .attr("x", xRight(0))
                .attr("y", d => y(d.Brand))
                .attr("width", d => xRight(d.Index) - xRight(0))
                .attr("height", y.bandwidth())
                .attr("class", "barIndex");
            
            yAxis.transition()
                .duration(500)
                .call(d3.axisLeft(y).tickSize(0))
                .style("path", 1.5);

            svg.selectAll(".plotTextIndex")
                .data(data)
                .join("text")
                .transition()
                .duration(500)
                .attr("class", "plotTextIndex")
                .attr("x", d => xRight(d.Index))
                .attr("y", d => y(d.Brand) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("dx", "5px")
                .text(d => Math.round(d.Index * 100) + "%")
            
            svg.selectAll(".plotTextIncome")
                .data(data)
                .join("text")
                .transition()
                .duration(500)
                .attr("class", "plotTextIncome")
                .attr("x", d => xLeft(d.Income))
                .attr("y", d => y(d.Brand) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("dx", "-60px")
                .text(d => (d.Income / 1000).toFixed(2) + " B$")
        });
    }

    // updates the colors of the legend
    function divergent_update_legend(){
        svg.selectAll(".legendSquare")
            .remove();
        svg.append("rect")
            .attr("x", width / 2 + 10)
            .attr("y",-15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legendSquare")
            .style("fill", getComputedStyle(document.body).getPropertyValue("--med-blue"))
        svg.append("rect")
            .attr("x", width / 2 - 20)
            .attr("y",-15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", "legendSquare")
            .style("fill", getComputedStyle(document.body).getPropertyValue("--dark-yellow"))
    }
}
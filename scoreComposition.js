{
    const width = 450,
        height = 450,
        margin = 40;

    const radius = Math.min(width, height) / 2 - margin

    // append the svg
    const svg = d3.select("#doughnut")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + 2*margin) + " " + (height + 2*margin))
        .append("g")
        .attr("transform", `translate(${width / 2 + margin},${height / 2 + margin})`);

    // colors for the slices
    var colors = [
        getComputedStyle(document.body).getPropertyValue("--med-blue"),
        getComputedStyle(document.body).getPropertyValue("--purple"),
        getComputedStyle(document.body).getPropertyValue("--fuchsia"),
        getComputedStyle(document.body).getPropertyValue("--orange"),
        getComputedStyle(document.body).getPropertyValue("--yellow")
    ]

    // colors for the difference wrt the average
    var textColors = [
        getComputedStyle(document.body).getPropertyValue("--red"),
        getComputedStyle(document.body).getPropertyValue("--yellow"),
        getComputedStyle(document.body).getPropertyValue("--green")
    ]

    // set the color scale for the slices
    const color = d3.scaleOrdinal()
        .range(colors)

    svg.append("text")
        .text("Index 2021 composition")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", -height/2 - 10 )
        .attr("class", "plotTitle")
    
    let idxAvg;
    percentageBySec_scores.then(function(data){
        data = data.map(d => parseFloat(d["Index Score"]) * 100)
        idxAvg = Math.round(d3.sum(data) / data.length)
    })

    // needed in doughnut
    var abcde = ["a", "b", "c", "d", "e"];

    percentageBySec_scores.then(function(data){
        var cols = data.columns;
        var yRect = height / 2 - 10;
        for(var i=0; i<5; i++){
            if(i % 2 == 0 && i!=0)
                yRect += 20;
            svg.append("rect")
                .attr("x", -20 + 40 * (i % 2))
                .attr("y", yRect)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", colors[i])
                .attr("class", "squares col" + abcde[i])
        }
        var yText = height / 2;
        for(var i=0; i<5; i++){
            if(i % 2 == 0 && i != 0)
                yText += 20;
            svg.append("text")
                .attr("text-anchor", function(){
                    if(i % 2 == 0)
                        return "end";
                    return "start";
                })
                .attr("x", -25 + 60 * (i % 2))
                .attr("y", yText)
                .text(cols[i+2])
                .attr("class", "legend col" + abcde[i])
                .style("fill-opacity", 1)
        }
    });

    function doughnut_update(selectedBrand){
        colors = [
            getComputedStyle(document.body).getPropertyValue("--med-blue"),
            getComputedStyle(document.body).getPropertyValue("--purple"),
            getComputedStyle(document.body).getPropertyValue("--fuchsia"),
            getComputedStyle(document.body).getPropertyValue("--orange"),
            getComputedStyle(document.body).getPropertyValue("--yellow")
        ]

        textColors = [
            getComputedStyle(document.body).getPropertyValue("--red"),
            getComputedStyle(document.body).getPropertyValue("--yellow"),
            getComputedStyle(document.body).getPropertyValue("--green")
        ]

        const color = d3.scaleOrdinal()
            .range(colors)

        percentageBySec_scores.then(function(data){
            var cols = data.columns;
            data = data.filter(d => d.Brand == selectedBrand);   
            let brandValues = {a: data[0][cols[2]], b: data[0][cols[3]], c: data[0][cols[4]], d: data[0][cols[5]], e: data[0][cols[6]]};
            const pie = d3.pie()
                .value(x => x[1])
            const data_ready = pie(Object.entries(brandValues));
            var indexScore = "";
            var avgScore = "";
    
            svg.selectAll(".doughnutSlice")
                .data(data_ready)
                .join('path')
                .attr("class", function(d){return "doughnutSlice col" + d.data[0];})
                .attr('d', d3.arc()
                    .innerRadius(120)
                    .outerRadius(radius)
                )
                .attr('fill', d => color(d.data[0]))
                .attr("stroke", "black")
                .style("stroke-width", "3px")
                .style("fill-opacity", 0.8)
                .style("stroke-opacity", 0.8)
                .on("mouseover", function(d,i){     // highlight just the hovered part and data
                    let val = Math.round(i.value * 100);
                    indexScore = d3.select(".doughnutScore").text();
                    avgScore = d3.select(".avgArrow").text();
                    svg.selectAll(".avgArrow")
                        .text("")
                    svg.selectAll(".doughnutScore")
                        .text(val + "%");
                    svg.selectAll(".doughnutSlice")
                        .style("fill-opacity", 0.2)
                    svg.selectAll(".squares")
                        .style("fill-opacity", 0.2)
                    svg.selectAll(".legend")
                        .style("fill-opacity", 0.2)
                    svg.selectAll(".col" + i.data[0])
                        .style("fill-opacity", 0.8);
                })
                .on("mouseleave", function(){    // color back everything
                    svg.selectAll(".doughnutScore")
                        .text(indexScore)
                    svg.selectAll(".avgArrow")
                        .text(avgScore);
                    svg.selectAll(".doughnutSlice")
                        .style("fill-opacity", 0.8)
                    svg.selectAll(".squares")
                        .style("fill-opacity", 0.8)
                    svg.selectAll(".legend")
                        .style("fill-opacity", 1)
                });
            return data;
        }).then(function(data){
            svg.selectAll(".doughnutScore") // add in the middle the total score
                .data(data)
                .join("text")
                .text(Math.round(data[0]["Index Score"] * 100) + "%")
                .attr("x", 0)
                .attr("y",90/4 - 10)
                .attr("class", "doughnutScore")
                .attr("text-anchor", "middle");
            svg.selectAll(".avgArrow")  // add the difference wrt the average
                .data(data)
                .join("text")
                .text(function(d){
                    let score = Math.round(parseFloat(d["Index Score"]) * 100);
                    if(score >= idxAvg)
                        return "🠕 (+" + (score - idxAvg) + "%)";
                    return "🠗 (" + (score - idxAvg) + "%)";
                })
                .style("fill", function(d){
                    if(parseFloat(d["Index Score"]) * 100 > idxAvg)
                        return textColors[2];
                    else if (parseFloat(d["Index Score"]) * 100 == idxAvg)
                        return textColors[1];
                    return textColors[0];
                })
                .attr("x", 0)
                .attr("y",90/4 + 30)
                .attr("class", "avgArrow")
                .attr("text-anchor", "middle");
        })
    }

    // updates the colors of the legend when a different palette is selected
    function scoreComp_legend_update(){
        colors = [
            getComputedStyle(document.body).getPropertyValue("--med-blue"),
            getComputedStyle(document.body).getPropertyValue("--purple"),
            getComputedStyle(document.body).getPropertyValue("--fuchsia"),
            getComputedStyle(document.body).getPropertyValue("--orange"),
            getComputedStyle(document.body).getPropertyValue("--yellow")
        ]
        svg.selectAll(".squares")
            .remove();
        percentageBySec_scores.then(function(data){
            var yRect = height / 2 - 10;
            for(var i=0; i<5; i++){
                if(i % 2 == 0 && i!=0)
                    yRect += 20;
                svg.append("rect")
                    .attr("x", -20 + 40 * (i % 2))
                    .attr("y", yRect)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", colors[i])
                    .attr("class", "squares col" + abcde[i])
            }
        });
    }
}
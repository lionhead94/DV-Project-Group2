{
    var margin = {top: 120, right: 120, bottom: 120, left: 120},
    width = 550 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;
    
    let brand1_spider = d3.select("#brand1_spider");
    let brand2_spider = d3.select("#brand2_spider");
    let brand3_spider = d3.select("#brand3_spider");
    let spider_buttons = [brand1_spider, brand2_spider, brand3_spider];
    let brandIndices = {}
    let selectedBrands;
    let colsPerSpider = [2, 7, 11, 14, 19, 25];

    let color = d3.scaleOrdinal()
        .range([
            getComputedStyle(document.body).getPropertyValue("--yellow"),
            getComputedStyle(document.body).getPropertyValue("--fuchsia"),
            getComputedStyle(document.body).getPropertyValue("--blue")
        ]);

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 1,
        levels: 4,
        roundStrokes: true,
        color: color
    };

    for(var i=1; i<=5; ++i){
        d3.select("#spider" + i)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip tooltipSpider" + i);
    }

    percentage_scores.then(function(data){
        let idx = 0;
        spider_buttons.forEach(function(d){ // generate the selects
            d.selectAll("option")
                .data(data)
                .enter()
                .append("option")
                .attr("value", function(d){return d.Brand})
                .property("selected", function(d) { 
                    return ["Abercrombie & Fitch", "Adidas", "Aeropostale"][idx] == d.Brand;    // preselect three brands
                })
                .text(function(d){return d.Brand});
            idx++;
        })
        return data;
    }).then(function(data){
        data.forEach(function(d){
            brandIndices[d.Brand] = parseInt(d.Index);
        })
        return data;
    }).then(function(data){
        selectedBrands = [  // get the selected brands form the selects
            document.getElementById("brand1_spider").value,
            document.getElementById("brand2_spider").value,
            document.getElementById("brand3_spider").value
        ];
        return data;
    }).then(function(data){     // collect and push together the needed data for each spider
        var spiderData = [];
        for(var sp=1; sp<=5; ++sp){
            var values = [];
            var cols = data.columns;
            selectedBrands.forEach(function(d){
                var l = []
                for(var i=colsPerSpider[sp-1]; i<colsPerSpider[sp]; i++){
                    l.push({axis:cols[i],  value:parseFloat(data[brandIndices[d]][cols[i]])});
                }
                values.push(l);
            });
            spiderData[sp] = values;
        }
        return(spiderData);
    }).then(function(spiderData){
        // draw the five charts
        for(var sp=1; sp<=5; ++sp){
            RadarChart(".radarChart"+sp, spiderData[sp], radarChartOptions)
        }
    });


    function spider_update(){
        let selectedBrands = [
            document.getElementById("brand1_spider").value,
            document.getElementById("brand2_spider").value,
            document.getElementById("brand3_spider").value
        ];

        let color = d3.scaleOrdinal()
            .range([
                getComputedStyle(document.body).getPropertyValue("--yellow"),
                getComputedStyle(document.body).getPropertyValue("--fuchsia"),
                getComputedStyle(document.body).getPropertyValue("--blue")
            ]);
        radarChartOptions.color = color;
        
        percentage_scores.then(function(data){
            var spiderData = [];
            for(var sp=1; sp<=5; ++sp){
                var values = [];
                var cols = data.columns;
                selectedBrands.forEach(function(d){
                    var l = []
                    for(var i=colsPerSpider[sp-1]; i<colsPerSpider[sp]; i++){
                        l.push({axis:cols[i],  value:parseFloat(data[brandIndices[d]][cols[i]])});
                    }
                    values.push(l);
                });
                spiderData[sp] = values;
            }
            return(spiderData);
        }).then(function(spiderData){
            for(var sp=1; sp<=5; ++sp){
                RadarChart(".radarChart"+sp, spiderData[sp], radarChartOptions)
            }
        });
    }
}
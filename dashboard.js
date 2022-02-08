{
    // generate the select
    percentage_scores.then(function(data){
        d3.select("#dashboardSelector")
            .selectAll("option")
            .data(data)
            .enter()
            .append("option")
            .attr("value", function(d){return d.Brand})
            .property("selected", function(d) { 
                return "Abercrombie & Fitch" == d.Brand;
            })
            .text(function(d){return d.Brand});
        dashboard_update();
    })

    // load the current brand logo and generate the plots
    function dashboard_update(){
        let selectedBrand = document.getElementById("dashboardSelector").value;
        logos.then(function(data){
            data = data.filter(d => d.Brand == selectedBrand);
            d3.select("#logo")
                .data(data)
                .attr("src", d => d.Link);
        })
        
        groups.then(function(data){
            data = data.filter(d => d.Brand == selectedBrand);
            if(data.length > 0){
                d3.select("#group")
                    .data(data)
                    .text(d => "Group: " + d.Group);
            }
            else{
                d3.select("#group")
                    .text("Group: -");
            }
        })
        doughnut_update(selectedBrand);
        scoreLine_update(selectedBrand);
    }
}
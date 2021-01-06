var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(d3data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(d3data.map(function (d) { 
      return d[chosenXAxis];
    })) * 0.8,
    d3.max(d3data.map(function (d) { 
      return d[chosenXAxis];
    })
    ) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// // function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", function (d) { 
      return newXScale(d[chosenXAxis]);
    //.append.text(function(d){
    //   return d.abbr});
    })

  return circlesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty:";
  }
  else  if (chosenXAxis === "income") {
    label = "Income:";
  }
  else {
    label = "Age:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>Healthcare:  ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("d3data.csv").then(function (d3data, err) {
  if (err) throw err;

  // parse data
  d3data.forEach(function (data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(d3data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(
      d3data.map(function (d) {
        return d.healthcare;
      })
    )]
    )
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
    // .text(function(d) {return d.abbr; });

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);
    // .text(function(d){return d.abbr});
/*
  // // append initial circles
    var circlesGroup = chartGroup.selectAll("g circle")
    .data(d3data)
    .enter();

    circlesGroup
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", function(d) { 
      return xLinearScale(d[chosenXAxis]);
    })
    .attr("cy", function(d) { 
      return yLinearScale(d.healthcare);
    })
    .attr("r", 12);

    circlesGroup
    .append("text")
    .classed("stateText", true)
    .attr("dx", function(d) { 
      return xLinearScale(d[chosenXAxis]);
    })
    .attr("dy", function(d) { 
      return yLinearScale(d.healthcare);
    })
    .text(function (d) {
      return d.abbr;
    	})
    .attr("text-size", 5);

*/
  // // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(d3data)
    .enter()

    .append("circle")
    .attr("cx", function(d) { 
      return xLinearScale(d[chosenXAxis]);
    })
    .attr("cy", function(d) { 
      return yLinearScale(d.healthcare);
    })
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", "0.5");

/*    
    .append("text").text(
      function(d){
        return d.abbr;
      }
    );


    ADD TEXT AFTER STYLE?? VIDEO 2

        .style("height", d => d + "px";
        .text(d => d + " degrees");
        });

  selection.exit().remove();
*/
    

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  // chartGroup.append("text")
  var healthcareLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(d3data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function (error) {
  console.log(error);
});

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
var chosenYAxis = "obesity";


 //-------- Scales for X and Y -------------------------
function xScale(csvData, chosenXAxis) {

  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
      d3.max(csvData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(csvData, chosenYAxis) {

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.8,
      d3.max(csvData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
}
 //------------------------------------------------------

 //--------------- Render Axeses-------------------------

var renderXAxes = (newXScale, xAxis)=> {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

var renderYAxes = (newYScale, yAxis)=> {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
 
  return yAxis;
}
 //------------------------------------------------------



// function used for updating circles group with a transition to
// new circles
let renderCircles = (circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) => {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr('cy', d=> newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis ,chosenYAxis ,circlesGroup) {

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${chosenYAxis}: ${d[chosenYAxis]}<br> ${chosenXAxis}: ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function(err, csvData) {
  if (err) throw err;

  // parse data
  csvData.forEach((data)=> {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.abbr = data.abbr
  });
  // xLinearScale function above csv import
  var xLinearScale = xScale(csvData, chosenXAxis);

  var yLinearScale = yScale(csvData, chosenYAxis);

    
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    
  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(csvData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5");
    
  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var yGroup = chartGroup.append("g")
    .attr("transform", `translate(${width}, ${height})`);


  //------------- X labels ----------------------
  var xPoverty = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");
    
    var xAge = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age Median");

    var xHouseIncome = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") 
    .classed("inactive", true)
    .text("Hosehold Income (Median)");



  //------------- Y labels ----------------------
  var yObesity = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 45 -  (margin.left*5))
    .attr("x", height/2)
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("axis-text inactive", true)
    .text("Obesity (%)");

  var ySmokes = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 25 -  (margin.left*5))
    .attr("x", height/2)
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("axis-text inactive", true)
    .text("Smokes (%)");

  var yHealthCare = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 5 -  (margin.left*5))
    .attr("x", height/2)
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

// --------- X event listner -----------------
  labelsGroup.selectAll("text")
    .on("click", function (){
      let value = d3.select(this).attr("value");
      // console.log(d3.select(this).attr("value"))
      if (value !== chosenXAxis &&
        (value == 'age' || value == 'poverty' || value == 'income') &&
        (chosenXAxis == 'age' || chosenXAxis == 'poverty' || chosenXAxis == 'income')) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
        xLinearScale = xScale(csvData, chosenXAxis);
        xAxis = renderXAxes(xLinearScale, xAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);
        if (chosenXAxis === "age") {
            xAge
            .classed("active", true)
            .classed("inactive", false);
            xPoverty
            .classed("active", false)
            .classed("inactive", true);
            xHouseIncome
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "poverty"){
            xAge
            .classed("active", false)
            .classed("inactive", true);
            xPoverty
            .classed("active", true)
            .classed("inactive", false);
            xHouseIncome
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenXAxis === "income") {
          xAge
            .classed("active", false)
            .classed("inactive", true);
            xPoverty
            .classed("active", false)
            .classed("inactive", true);
            xHouseIncome
            .classed("active", true)
            .classed("inactive", false);
        }
      }
       if (value !== chosenYAxis &&
        (value == 'obesity' || value == 'smokes' || value == 'healthcare') &&
        (chosenYAxis == 'obesity' || chosenYAxis == 'smokes' || chosenYAxis == 'healthcare')) {
          chosenYAxis = value;
          yLinearScale = yScale(csvData, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          circlesGroup = updateToolTip(chosenYAxis, chosenYAxis,circlesGroup);
          console.log(chosenYAxis)
          if (chosenYAxis === "obesity") {
            yObesity
              .classed("active", true)
              .classed("inactive", false);
            ySmokes
              .classed("active", false)
              .classed("inactive", true);
            yHealthCare
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenYAxis === "smokes") {
            yObesity
            .classed("active", false)
            .classed("inactive", true);
          ySmokes
            .classed("active", true)
            .classed("inactive", false);
          yHealthCare
            .classed("active", false)
            .classed("inactive", true);
          } else if (chosenYAxis === "healthcare"){
            yObesity
            .classed("active", false)
            .classed("inactive", true);
          ySmokes
            .classed("active", false)
            .classed("inactive", true);
          yHealthCare
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});

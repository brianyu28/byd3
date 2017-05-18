/****************************
  * Examples 
  ***************************/

// creates a sample bar graph. Needs a div called 'graphic-area' 
function sampleLineGraph() {
    data = [[2003, 5], [2004, 60], [2005, 40]];
    var coords = {
        "x": 20,
        "y": 20,
        "width": 600,
        "height": 500,
        "axisPadding": 40
    };
    var xAttrs = {
        "min": 2000,
        "max": 2010,
        "ticks": 5
    };
    var yAttrs = {
        "min": 0,
        "max": 70,
        "ticks": 5
    };
    var svg = createSVG('#graphic-area', 'infographic', 600, 600, 10);
    
    var axes = drawLineGraph(svg, coords, data, xAttrs, yAttrs,
//    var axes = drawDiscreteLineGraph(svg, coords, data, yAttrs,
            {"x-label": "test", "y-label": "another test"});

    // add more
    data2 = [[2002, 10], [2009, 65]];
    addLineToGraph(svg, data2, axes, {'color': style('green')});

}

function sampleBarGraph() {
    data = [["Red", 5], ["Blue", 8], ["Green", 13]];
    var coords = {
        "x": 0,
        "y": 0,
        "width": 600,
        "height": 600,
        "axisPadding": 40
    };
    var yAttrs = {
        "min": 0,
        "max": 20,
        "ticks": 4
    };
    addHeadline('#graphic-area', 600, 'This is a bar graph');
    var svg = createSVG('#graphic-area', 'infographic', 600, 600, 10);
    var axes = drawBarGraph(svg, coords, data, yAttrs, 
            {"x-label": "test", "y-label": "another test"});
}

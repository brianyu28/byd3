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
    
//    var axes = drawLineGraph(svg, coords, data, xAttrs, yAttrs,
    var axes = drawDiscreteLineGraph(svg, coords, data, yAttrs,
            {"x-label": "test", "y-label": "another test"});

    // add more
//    data2 = [[2002, 10], [2009, 65]];
 //   var newPoints = addLineToGraph(svg, data2, axes, {'color': style('green')});

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

function sampleMultiBarGraph() {
    data = [
        {
            "color": "#a82931",
            "data": [["Red", 10], ["Blue", 5], ["Green", 7]]
        },
        {
            "color": "#004e6a",
            "data": [["Red", 2], ["Blue", 9], ["Green", 1]]
        },
        {
            "color": "#298848",
            "data": [["Red", 3], ["Blue", 4], ["Green", 8]]
        }
    ];

    var coords = {
        "x": 0,
        "y": 0,
        "width": 600,
        "height": 600,
        "axisPadding": 40
    };

    var yAttrs = {
        "min": 0,
        "max": 15,
        "ticks": 5
    };

    addHeadline('#graphic-area', 600, 'This is a multiple bar graph');
    var svg = createSVG('#graphic-area', 'infographic', 600, 600, 10);
    var axes = drawMultiBarGraph(svg, coords, data, yAttrs, 
            {"x-label": "test", "y-label": "another test"});

    var person = drawPerson(svg, 50, 50, 100, {});
    movePerson(svg, person, 100, 100, 1000, {"personColor": "#0000ff"});
}

function sampleDonut() {
    var svg = createSVG('#graphic-area', 'infographic', 600, 600, 10);
    var donut = createDonut(svg, 100, 100, 50, 50, {});
    donutChangeData(svg, donut, 90, {});
}

function sampleMovingDonut() {
    var data = [
        {
            "name": "Category A",
            "value": 25
        },
        {
            "name": "Category B",
            "value": 90
        },
        {
            "name": "Category C",
            "value": 50
        }
    ];
    var chooser = '<select id="donut-chooser"> \
                  <option>Category A</option> \
                  <option>Category B</option> \
                  <option>Category C</option> \
                  </select><br/>';
    var area = document.getElementById('graphic-area');
    area.innerHTML = area.innerHTML + chooser;
    var svg = createSVG('#graphic-area', 'infographic', 300, 300, 10);
    var donut = createDynamicDonut('#donut-chooser', svg, data, 300, {});
}

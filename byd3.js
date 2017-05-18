/*
 * byd3.js
 * Version 0.0.1
 *
 * D3 Graphics Library
 * Brian Yu
 */

/****************************
  * SVG Canvas Setup
  ***************************/

// creates an SVG element to hold graphics
function createSVG(container_name, svg_name, width, height, padding) {
    var container = d3.select(container_name);

    var svg = container.append('svg')
        .attr('id', svg_name)
        .style('width', px(width))
        .style('height', px(height))
        .style('padding', px(padding));
    return svg;
}

/****************************
  * Custom Graphs 
  ***************************/

// draws a line graph with discrete x categories at (x, y) with given size
// minY and maxY should be the range of the y values, ticksY is the number of ticks
// data should be a list of [x, y] arrays 
function drawDiscreteLineGraph(svg, coords, data, yAttrs, attributes) {

    // compute the axes
    var xData = data.map(function(elt) { return elt[0]; });
    var xAxis = createDiscreteAxisX(
            xData, // domain, possible x values
            [coords['x'], coords['x'] + coords['width']], // range, coordinate locations
            coords['axisPadding']); // padding
    var yAxis = createLinearAxisY(
            [yAttrs['min'], yAttrs['max']], // domain, possible y values
            [coords['y'] + coords['height'], coords['y']], // range, coordinate locations
            yAttrs['ticks'], coords['axisPadding']); // ticks and padding

    // draw the gridlines
    if (style('lineGraphGridlinesX'))
        drawXGridlines(svg, xAxis, coords['height'] - 2 * coords['axisPadding'],
                data.length, coords['y'] + coords['height'] - coords['axisPadding'], {});

    if (style('lineGraphGridlinesY'))
        drawYGridlines(svg, yAxis, coords['width'] - 2 * coords['axisPadding'],
                yAttrs['ticks'], coords['x'] + coords['axisPadding'], {});

    drawAxisX(svg, xAxis, coords['y'] + coords['height'], coords['axisPadding']);
    drawAxisY(svg, yAxis, coords['x'], coords['axisPadding']);
    labelAxes(svg, coords, attributes);
    
    // draw the actual line path
    if (data.length !== 0) {
        var dataLocations = computeDataLocations(data, xAxis, yAxis);
        drawLinePath(svg, dataLocations, {});
    }

    return [xAxis, yAxis];
}

function drawLineGraph(svg, coords, data, xAttrs, yAttrs, attributes) {

    // compute the axes
    var xAxis = createLinearAxisX(
            [xAttrs['min'], xAttrs['max']], // domain, possible x values
            [coords['x'], coords['x'] + coords['width']], // range, coordinate locations
            xAttrs['ticks'], coords['axisPadding']); // ticks and padding
    var yAxis = createLinearAxisY(
            [yAttrs['min'], yAttrs['max']], // domain, possible y values
            [coords['y'] + coords['height'], coords['y']], // range, coordinate locations
            yAttrs['ticks'], coords['axisPadding']); // ticks and padding

    // draw the gridlines
    if (style('lineGraphGridlinesX'))
        drawXGridlines(svg, xAxis, coords['height'] - 2 * coords['axisPadding'],
                xAttrs['ticks'], coords['y'] + coords['height'] - coords['axisPadding'], {});
    if (style('lineGraphGridlinesY'))
        drawYGridlines(svg, yAxis, coords['width'] - 2 * coords['axisPadding'],
                yAttrs['ticks'], coords['x'] + coords['axisPadding'], {});

    drawAxisX(svg, xAxis, coords['y'] + coords['height'], coords['axisPadding']);
    drawAxisY(svg, yAxis, coords['x'], coords['axisPadding']);
    labelAxes(svg, coords, attributes);

    // draw the actual line path
    if (data.length !== 0) {
        var dataLocations = computeDataLocations(data, xAxis, yAxis);
        drawLinePath(svg, dataLocations, {});
    }

    return [xAxis, yAxis];
}

// draws a bar graph
// bar graph size should be in range (0, 1)
function drawBarGraph(svg, coords, data, yAttrs, attributes) {

    // compute the axes
    var xData = data.map(function(elt) { return elt[0]; });
    var xAxis = createBarAxisX(
        xData, // domain, possible x values
        [coords['x'], coords['x'] + coords['width']], // range, coordinate locations
        coords['axisPadding']); // padding
    xAxis.scale().padding(1 - style('barSize'));
    var yAxis = createLinearAxisY(
            [yAttrs['min'], yAttrs['max']], // domain, possible y values
            [coords['y'] + coords['height'], coords['y']], // range, coordinate locations
            yAttrs['ticks'], coords['axisPadding']); // ticks and padding
   
    // draw gridlines
    if (style('barGraphGridlines'))
        drawYGridlines(svg, yAxis, coords['width'] - 2 * coords['axisPadding'],
                yAttrs['ticks'], coords['x'] + coords['axisPadding'], {});

    // draw axes
    drawAxisX(svg, xAxis, coords['y'] + coords['height'], coords['axisPadding']);
    drawAxisY(svg, yAxis, coords['x'], coords['axisPadding']);
    labelAxes(svg, coords, attributes);

    // draw each bar
    barColor = get(attributes, 'color', style('barColor'));
    for (var i = 0; i < data.length; i++) {
        svg.append('rect')
            .attr('x', xAxis.scale()(data[i][0]))
            .attr('y', yAxis.scale()(data[i][1]))
            .attr('width', xAxis.scale().bandwidth())
            .attr('height', coords['y'] + coords['height']
                    - coords['axisPadding'] - yAxis.scale()(data[i][1]))
            .style('fill', barColor);
    }

    return [xAxis, yAxis];
}

function addLineToGraph(svg, data, axes, attributes) {
    var dataLocations = computeDataLocations(data, axes[0], axes[1]);
    drawLinePath(svg, dataLocations, attributes);
}

// labels the axes, if they are specified in the attributes of the graph
function labelAxes(svg, coords, attributes) {
    if ('x-label' in attributes) {
        svg.append('text')
            .attr('x', coords['x'] + coords['width'] / 2) 
            .attr('y', coords['y'] + coords['height'])
            .attr('text-anchor', 'middle')
            .style('font-family', style('axisFont'))
            .style('font-size', style('axisFontSize'))
            .text(attributes['x-label']);
    }

    if ('y-label' in attributes) {
        svg.append('text')
            .attr('x', coords['x'] - coords['height'] / 2 - coords['axisPadding'])
            .attr('y', coords['y'])
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .style('font-family', style('axisFont'))
            .style('font-size', style('axisFontSize'))
            .text(attributes['y-label']);
    }
}

/****************************
  * Graph Helper Functions
  ***************************/

// creates a scale mapping data in domain to pixels in range, with padding
function scale(type, domain, range, padding) {
    var scale = null;

    // modify range to allow for padding
    if (range[0] > range[1]) {
        range[0] -= padding;
        range[1] += padding;
    } else {
        range[0] += padding;
        range[1] -= padding;
    }
    if (type === 'linear') {
        scale = d3.scaleLinear().domain(domain).range(range);
    } else if (type === 'point') {
        scale = d3.scalePoint().domain(domain).range(range);
    } else if (type === 'band') {
        scale = d3.scaleBand().domain(domain).range(range);
    }
    return scale;
}

// returns an array of two arrays: the first is the x domain, the second is y domain
function domains(data) {
    var xMin = data[0][0];
    var xMax = data[0][0];
    var yMin = data[0][1];
    var yMax = data[0][1];

    for (var i = 1; i < data.length; i++) {
        if (data[i][0] < xMin)
            xMin = data[i][0];
        else if (data[i][0] > xMax)
            xMax = data[i][0];
        if (data[i][1] < yMin)
            yMin = data[i][1];
        else if (data[i][1] > yMax)
            yMax = data[i][1];
    }
}

// creates, but does not draw, an axis for continuous x data
function createLinearAxisX(domain, range, tickCount, axisPadding) {
    var axisScale = scale('linear', domain, range, axisPadding);
    return d3.axisBottom().scale(axisScale).ticks(tickCount);
}

// creates, but does not draw, an x axis for discrete x data
function createDiscreteAxisX(domain, range, axisPadding) {
    var axisScale = scale('point', domain, range, axisPadding);
    return d3.axisBottom().scale(axisScale);
}

// creates, but does not draw, an x axis for a bar graph
function createBarAxisX(domain, range, axisPadding) {
    var axisScale = scale('band', domain, range, axisPadding);
    return d3.axisBottom().scale(axisScale);
}

// creates, but does not draw, an axis for y data
function createLinearAxisY(domain, range, tickCount, axisPadding) {
    var axisScale = scale('linear', domain, range, axisPadding);
    return d3.axisLeft().scale(axisScale).ticks(tickCount);
}

function computeDataLocations(data, xAxis, yAxis) {
    var dataLocations = [];
    for (var i = 0; i < data.length; i++) {
        dataLocations.push([xAxis.scale()(data[i][0]), yAxis.scale()(data[i][1])]);
    }
    return dataLocations;
}

// draws the x axis on svg canvas. Requires an axis, and details about how tall graph is
function drawAxisX(svg, xAxis, graphHeight, axisPadding) {
    drawAxis(svg, xAxis, 'translate(0, ' + (graphHeight - axisPadding) + ')', {});
}

// draws the y axis on svg canvas.
function drawAxisY(svg, yAxis, graphXStart, axisPadding) {
    drawAxis(svg, yAxis, 'translate(' + (graphXStart + axisPadding) + ', 0)', {});
}

function drawAxis(svg, axis, transformation, attributes) {
    var axis = svg.append('g')
        .attr('transform', transformation)
        .call(axis);
    
    // modify CSS for the axes themselves
    axis.select('path')
        .style('stroke', style('axisColor'))
        .style('stroke-width', style('lineGraphAxisWidth'));

    // modify CSS for ticks
    axis.selectAll('.tick').selectAll('text')
        .style('font-family', style('axisFont'))
        .style('font-size', style('axisFontSize'));
}

// draws gridlines for y intervals
function drawYGridlines(svg, axis, width, ticks, xStart, attributes) {
    var gridlines = d3.axisRight()
        .tickFormat('')
        .tickSize(width)
        .ticks(ticks)
        .scale(axis.scale());

    drawGridlines(svg, gridlines, 'translate(' + xStart + ', 0)', {});
}

function drawXGridlines(svg, axis, height, ticks, yStart, attributes) {
    var gridlines = d3.axisTop()
        .tickFormat('')
        .tickSize(height)
        .ticks(ticks)
        .scale(axis.scale());

    drawGridlines(svg, gridlines, 'translate(0, ' + yStart + ')', {});
}

function drawGridlines(svg, gridlines, transformation, attributes) {
    var g = svg.append('g')
        .attr('transform', transformation)
        .call(gridlines);

    g.select('.tick').remove();
    g.select('.domain').remove();
    // style the line
    g.selectAll('.tick').selectAll('line')
        .style('stroke', style('gridlineColor'));

}

// draws a line connecting [x, y] points in data, useful for line graphs
function drawLinePath(svg, data, attributes) {
    var color = get(attributes, 'color', style('lineColor'));
    var strokeWidth = get(attributes, 'stroke-width', style('lineGraphLineWidth'));
    var drawPoints = get(attributes, 'drawPoints', style('lineGraphDrawPoints'));
    svg.append('path')
        .attr('d', line(data))
        .style('stroke', color)
        .style('fill', 'none')
        .style('stroke-width', strokeWidth);

    if (drawPoints) {
        for (var i = 0; i < data.length; i++) {
            drawPoint(svg, data[i][0], data[i][1], attributes);
        }
    }
}

// draws a point at (x, y)
function drawPoint(svg, x, y, attributes) {
    var radius = get(attributes, 'pointRadius', style('pointRadius'));
    var innerRadius = get(attributes, 'innerPointRadius', style('innerPointRadius'));
    var color = get(attributes, 'pointColor', style('pointColor'));

    // draw the main point
    var point = svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', radius)
        .attr('fill', color);
    
    // if we need a hollow center, draw that
    if (style('pointsHollowCenter')) {
        var innerPoint = svg.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', innerRadius)
            .attr('fill', style('white'));
    }
    return point;
}

/****************************
  * Infographic Helper Functions 
  ***************************/

function addHeadline(identifier, width, text) {
    var headline = d3.select(identifier).append('div')
        .style('width', px(width))
        .style('padding', px(style('headlinePadding')))
        .style('text-align', 'center')
        .style('font-size', px(style('headlineFontSize')))
        .style('font-family', style('headlineFont'))
        .text(text);
    return headline;
}

/****************************
  * Stylesheet
  ***************************/

// default stylesheet for byd3
var stylesheet = {}

// spacing
stylesheet['padding'] = 10;
stylesheet['headlinePadding'] = 10;

// text sizes
stylesheet['textFontSize'] = 12;
stylesheet['axisFontSize'] = 12;
stylesheet['headlineFontSize'] = 24;

// other sizes
stylesheet['lineGraphLineWidth'] = 2;
stylesheet['lineGraphAxisWidth'] = 2;
stylesheet['barSize'] = 0.5;
stylesheet['pointRadius'] = 4;
stylesheet['innerPointRadius'] = 2; // size of inner hollow point for line graphs

// base fonts
stylesheet['slab'] = '"Roboto Slab", serif';
stylesheet['merriweather'] = '"Merriweather", serif';
stylesheet['lato'] = '"Lato", sans-serif';
stylesheet['noto'] = '"Noto Sans", sans-serif';

// font choices
stylesheet['mainFont'] = stylesheet['merriweather'];
stylesheet['textFontSerif'] = stylesheet['merriweather'];
stylesheet['textFontSans'] = stylesheet['lato'];
stylesheet['axisFont'] = stylesheet['merriweather'];
stylesheet['headlineFont'] = stylesheet['merriweather'];

// base colors
stylesheet['black'] = '#000000';
stylesheet['white'] = '#ffffff';
stylesheet['red'] = '#a82931';
stylesheet['blue1'] = '#004e6a';
stylesheet['blue2'] = '#7799b7';
stylesheet['blue3'] = '#b0cfe7';
stylesheet['green'] = '#298848';
stylesheet['yellow'] = '#dbd300';
stylesheet['grey1'] = '#9b9b9b';

// color choices
stylesheet['lineColor'] = stylesheet['black'];
stylesheet['axisColor'] = stylesheet['black'];
stylesheet['barColor'] = stylesheet['red'];
stylesheet['pointColor'] = stylesheet['black'];
stylesheet['gridlineColor'] = stylesheet['grey1'];

// other configuration settings
stylesheet['lineGraphDrawPoints'] = true;
stylesheet['pointsHollowCenter'] = false; // give line graph points hollow middle
stylesheet['lineGraphGridlinesY'] = true;
stylesheet['lineGraphGridlinesX'] = false;
stylesheet['barGraphGridlines'] = true;

// gets the styling for a particular attribute, using defaults if nothing overriden
function style(attribute) {
    if (window.stylesheetOverride && attribute in stylesheetOverride) {
        return stylesheetOverride[attribute];
    } else {
        return stylesheet[attribute];
    }
}


/****************************
  * Helper Functions
  ***************************/

// gets an element from associative array, or goes to default
function get(arr, elt, def) {
    if (elt in arr)
        return arr[elt];
    else
        return def;
}

// converts a number N to a string 'Npx'
function px(x) {
    return x + 'px';
}

// line function
var line = d3.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; });

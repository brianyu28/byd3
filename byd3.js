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
        var points = drawLinePath(svg, dataLocations, attributes);
        addTooltipsToPoints(svg, points, data, attributes);
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
        var points = drawLinePath(svg, dataLocations, attributes);
        addTooltipsToPoints(svg, points, data, attributes);
    }

    return [xAxis, yAxis];
}

// draws a bar graph
// bar graph size should be in range (0, 1)
function drawBarGraph(svg, coords, data, yAttrs, attributes) {
    var barSize = get(attributes, 'barSize', style('barSize'));

    // compute the axes
    var xData = data.map(function(elt) { return elt[0]; });
    var xAxis = createBarAxisX(
        xData, // domain, possible x values
        [coords['x'], coords['x'] + coords['width']], // range, coordinate locations
        coords['axisPadding']); // padding
    xAxis.scale().padding(1 - barSize);
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
        var bar = svg.append('rect')
            .attr('x', xAxis.scale()(data[i][0]))
            .attr('y', yAxis.scale()(data[i][1]))
            .attr('width', xAxis.scale().bandwidth())
            .attr('height', coords['y'] + coords['height']
                    - coords['axisPadding'] - yAxis.scale()(data[i][1]))
            .style('fill', barColor);

        if (style('showTooltips')) {
            var contents = data[i][1];
            if ('tooltipFunction' in attributes)
                contents = attributes['tooltipFunction'](data[i]);
            addTooltipToPoint(svg, bar, contents, attributes);
        }
    }

    return [xAxis, yAxis];
}

// multiple bar graph
// data is an array of dictionaries
// each dictionary contains a list of [x,y] pairs as 'data'
// each dictionary also contains a 'color'
function drawMultiBarGraph(svg, coords, data, yAttrs, attributes) {

    // compute the axes
    var xData = data[0]['data'].map(function(elt) { return elt[0] });
    var xAxis = createBarAxisX(
            xData,
            [coords['x'], coords['x'] + coords['width']],
            coords['axisPadding']);
    xAxis.scale().padding(style('multiBarPadding'));
    var yAxis = createLinearAxisY(
            [yAttrs['min'], yAttrs['max']],
            [coords['y'] + coords['height'], coords['y']],
            yAttrs['ticks'], coords['axisPadding']);

    // draw gridlines
    if (style('barGraphGridlines'))
        drawYGridlines(svg, yAxis, coords['width'] - 2 * coords['axisPadding'],
                yAttrs['ticks'], coords['x'] + coords['axisPadding'], {});

    // draw axes
    drawAxisX(svg, xAxis, coords['y'] + coords['height'], coords['axisPadding']);
    drawAxisY(svg, yAxis, coords['x'], coords['axisPadding']);
    labelAxes(svg, coords, attributes);

    // go through each set of bars
    var numBars = data.length;
    var totalBarWidth = xAxis.scale().bandwidth();
    var eachBarWidth = totalBarWidth / numBars;
    for (var i = 0; i < data.length; i++) {
        var barColor = data[i]['color'];
        var barData = data[i]['data'];
        
        // go through each bar in the set
        for (var j = 0; j < barData.length; j++) {
            var bar = svg.append('rect')
                .attr('x', xAxis.scale()(barData[j][0]) + i * eachBarWidth)
                .attr('y', yAxis.scale()(barData[j][1]))
                .attr('width', eachBarWidth)
                .attr('height', coords['y'] + coords['height']
                        - coords['axisPadding'] - yAxis.scale()(barData[j][1]))
                .style('fill', barColor);

            if (style('showTooltips'))
                addTooltipToPoint(svg, bar, barData[j][1], attributes);
        }
    }

    return [xAxis, yAxis];
}

function addLineToGraph(svg, data, axes, attributes) {
    var dataLocations = computeDataLocations(data, axes[0], axes[1]);
    var points = drawLinePath(svg, dataLocations, attributes);
    return points;
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

    var points = [];
    if (drawPoints) {
        for (var i = 0; i < data.length; i++) {
            var point = drawPoint(svg, data[i][0], data[i][1], attributes);
            points.push(point);
        }
    }
    return points;
}

// draws a point at (x, y)
function drawPoint(svg, x, y, attributes) {
    var radius = get(attributes, 'pointRadius', style('pointRadius'));
    var innerRadius = get(attributes, 'innerPointRadius', style('innerPointRadius'));
    var color = get(attributes, 'pointColor', style('pointColor'));
    var tooltipContents = get(attributes, 'tooltipContents', null);

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
            .attr('fill', style('white'))
            .style('pointer-events', 'none');
    }

    // take care of tooltip
    if (tooltipContents != null)
        addTooltipToPoint(svg, point, tooltipContents, attributes);
    return point;
}

function createTooltip(svg, x, y, width, html, attributes) {
    var color = get(attributes, 'tooltipColor', style('tooltipColor'));
    var talign = get(attributes, 'tooltipAlign', style('tooltipAlign'));

    // determines if should erase all previous tooltips
    var shouldEraseTooltip = get(attributes, 'eraseTooltip', true);

    // should adjust for edge of screen
    var realign = get(attributes, 'realignTooltip', true);
    
    // compute if should go right or left
    var toRight = x < (pxtonum(svg.style('width')) / 2);

    // make sure that tooltip faces the inside of svg
    if (!toRight && realign)
        x -= width;

    if (shouldEraseTooltip)
        eraseTooltip(svg);
    var fo = svg.append('foreignObject')
        .attr('x', x)
        .attr('y', y)
        .attr('class', 'byd3-tooltip')
        .attr('width', width);
    fo.append('xhtml:div')
        .style('border-radius', px(style('tooltipBorderRadius')))
        .style('padding', px(style('tooltipPadding')))
        .style('text-align', talign)
        .style('width', width)
        .style('font-family', style('tooltipFont'))
        .style('background-color', color)
        .html(html);
}

function eraseTooltip(svg) {
    svg.selectAll('.byd3-tooltip').remove();
}

// adds listener on point to create tooltip when hovered
function addTooltipToPoint(svg, point, contents, attributes) {

    function createTooltipAtCursor() {
        var x = d3.mouse(svg.node())[0];
        var y = d3.mouse(svg.node())[1];
        var tt = createTooltip(svg, x, y, style('tooltipWidth'), contents, attributes);
    }
    point.on('mouseover', createTooltipAtCursor)
        .on('mousemove', createTooltipAtCursor)
        .on('click', createTooltipAtCursor)
        .on('mouseout', function() {
            eraseTooltip(svg);
        });
}

function addTooltipsToPoints(svg, points, data, attributes) {
    var tooltipFunction = get(attributes, 'tooltipFunction', null);
    var xLabel = get(attributes, 'x-label', null);
    var yLabel = get(attributes, 'y-label', null);
    for (var i = 0; i < points.length; i++) {
    
        var content; // contents of the tooltip
        if (tooltipFunction !== null) // custom function for computing inside
            content = tooltipFunction(data[i]);
        else { // compute tooltip contents just by default
            var content = '';
            if (!xLabel && !yLabel)
                content += '(' + data[i][0] + ', ' + data[i][1] + ')';
            if (xLabel)
                content += xLabel + ': ' + data[i][0];
            if (xLabel && yLabel)
                content += '<br/>';
            if (yLabel)
                content += yLabel + ': ' + data[i][1];
        }
        addTooltipToPoint(svg, points[i], content, attributes);
    }
}

/****************************
  * Infographic Helper Functions 
  ***************************/

function addHeadline(identifier, width, text) {
    var headline = d3.select(identifier).append('div')
        .attr('class', 'infographic-headline')
        .style('width', px(width))
        .style('padding', px(style('headlinePadding')))
        .style('text-align', 'center')
        .style('font-size', px(style('headlineFontSize')))
        .style('font-family', style('headlineFont'))
        .text(text);
    return headline;
}

/****************************
  * Other Graphics Features
  ***************************/

// draws person with head beginning at (x, y)
function drawPerson(svg, x, y, height, attributes) {
    var color = get(attributes, 'personColor', style('personColor'));
    var padding = 0.05 * height;
    var headSize = (2/7) * (height - padding);
    var bodySize = height - padding - headSize;
    var distToBody = (headSize / 2) + padding + (bodySize / 2);

    x += headSize / 2;
    y += headSize / 2;

    var head = svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', headSize / 2)
        .attr('distToBody', distToBody)
        .attr('headSize', headSize)
        .style('fill', color);

    var body = svg.append('ellipse')
        .attr('cx', x)
        .attr('cy', y + distToBody)
        .attr('rx', 1.1 * (headSize / 2))
        .attr('ry', bodySize / 2)
        .style('fill', color);

    return [head, body];
}

function movePerson(svg, person, x, y, duration, attributes) {
    var color = get(attributes, 'personColor', person[0].attr('fill'));
    var delay = get(attributes, 'delay', 0);
    
    var headSize = parseFloat(person[0].attr('headSize'));

    // move the head
    person[0].transition()
        .duration(duration)
        .delay(delay)
        .ease(d3.easeLinear)
        .attr('cx', x + headSize / 2)
        .attr('cy', y + headSize / 2)
        .style('fill', color);

    // move the body
    person[1].transition()
        .duration(duration)
        .delay(delay)
        .ease(d3.easeLinear)
        .attr('cx', x + headSize / 2)
        .attr('cy', y + headSize / 2 + parseFloat(person[0].attr('distToBody')))
        .style('fill', color);
}

// creates a person cluster graph of moving people
// takes in the selector for a <select> dropdown whose values are the names of categories
// also takes in data, which should be in the format:
//  data is an array of dictionaries, each dictionary representing a category (page)
//  each category dictionary as a 'name', which defines its category
//  each category dictionary also has 'data', which is a list of dictionaries,
//      each defining a group (grouping on same page).
//      each group has a label 'name', 'location' [x,y] of the label
//      'pctLocation' [x,y] of the percent, 'color' for the grouping,
//      'value' for the number of people, 'gridLoc' [x, y] for the origin of the grid of people,
//      'gridRows' and 'gridCols' to define the dimensions of the grid
// numPeople defines the number of people to draw
// width and height define the canvas size
function createPersonClusterGraph(selector, svg, data, numPeople, width, height, attributes) {
    var randomizePersonShuffle = get(attributes, 'randomizePersonShuffle', true);
    
    var personHeight = width / 15;
    var personWidth = Math.ceil(personHeight / 3);
    var personPadding = height / 120;

    var people = [];
    var labels = []; // visible, but disappear on transition
    // draw all the data of screen  
    for (var i = 0; i < numPeople; i++) {
        var person = drawPerson(svg, - (2 * personWidth), - (2 * personHeight), personHeight, {});
        people.push(person);
    }

    d3.select(selector).on('change', function() {
        var selection = d3.select(selector).node().value;
        transitionTo(selection);
    });

    function transitionTo(selection) {

        // remove labels if there are any
        for (var i = 0; i < labels.length; i++) {
            labels[i].remove();
        }
        labels = [];
    
        if (randomizePersonShuffle)
            people = shuffle(people);
        var personIndex = 0; // number of people already sorted

        // find index of selection
        var index = null;
        for (var i = 0; i < data.length; i++) {
            if (data[i]["name"] == selection) {
                index = i;
                break;
            }
        }
        
        // go through that selection's data
        var selectionData = data[index]['data']
        for (var i = 0; i < selectionData.length; i++) {
            var x = selectionData[i]['gridLoc'][0] * width;
            var y = selectionData[i]['gridLoc'][1] * height;

            // move all of the people into place
            for (var j = 0; j < selectionData[i]['gridRows']; j++) {
                for (var k = 0; k < selectionData[i]['gridCols']; k++) {
                    if (j * selectionData[i]['gridCols'] + k >= selectionData[i]['value']) {
                        // exit the loop if we've moved too many people
                        break;
                    }
                    
                    movePerson(svg, people[personIndex], x, y, 1000, 
                            {"personColor": selectionData[i]['color']});
                    personIndex++;
                    x += personWidth;
                }
                x = selectionData[i]['gridLoc'][0] * width;
                y += personHeight + personPadding;
            }

            // print the text
            var labelScale = d3.scaleLinear().domain([200, 700]).range([12, 24]);
            if (selectionData[i]['location'].length !== 0) {
                var name = svg.append('text')
                    .attr('x', selectionData[i]['location'][0] * width)
                    .attr('y', selectionData[i]['location'][1] * height)
                    .style('font-family', style('textFontSans'))
                    .style('font-size', labelScale(width))
                    .style('fill', selectionData[i]['color'])
                    .style('opacity', 0)
                    .text(selectionData[i]['name']);
                labels.push(name);
                name.transition()
                    .duration(1000)
                    .style('opacity', 1);
            }

            // show the percentage
            var pctScale = d3.scaleLinear().domain([200, 700]).range([24, 60])
            if (selectionData[i]['pctLoc'].length !== 0) {
                var percent = svg.append('text')
                    .attr('x', selectionData[i]['pctLoc'][0] * width)
                    .attr('y', selectionData[i]['pctLoc'][1] * height)
                    .style('font-family', style('textFontSans'))
                    .style('font-size', pctScale(width))
                    .style('fill', selectionData[i]['color'])
                    .style('opacity', 0)
                    .text(selectionData[i]['value'] + '%');
                labels.push(percent);
                percent.transition()
                    .duration(1000)
                    .style('opacity', 1);
            }
        }

        while (personIndex < numPeople) {
            movePerson(svg, people[personIndex],
                    -(2 * personWidth), -(2 * personHeight), 1000,
                    {'personColor': '#ffffff'});
            personIndex++;
        }


    }
    transitionTo(data[0]["name"]);
};


/****************************
  * Other Graphics
  ***************************/

// creates a rating chart
// selector is the name of the select dropdown
// data is an array of dictionaries, each being a selected category
//  each category has a 'name' which is the value of the selector
//  each category also has data, an array of dictionaries
//      each dictionary has a 'name', 'color', and 'value' (0-100)
function createRatingChart(selector, svg, data, width, height) {

    var padding = style('padding');
    var x = padding;
    var y = padding;
    var barWidth = width - 2 * padding;
    var barHeight = height - 2 * padding;
    
    var initialData = data[0]['data'];
    var bars = [];
    for (var i = 0; i < initialData.length; i++) {
        var bar = svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 0)
            .attr('height', 0);
        bars.push(bar);
    }

    var transitionTime = 0;

    function transitionTo(selection) {

        // get the selected choice
        var index = null;
        for (var i = 0; i < data.length; i++) {
            if (data[i]['name'] == selection) {
                index = i;
                break;
            }
        }

        var dist = 0;
        var selectedData = data[i]['data'];

        // compute the total value
        var total = 0;
        for (var i = 0; i < selectedData.length; i++)
            total += selectedData[i]['value'];

        // draw the bars
        for (var i = 0; i < selectedData.length; i++) {
            var thisWidth = (selectedData[i]['value'] / total) * barWidth;
            bars[i].transition()
                .duration(transitionTime)
                .attr('x', x + dist)
                .attr('y', y)
                .attr('data-name', selectedData[i]['name'])
                .attr('data-value', selectedData[i]['value'])
                .attr('width', thisWidth)
                .attr('height', barHeight)
                .attr('fill', selectedData[i]['color'])
                .on('end', function() {
                    var tooltipContents = d3.select(this).attr('data-name')
                        + '<br/>' + d3.select(this).attr('data-value') + '%';
                    
                    if (d3.select(this).attr('data-name').length > 0)
                        createTooltip(svg,
                                parseFloat(d3.select(this).attr('x')) + 
                                    d3.select(this).attr('width') / 4,
                                parseFloat(d3.select(this).attr('y')) + barHeight / 4,
                                parseFloat(d3.select(this).attr('width')) / 2,
                                tooltipContents,
                                {"eraseTooltip": false, "realignTooltip": false,
                                "tooltipDisplayDelay": transitionTime});

                });

            dist += thisWidth;
        }
    }

    transitionTo(data[0]['name']);
    
    // update when something is selected
    d3.select(selector).on('change', function() {
        eraseTooltip(svg);
        var selection = d3.select(selector).node().value;
        transitionTo(selection);
    });

    transitionTime = 1000;
}

function createDonut(svg, x, y, r, pct, attributes) {
    var color = get(attributes, 'donutColor', style('donutColor'));
    var size = get(attributes, 'donutSize', 0.4); // percent of radius to show

    // define the arcs for the circle and the arc
    var innerRadius = (1 - size) * r;
    var circle = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(r)
        .startAngle(0)
        .endAngle(2 * Math.PI);

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(r)
        .startAngle(0);

    // let text size be half of the inner radius
    var textSize = (2/3) * innerRadius;

    // draw the paths
    var circlePath = svg.append('path')
        .attr('d', circle)
        .attr('transform', translateBy(x, y))
        .style('fill', style('donutBgColor'));

    var arcPath = svg.append('path')
        .datum({'endAngle': (pct / 100) * (2 * Math.PI)})
        .attr('d', arc)
        .attr('data-r', r)
        .attr('data-size', size)
        .attr('transform', translateBy(x, y))
        .style('fill', color);

    var headline = svg.append('text')
        .attr('x', x)
        .attr('y', y + textSize / 2 - 5)
        .style('font-family', style('donutFont'))
        .style('font-size', textSize)
        .style('text-anchor', 'middle')
        .style('fill', '#000000')
        .text(pct + '%');

    return [circlePath, arcPath, headline];
}

function donutChangeData(svg, donut, pct, attributes) {
    var duration = get(attributes, 'donutChangeDuration', style('transitionTime'));
    var arcPath = donut[1];
    var headline = donut[2];
    var r = parseFloat(arcPath.attr('data-r'));
    var size = parseFloat(arcPath.attr('data-size'));

    var arc = d3.arc()
        .innerRadius((1 - size) * r)
        .outerRadius(r)
        .startAngle(0);
    
    // computes transition angles during the movement
    // adapted from http://bl.ocks.org/mbostock/5100636
    function arcTween(newAngle) {
        return function(d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function(t) {
                d.endAngle = interpolate(t);
                return arc(d);
            }
        }
    }

    arcPath.transition()
        .duration(duration)
        .attrTween('d', arcTween((pct / 100) * (2 * Math.PI)),
                (1 - size) * r, r);

    headline.transition()
        .duration(duration)
        .text(pct + '%');
}

function createDynamicDonut(selector, svg, data, width, attributes) {
    var padding = style('padding');
    var radius = (width / 2) - padding;
    var cx = padding + radius;
    var cy = padding + radius;
    
    // draw the donut graph
    var donut = createDonut(svg, cx, cy, radius, 0, attributes);

    function transitionTo(selection) {
        index = null;
        for (var i = 0; i < data.length; i++) {
            if (data[i]['name'] == selection) {
                index = i;
                break;
            }
        }
        donutChangeData(svg, donut, data[index]['value'], attributes);
    }
    
    // allow multiple donuts to bind to the same selector
    var eventName = 'eventName' in attributes ? 'change.' + attributes['eventName'] : 'change';
    d3.select(selector).on(eventName, function() {
        var selection = d3.select(selector).node().value;
        transitionTo(selection);
    });

    transitionTo(data[0]["name"]);
    return donut;
}

/****************************
  * Stylesheet
  ***************************/

// default stylesheet for byd3
var stylesheet = {}

// spacing
stylesheet['padding'] = 10;
stylesheet['headlinePadding'] = 10;
stylesheet['tooltipPadding'] = 5;
stylesheet['multiBarPadding'] = 0.2;

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
stylesheet['tooltipBorderRadius'] = 4;
stylesheet['tooltipWidth'] = 100;

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
stylesheet['tooltipFont'] = stylesheet['lato'];
stylesheet['donutFont'] = stylesheet['lato'];

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
stylesheet['grey2'] = '#c0c0c0';

// color choices
stylesheet['lineColor'] = stylesheet['black'];
stylesheet['axisColor'] = stylesheet['black'];
stylesheet['barColor'] = stylesheet['red'];
stylesheet['pointColor'] = stylesheet['black'];
stylesheet['gridlineColor'] = stylesheet['grey1'];
stylesheet['tooltipColor'] = stylesheet['grey2'];
stylesheet['personColor'] = stylesheet['red'];
stylesheet['donutColor'] = stylesheet['red'];
stylesheet['donutBgColor'] = stylesheet['grey1'];

// other configuration settings
stylesheet['lineGraphDrawPoints'] = true;
stylesheet['pointsHollowCenter'] = false; // give line graph points hollow middle
stylesheet['lineGraphGridlinesY'] = true;
stylesheet['lineGraphGridlinesX'] = false;
stylesheet['barGraphGridlines'] = true;
stylesheet['tooltipAlign'] = 'center';
stylesheet['showTooltips'] = true;
stylesheet['transitionTime'] = 1000;

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

// shuffles an array
// source: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function max(x, y) {
    return (x > y) ? x : y;
}

function min(x, y) {
    return (x < y) ? x : y;
}

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

function pxtonum(x) {
    return parseInt(x.substring(0, x.length - 2));
}

function translateBy(x, y) {
    return 'translate(' + x + ',' + y + ')';
}

// line function
var line = d3.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; });

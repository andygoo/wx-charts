import { getPieDataPoints, calYAxisData, getXAxisPoints, getDataPoints, fixColumeData } from './charts-data'
import { mesureText } from './charts-util'
import Util from '../util/util'
import drawPointShape from './draw-data-shape'
import drawPointText from './draw-data-text'

function drawYAxisTitle (title, opts, config, context) {
    let startX = config.xAxisHeight + (opts.height - config.xAxisHeight - mesureText(title)) / 2;
    context.save();
    context.beginPath();
    context.setFontSize(20);
    context.setFillStyle('#333333');
    context.translate(0, opts.height);
    context.rotate(-90 * Math.PI / 180);
    context.fillText(title, startX, 35);
    context.stroke();
    context.closePath();
    context.restore();
}

export function drawColumnDataPoints (series, opts, config, context, process = 1) {
    let { ranges } = calYAxisData(series, opts, config);
    let { xAxisPoints, eachSpacing } = getXAxisPoints(opts.categories, opts, config);
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;

    series.forEach(function(eachSeries, seriesIndex) {
        let data = eachSeries.data;
        let points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config);

        // 绘制柱状数据图
        context.beginPath();
        context.setFillStyle(eachSeries.color);
        points.forEach(function(item, index) {
            let startX = item.x - item.width / 2 + 1;
            let height = opts.height - item.y - config.padding - config.xAxisHeight - config.legendHeight;
            context.moveTo(startX, item.y);
            context.rect(startX, item.y, item.width - 2, height);
        });
        context.closePath();
        context.fill();
    });
    series.forEach(function(eachSeries, seriesIndex) {
        let data = eachSeries.data;
        let points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
        points = fixColumeData(points, eachSpacing, series.length, seriesIndex, config);
        if (opts.dataLabel !== false && process === 1) {
            drawPointText(points, eachSeries, config, context);
        }
    });
}

export function drawAreaDataPoints (series, opts, config, context, process = 1) {
    let { ranges } = calYAxisData(series, opts, config);
    let { xAxisPoints, eachSpacing } = getXAxisPoints(opts.categories, opts, config);
    let minRange = ranges.pop();
    let maxRange = ranges.shift();
    let endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;

    series.forEach(function(eachSeries, seriesIndex) {
        let data = eachSeries.data;
        let points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);

        // 绘制区域数据
        let firstPoint = points[0];
        let lastPoint = points[points.length - 1];
        context.beginPath();
        context.setStrokeStyle(eachSeries.color);
        context.setFillStyle(eachSeries.color);
        context.setGlobalAlpha(0.6);
        context.setLineWidth(4);
        context.moveTo(firstPoint.x, firstPoint.y);
        points.forEach(function(item, index) {
            if (index > 0) {
                context.lineTo(item.x, item.y);
            }
        });

        context.lineTo(lastPoint.x, endY);
        context.lineTo(firstPoint.x, endY);
        context.lineTo(firstPoint.x, firstPoint.y);
        context.closePath();
        context.fill();
        context.setGlobalAlpha(1);

        let shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
        drawPointShape(points, eachSeries.color, shape, context);
    });
    if (opts.dataLabel !== false && process === 1) {
        series.forEach(function(eachSeries, seriesIndex) {
            let data = eachSeries.data;
            let points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
            drawPointText(points, eachSeries, config, context);
        });
    }
}

export function drawLineDataPoints (series, opts, config, context, process = 1) {
    let { ranges } = calYAxisData(series, opts, config);
    let { xAxisPoints, eachSpacing } = getXAxisPoints(opts.categories, opts, config);
    let minRange = ranges.pop();
    let maxRange = ranges.shift();

    series.forEach(function(eachSeries, seriesIndex) {
        let data = eachSeries.data;
        let points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);

        // 绘制数据线
        context.beginPath();
        context.setStrokeStyle(eachSeries.color);
        context.setLineWidth(4);
        context.moveTo(points[0].x, points[0].y);
        points.forEach(function(item, index) {
            if (index > 0) {
                context.lineTo(item.x, item.y);
            }
        });
        context.moveTo(points[0].x, points[0].y);
        context.closePath();
        context.stroke();

        let shape = config.dataPointShape[seriesIndex % config.dataPointShape.length];
        drawPointShape(points, eachSeries.color, shape, context);
    });
    if (opts.dataLabel !== false && process === 1) {
        series.forEach(function(eachSeries, seriesIndex) {
            let data = eachSeries.data;
            let points = getDataPoints(data, minRange, maxRange, xAxisPoints, eachSpacing, opts, config, process);
            drawPointText(points, eachSeries, config, context);
        });
    }
}

export function drawXAxis (categories, opts, config, context) {
    let { xAxisPoints, startX, endX, eachSpacing } = getXAxisPoints(categories, opts, config);
    let startY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;
    let endY = opts.height - config.padding - config.legendHeight;

    context.beginPath();
    context.setStrokeStyle("#cccccc")
    context.setLineWidth(1);
    context.moveTo(startX, startY);
    context.lineTo(endX, startY);
    xAxisPoints.forEach(function(item, index) {
        context.moveTo(item, startY);
        context.lineTo(item, endY);
    });
    context.closePath();
    context.stroke();

    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle('#666666');
    categories.forEach(function(item, index) {
        let offset = eachSpacing / 2 - mesureText(item) / 2;
        context.fillText(item, xAxisPoints[index] + offset, startY + 28);
    });
    context.closePath();
    context.stroke();
}

export function drawYAxis (series, opts, config, context) {
    let { rangesFormat } = calYAxisData(series, opts, config);

    let yAxisTotleWidth = config.yAxisWidth + config.yAxisTitleWidth;

    let spacingValid = opts.height - 2 * config.padding - config.xAxisHeight - config.legendHeight;
    let eachSpacing = Math.floor(spacingValid / config.yAxisSplit);
    let startX = config.padding + yAxisTotleWidth;
    let endX = opts.width - config.padding;
    let startY = config.padding;
    let endY = opts.height - config.padding - config.xAxisHeight - config.legendHeight;

    let points = [];
    for (let i = 0; i < config.yAxisSplit; i++) {
        points.push(config.padding + eachSpacing * i);
    }

    context.beginPath();
    context.setStrokeStyle("#cccccc")
    context.setLineWidth(1);
    points.forEach(function(item, index) {
        context.moveTo(startX, item);
        context.lineTo(endX, item);
    });
    context.closePath();
    context.stroke();
    context.beginPath();
    context.setFontSize(config.fontSize);
    context.setFillStyle('#666666')
    rangesFormat.forEach(function(item, index) {
        let pos = points[index] ? points[index] : endY;
        context.fillText(item, config.padding + config.yAxisTitleWidth, pos + 10);
    });
    context.closePath();
    context.stroke();

    if (opts.yAxis.title) {  
        drawYAxisTitle(opts.yAxis.title, opts, config, context);
    }
}

export function drawLegend (series, opts, config, context) {
    if (!opts.legend) {
        return;
    }
    let padding = 10;
    let width = 0;
    series.forEach(function (item) {
        item.name = item.name || 'undefined';
        width += 2 * padding + mesureText(item.name) + 45;
    });
    let startX = (opts.width - width) / 2 + padding;
    let startY = opts.height - config.legendHeight - 5;
    
    context.setFontSize(config.fontSize);
    series.forEach(function (item) {
        context.moveTo(startX, startY);
        context.beginPath();
        context.setFillStyle(item.color);
        context.rect(startX, startY, 30, 20);
        context.closePath();
        context.fill();
        startX += padding + 30;
        context.beginPath();
        context.setFillStyle('#333333');
        context.fillText(item.name, startX, startY + 18);
        context.closePath();
        context.stroke();
        startX += mesureText(item.name) + padding + 15; 
    });
}
export function drawPieDataPoints (series, opts, config, context, process = 1) {
    series = getPieDataPoints(series, process);
    let centerPosition = {
        x: opts.width / 2,
        y: (opts.height - 2 * config.padding - config.legendHeight) / 2 
    }
    let radius = Math.min(centerPosition.x - config.padding, centerPosition.y);
    context.setStrokeStyle('#ffffff');
    context.setLineWidth(2)
    series.forEach(function(eachSeries) {
        context.beginPath();
        context.setFillStyle(eachSeries.color);
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, radius, eachSeries._start_, 2 * eachSeries._proportion_ * Math.PI);
        context.closePath();
        context.fill();

        context.beginPath();
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, radius, eachSeries._start_, 0);
        context.lineTo(centerPosition.x, centerPosition.y);
        context.stroke();
        context.closePath();
        context.stroke();
        context.beginPath();
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, radius, eachSeries._start_ + 2 * eachSeries._proportion_ * Math.PI, 0);
        context.moveTo(centerPosition.x, centerPosition.y);
        context.stroke();
        context.closePath();
    });

    if (opts.type === 'ring') {
        context.beginPath();
        context.setFillStyle('#ffffff');
        context.moveTo(centerPosition.x, centerPosition.y);
        context.arc(centerPosition.x, centerPosition.y, radius * 0.6, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
    }
}

export function drawCanvas (opts, context) {
    wx.drawCanvas({
        canvasId: opts.canvasId,
        actions: context.getActions()
    });
}
/*
 * Vue Chartkick
 * Create beautiful JavaScript charts with one line of Vue
 * https://github.com/ankane/vue-chartkick
 * v0.6.1
 * MIT License
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.VueChartkick = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var chartkick = createCommonjsModule(function (module, exports) {
	/*!
	 * Chartkick.js
	 * Create beautiful charts with one line of JavaScript
	 * https://github.com/ankane/chartkick.js
	 * v4.2.0
	 * MIT License
	 */

	(function (global, factory) {
	   module.exports = factory() ;
	})(commonjsGlobal, (function () {
	  function isArray(variable) {
	    return Object.prototype.toString.call(variable) === "[object Array]";
	  }

	  function isFunction(variable) {
	    return variable instanceof Function;
	  }

	  function isPlainObject(variable) {
	    // protect against prototype pollution, defense 2
	    return Object.prototype.toString.call(variable) === "[object Object]" && !isFunction(variable) && variable instanceof Object;
	  }

	  // https://github.com/madrobby/zepto/blob/master/src/zepto.js
	  function extend(target, source) {
	    var key;
	    for (key in source) {
	      // protect against prototype pollution, defense 1
	      if (key === "__proto__") { continue; }

	      if (isPlainObject(source[key]) || isArray(source[key])) {
	        if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
	          target[key] = {};
	        }
	        if (isArray(source[key]) && !isArray(target[key])) {
	          target[key] = [];
	        }
	        extend(target[key], source[key]);
	      } else if (source[key] !== undefined) {
	        target[key] = source[key];
	      }
	    }
	  }

	  function merge(obj1, obj2) {
	    var target = {};
	    extend(target, obj1);
	    extend(target, obj2);
	    return target;
	  }

	  var DATE_PATTERN = /^(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)$/i;

	  function negativeValues(series) {
	    var i, j, data;
	    for (i = 0; i < series.length; i++) {
	      data = series[i].data;
	      for (j = 0; j < data.length; j++) {
	        if (data[j][1] < 0) {
	          return true;
	        }
	      }
	    }
	    return false;
	  }

	  function toStr(n) {
	    return "" + n;
	  }

	  function toFloat(n) {
	    return parseFloat(n);
	  }

	  function toDate(n) {
	    var matches, year, month, day;
	    if (typeof n !== "object") {
	      if (typeof n === "number") {
	        n = new Date(n * 1000); // ms
	      } else {
	        n = toStr(n);
	        if ((matches = n.match(DATE_PATTERN))) {
	          year = parseInt(matches[1], 10);
	          month = parseInt(matches[3], 10) - 1;
	          day = parseInt(matches[5], 10);
	          return new Date(year, month, day);
	        } else {
	          // try our best to get the str into iso8601
	          // TODO be smarter about this
	          var str = n.replace(/ /, "T").replace(" ", "").replace("UTC", "Z");
	          // Date.parse returns milliseconds if valid and NaN if invalid
	          n = new Date(Date.parse(str) || n);
	        }
	      }
	    }
	    return n;
	  }

	  function toArr(n) {
	    if (!isArray(n)) {
	      var arr = [], i;
	      for (i in n) {
	        if (n.hasOwnProperty(i)) {
	          arr.push([i, n[i]]);
	        }
	      }
	      n = arr;
	    }
	    return n;
	  }

	  function jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle) {
	    return function (chart, opts, chartOptions) {
	      var series = chart.data;
	      var options = merge({}, defaultOptions);
	      options = merge(options, chartOptions || {});

	      if (chart.singleSeriesFormat || "legend" in opts) {
	        hideLegend(options, opts.legend, chart.singleSeriesFormat);
	      }

	      if (opts.title) {
	        setTitle(options, opts.title);
	      }

	      // min
	      if ("min" in opts) {
	        setMin(options, opts.min);
	      } else if (!negativeValues(series)) {
	        setMin(options, 0);
	      }

	      // max
	      if (opts.max) {
	        setMax(options, opts.max);
	      }

	      if ("stacked" in opts) {
	        setStacked(options, opts.stacked);
	      }

	      if (opts.colors) {
	        options.colors = opts.colors;
	      }

	      if (opts.xtitle) {
	        setXtitle(options, opts.xtitle);
	      }

	      if (opts.ytitle) {
	        setYtitle(options, opts.ytitle);
	      }

	      // merge library last
	      options = merge(options, opts.library || {});

	      return options;
	    };
	  }

	  function sortByTime(a, b) {
	    return a[0].getTime() - b[0].getTime();
	  }

	  function sortByNumberSeries(a, b) {
	    return a[0] - b[0];
	  }

	  function sortByNumber(a, b) {
	    return a - b;
	  }

	  function isMinute(d) {
	    return d.getMilliseconds() === 0 && d.getSeconds() === 0;
	  }

	  function isHour(d) {
	    return isMinute(d) && d.getMinutes() === 0;
	  }

	  function isDay(d) {
	    return isHour(d) && d.getHours() === 0;
	  }

	  function isWeek(d, dayOfWeek) {
	    return isDay(d) && d.getDay() === dayOfWeek;
	  }

	  function isMonth(d) {
	    return isDay(d) && d.getDate() === 1;
	  }

	  function isYear(d) {
	    return isMonth(d) && d.getMonth() === 0;
	  }

	  function isDate(obj) {
	    return !isNaN(toDate(obj)) && toStr(obj).length >= 6;
	  }

	  function isNumber(obj) {
	    return typeof obj === "number";
	  }

	  var byteSuffixes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB"];

	  function formatValue(pre, value, options, axis) {
	    pre = pre || "";
	    if (options.prefix) {
	      if (value < 0) {
	        value = value * -1;
	        pre += "-";
	      }
	      pre += options.prefix;
	    }

	    var suffix = options.suffix || "";
	    var precision = options.precision;
	    var round = options.round;

	    if (options.byteScale) {
	      var suffixIdx;
	      var baseValue = axis ? options.byteScale : value;

	      if (baseValue >= 1152921504606846976) {
	        value /= 1152921504606846976;
	        suffixIdx = 6;
	      } else if (baseValue >= 1125899906842624) {
	        value /= 1125899906842624;
	        suffixIdx = 5;
	      } else if (baseValue >= 1099511627776) {
	        value /= 1099511627776;
	        suffixIdx = 4;
	      } else if (baseValue >= 1073741824) {
	        value /= 1073741824;
	        suffixIdx = 3;
	      } else if (baseValue >= 1048576) {
	        value /= 1048576;
	        suffixIdx = 2;
	      } else if (baseValue >= 1024) {
	        value /= 1024;
	        suffixIdx = 1;
	      } else {
	        suffixIdx = 0;
	      }

	      // TODO handle manual precision case
	      if (precision === undefined && round === undefined) {
	        if (value >= 1023.5) {
	          if (suffixIdx < byteSuffixes.length - 1) {
	            value = 1.0;
	            suffixIdx += 1;
	          }
	        }
	        precision = value >= 1000 ? 4 : 3;
	      }
	      suffix = " " + byteSuffixes[suffixIdx];
	    }

	    if (precision !== undefined && round !== undefined) {
	      throw Error("Use either round or precision, not both");
	    }

	    if (!axis) {
	      if (precision !== undefined) {
	        value = value.toPrecision(precision);
	        if (!options.zeros) {
	          value = parseFloat(value);
	        }
	      }

	      if (round !== undefined) {
	        if (round < 0) {
	          var num = Math.pow(10, -1 * round);
	          value = parseInt((1.0 * value / num).toFixed(0)) * num;
	        } else {
	          value = value.toFixed(round);
	          if (!options.zeros) {
	            value = parseFloat(value);
	          }
	        }
	      }
	    }

	    if (options.thousands || options.decimal) {
	      value = toStr(value);
	      var parts = value.split(".");
	      value = parts[0];
	      if (options.thousands) {
	        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousands);
	      }
	      if (parts.length > 1) {
	        value += (options.decimal || ".") + parts[1];
	      }
	    }

	    return pre + value + suffix;
	  }

	  function seriesOption(chart, series, option) {
	    if (option in series) {
	      return series[option];
	    } else if (option in chart.options) {
	      return chart.options[option];
	    }
	    return null;
	  }

	  function allZeros(data) {
	    var i, j, d;
	    for (i = 0; i < data.length; i++) {
	      d = data[i].data;
	      for (j = 0; j < d.length; j++) {
	        if (d[j][1] != 0) {
	          return false;
	        }
	      }
	    }
	    return true;
	  }

	  var baseOptions = {
	    maintainAspectRatio: false,
	    animation: false,
	    plugins: {
	      legend: {},
	      tooltip: {
	        displayColors: false,
	        callbacks: {}
	      },
	      title: {
	        font: {
	          size: 20
	        },
	        color: "#333"
	      }
	    },
	    interaction: {}
	  };

	  var defaultOptions$2 = {
	    scales: {
	      y: {
	        ticks: {
	          maxTicksLimit: 4
	        },
	        title: {
	          font: {
	            size: 16
	          },
	          color: "#333"
	        },
	        grid: {}
	      },
	      x: {
	        grid: {
	          drawOnChartArea: false
	        },
	        title: {
	          font: {
	            size: 16
	          },
	          color: "#333"
	        },
	        time: {},
	        ticks: {}
	      }
	    }
	  };

	  // http://there4.io/2012/05/02/google-chart-color-list/
	  var defaultColors = [
	    "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6",
	    "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11",
	    "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#651067"
	  ];

	  var hideLegend$2 = function (options, legend, hideLegend) {
	    if (legend !== undefined) {
	      options.plugins.legend.display = !!legend;
	      if (legend && legend !== true) {
	        options.plugins.legend.position = legend;
	      }
	    } else if (hideLegend) {
	      options.plugins.legend.display = false;
	    }
	  };

	  var setTitle$2 = function (options, title) {
	    options.plugins.title.display = true;
	    options.plugins.title.text = title;
	  };

	  var setMin$2 = function (options, min) {
	    if (min !== null) {
	      options.scales.y.min = toFloat(min);
	    }
	  };

	  var setMax$2 = function (options, max) {
	    options.scales.y.max = toFloat(max);
	  };

	  var setBarMin$1 = function (options, min) {
	    if (min !== null) {
	      options.scales.x.min = toFloat(min);
	    }
	  };

	  var setBarMax$1 = function (options, max) {
	    options.scales.x.max = toFloat(max);
	  };

	  var setStacked$2 = function (options, stacked) {
	    options.scales.x.stacked = !!stacked;
	    options.scales.y.stacked = !!stacked;
	  };

	  var setXtitle$2 = function (options, title) {
	    options.scales.x.title.display = true;
	    options.scales.x.title.text = title;
	  };

	  var setYtitle$2 = function (options, title) {
	    options.scales.y.title.display = true;
	    options.scales.y.title.text = title;
	  };

	  // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	  var addOpacity = function (hex, opacity) {
	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? "rgba(" + parseInt(result[1], 16) + ", " + parseInt(result[2], 16) + ", " + parseInt(result[3], 16) + ", " + opacity + ")" : hex;
	  };

	  // check if not null or undefined
	  // https://stackoverflow.com/a/27757708/1177228
	  var notnull = function (x) {
	    return x != null;
	  };

	  var setLabelSize = function (chart, data, options) {
	    var maxLabelSize = Math.ceil(chart.element.offsetWidth / 4.0 / data.labels.length);
	    if (maxLabelSize > 25) {
	      maxLabelSize = 25;
	    } else if (maxLabelSize < 10) {
	      maxLabelSize = 10;
	    }
	    if (!options.scales.x.ticks.callback) {
	      options.scales.x.ticks.callback = function (value) {
	        value = toStr(this.getLabelForValue(value));
	        if (value.length > maxLabelSize) {
	          return value.substring(0, maxLabelSize - 2) + "...";
	        } else {
	          return value;
	        }
	      };
	    }
	  };

	  var setFormatOptions$1 = function (chart, options, chartType) {
	    var formatOptions = {
	      prefix: chart.options.prefix,
	      suffix: chart.options.suffix,
	      thousands: chart.options.thousands,
	      decimal: chart.options.decimal,
	      precision: chart.options.precision,
	      round: chart.options.round,
	      zeros: chart.options.zeros
	    };

	    if (chart.options.bytes) {
	      var series = chart.data;
	      if (chartType === "pie") {
	        series = [{data: series}];
	      }

	      // calculate max
	      var max = 0;
	      for (var i = 0; i < series.length; i++) {
	        var s = series[i];
	        for (var j = 0; j < s.data.length; j++) {
	          if (s.data[j][1] > max) {
	            max = s.data[j][1];
	          }
	        }
	      }

	      // calculate scale
	      var scale = 1;
	      while (max >= 1024) {
	        scale *= 1024;
	        max /= 1024;
	      }

	      // set step size
	      formatOptions.byteScale = scale;
	    }

	    if (chartType !== "pie") {
	      var axis = options.scales.y;
	      if (chartType === "bar") {
	        axis = options.scales.x;
	      }

	      if (formatOptions.byteScale) {
	        if (!axis.ticks.stepSize) {
	          axis.ticks.stepSize = formatOptions.byteScale / 2;
	        }
	        if (!axis.ticks.maxTicksLimit) {
	          axis.ticks.maxTicksLimit = 4;
	        }
	      }

	      if (!axis.ticks.callback) {
	        axis.ticks.callback = function (value) {
	          return formatValue("", value, formatOptions, true);
	        };
	      }
	    }

	    if (!options.plugins.tooltip.callbacks.label) {
	      if (chartType === "scatter") {
	        options.plugins.tooltip.callbacks.label = function (context) {
	          var label = context.dataset.label || '';
	          if (label) {
	            label += ': ';
	          }
	          return label + '(' + context.label + ', ' + context.formattedValue + ')';
	        };
	      } else if (chartType === "bubble") {
	        options.plugins.tooltip.callbacks.label = function (context) {
	          var label = context.dataset.label || '';
	          if (label) {
	            label += ': ';
	          }
	          var dataPoint = context.raw;
	          return label + '(' + dataPoint.x + ', ' + dataPoint.y + ', ' + dataPoint.v + ')';
	        };
	      } else if (chartType === "pie") {
	        // need to use separate label for pie charts
	        options.plugins.tooltip.callbacks.label = function (context) {
	          var dataLabel = context.label;
	          var value = ': ';

	          if (isArray(dataLabel)) {
	            // show value on first line of multiline label
	            // need to clone because we are changing the value
	            dataLabel = dataLabel.slice();
	            dataLabel[0] += value;
	          } else {
	            dataLabel += value;
	          }

	          return formatValue(dataLabel, context.parsed, formatOptions);
	        };
	      } else {
	        var valueLabel = chartType === "bar" ? "x" : "y";
	        options.plugins.tooltip.callbacks.label = function (context) {
	          // don't show null values for stacked charts
	          if (context.parsed[valueLabel] === null) {
	            return;
	          }

	          var label = context.dataset.label || '';
	          if (label) {
	            label += ': ';
	          }
	          return formatValue(label, context.parsed[valueLabel], formatOptions);
	        };
	      }
	    }
	  };

	  var jsOptions$2 = jsOptionsFunc(merge(baseOptions, defaultOptions$2), hideLegend$2, setTitle$2, setMin$2, setMax$2, setStacked$2, setXtitle$2, setYtitle$2);

	  var createDataTable = function (chart, options, chartType) {
	    var datasets = [];
	    var labels = [];

	    var colors = chart.options.colors || defaultColors;

	    var day = true;
	    var week = true;
	    var dayOfWeek;
	    var month = true;
	    var year = true;
	    var hour = true;
	    var minute = true;

	    var series = chart.data;

	    var max = 0;
	    if (chartType === "bubble") {
	      for (var i$1 = 0; i$1 < series.length; i$1++) {
	        var s$1 = series[i$1];
	        for (var j$1 = 0; j$1 < s$1.data.length; j$1++) {
	          if (s$1.data[j$1][2] > max) {
	            max = s$1.data[j$1][2];
	          }
	        }
	      }
	    }

	    var i, j, s, d, key, rows = [], rows2 = [];

	    if (chartType === "bar" || chartType === "column" || (chart.xtype !== "number" && chart.xtype !== "bubble")) {
	      var sortedLabels = [];

	      for (i = 0; i < series.length; i++) {
	        s = series[i];

	        for (j = 0; j < s.data.length; j++) {
	          d = s.data[j];
	          key = chart.xtype == "datetime" ? d[0].getTime() : d[0];
	          if (!rows[key]) {
	            rows[key] = new Array(series.length);
	          }
	          rows[key][i] = toFloat(d[1]);
	          if (sortedLabels.indexOf(key) === -1) {
	            sortedLabels.push(key);
	          }
	        }
	      }

	      if (chart.xtype === "datetime" || chart.xtype === "number") {
	        sortedLabels.sort(sortByNumber);
	      }

	      for (j = 0; j < series.length; j++) {
	        rows2.push([]);
	      }

	      var value;
	      var k;
	      for (k = 0; k < sortedLabels.length; k++) {
	        i = sortedLabels[k];
	        if (chart.xtype === "datetime") {
	          value = new Date(toFloat(i));
	          // TODO make this efficient
	          day = day && isDay(value);
	          if (!dayOfWeek) {
	            dayOfWeek = value.getDay();
	          }
	          week = week && isWeek(value, dayOfWeek);
	          month = month && isMonth(value);
	          year = year && isYear(value);
	          hour = hour && isHour(value);
	          minute = minute && isMinute(value);
	        } else {
	          value = i;
	        }
	        labels.push(value);
	        for (j = 0; j < series.length; j++) {
	          // Chart.js doesn't like undefined
	          rows2[j].push(rows[i][j] === undefined ? null : rows[i][j]);
	        }
	      }
	    } else {
	      for (var i$2 = 0; i$2 < series.length; i$2++) {
	        var s$2 = series[i$2];
	        var d$1 = [];
	        for (var j$2 = 0; j$2 < s$2.data.length; j$2++) {
	          var point = {
	            x: toFloat(s$2.data[j$2][0]),
	            y: toFloat(s$2.data[j$2][1])
	          };
	          if (chartType === "bubble") {
	            point.r = toFloat(s$2.data[j$2][2]) * 20 / max;
	            // custom attribute, for tooltip
	            point.v = s$2.data[j$2][2];
	          }
	          d$1.push(point);
	        }
	        rows2.push(d$1);
	      }
	    }

	    var color;
	    var backgroundColor;

	    for (i = 0; i < series.length; i++) {
	      s = series[i];

	      // use colors for each bar for single series format
	      if (chart.options.colors && chart.singleSeriesFormat && (chartType === "bar" || chartType === "column") && !s.color && isArray(chart.options.colors) && !isArray(chart.options.colors[0])) {
	        color = colors;
	        backgroundColor = [];
	        for (var j$3 = 0; j$3 < colors.length; j$3++) {
	          backgroundColor[j$3] = addOpacity(color[j$3], 0.5);
	        }
	      } else {
	        color = s.color || colors[i];
	        backgroundColor = chartType !== "line" ? addOpacity(color, 0.5) : color;
	      }

	      var dataset = {
	        label: s.name || "",
	        data: rows2[i],
	        fill: chartType === "area",
	        borderColor: color,
	        backgroundColor: backgroundColor,
	        borderWidth: 2
	      };

	      var pointChart = chartType === "line" || chartType === "area" || chartType === "scatter" || chartType === "bubble";
	      if (pointChart) {
	        dataset.pointBackgroundColor = color;
	        dataset.pointHoverBackgroundColor = color;
	        dataset.pointHitRadius = 50;
	      }

	      if (chartType === "bubble") {
	        dataset.pointBackgroundColor = backgroundColor;
	        dataset.pointHoverBackgroundColor = backgroundColor;
	        dataset.pointHoverBorderWidth = 2;
	      }

	      if (s.stack) {
	        dataset.stack = s.stack;
	      }

	      var curve = seriesOption(chart, s, "curve");
	      if (curve === false) {
	        dataset.tension = 0;
	      } else if (pointChart) {
	        dataset.tension = 0.4;
	      }

	      var points = seriesOption(chart, s, "points");
	      if (points === false) {
	        dataset.pointRadius = 0;
	        dataset.pointHoverRadius = 0;
	      }

	      dataset = merge(dataset, chart.options.dataset || {});
	      dataset = merge(dataset, s.library || {});
	      dataset = merge(dataset, s.dataset || {});

	      datasets.push(dataset);
	    }

	    var xmin = chart.options.xmin;
	    var xmax = chart.options.xmax;

	    if (chart.xtype === "datetime") {
	      if (notnull(xmin)) {
	        options.scales.x.min = toDate(xmin).getTime();
	      }
	      if (notnull(xmax)) {
	        options.scales.x.max = toDate(xmax).getTime();
	      }
	    } else if (chart.xtype === "number") {
	      if (notnull(xmin)) {
	        options.scales.x.min = xmin;
	      }
	      if (notnull(xmax)) {
	        options.scales.x.max = xmax;
	      }
	    }

	    // for empty datetime chart
	    if (chart.xtype === "datetime" && labels.length === 0) {
	      if (notnull(xmin)) {
	        labels.push(toDate(xmin));
	      }
	      if (notnull(xmax)) {
	        labels.push(toDate(xmax));
	      }
	      day = false;
	      week = false;
	      month = false;
	      year = false;
	      hour = false;
	      minute = false;
	    }

	    if (chart.xtype === "datetime" && labels.length > 0) {
	      var minTime = (notnull(xmin) ? toDate(xmin) : labels[0]).getTime();
	      var maxTime = (notnull(xmax) ? toDate(xmax) : labels[0]).getTime();

	      for (i = 1; i < labels.length; i++) {
	        var value$1 = labels[i].getTime();
	        if (value$1 < minTime) {
	          minTime = value$1;
	        }
	        if (value$1 > maxTime) {
	          maxTime = value$1;
	        }
	      }

	      var timeDiff = (maxTime - minTime) / (86400 * 1000.0);

	      if (!options.scales.x.time.unit) {
	        var step;
	        if (year || timeDiff > 365 * 10) {
	          options.scales.x.time.unit = "year";
	          step = 365;
	        } else if (month || timeDiff > 30 * 10) {
	          options.scales.x.time.unit = "month";
	          step = 30;
	        } else if (day || timeDiff > 10) {
	          options.scales.x.time.unit = "day";
	          step = 1;
	        } else if (hour || timeDiff > 0.5) {
	          options.scales.x.time.displayFormats = {hour: "MMM d, h a"};
	          options.scales.x.time.unit = "hour";
	          step = 1 / 24.0;
	        } else if (minute) {
	          options.scales.x.time.displayFormats = {minute: "h:mm a"};
	          options.scales.x.time.unit = "minute";
	          step = 1 / 24.0 / 60.0;
	        }

	        if (step && timeDiff > 0) {
	          // width not available for hidden elements
	          var width = chart.element.offsetWidth;
	          if (width > 0) {
	            var unitStepSize = Math.ceil(timeDiff / step / (width / 100.0));
	            if (week && step === 1) {
	              unitStepSize = Math.ceil(unitStepSize / 7.0) * 7;
	            }
	            options.scales.x.time.stepSize = unitStepSize;
	          }
	        }
	      }

	      if (!options.scales.x.time.tooltipFormat) {
	        if (day) {
	          options.scales.x.time.tooltipFormat = "PP";
	        } else if (hour) {
	          options.scales.x.time.tooltipFormat = "MMM d, h a";
	        } else if (minute) {
	          options.scales.x.time.tooltipFormat = "h:mm a";
	        }
	      }
	    }

	    var data = {
	      labels: labels,
	      datasets: datasets
	    };

	    return data;
	  };

	  var defaultExport$2 = function defaultExport(library) {
	    this.name = "chartjs";
	    this.library = library;
	  };

	  defaultExport$2.prototype.renderLineChart = function renderLineChart (chart, chartType) {
	    var chartOptions = {};
	    // fix for https://github.com/chartjs/Chart.js/issues/2441
	    if (!chart.options.max && allZeros(chart.data)) {
	      chartOptions.max = 1;
	    }

	    var options = jsOptions$2(chart, merge(chartOptions, chart.options));
	    setFormatOptions$1(chart, options, chartType);

	    var data = createDataTable(chart, options, chartType || "line");

	    if (chart.xtype === "number") {
	      options.scales.x.type = options.scales.x.type || "linear";
	      options.scales.x.position = options.scales.x.position ||"bottom";
	    } else {
	      options.scales.x.type = chart.xtype === "string" ? "category" : "time";
	    }

	    this.drawChart(chart, "line", data, options);
	  };

	  defaultExport$2.prototype.renderPieChart = function renderPieChart (chart) {
	    var options = merge({}, baseOptions);
	    if (chart.options.donut) {
	      options.cutout = "50%";
	    }

	    if ("legend" in chart.options) {
	      hideLegend$2(options, chart.options.legend);
	    }

	    if (chart.options.title) {
	      setTitle$2(options, chart.options.title);
	    }

	    options = merge(options, chart.options.library || {});
	    setFormatOptions$1(chart, options, "pie");

	    var labels = [];
	    var values = [];
	    for (var i = 0; i < chart.data.length; i++) {
	      var point = chart.data[i];
	      labels.push(point[0]);
	      values.push(point[1]);
	    }

	    var dataset = {
	      data: values,
	      backgroundColor: chart.options.colors || defaultColors
	    };
	    dataset = merge(dataset, chart.options.dataset || {});

	    var data = {
	      labels: labels,
	      datasets: [dataset]
	    };

	    this.drawChart(chart, "pie", data, options);
	  };

	  defaultExport$2.prototype.renderColumnChart = function renderColumnChart (chart, chartType) {
	    var options;
	    if (chartType === "bar") {
	      var barOptions = merge(baseOptions, defaultOptions$2);
	      barOptions.indexAxis = "y";

	      // ensure gridlines have proper orientation
	      barOptions.scales.x.grid.drawOnChartArea = true;
	      barOptions.scales.y.grid.drawOnChartArea = false;
	      delete barOptions.scales.y.ticks.maxTicksLimit;

	      options = jsOptionsFunc(barOptions, hideLegend$2, setTitle$2, setBarMin$1, setBarMax$1, setStacked$2, setXtitle$2, setYtitle$2)(chart, chart.options);
	    } else {
	      options = jsOptions$2(chart, chart.options);
	    }
	    setFormatOptions$1(chart, options, chartType);
	    var data = createDataTable(chart, options, "column");
	    if (chartType !== "bar") {
	      setLabelSize(chart, data, options);
	    }
	    this.drawChart(chart, "bar", data, options);
	  };

	  defaultExport$2.prototype.renderAreaChart = function renderAreaChart (chart) {
	    this.renderLineChart(chart, "area");
	  };

	  defaultExport$2.prototype.renderBarChart = function renderBarChart (chart) {
	    this.renderColumnChart(chart, "bar");
	  };

	  defaultExport$2.prototype.renderScatterChart = function renderScatterChart (chart, chartType) {
	    chartType = chartType || "scatter";

	    var options = jsOptions$2(chart, chart.options);
	    setFormatOptions$1(chart, options, chartType);

	    if (!("showLine" in options)) {
	      options.showLine = false;
	    }

	    var data = createDataTable(chart, options, chartType);

	    options.scales.x.type = options.scales.x.type || "linear";
	    options.scales.x.position = options.scales.x.position || "bottom";

	    // prevent grouping hover and tooltips
	    if (!("mode" in options.interaction)) {
	      options.interaction.mode = "nearest";
	    }

	    this.drawChart(chart, chartType, data, options);
	  };

	  defaultExport$2.prototype.renderBubbleChart = function renderBubbleChart (chart) {
	    this.renderScatterChart(chart, "bubble");
	  };

	  defaultExport$2.prototype.destroy = function destroy (chart) {
	    if (chart.chart) {
	      chart.chart.destroy();
	    }
	  };

	  defaultExport$2.prototype.drawChart = function drawChart (chart, type, data, options) {
	    this.destroy(chart);
	    if (chart.destroyed) { return; }

	    var chartOptions = {
	      type: type,
	      data: data,
	      options: options
	    };

	    if (chart.options.code) {
	      window.console.log("new Chart(ctx, " + JSON.stringify(chartOptions) + ");");
	    }

	    chart.element.innerHTML = "<canvas></canvas>";
	    var ctx = chart.element.getElementsByTagName("CANVAS")[0];
	    chart.chart = new this.library(ctx, chartOptions);
	  };

	  var defaultOptions$1 = {
	    chart: {},
	    xAxis: {
	      title: {
	        text: null
	      },
	      labels: {
	        style: {
	          fontSize: "12px"
	        }
	      }
	    },
	    yAxis: {
	      title: {
	        text: null
	      },
	      labels: {
	        style: {
	          fontSize: "12px"
	        }
	      }
	    },
	    title: {
	      text: null
	    },
	    credits: {
	      enabled: false
	    },
	    legend: {
	      borderWidth: 0
	    },
	    tooltip: {
	      style: {
	        fontSize: "12px"
	      }
	    },
	    plotOptions: {
	      areaspline: {},
	      area: {},
	      series: {
	        marker: {}
	      }
	    },
	    time: {
	      useUTC: false
	    }
	  };

	  var hideLegend$1 = function (options, legend, hideLegend) {
	    if (legend !== undefined) {
	      options.legend.enabled = !!legend;
	      if (legend && legend !== true) {
	        if (legend === "top" || legend === "bottom") {
	          options.legend.verticalAlign = legend;
	        } else {
	          options.legend.layout = "vertical";
	          options.legend.verticalAlign = "middle";
	          options.legend.align = legend;
	        }
	      }
	    } else if (hideLegend) {
	      options.legend.enabled = false;
	    }
	  };

	  var setTitle$1 = function (options, title) {
	    options.title.text = title;
	  };

	  var setMin$1 = function (options, min) {
	    options.yAxis.min = min;
	  };

	  var setMax$1 = function (options, max) {
	    options.yAxis.max = max;
	  };

	  var setStacked$1 = function (options, stacked) {
	    var stackedValue = stacked ? (stacked === true ? "normal" : stacked) : null;
	    options.plotOptions.series.stacking = stackedValue;
	    options.plotOptions.area.stacking = stackedValue;
	    options.plotOptions.areaspline.stacking = stackedValue;
	  };

	  var setXtitle$1 = function (options, title) {
	    options.xAxis.title.text = title;
	  };

	  var setYtitle$1 = function (options, title) {
	    options.yAxis.title.text = title;
	  };

	  var jsOptions$1 = jsOptionsFunc(defaultOptions$1, hideLegend$1, setTitle$1, setMin$1, setMax$1, setStacked$1, setXtitle$1, setYtitle$1);

	  var setFormatOptions = function(chart, options, chartType) {
	    var formatOptions = {
	      prefix: chart.options.prefix,
	      suffix: chart.options.suffix,
	      thousands: chart.options.thousands,
	      decimal: chart.options.decimal,
	      precision: chart.options.precision,
	      round: chart.options.round,
	      zeros: chart.options.zeros
	    };

	    // skip when axis is an array (like with min/max)
	    if (chartType !== "pie" && !isArray(options.yAxis) && !options.yAxis.labels.formatter) {
	      options.yAxis.labels.formatter = function () {
	        return formatValue("", this.value, formatOptions);
	      };
	    }

	    if (!options.tooltip.pointFormatter && !options.tooltip.pointFormat) {
	      options.tooltip.pointFormatter = function () {
	        return '<span style="color:' + this.color + '">\u25CF</span> ' + formatValue(this.series.name + ': <b>', this.y, formatOptions) + '</b><br/>';
	      };
	    }
	  };

	  var defaultExport$1 = function defaultExport(library) {
	    this.name = "highcharts";
	    this.library = library;
	  };

	  defaultExport$1.prototype.renderLineChart = function renderLineChart (chart, chartType) {
	    chartType = chartType || "spline";
	    var chartOptions = {};
	    if (chartType === "areaspline") {
	      chartOptions = {
	        plotOptions: {
	          areaspline: {
	            stacking: "normal"
	          },
	          area: {
	            stacking: "normal"
	          },
	          series: {
	            marker: {
	              enabled: false
	            }
	          }
	        }
	      };
	    }

	    if (chart.options.curve === false) {
	      if (chartType === "areaspline") {
	        chartType = "area";
	      } else if (chartType === "spline") {
	        chartType = "line";
	      }
	    }

	    var options = jsOptions$1(chart, chart.options, chartOptions), data, i, j;
	    if (chart.xtype === "number") {
	      options.xAxis.type = options.xAxis.type || "linear";
	    } else {
	      options.xAxis.type = chart.xtype === "string" ? "category" : "datetime";
	    }
	    if (!options.chart.type) {
	      options.chart.type = chartType;
	    }
	    setFormatOptions(chart, options, chartType);

	    var series = chart.data;
	    for (i = 0; i < series.length; i++) {
	      series[i].name = series[i].name || "Value";
	      data = series[i].data;
	      if (chart.xtype === "datetime") {
	        for (j = 0; j < data.length; j++) {
	          data[j][0] = data[j][0].getTime();
	        }
	      }
	      series[i].marker = {symbol: "circle"};
	      if (chart.options.points === false) {
	        series[i].marker.enabled = false;
	      }
	    }

	    this.drawChart(chart, series, options);
	  };

	  defaultExport$1.prototype.renderScatterChart = function renderScatterChart (chart) {
	    var options = jsOptions$1(chart, chart.options, {});
	    options.chart.type = "scatter";
	    this.drawChart(chart, chart.data, options);
	  };

	  defaultExport$1.prototype.renderPieChart = function renderPieChart (chart) {
	    var chartOptions = merge(defaultOptions$1, {});

	    if (chart.options.colors) {
	      chartOptions.colors = chart.options.colors;
	    }
	    if (chart.options.donut) {
	      chartOptions.plotOptions = {pie: {innerSize: "50%"}};
	    }

	    if ("legend" in chart.options) {
	      hideLegend$1(chartOptions, chart.options.legend);
	    }

	    if (chart.options.title) {
	      setTitle$1(chartOptions, chart.options.title);
	    }

	    var options = merge(chartOptions, chart.options.library || {});
	    setFormatOptions(chart, options, "pie");
	    var series = [{
	      type: "pie",
	      name: chart.options.label || "Value",
	      data: chart.data
	    }];

	    this.drawChart(chart, series, options);
	  };

	  defaultExport$1.prototype.renderColumnChart = function renderColumnChart (chart, chartType) {
	    chartType = chartType || "column";
	    var series = chart.data;
	    var options = jsOptions$1(chart, chart.options), i, j, s, d, rows = [], categories = [];
	    options.chart.type = chartType;
	    setFormatOptions(chart, options, chartType);

	    for (i = 0; i < series.length; i++) {
	      s = series[i];

	      for (j = 0; j < s.data.length; j++) {
	        d = s.data[j];
	        if (!rows[d[0]]) {
	          rows[d[0]] = new Array(series.length);
	          categories.push(d[0]);
	        }
	        rows[d[0]][i] = d[1];
	      }
	    }

	    if (chart.xtype === "number") {
	      categories.sort(sortByNumber);
	    }

	    options.xAxis.categories = categories;

	    var newSeries = [], d2;
	    for (i = 0; i < series.length; i++) {
	      d = [];
	      for (j = 0; j < categories.length; j++) {
	        d.push(rows[categories[j]][i] || 0);
	      }

	      d2 = {
	        name: series[i].name || "Value",
	        data: d
	      };
	      if (series[i].stack) {
	        d2.stack = series[i].stack;
	      }

	      newSeries.push(d2);
	    }

	    this.drawChart(chart, newSeries, options);
	  };

	  defaultExport$1.prototype.renderBarChart = function renderBarChart (chart) {
	    this.renderColumnChart(chart, "bar");
	  };

	  defaultExport$1.prototype.renderAreaChart = function renderAreaChart (chart) {
	    this.renderLineChart(chart, "areaspline");
	  };

	  defaultExport$1.prototype.destroy = function destroy (chart) {
	    if (chart.chart) {
	      chart.chart.destroy();
	    }
	  };

	  defaultExport$1.prototype.drawChart = function drawChart (chart, data, options) {
	    this.destroy(chart);
	    if (chart.destroyed) { return; }

	    options.chart.renderTo = chart.element.id;
	    options.series = data;

	    if (chart.options.code) {
	      window.console.log("new Highcharts.Chart(" + JSON.stringify(options) + ");");
	    }

	    chart.chart = new this.library.Chart(options);
	  };

	  var loaded = {};
	  var callbacks = [];

	  // Set chart options
	  var defaultOptions = {
	    chartArea: {},
	    fontName: "'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif",
	    pointSize: 6,
	    legend: {
	      textStyle: {
	        fontSize: 12,
	        color: "#444"
	      },
	      alignment: "center",
	      position: "right"
	    },
	    curveType: "function",
	    hAxis: {
	      textStyle: {
	        color: "#666",
	        fontSize: 12
	      },
	      titleTextStyle: {},
	      gridlines: {
	        color: "transparent"
	      },
	      baselineColor: "#ccc",
	      viewWindow: {}
	    },
	    vAxis: {
	      textStyle: {
	        color: "#666",
	        fontSize: 12
	      },
	      titleTextStyle: {},
	      baselineColor: "#ccc",
	      viewWindow: {}
	    },
	    tooltip: {
	      textStyle: {
	        color: "#666",
	        fontSize: 12
	      }
	    }
	  };

	  var hideLegend = function (options, legend, hideLegend) {
	    if (legend !== undefined) {
	      var position;
	      if (!legend) {
	        position = "none";
	      } else if (legend === true) {
	        position = "right";
	      } else {
	        position = legend;
	      }
	      options.legend.position = position;
	    } else if (hideLegend) {
	      options.legend.position = "none";
	    }
	  };

	  var setTitle = function (options, title) {
	    options.title = title;
	    options.titleTextStyle = {color: "#333", fontSize: "20px"};
	  };

	  var setMin = function (options, min) {
	    options.vAxis.viewWindow.min = min;
	  };

	  var setMax = function (options, max) {
	    options.vAxis.viewWindow.max = max;
	  };

	  var setBarMin = function (options, min) {
	    options.hAxis.viewWindow.min = min;
	  };

	  var setBarMax = function (options, max) {
	    options.hAxis.viewWindow.max = max;
	  };

	  var setStacked = function (options, stacked) {
	    options.isStacked = stacked ? stacked : false;
	  };

	  var setXtitle = function (options, title) {
	    options.hAxis.title = title;
	    options.hAxis.titleTextStyle.italic = false;
	  };

	  var setYtitle = function (options, title) {
	    options.vAxis.title = title;
	    options.vAxis.titleTextStyle.italic = false;
	  };

	  var jsOptions = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setMin, setMax, setStacked, setXtitle, setYtitle);

	  var resize = function (callback) {
	    if (window.attachEvent) {
	      window.attachEvent("onresize", callback);
	    } else if (window.addEventListener) {
	      window.addEventListener("resize", callback, true);
	    }
	    callback();
	  };

	  var defaultExport = function defaultExport(library) {
	    this.name = "google";
	    this.library = library;
	  };

	  defaultExport.prototype.renderLineChart = function renderLineChart (chart) {
	      var this$1$1 = this;

	    this.waitForLoaded(chart, function () {
	      var chartOptions = {};

	      if (chart.options.curve === false) {
	        chartOptions.curveType = "none";
	      }

	      if (chart.options.points === false) {
	        chartOptions.pointSize = 0;
	      }

	      var options = jsOptions(chart, chart.options, chartOptions);
	      var data = this$1$1.createDataTable(chart.data, chart.xtype);

	      this$1$1.drawChart(chart, "LineChart", data, options);
	    });
	  };

	  defaultExport.prototype.renderPieChart = function renderPieChart (chart) {
	      var this$1$1 = this;

	    this.waitForLoaded(chart, function () {
	      var chartOptions = {
	        chartArea: {
	          top: "10%",
	          height: "80%"
	        },
	        legend: {}
	      };
	      if (chart.options.colors) {
	        chartOptions.colors = chart.options.colors;
	      }
	      if (chart.options.donut) {
	        chartOptions.pieHole = 0.5;
	      }
	      if ("legend" in chart.options) {
	        hideLegend(chartOptions, chart.options.legend);
	      }
	      if (chart.options.title) {
	        setTitle(chartOptions, chart.options.title);
	      }
	      var options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

	      var data = new this$1$1.library.visualization.DataTable();
	      data.addColumn("string", "");
	      data.addColumn("number", "Value");
	      data.addRows(chart.data);

	      this$1$1.drawChart(chart, "PieChart", data, options);
	    });
	  };

	  defaultExport.prototype.renderColumnChart = function renderColumnChart (chart) {
	      var this$1$1 = this;

	    this.waitForLoaded(chart, function () {
	      var options = jsOptions(chart, chart.options);
	      var data = this$1$1.createDataTable(chart.data, chart.xtype);

	      this$1$1.drawChart(chart, "ColumnChart", data, options);
	    });
	  };

	  defaultExport.prototype.renderBarChart = function renderBarChart (chart) {
	      var this$1$1 = this;

	    this.waitForLoaded(chart, function () {
	      var chartOptions = {
	        hAxis: {
	          gridlines: {
	            color: "#ccc"
	          }
	        }
	      };
	      var options = jsOptionsFunc(defaultOptions, hideLegend, setTitle, setBarMin, setBarMax, setStacked, setXtitle, setYtitle)(chart, chart.options, chartOptions);
	      var data = this$1$1.createDataTable(chart.data, chart.xtype);

	      this$1$1.drawChart(chart, "BarChart", data, options);
	    });
	  };

	  defaultExport.prototype.renderAreaChart = function renderAreaChart (chart) {
	      var this$1$1 = this;

	    this.waitForLoaded(chart, function () {
	      var chartOptions = {
	        isStacked: true,
	        pointSize: 0,
	        areaOpacity: 0.5
	      };

	      var options = jsOptions(chart, chart.options, chartOptions);
	      var data = this$1$1.createDataTable(chart.data, chart.xtype);

	      this$1$1.drawChart(chart, "AreaChart", data, options);
	    });
	  };

	  defaultExport.prototype.renderGeoChart = function renderGeoChart (chart) {
	      var this$1$1 = this;

	    this.waitForLoaded(chart, "geochart", function () {
	      var chartOptions = {
	        legend: "none",
	        colorAxis: {
	          colors: chart.options.colors || ["#f6c7b6", "#ce502d"]
	        }
	      };
	      var options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

	      var data = new this$1$1.library.visualization.DataTable();
	      data.addColumn("string", "");
	      data.addColumn("number", chart.options.label || "Value");
	      data.addRows(chart.data);

	      this$1$1.drawChart(chart, "GeoChart", data, options);
	    });
	  };

	  defaultExport.prototype.renderScatterChart = function renderScatterChart (chart) {
	      var this$1$1 = this;

	    this.waitForLoaded(chart, function () {
	      var chartOptions = {};
	      var options = jsOptions(chart, chart.options, chartOptions);

	      var series = chart.data, rows2 = [], i, j, data, d;
	      for (i = 0; i < series.length; i++) {
	        series[i].name = series[i].name || "Value";
	        d = series[i].data;
	        for (j = 0; j < d.length; j++) {
	          var row = new Array(series.length + 1);
	          row[0] = d[j][0];
	          row[i + 1] = d[j][1];
	          rows2.push(row);
	        }
	      }

	      data = new this$1$1.library.visualization.DataTable();
	      data.addColumn("number", "");
	      for (i = 0; i < series.length; i++) {
	        data.addColumn("number", series[i].name);
	      }
	      data.addRows(rows2);

	      this$1$1.drawChart(chart, "ScatterChart", data, options);
	    });
	  };

	  defaultExport.prototype.renderTimeline = function renderTimeline (chart) {
	      var this$1$1 = this;

	    this.waitForLoaded(chart, "timeline", function () {
	      var chartOptions = {
	        legend: "none"
	      };

	      if (chart.options.colors) {
	        chartOptions.colors = chart.options.colors;
	      }
	      var options = merge(merge(defaultOptions, chartOptions), chart.options.library || {});

	      var data = new this$1$1.library.visualization.DataTable();
	      data.addColumn({type: "string", id: "Name"});
	      data.addColumn({type: "date", id: "Start"});
	      data.addColumn({type: "date", id: "End"});
	      data.addRows(chart.data);

	      chart.element.style.lineHeight = "normal";

	      this$1$1.drawChart(chart, "Timeline", data, options);
	    });
	  };

	  // TODO remove resize events
	  defaultExport.prototype.destroy = function destroy (chart) {
	    if (chart.chart) {
	      chart.chart.clearChart();
	    }
	  };

	  defaultExport.prototype.drawChart = function drawChart (chart, type, data, options) {
	    this.destroy(chart);
	    if (chart.destroyed) { return; }

	    if (chart.options.code) {
	      window.console.log("var data = new google.visualization.DataTable(" + data.toJSON() + ");\nvar chart = new google.visualization." + type + "(element);\nchart.draw(data, " + JSON.stringify(options) + ");");
	    }

	    chart.chart = new this.library.visualization[type](chart.element);
	    resize(function () {
	      chart.chart.draw(data, options);
	    });
	  };

	  defaultExport.prototype.waitForLoaded = function waitForLoaded (chart, pack, callback) {
	      var this$1$1 = this;

	    if (!callback) {
	      callback = pack;
	      pack = "corechart";
	    }

	    callbacks.push({pack: pack, callback: callback});

	    if (loaded[pack]) {
	      this.runCallbacks();
	    } else {
	      loaded[pack] = true;

	      // https://groups.google.com/forum/#!topic/google-visualization-api/fMKJcyA2yyI
	      var loadOptions = {
	        packages: [pack],
	        callback: function () { this$1$1.runCallbacks(); }
	      };
	      var config = chart.__config();
	      if (config.language) {
	        loadOptions.language = config.language;
	      }
	      if (pack === "geochart" && config.mapsApiKey) {
	        loadOptions.mapsApiKey = config.mapsApiKey;
	      }

	      this.library.charts.load("current", loadOptions);
	    }
	  };

	  defaultExport.prototype.runCallbacks = function runCallbacks () {
	    var cb, call;
	    for (var i = 0; i < callbacks.length; i++) {
	      cb = callbacks[i];
	      call = this.library.visualization && ((cb.pack === "corechart" && this.library.visualization.LineChart) || (cb.pack === "timeline" && this.library.visualization.Timeline) || (cb.pack === "geochart" && this.library.visualization.GeoChart));
	      if (call) {
	        cb.callback();
	        callbacks.splice(i, 1);
	        i--;
	      }
	    }
	  };

	  // cant use object as key
	  defaultExport.prototype.createDataTable = function createDataTable (series, columnType) {
	    var i, j, s, d, key, rows = [], sortedLabels = [];
	    for (i = 0; i < series.length; i++) {
	      s = series[i];
	      series[i].name = series[i].name || "Value";

	      for (j = 0; j < s.data.length; j++) {
	        d = s.data[j];
	        key = (columnType === "datetime") ? d[0].getTime() : d[0];
	        if (!rows[key]) {
	          rows[key] = new Array(series.length);
	          sortedLabels.push(key);
	        }
	        rows[key][i] = toFloat(d[1]);
	      }
	    }

	    var rows2 = [];
	    var day = true;
	    var value;
	    for (j = 0; j < sortedLabels.length; j++) {
	      i = sortedLabels[j];
	      if (columnType === "datetime") {
	        value = new Date(toFloat(i));
	        day = day && isDay(value);
	      } else if (columnType === "number") {
	        value = toFloat(i);
	      } else {
	        value = i;
	      }
	      rows2.push([value].concat(rows[i]));
	    }
	    if (columnType === "datetime") {
	      rows2.sort(sortByTime);
	    } else if (columnType === "number") {
	      rows2.sort(sortByNumberSeries);

	      for (i = 0; i < rows2.length; i++) {
	        rows2[i][0] = toStr(rows2[i][0]);
	      }

	      columnType = "string";
	    }

	    // create datatable
	    var data = new this.library.visualization.DataTable();
	    columnType = columnType === "datetime" && day ? "date" : columnType;
	    data.addColumn(columnType, "");
	    for (i = 0; i < series.length; i++) {
	      data.addColumn("number", series[i].name);
	    }
	    data.addRows(rows2);

	    return data;
	  };

	  function formatSeriesData(data, keyType) {
	    var r = [], j, keyFunc;

	    if (keyType === "number") {
	      keyFunc = toFloat;
	    } else if (keyType === "datetime") {
	      keyFunc = toDate;
	    } else {
	      keyFunc = toStr;
	    }

	    if (keyType === "bubble") {
	      for (j = 0; j < data.length; j++) {
	        r.push([toFloat(data[j][0]), toFloat(data[j][1]), toFloat(data[j][2])]);
	      }
	    } else {
	      for (j = 0; j < data.length; j++) {
	        r.push([keyFunc(data[j][0]), toFloat(data[j][1])]);
	      }
	    }

	    if (keyType === "datetime") {
	      r.sort(sortByTime);
	    } else if (keyType === "number") {
	      r.sort(sortByNumberSeries);
	    }

	    return r;
	  }

	  function detectXType(series, noDatetime, options) {
	    if (dataEmpty(series)) {
	      if ((options.xmin || options.xmax) && (!options.xmin || isDate(options.xmin)) && (!options.xmax || isDate(options.xmax))) {
	        return "datetime";
	      } else {
	        return "number";
	      }
	    } else if (detectXTypeWithFunction(series, isNumber)) {
	      return "number";
	    } else if (!noDatetime && detectXTypeWithFunction(series, isDate)) {
	      return "datetime";
	    } else {
	      return "string";
	    }
	  }

	  function detectXTypeWithFunction(series, func) {
	    var i, j, data;
	    for (i = 0; i < series.length; i++) {
	      data = toArr(series[i].data);
	      for (j = 0; j < data.length; j++) {
	        if (!func(data[j][0])) {
	          return false;
	        }
	      }
	    }
	    return true;
	  }

	  // creates a shallow copy of each element of the array
	  // elements are expected to be objects
	  function copySeries(series) {
	    var newSeries = [], i, j;
	    for (i = 0; i < series.length; i++) {
	      var copy = {};
	      for (j in series[i]) {
	        if (series[i].hasOwnProperty(j)) {
	          copy[j] = series[i][j];
	        }
	      }
	      newSeries.push(copy);
	    }
	    return newSeries;
	  }

	  function processSeries(chart, keyType, noDatetime) {
	    var i;

	    var opts = chart.options;
	    var series = chart.rawData;

	    // see if one series or multiple
	    chart.singleSeriesFormat = (!isArray(series) || typeof series[0] !== "object" || isArray(series[0]));
	    if (chart.singleSeriesFormat) {
	      series = [{name: opts.label, data: series}];
	    }

	    // convert to array
	    // must come before dataEmpty check
	    series = copySeries(series);
	    for (i = 0; i < series.length; i++) {
	      series[i].data = toArr(series[i].data);
	    }

	    chart.xtype = keyType ? keyType : (opts.discrete ? "string" : detectXType(series, noDatetime, opts));

	    // right format
	    for (i = 0; i < series.length; i++) {
	      series[i].data = formatSeriesData(series[i].data, chart.xtype);
	    }

	    return series;
	  }

	  function processSimple(chart) {
	    var perfectData = toArr(chart.rawData), i;
	    for (i = 0; i < perfectData.length; i++) {
	      perfectData[i] = [toStr(perfectData[i][0]), toFloat(perfectData[i][1])];
	    }
	    return perfectData;
	  }

	  function dataEmpty(data, chartType) {
	    if (chartType === "PieChart" || chartType === "GeoChart" || chartType === "Timeline") {
	      return data.length === 0;
	    } else {
	      for (var i = 0; i < data.length; i++) {
	        if (data[i].data.length > 0) {
	          return false;
	        }
	      }
	      return true;
	    }
	  }

	  function addDownloadButton(chart) {
	    var element = chart.element;
	    var link = document.createElement("a");

	    var download = chart.options.download;
	    if (download === true) {
	      download = {};
	    } else if (typeof download === "string") {
	      download = {filename: download};
	    }
	    link.download = download.filename || "chart.png"; // https://caniuse.com/download

	    link.style.position = "absolute";
	    link.style.top = "20px";
	    link.style.right = "20px";
	    link.style.zIndex = 1000;
	    link.style.lineHeight = "20px";
	    link.target = "_blank"; // for safari
	    var image = document.createElement("img");
	    image.alt = "Download";
	    image.style.border = "none";
	    // icon from font-awesome
	    // http://fa2png.io/
	    image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAABCFBMVEUAAADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMywEsqxAAAAV3RSTlMAAQIDBggJCgsMDQ4PERQaHB0eISIjJCouLzE0OTo/QUJHSUpLTU5PUllhYmltcHh5foWLjI+SlaCio6atr7S1t7m6vsHHyM7R2tze5Obo7fHz9ff5+/1hlxK2AAAA30lEQVQYGUXBhVYCQQBA0TdYWAt2d3d3YWAHyur7/z9xgD16Lw0DW+XKx+1GgX+FRzM3HWQWrHl5N/oapW5RPe0PkBu+UYeICvozTWZVK23Ao04B79oJrOsJDOoxkZoQPWgX29pHpCZEk7rEvQYiNSFq1UMqvlCjJkRBS1R8hb00Vb/TajtBL7nTHE1X1vyMQF732dQhyF2o6SAwrzP06iUQzvwsArlnzcOdrgBhJyHa1QOgO9U1GsKuvjUTjavliZYQ8nNPapG6sap/3nrIdJ6bOWzmX/fy0XVpfzZP3S8OJT3g9EEiJwAAAABJRU5ErkJggg==";
	    link.appendChild(image);
	    element.style.position = "relative";

	    chart.__downloadAttached = true;

	    // mouseenter
	    chart.__enterEvent = addEvent(element, "mouseover", function(e) {
	      var related = e.relatedTarget;
	      // check download option again to ensure it wasn't changed
	      if ((!related || (related !== this && !childOf(this, related))) && chart.options.download) {
	        link.href = chart.toImage(download);
	        element.appendChild(link);
	      }
	    });

	    // mouseleave
	    chart.__leaveEvent = addEvent(element, "mouseout", function(e) {
	      var related = e.relatedTarget;
	      if (!related || (related !== this && !childOf(this, related))) {
	        if (link.parentNode) {
	          link.parentNode.removeChild(link);
	        }
	      }
	    });
	  }

	  // https://stackoverflow.com/questions/10149963/adding-event-listener-cross-browser
	  function addEvent(elem, event, fn) {
	    if (elem.addEventListener) {
	      elem.addEventListener(event, fn, false);
	      return fn;
	    } else {
	      var fn2 = function() {
	        // set the this pointer same as addEventListener when fn is called
	        return(fn.call(elem, window.event));
	      };
	      elem.attachEvent("on" + event, fn2);
	      return fn2;
	    }
	  }

	  function removeEvent(elem, event, fn) {
	    if (elem.removeEventListener) {
	      elem.removeEventListener(event, fn, false);
	    } else {
	      elem.detachEvent("on" + event, fn);
	    }
	  }

	  // https://gist.github.com/shawnbot/4166283
	  function childOf(p, c) {
	    if (p === c) { return false; }
	    while (c && c !== p) { c = c.parentNode; }
	    return c === p;
	  }

	  var pendingRequests = [], runningRequests = 0, maxRequests = 4;

	  function pushRequest(url, success, error) {
	    pendingRequests.push([url, success, error]);
	    runNext();
	  }

	  function runNext() {
	    if (runningRequests < maxRequests) {
	      var request = pendingRequests.shift();
	      if (request) {
	        runningRequests++;
	        getJSON(request[0], request[1], request[2]);
	        runNext();
	      }
	    }
	  }

	  function requestComplete() {
	    runningRequests--;
	    runNext();
	  }

	  function getJSON(url, success, error) {
	    ajaxCall(url, success, function (jqXHR, textStatus, errorThrown) {
	      var message = (typeof errorThrown === "string") ? errorThrown : errorThrown.message;
	      error(message);
	    });
	  }

	  function ajaxCall(url, success, error) {
	    var $ = window.jQuery || window.Zepto || window.$;

	    if ($ && $.ajax) {
	      $.ajax({
	        dataType: "json",
	        url: url,
	        success: success,
	        error: error,
	        complete: requestComplete
	      });
	    } else {
	      var xhr = new XMLHttpRequest();
	      xhr.open("GET", url, true);
	      xhr.setRequestHeader("Content-Type", "application/json");
	      xhr.onload = function () {
	        requestComplete();
	        if (xhr.status === 200) {
	          success(JSON.parse(xhr.responseText), xhr.statusText, xhr);
	        } else {
	          error(xhr, "error", xhr.statusText);
	        }
	      };
	      xhr.send();
	    }
	  }

	  var config = {};
	  var adapters = [];

	  // helpers

	  function setText(element, text) {
	    if (document.body.innerText) {
	      element.innerText = text;
	    } else {
	      element.textContent = text;
	    }
	  }

	  // TODO remove prefix for all messages
	  function chartError(element, message, noPrefix) {
	    if (!noPrefix) {
	      message = "Error Loading Chart: " + message;
	    }
	    setText(element, message);
	    element.style.color = "#ff0000";
	  }

	  function errorCatcher(chart) {
	    try {
	      chart.__render();
	    } catch (err) {
	      chartError(chart.element, err.message);
	      throw err;
	    }
	  }

	  function fetchDataSource(chart, dataSource, showLoading) {
	    // only show loading message for urls and callbacks
	    if (showLoading && chart.options.loading && (typeof dataSource === "string" || typeof dataSource === "function")) {
	      setText(chart.element, chart.options.loading);
	    }

	    if (typeof dataSource === "string") {
	      pushRequest(dataSource, function (data) {
	        chart.rawData = data;
	        errorCatcher(chart);
	      }, function (message) {
	        chartError(chart.element, message);
	      });
	    } else if (typeof dataSource === "function") {
	      try {
	        dataSource(function (data) {
	          chart.rawData = data;
	          errorCatcher(chart);
	        }, function (message) {
	          chartError(chart.element, message, true);
	        });
	      } catch (err) {
	        chartError(chart.element, err, true);
	      }
	    } else {
	      chart.rawData = dataSource;
	      errorCatcher(chart);
	    }
	  }

	  function getAdapterType(library) {
	    if (library) {
	      if (library.product === "Highcharts") {
	        return defaultExport$1;
	      } else if (library.charts) {
	        return defaultExport;
	      } else if (isFunction(library)) {
	        return defaultExport$2;
	      }
	    }
	    throw new Error("Unknown adapter");
	  }

	  function addAdapter(library) {
	    var adapterType = getAdapterType(library);
	    var adapter = new adapterType(library);

	    if (adapters.indexOf(adapter) === -1) {
	      adapters.push(adapter);
	    }
	  }

	  function loadAdapters() {
	    if ("Chart" in window) {
	      addAdapter(window.Chart);
	    }

	    if ("Highcharts" in window) {
	      addAdapter(window.Highcharts);
	    }

	    if (window.google && window.google.charts) {
	      addAdapter(window.google);
	    }
	  }

	  function renderChart(chartType, chart) {
	    if (dataEmpty(chart.data, chartType)) {
	      var message = chart.options.empty || (chart.options.messages && chart.options.messages.empty) || "No data";
	      setText(chart.element, message);
	    } else {
	      callAdapter(chartType, chart);
	      if (chart.options.download && !chart.__downloadAttached && chart.adapter === "chartjs") {
	        addDownloadButton(chart);
	      }
	    }
	  }

	  // TODO remove chartType if cross-browser way
	  // to get the name of the chart class
	  function callAdapter(chartType, chart) {
	    var i, adapter, fnName, adapterName;
	    fnName = "render" + chartType;
	    adapterName = chart.options.adapter;

	    loadAdapters();

	    for (i = 0; i < adapters.length; i++) {
	      adapter = adapters[i];
	      if ((!adapterName || adapterName === adapter.name) && isFunction(adapter[fnName])) {
	        chart.adapter = adapter.name;
	        chart.__adapterObject = adapter;
	        return adapter[fnName](chart);
	      }
	    }

	    if (adapters.length > 0) {
	      throw new Error("No charting library found for " + chartType);
	    } else {
	      throw new Error("No charting libraries found - be sure to include one before your charts");
	    }
	  }

	  // define classes

	  var Chart = function Chart(element, dataSource, options) {
	    var elementId;
	    if (typeof element === "string") {
	      elementId = element;
	      element = document.getElementById(element);
	      if (!element) {
	        throw new Error("No element with id " + elementId);
	      }
	    }
	    this.element = element;
	    this.options = merge(Chartkick.options, options || {});
	    this.dataSource = dataSource;

	    Chartkick.charts[element.id] = this;

	    fetchDataSource(this, dataSource, true);

	    if (this.options.refresh) {
	      this.startRefresh();
	    }
	  };

	  Chart.prototype.getElement = function getElement () {
	    return this.element;
	  };

	  Chart.prototype.getDataSource = function getDataSource () {
	    return this.dataSource;
	  };

	  Chart.prototype.getData = function getData () {
	    return this.data;
	  };

	  Chart.prototype.getOptions = function getOptions () {
	    return this.options;
	  };

	  Chart.prototype.getChartObject = function getChartObject () {
	    return this.chart;
	  };

	  Chart.prototype.getAdapter = function getAdapter () {
	    return this.adapter;
	  };

	  Chart.prototype.updateData = function updateData (dataSource, options) {
	    this.dataSource = dataSource;
	    if (options) {
	      this.__updateOptions(options);
	    }
	    fetchDataSource(this, dataSource, true);
	  };

	  Chart.prototype.setOptions = function setOptions (options) {
	    this.__updateOptions(options);
	    this.redraw();
	  };

	  Chart.prototype.redraw = function redraw () {
	    fetchDataSource(this, this.rawData);
	  };

	  Chart.prototype.refreshData = function refreshData () {
	    if (typeof this.dataSource === "string") {
	      // prevent browser from caching
	      var sep = this.dataSource.indexOf("?") === -1 ? "?" : "&";
	      var url = this.dataSource + sep + "_=" + (new Date()).getTime();
	      fetchDataSource(this, url);
	    } else if (typeof this.dataSource === "function") {
	      fetchDataSource(this, this.dataSource);
	    }
	  };

	  Chart.prototype.startRefresh = function startRefresh () {
	      var this$1$1 = this;

	    var refresh = this.options.refresh;

	    if (refresh && typeof this.dataSource !== "string" && typeof this.dataSource !== "function") {
	      throw new Error("Data source must be a URL or callback for refresh");
	    }

	    if (!this.intervalId) {
	      if (refresh) {
	        this.intervalId = setInterval( function () {
	          this$1$1.refreshData();
	        }, refresh * 1000);
	      } else {
	        throw new Error("No refresh interval");
	      }
	    }
	  };

	  Chart.prototype.stopRefresh = function stopRefresh () {
	    if (this.intervalId) {
	      clearInterval(this.intervalId);
	      this.intervalId = null;
	    }
	  };

	  Chart.prototype.toImage = function toImage (download) {
	    if (this.adapter === "chartjs") {
	      if (download && download.background && download.background !== "transparent") {
	        // https://stackoverflow.com/questions/30464750/chartjs-line-chart-set-background-color
	        var canvas = this.chart.canvas;
	        var ctx = this.chart.ctx;
	        var tmpCanvas = document.createElement("canvas");
	        var tmpCtx = tmpCanvas.getContext("2d");
	        tmpCanvas.width = ctx.canvas.width;
	        tmpCanvas.height = ctx.canvas.height;
	        tmpCtx.fillStyle = download.background;
	        tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
	        tmpCtx.drawImage(canvas, 0, 0);
	        return tmpCanvas.toDataURL("image/png");
	      } else {
	        return this.chart.toBase64Image();
	      }
	    } else {
	      throw new Error("Feature only available for Chart.js");
	    }
	  };

	  Chart.prototype.destroy = function destroy () {
	    this.destroyed = true;
	    this.stopRefresh();

	    if (this.__adapterObject) {
	      this.__adapterObject.destroy(this);
	    }

	    if (this.__enterEvent) {
	      removeEvent(this.element, "mouseover", this.__enterEvent);
	    }

	    if (this.__leaveEvent) {
	      removeEvent(this.element, "mouseout", this.__leaveEvent);
	    }
	  };

	  Chart.prototype.__updateOptions = function __updateOptions (options) {
	    var updateRefresh = options.refresh && options.refresh !== this.options.refresh;
	    this.options = merge(Chartkick.options, options);
	    if (updateRefresh) {
	      this.stopRefresh();
	      this.startRefresh();
	    }
	  };

	  Chart.prototype.__render = function __render () {
	    this.data = this.__processData();
	    renderChart(this.__chartName(), this);
	  };

	  Chart.prototype.__config = function __config () {
	    return config;
	  };

	  var LineChart = /*@__PURE__*/(function (Chart) {
	    function LineChart () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { LineChart.__proto__ = Chart; }
	    LineChart.prototype = Object.create( Chart && Chart.prototype );
	    LineChart.prototype.constructor = LineChart;

	    LineChart.prototype.__processData = function __processData () {
	      return processSeries(this);
	    };

	    LineChart.prototype.__chartName = function __chartName () {
	      return "LineChart";
	    };

	    return LineChart;
	  }(Chart));

	  var PieChart = /*@__PURE__*/(function (Chart) {
	    function PieChart () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { PieChart.__proto__ = Chart; }
	    PieChart.prototype = Object.create( Chart && Chart.prototype );
	    PieChart.prototype.constructor = PieChart;

	    PieChart.prototype.__processData = function __processData () {
	      return processSimple(this);
	    };

	    PieChart.prototype.__chartName = function __chartName () {
	      return "PieChart";
	    };

	    return PieChart;
	  }(Chart));

	  var ColumnChart = /*@__PURE__*/(function (Chart) {
	    function ColumnChart () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { ColumnChart.__proto__ = Chart; }
	    ColumnChart.prototype = Object.create( Chart && Chart.prototype );
	    ColumnChart.prototype.constructor = ColumnChart;

	    ColumnChart.prototype.__processData = function __processData () {
	      return processSeries(this, null, true);
	    };

	    ColumnChart.prototype.__chartName = function __chartName () {
	      return "ColumnChart";
	    };

	    return ColumnChart;
	  }(Chart));

	  var BarChart = /*@__PURE__*/(function (Chart) {
	    function BarChart () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { BarChart.__proto__ = Chart; }
	    BarChart.prototype = Object.create( Chart && Chart.prototype );
	    BarChart.prototype.constructor = BarChart;

	    BarChart.prototype.__processData = function __processData () {
	      return processSeries(this, null, true);
	    };

	    BarChart.prototype.__chartName = function __chartName () {
	      return "BarChart";
	    };

	    return BarChart;
	  }(Chart));

	  var AreaChart = /*@__PURE__*/(function (Chart) {
	    function AreaChart () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { AreaChart.__proto__ = Chart; }
	    AreaChart.prototype = Object.create( Chart && Chart.prototype );
	    AreaChart.prototype.constructor = AreaChart;

	    AreaChart.prototype.__processData = function __processData () {
	      return processSeries(this);
	    };

	    AreaChart.prototype.__chartName = function __chartName () {
	      return "AreaChart";
	    };

	    return AreaChart;
	  }(Chart));

	  var GeoChart = /*@__PURE__*/(function (Chart) {
	    function GeoChart () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { GeoChart.__proto__ = Chart; }
	    GeoChart.prototype = Object.create( Chart && Chart.prototype );
	    GeoChart.prototype.constructor = GeoChart;

	    GeoChart.prototype.__processData = function __processData () {
	      return processSimple(this);
	    };

	    GeoChart.prototype.__chartName = function __chartName () {
	      return "GeoChart";
	    };

	    return GeoChart;
	  }(Chart));

	  var ScatterChart = /*@__PURE__*/(function (Chart) {
	    function ScatterChart () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { ScatterChart.__proto__ = Chart; }
	    ScatterChart.prototype = Object.create( Chart && Chart.prototype );
	    ScatterChart.prototype.constructor = ScatterChart;

	    ScatterChart.prototype.__processData = function __processData () {
	      return processSeries(this, "number");
	    };

	    ScatterChart.prototype.__chartName = function __chartName () {
	      return "ScatterChart";
	    };

	    return ScatterChart;
	  }(Chart));

	  var BubbleChart = /*@__PURE__*/(function (Chart) {
	    function BubbleChart () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { BubbleChart.__proto__ = Chart; }
	    BubbleChart.prototype = Object.create( Chart && Chart.prototype );
	    BubbleChart.prototype.constructor = BubbleChart;

	    BubbleChart.prototype.__processData = function __processData () {
	      return processSeries(this, "bubble");
	    };

	    BubbleChart.prototype.__chartName = function __chartName () {
	      return "BubbleChart";
	    };

	    return BubbleChart;
	  }(Chart));

	  var Timeline = /*@__PURE__*/(function (Chart) {
	    function Timeline () {
	      Chart.apply(this, arguments);
	    }

	    if ( Chart ) { Timeline.__proto__ = Chart; }
	    Timeline.prototype = Object.create( Chart && Chart.prototype );
	    Timeline.prototype.constructor = Timeline;

	    Timeline.prototype.__processData = function __processData () {
	      var i, data = this.rawData;
	      for (i = 0; i < data.length; i++) {
	        data[i][1] = toDate(data[i][1]);
	        data[i][2] = toDate(data[i][2]);
	      }
	      return data;
	    };

	    Timeline.prototype.__chartName = function __chartName () {
	      return "Timeline";
	    };

	    return Timeline;
	  }(Chart));

	  var Chartkick = {
	    LineChart: LineChart,
	    PieChart: PieChart,
	    ColumnChart: ColumnChart,
	    BarChart: BarChart,
	    AreaChart: AreaChart,
	    GeoChart: GeoChart,
	    ScatterChart: ScatterChart,
	    BubbleChart: BubbleChart,
	    Timeline: Timeline,
	    charts: {},
	    configure: function (options) {
	      for (var key in options) {
	        if (options.hasOwnProperty(key)) {
	          config[key] = options[key];
	        }
	      }
	    },
	    setDefaultOptions: function (opts) {
	      Chartkick.options = opts;
	    },
	    eachChart: function (callback) {
	      for (var chartId in Chartkick.charts) {
	        if (Chartkick.charts.hasOwnProperty(chartId)) {
	          callback(Chartkick.charts[chartId]);
	        }
	      }
	    },
	    destroyAll: function() {
	      for (var chartId in Chartkick.charts) {
	        if (Chartkick.charts.hasOwnProperty(chartId)) {
	          Chartkick.charts[chartId].destroy();
	          delete Chartkick.charts[chartId];
	        }
	      }
	    },
	    config: config,
	    options: {},
	    adapters: adapters,
	    addAdapter: addAdapter,
	    use: function(adapter) {
	      addAdapter(adapter);
	      return Chartkick;
	    }
	  };

	  // not ideal, but allows for simpler integration
	  if (typeof window !== "undefined" && !window.Chartkick) {
	    window.Chartkick = Chartkick;

	    // clean up previous charts before Turbolinks loads new page
	    document.addEventListener("turbolinks:before-render", function() {
	      if (config.autoDestroy !== false) {
	        Chartkick.destroyAll();
	      }
	    });
	    document.addEventListener("turbo:before-render", function() {
	      if (config.autoDestroy !== false) {
	        Chartkick.destroyAll();
	      }
	    });

	    // use setTimeout so charting library can come later in same JS file
	    setTimeout(function() {
	      window.dispatchEvent(new Event("chartkick:load"));
	    }, 0);
	  }

	  // backwards compatibility for esm require
	  Chartkick.default = Chartkick;

	  return Chartkick;

	}));
	});

	var toStr = Object.prototype.toString;

	var isArguments = function isArguments(value) {
		var str = toStr.call(value);
		var isArgs = str === '[object Arguments]';
		if (!isArgs) {
			isArgs = str !== '[object Array]' &&
				value !== null &&
				typeof value === 'object' &&
				typeof value.length === 'number' &&
				value.length >= 0 &&
				toStr.call(value.callee) === '[object Function]';
		}
		return isArgs;
	};

	var keysShim;
	if (!Object.keys) {
		// modified from https://github.com/es-shims/es5-shim
		var has = Object.prototype.hasOwnProperty;
		var toStr$1 = Object.prototype.toString;
		var isArgs = isArguments; // eslint-disable-line global-require
		var isEnumerable = Object.prototype.propertyIsEnumerable;
		var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
		var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
		var dontEnums = [
			'toString',
			'toLocaleString',
			'valueOf',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'constructor'
		];
		var equalsConstructorPrototype = function (o) {
			var ctor = o.constructor;
			return ctor && ctor.prototype === o;
		};
		var excludedKeys = {
			$applicationCache: true,
			$console: true,
			$external: true,
			$frame: true,
			$frameElement: true,
			$frames: true,
			$innerHeight: true,
			$innerWidth: true,
			$onmozfullscreenchange: true,
			$onmozfullscreenerror: true,
			$outerHeight: true,
			$outerWidth: true,
			$pageXOffset: true,
			$pageYOffset: true,
			$parent: true,
			$scrollLeft: true,
			$scrollTop: true,
			$scrollX: true,
			$scrollY: true,
			$self: true,
			$webkitIndexedDB: true,
			$webkitStorageInfo: true,
			$window: true
		};
		var hasAutomationEqualityBug = (function () {
			/* global window */
			if (typeof window === 'undefined') { return false; }
			for (var k in window) {
				try {
					if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
						try {
							equalsConstructorPrototype(window[k]);
						} catch (e) {
							return true;
						}
					}
				} catch (e$1) {
					return true;
				}
			}
			return false;
		}());
		var equalsConstructorPrototypeIfNotBuggy = function (o) {
			/* global window */
			if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
				return equalsConstructorPrototype(o);
			}
			try {
				return equalsConstructorPrototype(o);
			} catch (e) {
				return false;
			}
		};

		keysShim = function keys(object) {
			var isObject = object !== null && typeof object === 'object';
			var isFunction = toStr$1.call(object) === '[object Function]';
			var isArguments = isArgs(object);
			var isString = isObject && toStr$1.call(object) === '[object String]';
			var theKeys = [];

			if (!isObject && !isFunction && !isArguments) {
				throw new TypeError('Object.keys called on a non-object');
			}

			var skipProto = hasProtoEnumBug && isFunction;
			if (isString && object.length > 0 && !has.call(object, 0)) {
				for (var i = 0; i < object.length; ++i) {
					theKeys.push(String(i));
				}
			}

			if (isArguments && object.length > 0) {
				for (var j = 0; j < object.length; ++j) {
					theKeys.push(String(j));
				}
			} else {
				for (var name in object) {
					if (!(skipProto && name === 'prototype') && has.call(object, name)) {
						theKeys.push(String(name));
					}
				}
			}

			if (hasDontEnumBug) {
				var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

				for (var k = 0; k < dontEnums.length; ++k) {
					if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
						theKeys.push(dontEnums[k]);
					}
				}
			}
			return theKeys;
		};
	}
	var implementation = keysShim;

	var slice = Array.prototype.slice;


	var origKeys = Object.keys;
	var keysShim$1 = origKeys ? function keys(o) { return origKeys(o); } : implementation;

	var originalKeys = Object.keys;

	keysShim$1.shim = function shimObjectKeys() {
		if (Object.keys) {
			var keysWorksWithArguments = (function () {
				// Safari 5.0 bug
				var args = Object.keys(arguments);
				return args && args.length === arguments.length;
			}(1, 2));
			if (!keysWorksWithArguments) {
				Object.keys = function keys(object) { // eslint-disable-line func-name-matching
					if (isArguments(object)) {
						return originalKeys(slice.call(object));
					}
					return originalKeys(object);
				};
			}
		} else {
			Object.keys = keysShim$1;
		}
		return Object.keys || keysShim$1;
	};

	var objectKeys = keysShim$1;

	/* eslint complexity: [2, 18], max-statements: [2, 33] */
	var shams = function hasSymbols() {
		if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
		if (typeof Symbol.iterator === 'symbol') { return true; }

		var obj = {};
		var sym = Symbol('test');
		var symObj = Object(sym);
		if (typeof sym === 'string') { return false; }

		if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
		if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

		// temp disabled per https://github.com/ljharb/object.assign/issues/17
		// if (sym instanceof Symbol) { return false; }
		// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
		// if (!(symObj instanceof Symbol)) { return false; }

		// if (typeof Symbol.prototype.toString !== 'function') { return false; }
		// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

		var symVal = 42;
		obj[sym] = symVal;
		for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
		if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

		if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

		var syms = Object.getOwnPropertySymbols(obj);
		if (syms.length !== 1 || syms[0] !== sym) { return false; }

		if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

		if (typeof Object.getOwnPropertyDescriptor === 'function') {
			var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
			if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
		}

		return true;
	};

	var shams$1 = function hasToStringTagShams() {
		return shams() && !!Symbol.toStringTag;
	};

	var origSymbol = typeof Symbol !== 'undefined' && Symbol;


	var hasSymbols = function hasNativeSymbols() {
		if (typeof origSymbol !== 'function') { return false; }
		if (typeof Symbol !== 'function') { return false; }
		if (typeof origSymbol('foo') !== 'symbol') { return false; }
		if (typeof Symbol('bar') !== 'symbol') { return false; }

		return shams();
	};

	/* eslint no-invalid-this: 1 */

	var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
	var slice$1 = Array.prototype.slice;
	var toStr$2 = Object.prototype.toString;
	var funcType = '[object Function]';

	var implementation$1 = function bind(that) {
	    var target = this;
	    if (typeof target !== 'function' || toStr$2.call(target) !== funcType) {
	        throw new TypeError(ERROR_MESSAGE + target);
	    }
	    var args = slice$1.call(arguments, 1);

	    var bound;
	    var binder = function () {
	        if (this instanceof bound) {
	            var result = target.apply(
	                this,
	                args.concat(slice$1.call(arguments))
	            );
	            if (Object(result) === result) {
	                return result;
	            }
	            return this;
	        } else {
	            return target.apply(
	                that,
	                args.concat(slice$1.call(arguments))
	            );
	        }
	    };

	    var boundLength = Math.max(0, target.length - args.length);
	    var boundArgs = [];
	    for (var i = 0; i < boundLength; i++) {
	        boundArgs.push('$' + i);
	    }

	    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

	    if (target.prototype) {
	        var Empty = function Empty() {};
	        Empty.prototype = target.prototype;
	        bound.prototype = new Empty();
	        Empty.prototype = null;
	    }

	    return bound;
	};

	var functionBind = Function.prototype.bind || implementation$1;

	var src = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

	var undefined$1;

	var $SyntaxError = SyntaxError;
	var $Function = Function;
	var $TypeError = TypeError;

	// eslint-disable-next-line consistent-return
	var getEvalledConstructor = function (expressionSyntax) {
		try {
			return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
		} catch (e) {}
	};

	var $gOPD = Object.getOwnPropertyDescriptor;
	if ($gOPD) {
		try {
			$gOPD({}, '');
		} catch (e) {
			$gOPD = null; // this is IE 8, which has a broken gOPD
		}
	}

	var throwTypeError = function () {
		throw new $TypeError();
	};
	var ThrowTypeError = $gOPD
		? (function () {
			try {
				// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
				arguments.callee; // IE 8 does not throw here
				return throwTypeError;
			} catch (calleeThrows) {
				try {
					// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
					return $gOPD(arguments, 'callee').get;
				} catch (gOPDthrows) {
					return throwTypeError;
				}
			}
		}())
		: throwTypeError;

	var hasSymbols$1 = hasSymbols();

	var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

	var needsEval = {};

	var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto(Uint8Array);

	var INTRINSICS = {
		'%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
		'%Array%': Array,
		'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
		'%ArrayIteratorPrototype%': hasSymbols$1 ? getProto([][Symbol.iterator]()) : undefined$1,
		'%AsyncFromSyncIteratorPrototype%': undefined$1,
		'%AsyncFunction%': needsEval,
		'%AsyncGenerator%': needsEval,
		'%AsyncGeneratorFunction%': needsEval,
		'%AsyncIteratorPrototype%': needsEval,
		'%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
		'%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
		'%Boolean%': Boolean,
		'%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
		'%Date%': Date,
		'%decodeURI%': decodeURI,
		'%decodeURIComponent%': decodeURIComponent,
		'%encodeURI%': encodeURI,
		'%encodeURIComponent%': encodeURIComponent,
		'%Error%': Error,
		'%eval%': eval, // eslint-disable-line no-eval
		'%EvalError%': EvalError,
		'%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
		'%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
		'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
		'%Function%': $Function,
		'%GeneratorFunction%': needsEval,
		'%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
		'%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
		'%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
		'%isFinite%': isFinite,
		'%isNaN%': isNaN,
		'%IteratorPrototype%': hasSymbols$1 ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
		'%JSON%': typeof JSON === 'object' ? JSON : undefined$1,
		'%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
		'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols$1 ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
		'%Math%': Math,
		'%Number%': Number,
		'%Object%': Object,
		'%parseFloat%': parseFloat,
		'%parseInt%': parseInt,
		'%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
		'%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
		'%RangeError%': RangeError,
		'%ReferenceError%': ReferenceError,
		'%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
		'%RegExp%': RegExp,
		'%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
		'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols$1 ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
		'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
		'%String%': String,
		'%StringIteratorPrototype%': hasSymbols$1 ? getProto(''[Symbol.iterator]()) : undefined$1,
		'%Symbol%': hasSymbols$1 ? Symbol : undefined$1,
		'%SyntaxError%': $SyntaxError,
		'%ThrowTypeError%': ThrowTypeError,
		'%TypedArray%': TypedArray,
		'%TypeError%': $TypeError,
		'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
		'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
		'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
		'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
		'%URIError%': URIError,
		'%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
		'%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
		'%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet
	};

	var doEval = function doEval(name) {
		var value;
		if (name === '%AsyncFunction%') {
			value = getEvalledConstructor('async function () {}');
		} else if (name === '%GeneratorFunction%') {
			value = getEvalledConstructor('function* () {}');
		} else if (name === '%AsyncGeneratorFunction%') {
			value = getEvalledConstructor('async function* () {}');
		} else if (name === '%AsyncGenerator%') {
			var fn = doEval('%AsyncGeneratorFunction%');
			if (fn) {
				value = fn.prototype;
			}
		} else if (name === '%AsyncIteratorPrototype%') {
			var gen = doEval('%AsyncGenerator%');
			if (gen) {
				value = getProto(gen.prototype);
			}
		}

		INTRINSICS[name] = value;

		return value;
	};

	var LEGACY_ALIASES = {
		'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
		'%ArrayPrototype%': ['Array', 'prototype'],
		'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
		'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
		'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
		'%ArrayProto_values%': ['Array', 'prototype', 'values'],
		'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
		'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
		'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
		'%BooleanPrototype%': ['Boolean', 'prototype'],
		'%DataViewPrototype%': ['DataView', 'prototype'],
		'%DatePrototype%': ['Date', 'prototype'],
		'%ErrorPrototype%': ['Error', 'prototype'],
		'%EvalErrorPrototype%': ['EvalError', 'prototype'],
		'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
		'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
		'%FunctionPrototype%': ['Function', 'prototype'],
		'%Generator%': ['GeneratorFunction', 'prototype'],
		'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
		'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
		'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
		'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
		'%JSONParse%': ['JSON', 'parse'],
		'%JSONStringify%': ['JSON', 'stringify'],
		'%MapPrototype%': ['Map', 'prototype'],
		'%NumberPrototype%': ['Number', 'prototype'],
		'%ObjectPrototype%': ['Object', 'prototype'],
		'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
		'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
		'%PromisePrototype%': ['Promise', 'prototype'],
		'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
		'%Promise_all%': ['Promise', 'all'],
		'%Promise_reject%': ['Promise', 'reject'],
		'%Promise_resolve%': ['Promise', 'resolve'],
		'%RangeErrorPrototype%': ['RangeError', 'prototype'],
		'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
		'%RegExpPrototype%': ['RegExp', 'prototype'],
		'%SetPrototype%': ['Set', 'prototype'],
		'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
		'%StringPrototype%': ['String', 'prototype'],
		'%SymbolPrototype%': ['Symbol', 'prototype'],
		'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
		'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
		'%TypeErrorPrototype%': ['TypeError', 'prototype'],
		'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
		'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
		'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
		'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
		'%URIErrorPrototype%': ['URIError', 'prototype'],
		'%WeakMapPrototype%': ['WeakMap', 'prototype'],
		'%WeakSetPrototype%': ['WeakSet', 'prototype']
	};



	var $concat = functionBind.call(Function.call, Array.prototype.concat);
	var $spliceApply = functionBind.call(Function.apply, Array.prototype.splice);
	var $replace = functionBind.call(Function.call, String.prototype.replace);
	var $strSlice = functionBind.call(Function.call, String.prototype.slice);
	var $exec = functionBind.call(Function.call, RegExp.prototype.exec);

	/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
	var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
	var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
	var stringToPath = function stringToPath(string) {
		var first = $strSlice(string, 0, 1);
		var last = $strSlice(string, -1);
		if (first === '%' && last !== '%') {
			throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
		} else if (last === '%' && first !== '%') {
			throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
		}
		var result = [];
		$replace(string, rePropName, function (match, number, quote, subString) {
			result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
		});
		return result;
	};
	/* end adaptation */

	var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
		var intrinsicName = name;
		var alias;
		if (src(LEGACY_ALIASES, intrinsicName)) {
			alias = LEGACY_ALIASES[intrinsicName];
			intrinsicName = '%' + alias[0] + '%';
		}

		if (src(INTRINSICS, intrinsicName)) {
			var value = INTRINSICS[intrinsicName];
			if (value === needsEval) {
				value = doEval(intrinsicName);
			}
			if (typeof value === 'undefined' && !allowMissing) {
				throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
			}

			return {
				alias: alias,
				name: intrinsicName,
				value: value
			};
		}

		throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
	};

	var getIntrinsic = function GetIntrinsic(name, allowMissing) {
		if (typeof name !== 'string' || name.length === 0) {
			throw new $TypeError('intrinsic name must be a non-empty string');
		}
		if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
			throw new $TypeError('"allowMissing" argument must be a boolean');
		}

		if ($exec(/^%?[^%]*%?$/, name) === null) {
			throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
		}
		var parts = stringToPath(name);
		var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

		var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
		var intrinsicRealName = intrinsic.name;
		var value = intrinsic.value;
		var skipFurtherCaching = false;

		var alias = intrinsic.alias;
		if (alias) {
			intrinsicBaseName = alias[0];
			$spliceApply(parts, $concat([0, 1], alias));
		}

		for (var i = 1, isOwn = true; i < parts.length; i += 1) {
			var part = parts[i];
			var first = $strSlice(part, 0, 1);
			var last = $strSlice(part, -1);
			if (
				(
					(first === '"' || first === "'" || first === '`')
					|| (last === '"' || last === "'" || last === '`')
				)
				&& first !== last
			) {
				throw new $SyntaxError('property names with quotes must have matching quotes');
			}
			if (part === 'constructor' || !isOwn) {
				skipFurtherCaching = true;
			}

			intrinsicBaseName += '.' + part;
			intrinsicRealName = '%' + intrinsicBaseName + '%';

			if (src(INTRINSICS, intrinsicRealName)) {
				value = INTRINSICS[intrinsicRealName];
			} else if (value != null) {
				if (!(part in value)) {
					if (!allowMissing) {
						throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
					}
					return void undefined$1;
				}
				if ($gOPD && (i + 1) >= parts.length) {
					var desc = $gOPD(value, part);
					isOwn = !!desc;

					// By convention, when a data property is converted to an accessor
					// property to emulate a data property that does not suffer from
					// the override mistake, that accessor's getter is marked with
					// an `originalValue` property. Here, when we detect this, we
					// uphold the illusion by pretending to see that original data
					// property, i.e., returning the value rather than the getter
					// itself.
					if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
						value = desc.get;
					} else {
						value = value[part];
					}
				} else {
					isOwn = src(value, part);
					value = value[part];
				}

				if (isOwn && !skipFurtherCaching) {
					INTRINSICS[intrinsicRealName] = value;
				}
			}
		}
		return value;
	};

	var callBind = createCommonjsModule(function (module) {




	var $apply = getIntrinsic('%Function.prototype.apply%');
	var $call = getIntrinsic('%Function.prototype.call%');
	var $reflectApply = getIntrinsic('%Reflect.apply%', true) || functionBind.call($call, $apply);

	var $gOPD = getIntrinsic('%Object.getOwnPropertyDescriptor%', true);
	var $defineProperty = getIntrinsic('%Object.defineProperty%', true);
	var $max = getIntrinsic('%Math.max%');

	if ($defineProperty) {
		try {
			$defineProperty({}, 'a', { value: 1 });
		} catch (e) {
			// IE 8 has a broken defineProperty
			$defineProperty = null;
		}
	}

	module.exports = function callBind(originalFunction) {
		var func = $reflectApply(functionBind, $call, arguments);
		if ($gOPD && $defineProperty) {
			var desc = $gOPD(func, 'length');
			if (desc.configurable) {
				// original length, plus the receiver, minus any additional arguments (after the receiver)
				$defineProperty(
					func,
					'length',
					{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
				);
			}
		}
		return func;
	};

	var applyBind = function applyBind() {
		return $reflectApply(functionBind, $apply, arguments);
	};

	if ($defineProperty) {
		$defineProperty(module.exports, 'apply', { value: applyBind });
	} else {
		module.exports.apply = applyBind;
	}
	});
	var callBind_1 = callBind.apply;

	var $indexOf = callBind(getIntrinsic('String.prototype.indexOf'));

	var callBound = function callBoundIntrinsic(name, allowMissing) {
		var intrinsic = getIntrinsic(name, !!allowMissing);
		if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
			return callBind(intrinsic);
		}
		return intrinsic;
	};

	var hasToStringTag = shams$1();


	var $toString = callBound('Object.prototype.toString');

	var isStandardArguments = function isArguments(value) {
		if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
			return false;
		}
		return $toString(value) === '[object Arguments]';
	};

	var isLegacyArguments = function isArguments(value) {
		if (isStandardArguments(value)) {
			return true;
		}
		return value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			$toString(value) !== '[object Array]' &&
			$toString(value.callee) === '[object Function]';
	};

	var supportsStandardArguments = (function () {
		return isStandardArguments(arguments);
	}());

	isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

	var isArguments$1 = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

	var $defineProperty = getIntrinsic('%Object.defineProperty%', true);

	var hasPropertyDescriptors = function hasPropertyDescriptors() {
		if ($defineProperty) {
			try {
				$defineProperty({}, 'a', { value: 1 });
				return true;
			} catch (e) {
				// IE 8 has a broken defineProperty
				return false;
			}
		}
		return false;
	};

	hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
		// node v0.6 has a bug where array lengths can be Set but not Defined
		if (!hasPropertyDescriptors()) {
			return null;
		}
		try {
			return $defineProperty([], 'length', { value: 1 }).length !== 1;
		} catch (e) {
			// In Firefox 4-22, defining length on an array throws an exception.
			return true;
		}
	};

	var hasPropertyDescriptors_1 = hasPropertyDescriptors;

	var hasSymbols$2 = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

	var toStr$3 = Object.prototype.toString;
	var concat = Array.prototype.concat;
	var origDefineProperty = Object.defineProperty;

	var isFunction = function (fn) {
		return typeof fn === 'function' && toStr$3.call(fn) === '[object Function]';
	};

	var hasPropertyDescriptors$1 = hasPropertyDescriptors_1();

	var supportsDescriptors = origDefineProperty && hasPropertyDescriptors$1;

	var defineProperty = function (object, name, value, predicate) {
		if (name in object && (!isFunction(predicate) || !predicate())) {
			return;
		}
		if (supportsDescriptors) {
			origDefineProperty(object, name, {
				configurable: true,
				enumerable: false,
				value: value,
				writable: true
			});
		} else {
			object[name] = value; // eslint-disable-line no-param-reassign
		}
	};

	var defineProperties = function (object, map) {
		var predicates = arguments.length > 2 ? arguments[2] : {};
		var props = objectKeys(map);
		if (hasSymbols$2) {
			props = concat.call(props, Object.getOwnPropertySymbols(map));
		}
		for (var i = 0; i < props.length; i += 1) {
			defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
		}
	};

	defineProperties.supportsDescriptors = !!supportsDescriptors;

	var defineProperties_1 = defineProperties;

	var numberIsNaN = function (value) {
		return value !== value;
	};

	var implementation$2 = function is(a, b) {
		if (a === 0 && b === 0) {
			return 1 / a === 1 / b;
		}
		if (a === b) {
			return true;
		}
		if (numberIsNaN(a) && numberIsNaN(b)) {
			return true;
		}
		return false;
	};

	var polyfill = function getPolyfill() {
		return typeof Object.is === 'function' ? Object.is : implementation$2;
	};

	var shim = function shimObjectIs() {
		var polyfill$1 = polyfill();
		defineProperties_1(Object, { is: polyfill$1 }, {
			is: function testObjectIs() {
				return Object.is !== polyfill$1;
			}
		});
		return polyfill$1;
	};

	var polyfill$1 = callBind(polyfill(), Object);

	defineProperties_1(polyfill$1, {
		getPolyfill: polyfill,
		implementation: implementation$2,
		shim: shim
	});

	var objectIs = polyfill$1;

	var hasToStringTag$1 = shams$1();
	var has$1;
	var $exec$1;
	var isRegexMarker;
	var badStringifier;

	if (hasToStringTag$1) {
		has$1 = callBound('Object.prototype.hasOwnProperty');
		$exec$1 = callBound('RegExp.prototype.exec');
		isRegexMarker = {};

		var throwRegexMarker = function () {
			throw isRegexMarker;
		};
		badStringifier = {
			toString: throwRegexMarker,
			valueOf: throwRegexMarker
		};

		if (typeof Symbol.toPrimitive === 'symbol') {
			badStringifier[Symbol.toPrimitive] = throwRegexMarker;
		}
	}

	var $toString$1 = callBound('Object.prototype.toString');
	var gOPD = Object.getOwnPropertyDescriptor;
	var regexClass = '[object RegExp]';

	var isRegex = hasToStringTag$1
		// eslint-disable-next-line consistent-return
		? function isRegex(value) {
			if (!value || typeof value !== 'object') {
				return false;
			}

			var descriptor = gOPD(value, 'lastIndex');
			var hasLastIndexDataProperty = descriptor && has$1(descriptor, 'value');
			if (!hasLastIndexDataProperty) {
				return false;
			}

			try {
				$exec$1(value, badStringifier);
			} catch (e) {
				return e === isRegexMarker;
			}
		}
		: function isRegex(value) {
			// In older browsers, typeof regex incorrectly returns 'function'
			if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
				return false;
			}

			return $toString$1(value) === regexClass;
		};

	var functionsHaveNames = function functionsHaveNames() {
		return typeof function f() {}.name === 'string';
	};

	var gOPD$1 = Object.getOwnPropertyDescriptor;
	if (gOPD$1) {
		try {
			gOPD$1([], 'length');
		} catch (e) {
			// IE 8 has a broken gOPD
			gOPD$1 = null;
		}
	}

	functionsHaveNames.functionsHaveConfigurableNames = function functionsHaveConfigurableNames() {
		if (!functionsHaveNames() || !gOPD$1) {
			return false;
		}
		var desc = gOPD$1(function () {}, 'name');
		return !!desc && !!desc.configurable;
	};

	var $bind = Function.prototype.bind;

	functionsHaveNames.boundFunctionsHaveNames = function boundFunctionsHaveNames() {
		return functionsHaveNames() && typeof $bind === 'function' && function f() {}.bind().name !== '';
	};

	var functionsHaveNames_1 = functionsHaveNames;

	var implementation$3 = createCommonjsModule(function (module) {

	var functionsHaveConfigurableNames = functionsHaveNames_1.functionsHaveConfigurableNames();

	var $Object = Object;
	var $TypeError = TypeError;

	module.exports = function flags() {
		if (this != null && this !== $Object(this)) {
			throw new $TypeError('RegExp.prototype.flags getter called on non-object');
		}
		var result = '';
		if (this.hasIndices) {
			result += 'd';
		}
		if (this.global) {
			result += 'g';
		}
		if (this.ignoreCase) {
			result += 'i';
		}
		if (this.multiline) {
			result += 'm';
		}
		if (this.dotAll) {
			result += 's';
		}
		if (this.unicode) {
			result += 'u';
		}
		if (this.sticky) {
			result += 'y';
		}
		return result;
	};

	if (functionsHaveConfigurableNames && Object.defineProperty) {
		Object.defineProperty(module.exports, 'name', { value: 'get flags' });
	}
	});

	var supportsDescriptors$1 = defineProperties_1.supportsDescriptors;
	var $gOPD$1 = Object.getOwnPropertyDescriptor;

	var polyfill$2 = function getPolyfill() {
		if (supportsDescriptors$1 && (/a/mig).flags === 'gim') {
			var descriptor = $gOPD$1(RegExp.prototype, 'flags');
			if (
				descriptor
				&& typeof descriptor.get === 'function'
				&& typeof RegExp.prototype.dotAll === 'boolean'
				&& typeof RegExp.prototype.hasIndices === 'boolean'
			) {
				/* eslint getter-return: 0 */
				var calls = '';
				var o = {};
				Object.defineProperty(o, 'hasIndices', {
					get: function () {
						calls += 'd';
					}
				});
				Object.defineProperty(o, 'sticky', {
					get: function () {
						calls += 'y';
					}
				});
				if (calls === 'dy') {
					return descriptor.get;
				}
			}
		}
		return implementation$3;
	};

	var supportsDescriptors$2 = defineProperties_1.supportsDescriptors;

	var gOPD$2 = Object.getOwnPropertyDescriptor;
	var defineProperty$1 = Object.defineProperty;
	var TypeErr = TypeError;
	var getProto$1 = Object.getPrototypeOf;
	var regex = /a/;

	var shim$1 = function shimFlags() {
		if (!supportsDescriptors$2 || !getProto$1) {
			throw new TypeErr('RegExp.prototype.flags requires a true ES5 environment that supports property descriptors');
		}
		var polyfill = polyfill$2();
		var proto = getProto$1(regex);
		var descriptor = gOPD$2(proto, 'flags');
		if (!descriptor || descriptor.get !== polyfill) {
			defineProperty$1(proto, 'flags', {
				configurable: true,
				enumerable: false,
				get: polyfill
			});
		}
		return polyfill;
	};

	var flagsBound = callBind(polyfill$2());

	defineProperties_1(flagsBound, {
		getPolyfill: polyfill$2,
		implementation: implementation$3,
		shim: shim$1
	});

	var regexp_prototype_flags = flagsBound;

	var getDay = Date.prototype.getDay;
	var tryDateObject = function tryDateGetDayCall(value) {
		try {
			getDay.call(value);
			return true;
		} catch (e) {
			return false;
		}
	};

	var toStr$4 = Object.prototype.toString;
	var dateClass = '[object Date]';
	var hasToStringTag$2 = shams$1();

	var isDateObject = function isDateObject(value) {
		if (typeof value !== 'object' || value === null) {
			return false;
		}
		return hasToStringTag$2 ? tryDateObject(value) : toStr$4.call(value) === dateClass;
	};

	var getTime = Date.prototype.getTime;

	function deepEqual(actual, expected, options) {
	  var opts = options || {};

	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (opts.strict ? objectIs(actual, expected) : actual === expected) {
	    return true;
	  }

	  // 7.3. Other pairs that do not both pass typeof value == 'object', equivalence is determined by ==.
	  if (!actual || !expected || (typeof actual !== 'object' && typeof expected !== 'object')) {
	    return opts.strict ? objectIs(actual, expected) : actual == expected;
	  }

	  /*
	   * 7.4. For all other Object pairs, including Array objects, equivalence is
	   * determined by having the same number of owned properties (as verified
	   * with Object.prototype.hasOwnProperty.call), the same set of keys
	   * (although not necessarily the same order), equivalent values for every
	   * corresponding key, and an identical 'prototype' property. Note: this
	   * accounts for both named and indexed properties on Arrays.
	   */
	  // eslint-disable-next-line no-use-before-define
	  return objEquiv(actual, expected, opts);
	}

	function isUndefinedOrNull(value) {
	  return value === null || value === undefined;
	}

	function isBuffer(x) {
	  if (!x || typeof x !== 'object' || typeof x.length !== 'number') {
	    return false;
	  }
	  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
	    return false;
	  }
	  if (x.length > 0 && typeof x[0] !== 'number') {
	    return false;
	  }
	  return true;
	}

	function objEquiv(a, b, opts) {
	  /* eslint max-statements: [2, 50] */
	  var i, key;
	  if (typeof a !== typeof b) { return false; }
	  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) { return false; }

	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) { return false; }

	  if (isArguments$1(a) !== isArguments$1(b)) { return false; }

	  var aIsRegex = isRegex(a);
	  var bIsRegex = isRegex(b);
	  if (aIsRegex !== bIsRegex) { return false; }
	  if (aIsRegex || bIsRegex) {
	    return a.source === b.source && regexp_prototype_flags(a) === regexp_prototype_flags(b);
	  }

	  if (isDateObject(a) && isDateObject(b)) {
	    return getTime.call(a) === getTime.call(b);
	  }

	  var aIsBuffer = isBuffer(a);
	  var bIsBuffer = isBuffer(b);
	  if (aIsBuffer !== bIsBuffer) { return false; }
	  if (aIsBuffer || bIsBuffer) { // && would work too, because both are true or both false here
	    if (a.length !== b.length) { return false; }
	    for (i = 0; i < a.length; i++) {
	      if (a[i] !== b[i]) { return false; }
	    }
	    return true;
	  }

	  if (typeof a !== typeof b) { return false; }

	  try {
	    var ka = objectKeys(a);
	    var kb = objectKeys(b);
	  } catch (e) { // happens when one is a string literal and the other isn't
	    return false;
	  }
	  // having the same number of owned properties (keys incorporates hasOwnProperty)
	  if (ka.length !== kb.length) { return false; }

	  // the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  // ~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i]) { return false; }
	  }
	  // equivalent values for every corresponding key, and ~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!deepEqual(a[key], b[key], opts)) { return false; }
	  }

	  return true;
	}

	var deepEqual_1 = deepEqual;

	var isMergeableObject = function isMergeableObject(value) {
		return isNonNullObject(value)
			&& !isSpecial(value)
	};

	function isNonNullObject(value) {
		return !!value && typeof value === 'object'
	}

	function isSpecial(value) {
		var stringValue = Object.prototype.toString.call(value);

		return stringValue === '[object RegExp]'
			|| stringValue === '[object Date]'
			|| isReactElement(value)
	}

	// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
	var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
	var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

	function isReactElement(value) {
		return value.$$typeof === REACT_ELEMENT_TYPE
	}

	function emptyTarget(val) {
		return Array.isArray(val) ? [] : {}
	}

	function cloneUnlessOtherwiseSpecified(value, options) {
		return (options.clone !== false && options.isMergeableObject(value))
			? deepmerge(emptyTarget(value), value, options)
			: value
	}

	function defaultArrayMerge(target, source, options) {
		return target.concat(source).map(function(element) {
			return cloneUnlessOtherwiseSpecified(element, options)
		})
	}

	function getMergeFunction(key, options) {
		if (!options.customMerge) {
			return deepmerge
		}
		var customMerge = options.customMerge(key);
		return typeof customMerge === 'function' ? customMerge : deepmerge
	}

	function getEnumerableOwnPropertySymbols(target) {
		return Object.getOwnPropertySymbols
			? Object.getOwnPropertySymbols(target).filter(function(symbol) {
				return target.propertyIsEnumerable(symbol)
			})
			: []
	}

	function getKeys(target) {
		return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
	}

	function propertyIsOnObject(object, property) {
		try {
			return property in object
		} catch(_) {
			return false
		}
	}

	// Protects from prototype poisoning and unexpected merging up the prototype chain.
	function propertyIsUnsafe(target, key) {
		return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
			&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
				&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
	}

	function mergeObject(target, source, options) {
		var destination = {};
		if (options.isMergeableObject(target)) {
			getKeys(target).forEach(function(key) {
				destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
			});
		}
		getKeys(source).forEach(function(key) {
			if (propertyIsUnsafe(target, key)) {
				return
			}

			if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
				destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
			} else {
				destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
			}
		});
		return destination
	}

	function deepmerge(target, source, options) {
		options = options || {};
		options.arrayMerge = options.arrayMerge || defaultArrayMerge;
		options.isMergeableObject = options.isMergeableObject || isMergeableObject;
		// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
		// implementations can use it. The caller may not replace it.
		options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

		var sourceIsArray = Array.isArray(source);
		var targetIsArray = Array.isArray(target);
		var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

		if (!sourceAndTargetTypesMatch) {
			return cloneUnlessOtherwiseSpecified(source, options)
		} else if (sourceIsArray) {
			return options.arrayMerge(target, source, options)
		} else {
			return mergeObject(target, source, options)
		}
	}

	deepmerge.all = function deepmergeAll(array, options) {
		if (!Array.isArray(array)) {
			throw new Error('first argument should be an array')
		}

		return array.reduce(function(prev, next) {
			return deepmerge(prev, next, options)
		}, {})
	};

	var deepmerge_1 = deepmerge;

	var cjs = deepmerge_1;

	var chartId = 1;

	var createComponent = function(Vue, tagName, chartType) {
	  var chartProps = [
	    "adapter", "bytes", "code", "colors", "curve", "dataset", "decimal", "discrete", "donut", "download", "label",
	    "legend", "library", "max", "messages", "min", "points", "precision", "prefix", "refresh",
	    "round", "stacked", "suffix", "thousands", "title", "xmax", "xmin", "xtitle", "ytitle", "zeros"
	  ];
	  Vue.component(tagName, {
	    props: ["data", "id", "width", "height"].concat(chartProps),
	    render: function(createElement) {
	      return createElement(
	        "div",
	        {
	          attrs: {
	            id: this.chartId
	          },
	          style: this.chartStyle
	        },
	        ["Loading..."]
	      )
	    },
	    data: function() {
	      return {
	        chartId: null
	      }
	    },
	    computed: {
	      chartStyle: function() {
	        // hack to watch data and options
	        this.data;
	        this.chartOptions;

	        return {
	          height: this.height || "300px",
	          lineHeight: this.height || "300px",
	          width: this.width || "100%",
	          textAlign: "center",
	          color: "#999",
	          fontSize: "14px",
	          fontFamily: "'Lucida Grande', 'Lucida Sans Unicode', Verdana, Arial, Helvetica, sans-serif"
	        }
	      },
	      chartOptions: function() {
	        var options = {};
	        var props = chartProps;
	        for (var i = 0; i < props.length; i++) {
	          var prop = props[i];
	          if (this[prop] !== undefined) {
	            options[prop] = this[prop];
	          }
	        }
	        return options
	      }
	    },
	    created: function() {
	      this.chartId = this.chartId || this.id || ("chart-" + chartId++);
	    },
	    mounted: function() {
	      this.updateChart();
	      this.savedState = this.currentState();
	    },
	    updated: function() {
	      // avoid updates when literal objects are used as props
	      // see https://github.com/ankane/vue-chartkick/pull/52
	      // and https://github.com/vuejs/vue/issues/4060
	      var currentState = this.currentState();
	      if (!deepEqual_1(currentState, this.savedState)) {
	        this.updateChart();
	        this.savedState = currentState;
	      }
	    },
	    beforeDestroy: function() {
	      if (this.chart) {
	        this.chart.destroy();
	      }
	    },
	    methods: {
	      updateChart: function() {
	        if (this.data !== null) {
	          if (this.chart) {
	            this.chart.updateData(this.data, this.chartOptions);
	          } else {
	            this.chart = new chartType(this.chartId, this.data, this.chartOptions);
	          }
	        } else if (this.chart) {
	          this.chart.destroy();
	          this.chart = null;
	          this.$el.innerText = "Loading...";
	        }
	      },
	      currentState: function() {
	        return cjs({}, {
	          data: this.data,
	          chartOptions: this.chartOptions
	        })
	      }
	    }
	  });
	};

	chartkick.version = "0.6.1"; // TODO remove in future versions
	chartkick.install = function(Vue, options) {
	  if (options && options.adapter) {
	    chartkick.addAdapter(options.adapter);
	  }
	  createComponent(Vue, "line-chart", chartkick.LineChart);
	  createComponent(Vue, "pie-chart", chartkick.PieChart);
	  createComponent(Vue, "column-chart", chartkick.ColumnChart);
	  createComponent(Vue, "bar-chart", chartkick.BarChart);
	  createComponent(Vue, "area-chart", chartkick.AreaChart);
	  createComponent(Vue, "scatter-chart", chartkick.ScatterChart);
	  createComponent(Vue, "geo-chart", chartkick.GeoChart);
	  createComponent(Vue, "timeline", chartkick.Timeline);
	};

	var VueChartkick = chartkick;

	// in browser
	if (typeof window !== "undefined" && window.Vue) {
	  window.Vue.use(VueChartkick);
	}

	return VueChartkick;

})));

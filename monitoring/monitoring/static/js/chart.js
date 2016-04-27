var printSummaryChart = function(chart_data) {
  var chart_data = chart_data;

  if(chart_data.length < 1) return false;

  var plot = $.plot("#realtime_chart", [chart_data], {
    grid: {
      backgroundColor: '#ffffff',
    },
    series: {
      lines: {
        show: true,
        fill: true,
        lineWidth: 2
      }
    },
    xaxis: {
      mode: "time",
      timezone: "browser",
      minTickSize: [24, "hour"],
      tickFormatter: function() {
        return "";
      }
    },
    yaxis: {
      tickFormatter: function() {
        return "";
      }
    },
    colors: ['#0748aa'],
    legend: {
      show: false
    }
  });
};

var printChart = function(chart_data) {
  var chart_data = chart_data;

  if(chart_data.length < 1) return false;

  var plot = $.plot("#placeholder", [chart_data], {
    grid: {
      borderColor: '#dbdbdb',
      color: '#dbdbdb',
      borderWidth: 1,
      labelMargin: 10,
      backgroundColor: '#ffffff',
      clickable: true,
      hoverable: true,
      markings: markWeekend
    },
    series: {
      lines: {
        show: true,
        fill: true,
        lineWidth: 2
      },
      points: { show: true }
    },
    tooltip: true,
    tooltipOpts: {
      content: '%x, %y',
      shifts: {
        x: 20,
        y: 0
      },
      defaultTheme: false
    },
    xaxis: {
      mode: "time",
      timezone: "browser",
      timeformat: "%Y-%m-%d",
      minTickSize: [24, "hour"]
    },
    yaxis: {
      min: 0,
      tickFormatter: function(val, axis) {
        return numberWithCommas(val);
      }
    },
    legend: {
      show: true,
      position: 'nw'
    },
    colors: ['#0748aa'],
  });

  $("#placeholder").bind("plothover", function (event, pos, item) {

    var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
    $("#hoverdata").text(str);

    if (item) {
      var x = item.datapoint[0].toFixed(2),
        y = item.datapoint[1].toFixed(2);

      $("#tooltip").html(numberWithCommas(parseInt(y)) + '<br/>' + timeConverter(x))
        .css({top: item.pageY+5, left: item.pageX+5})
        .fadeIn(200);
    } else {
      $("#tooltip").hide();
    }
  });

  $("#placeholder").bind("plotclick", function (event, pos, item) {
    if (item) {
      $("#clickdata").text(" - click point " + item.dataIndex + " in " + item.series.label);
      plot.highlight(item.series, item.datapoint);
    }
  });

  // Add the Flot version string to the footer

  $("#footer").prepend("Flot " + $.plot.version + " &ndash; ");
};

$( "#day_from" ).datepicker({ dateFormat: "yy-mm-dd" });
$( "#day_until" ).datepicker({ dateFormat: "yy-mm-dd" });

$('#notice_form').submit(function(e) {
  $('#from').val(timestampConverter($('#day_from').val(), $('#time_from').val()));
  $('#until').val(timestampConverter($('#day_until').val(), $('#time_until').val()));
});

$("<div id='tooltip'></div>").css({
  position: "absolute",
  display: "none",
  padding: "10px",
  "background-color": "#000",
  opacity: 0.80,
  color: "#fff",
  "text-align": "right"
}).appendTo("body");

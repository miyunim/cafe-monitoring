var printChartByItem = function(chart_data) {
  var chart_data = chart_data;

  if(chart_data.length < 1) return false;

  var plot = $.plot("#bar_placeholder", [chart_data], {
    grid: {
      borderColor: '#dbdbdb',
      color: '#dbdbdb',
      borderWidth: 1,
      labelMargin: 10,
      backgroundColor: '#ffffff',
      clickable: true,
      hoverable: true,
    },
    series: {
      bars: {
        show: true,
        barWidth: 0.5,
        align: 'center',
        horizontal: true,
      }
    },
    tooltip: true,
    tooltipOpts: {
      content: '%x, %y',
      defaultTheme: false
    },
    xaxis: {
      tickFormatter: function(val, axis) {
        return numberWithCommas(val);
      }
    },
    yaxis: {
      mode: "categories",
    },
    legend: {
      show: true,
      position: 'ne'
    },
    colors: ['#0748aa'],
  });

  $("#bar_placeholder").bind("plothover", function (event, pos, item) {

    var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
    $("#hoverdata").text(str);

    if (item) {
      var x = item.datapoint[0].toFixed(2),
        y = item.datapoint[1].toFixed(2);

      $("#tooltip").html(numberWithCommas(parseInt(x)))
        .css({top: item.pageY+5, left: item.pageX+5})
        .fadeIn(200);
    } else {
      $("#tooltip").hide();
    }
  });

  $.each($('.flot-x-axis .tickLabel'), function(index, label) {
    var label = $(label).text();
    $(this).text(label.replace('com.example.appname.', ''));
  });

  $("#bar_placeholder").bind("plotclick", function (event, pos, item) {
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

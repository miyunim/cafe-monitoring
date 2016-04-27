$(function($) {
  var getData = function() {
    $.ajax({
      type: 'GET',
      url: './',
      dataType: 'json',
      data: {
        'from': $('#from').val(),
        'until': timestampConverter(timeConverter($.now()).split(' ')[0], '23:59'),
        'unit': $('#unit').val()
      },
      success: function(response) {
        //var val = numberWithCommas(parseInt(response.total));
        var val = parseInt(response.total);
        var beforeCounter = parseInt($('#txt_total_val_before').val());

        $({Counter: beforeCounter }).animate({ Counter: parseInt(val) }, {
          duration: 1000,
          easing: 'swing',
          step: function() {
            $('.realtime-total-val .counter').text(numberWithCommas(Math.ceil(this.Counter)));
          },
          complete: function() {
            $('.realtime-total-val .counter').text(numberWithCommas(this.Counter));
            $('#txt_total_val_before').val(this.Counter);
          }
        });
        setTimeout(getData, 5000);
      },
      error: function(error) {

      }
    });
  };

  getData();
});

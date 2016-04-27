function numberWithCommas(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function timeConverter(UNIX_timestamp){
  var a = new Date(parseInt(UNIX_timestamp));

  var year = a.getFullYear();
  var month = (a.getMonth() + 1 < 10) ? '0' + (a.getMonth() + 1): a.getMonth() + 1;
  var date = (a.getDate() < 10) ? '0' + a.getDate(): a.getDate();
  var hour = (a.getHours() < 10) ? '0' + a.getHours(): a.getHours();
  var min = (a.getMinutes() < 10) ? '0' + a.getMinutes(): a.getMinutes();

  return year + '-' + month + '-' + date + ' ' + hour + ':' + min;
}

function timestampConverter(strDate, strTime){
 var datum = Date.parse(strDate + ' ' + strTime);
 return datum/1000;
}

function markWeekend(axes) {
  var markings = [],
      d = new Date(axes.xaxis.min);

  // go to the first Saturday
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7));
  d.setSeconds(0);
  d.setMinutes(0);
  d.setHours(0);

  var i = d.getTime();
  do {
    markings.push({xaxis: {from: i, to: i + 2 * 24 * 60 * 60 * 1000}});
    i += 7 * 24 * 60 * 60 * 1000;
  } while (i < axes.xaxis.max);

  return markings;
}

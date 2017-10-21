
(function() {
  $('#btnSearch').on('click', findCities);

  var loader = $('<div></div>')
                .addClass('loaderWrapper')
                .append("<div class='loader'></div>");

  function findCities() {
    var searchString = $('#inputSearch').val();
    var url = 'http://api.openweathermap.org/data/2.5/find?q=' +
              encodeURIComponent(searchString) + '&units=metric&lang=ru&APPID=8341812113eb234cc63caae1a067b88c';

    $('.results').html('').append(loader);

    $.get( url, function(data) {
      createCityList(data.list); 
    })
    .fail(function() {
      showAlertMessage('Похоже произошла какая-то ошибка. Попробуйте повторить поиск.')
    })
    .always(function() {
      $('.loaderWrapper').remove();
    });
  }

  function showAlertMessage(text) {
    var dismissBtn = $("<button></button>")
                      .addClass('close')
                      .attr({
                        type: 'button',
                        'data-dismiss': 'alert',
                        'aria-label': 'Close',
                      })
                      .append($("<span aria-hidden='true'>&times;</span>"));
    var alert = $("<div></div>")
                .addClass('alert alert-warning')
                .attr({role: 'alert'})
                .append(dismissBtn)
                .append(text);
    $("<div></div>")
    .addClass('col-md-6 col-md-offset-3')
    .append(alert)
    .appendTo('.results');
  }

  function createCityList(data) {
    $('.results').html('');

    data.forEach(function(city) {
      var imgFlagLink = "https://github.com/hjnilsson/country-flags/blob/master/png100px/"
                        + city.sys.country.toLowerCase() + ".png?raw=true";
      var img = $("<img>")
                  .addClass('countryFlag thumbnail center-block mg-top-21 img-responsive')
                  .attr({src: imgFlagLink});
      var col1 = $("<div></div>")
                  .addClass('col-md-1 col-xs-3 col-md-offset-1')
                  .append(img);
      var cityNameLink = $("<a></a>")
                          .text(city.name + ' ')
                          .attr({
                            href: '#'
                            })
                          .on('click', {id: city.id}, buildFullWeatherInfo);
      var cityTemp = $("<span></span>")
                      .addClass('badge')
                      .text(city.main.temp + '°C');
      var h3 = $("<h3></h3>")
                .append([cityNameLink, cityTemp]);

      var description = $("<p></p>")
                          .text('Температура от ' + city.main.temp_min + ' до ' 
                            + city.main.temp_max + '°C, скорость ветра ' + city.wind.speed
                            + 'м/с, облачность ' + city.clouds.all + '%, '
                            + city.weather[0].description + '.');
      var cityCoordLink = $("<a></a>")
                            .attr({href: '#'})
                            .text(city.coord.lat + ' : ' + city.coord.lon)
                            .wrap('<p></p>');
      var col2 = $("<div></div>")
                          .addClass('col-md-8 col-xs-9')
                          .append([h3, description, cityCoordLink]);
      var row = $("<div></div>")
                  .addClass('row')
                  .append([col1, col2]);
      row.appendTo('.results');
    });
  }

  function buildFullWeatherInfo(event) {
    getCityWeather(event);
    createTabs();
    // getCityForecast(event);
  }

  function getCityForecast(event) {
    var url = 'http://api.openweathermap.org/data/2.5/forecast?id='
              + event.data.id + '&units=metric&lang=ru&APPID=8341812113eb234cc63caae1a067b88c';

    $('.results').html('').append(loader);

    $.get(url, function(data) {
      createCityForecastChart(data);
    })
    .fail(function() {
      alert('fail');
    })
    .always(function() {
      $('.loaderWrapper').remove();
    });
  }

  function createTabs() {
    var link = $('<a></a>').
            attr({
              'href': '#main',
              'aria-controls': 'main',
              'role': 'tab',
              'data-toggle': 'tab'
            })
            .text('Main');
    var li = $('<li></li>')
          .attr({
            'class': 'active',
            'role': 'presentation',
          })
          .append(link);
    var ul = $('<ul></ul>')
          .attr({
            'class': 'nav nav-tabs',
            'role': 'tablist',
          })
          .append(li);
    var tab = $('<div></div>')
                .attr({
                  'id': 'main',
                  'class': 'tab-pane fade active',
                  'role': 'tabpanel',
                });
    var tabContent = $('<div></div>')
                      .addClass('tab-content')
                      .append(tab);
    var col = $('<div></div>')
                .addClass('col-md-8')
                .append([ul, tabContent]);

    console.log(col);
    $('.results').append(col);
  }

  function createCityForecastChart(cityData) {
    
  }

  function getCityWeather(event) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?id='
              + event.data.id + '&units=metric&lang=ru&APPID=8341812113eb234cc63caae1a067b88c';
    
    $('.results').html('').append(loader);   

    $.get(url, function(data) {
      createCityWeatherPanel(data);
    })
    .fail(function() {
      alert('fail');
    })
    .always(function() {
      $('.loaderWrapper').remove();
    });
  }

  function createCityWeatherPanel(cityData) {

    var weatherTable = createWeatherTable(cityData);
    var h4 = $('<h4></h4>')
              .append('<strong></strong>')
              .find('strong').text('Погода в городе ' + cityData.name + ', '
                                   + cityData.sys.country)
              .end();
    var panelHeading = $('<div></div>')
                      .addClass('panel-heading')
                      .append(h4);
    var p_temp = $('<p></p>')
                  .addClass('temp')
                  .text(cityData.main.temp.toString().split('.')[0] + '°C, '
                          + cityData.weather[0].description);
    var p_data = $('<p></p>')
                  .addClass('date')
                  .text(formatTime(cityData.dt));
    var panelBody = $('<div></div>')
                      .addClass('panel-body')
                      .append([p_temp, p_data]);
    var panel = $('<div></div>')
                  .addClass('panel panel-default')
                  .append([panelHeading, panelBody, weatherTable]);
    var colWrapper = $('<div></div>')
                      .addClass('col-md-4')
                      .append(panel);

    $('.results').append(colWrapper);

  }

  function createWeatherTable(cityData) {
    var infoTable = {
      'Скорость ветра': cityData.wind.speed + ' м/с',
      'Облачность': cityData.clouds.all + ' %',
      'Давление': cityData.main.pressure + ' Па',
      'Влажность': cityData.main.humidity + ' %',
      'Восход': formatTime(cityData.sys.sunrise),
      'Закат': formatTime(cityData.sys.sunset),
      'Координаты': cityData.coord.lat + ' : ' + cityData.coord.lon,
    }
    var tr = $('<tr></tr>').append('<th></th><td></td>');
    var table = $('<table></table>')
                  .addClass('table table-bordered')
                  .append('<tbody></tbody>');
    for (key in infoTable) {
    var clone_tr = tr.clone();
    clone_tr.find('th').text(key).end().find('td').text(infoTable[key]);      
    table.find('tbody').append(clone_tr);
    }
    return table;
  }

  function formatTime(milliseconds) {
    var date = new Date(milliseconds*1000);
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();

    if (hours.length == 1) {
      hours = '0' + hours
    }
    
    if (minutes.length == 1) {
      minutes = '0' + minutes;
    }

    return hours + ':' + minutes;

  }
})();


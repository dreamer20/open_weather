'use strict';
(function() {
  $('#btnSearch').on('click', findCities);

  var loader = $('<div></div>')
                .addClass('loader-wrapper main-loader')
                .append("<div class='loader'></div>");

  function findCities() {
    var searchString = $('#inputSearch').val();
    var url = 'http://api.openweathermap.org/data/2.5/find?q=' 
              + encodeURIComponent(searchString) 
              + '&units=metric&lang=ru&APPID=8341812113eb234cc63caae1a067b88c';

    $('.results').html('').append(loader);

    $.get( url, function(data) {
      createCityList(data.list); 
    })
    .fail(function() {
      showAlertMessage('Похоже произошла какая-то ошибка. Попробуйте повторить поиск.')
    })
    .always(function() {
      $('.main-loader').remove();
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
                      .text(formatTemperature(city.main.temp) + '°C');
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
    var col1 = $('<div></div>')
                .addClass('col-md-4 weather');
    var col2 = $('<div></div>')
                .addClass('col-md-8 forecast');
                
    $('.results').html('').append([col1, col2]);
    getCityWeather(event);
    getCityForecast(event);
  }

  function getCityForecast(event) {
    var url = 'http://api.openweathermap.org/data/2.5/forecast?id='
              + event.data.id + '&units=metric&lang=ru&APPID=8341812113eb234cc63caae1a067b88c';

    $('.forecast').html('').append(loader.clone().addClass('forecast-loader'));

    $.get(url, function(data) {
      createTabs();
      createCityForecastChart(data);
    })
    .fail(function() {
      alert('fail');
    })
    .always(function() {
      $('.forecast-loader').remove();
    });
  }

  function createTabs() {

    var tabsList = {
      '24hours': 'За 24 часа',
      '5days': 'Пятидневный прогноз',
      'hourly': 'Почасовой прогноз',
    };

    var ul = $('<ul></ul>')
          .attr({
            'class': 'nav nav-tabs',
            'role': 'tablist',
          });
    var tabContent = $('<div></div>')
                      .addClass('tab-content');
    for (var key in tabsList) {
    var link = $('<a></a>').
            attr({
              'href': '#' + key,
              'aria-controls': key,
              'role': 'tab',
              'data-toggle': 'tab'
            })
            .text(tabsList[key]);
    var li = $('<li></li>')
          .attr({
            'class': (key == '24hours') ? 'active' : '',
            'role': 'presentation',
          })
          .append(link)
          .appendTo(ul);      

    var tab = $('<div></div>')
                .attr({
                  'id': key,
                  'class': 'tab-pane fade active' + ((key == '24hours') ? ' in' : ''),
                  'role': 'tabpanel',
                }).appendTo(tabContent);
    }


    $('.forecast').append([ul, tabContent]);

  }

  function createCityForecastChart(cityData) {
    var temperatureData = [];
    var temperatureHours = [];
    var date = [];
    for (var i = 0; i < 10; i++) {
      var dt = formatUTCTime(cityData.list[i].dt);
      date.push(dt.date);
      temperatureData.push(formatTemperature(cityData.list[i].main.temp));
      temperatureHours.push(dt.time);
    }

    $('<canvas></canvas>')
      .attr({
        'id': 'chart',
        'width': 400,
        'height': 150,
      }).appendTo('.tab-content #24hours');
      
    var ctx = $('#chart');

    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: temperatureHours,
        datasets: [{
          label: 'Температура',
          data: temperatureData,
          backgroundColor: 'rgb(255, 99, 132, 0)',
        }]
      },
      options: {
        tooltips: {

          callbacks: {
            title: function(tooltipsItems, data) {
              return date[tooltipsItems[0].index];
            },
            label: function(tooltipsItem, data) {
              return data.datasets[0].label + ': ' 
                      + data.datasets[0].data[tooltipsItem.index] + '°C';
            }
          }
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Время'
            },
          }],        
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Темература °C'
            },
            ticks: {
              beginAtZero: true,
              suggestedMin: -10,
              suggentedMax: 20,   
            },
          }],
        }
      }
    });

  }

  function getCityWeather(event) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?id='
              + event.data.id + '&units=metric&lang=ru&APPID=8341812113eb234cc63caae1a067b88c';
    
    $('.weather').html('').append(loader.clone().addClass('weather-loader'));   

    $.get(url, function(data) {
      createCityWeatherPanel(data);
    })
    .fail(function() {
      alert('fail');
    })
    .always(function() {
      $('.weather-loader').remove();
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
                  .text(formatTemperature(cityData.main.temp) + '°C, '
                          + cityData.weather[0].description);
    var p_data = $('<p></p>')
                  .addClass('date')
                  .text(formatUTCTime(cityData.dt).date);
    var panelBody = $('<div></div>')
                      .addClass('panel-body')
                      .append([p_temp, p_data]);
    var panel = $('<div></div>')
                  .addClass('panel panel-default')
                  .append([panelHeading, panelBody, weatherTable]);

    $('.weather').append(panel);

  }

  function createWeatherTable(cityData) {
    var infoTable = {
      'Скорость ветра': cityData.wind.speed + ' м/с',
      'Облачность': cityData.clouds.all + ' %',
      'Давление': cityData.main.pressure + ' Па',
      'Влажность': cityData.main.humidity + ' %',
      'Восход': formatUTCTime(cityData.sys.sunrise).time,
      'Закат': formatUTCTime(cityData.sys.sunset).time,
      'Координаты': cityData.coord.lat + ' : ' + cityData.coord.lon,
    }
    var tr = $('<tr></tr>').append('<th></th><td></td>');
    var table = $('<table></table>')
                  .addClass('table table-bordered')
                  .append('<tbody></tbody>');
    for (var key in infoTable) {
    var clone_tr = tr.clone();
    clone_tr.find('th').text(key).end().find('td').text(infoTable[key]);      
    table.find('tbody').append(clone_tr);
    }
    return table;
  }

  function formatUTCTime(milliseconds) {
    var date = new Date(milliseconds*1000);
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var month = (date.getMonth() + 1).toString();
    var dayOfMonth = date.getDate().toString();
    var year = date.getYear().toString();
    if (hours.length == 1) {
      hours = '0' + hours
    }
    
    if (minutes.length == 1) {
      minutes = '0' + minutes;
    }

    if (month.length == 1) {
      month = '0' + month;
    }

    if (dayOfMonth.length == 1) {
      dayOfMonth = '0' + dayOfMonth
    }

    return {
      time: [hours, minutes].join(':'),
      date: [dayOfMonth, month, year].join('.'),
    };
  }

  function formatForecastTime(forecastTime) {
    var time = {};
    time.date = forecastTime.split(' ')[0];
    time.time = forecastTime.split(' ')[1];

    if (time.time[0] == '0') {
      time.time = time.time.slice(1);
    }

    return time;
    }
  

  function formatTemperature(temp) {
    return temp.toString().split('.')[0];
  }
})();

var ctx = $('#chart');

    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [1,2,3,4,6,7],
        datasets: [{
          label: 'Температура',
          data: [2,53,31,33,55],
          backgroundColor: 'rgb(255, 99, 132, 0)',
        }]
      },
      options: {
        tooltips: {

          callbacks: {
            title: function(tooltipsItems, data) {
              console.log(data);
            },
            label: function(tooltipsItem, data) {
              return data.datasets[0].label + ': ' + data.datasets[0].data[tooltipsItem.index] + '°C';
            }
          }
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Время'
            },
          }],        
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Темература °C'
            },
            ticks: {
              beginAtZero: true,
              suggestedMin: -10,
              suggentedMax: 20,   
            },
          }],
        }
      }
    });
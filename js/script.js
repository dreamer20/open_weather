'use strict';
(function() {
  $('#btnSearch').on('click', findCities);
  $('#inputSearch').on('keydown', function(event) {
    if (event.keyCode == 13) {
      findCities();
    } 
  });

  var resultsLoader = new Loader('.results');


  function findCities() {
    var searchString = $('#inputSearch').val();
    var url = 'http://api.openweathermap.org/data/2.5/find?q=' 
              + encodeURIComponent(searchString) 
              + '&units=metric&lang=ru&APPID=8341812113eb234cc63caae1a067b88c';

    resultsLoader.start();

    $.get( url, function(data) {
      createCityList(data.list); 
    })
    .fail(function() {
      showAlertMessage('Похоже произошла какая-то ошибка. Попробуйте повторить поиск.')
    })
    .always(function() {
      resultsLoader.stop();
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

    var forecastLoader = new Loader('.forecast');
    forecastLoader.start();
    $.get(url, function(data) {
      createTabs();
      create24hForecastChart(data);
      createdailyForecastChart(data);
      createHourlyForecastTable(data);
    })
    .fail(function() {
      alert('fail');
    })
    .always(function() {
     forecastLoader.stop()
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

  function create24hForecastChart(cityData) {
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
        'id': '24hChart',
        'width': 400,
        'height': 150,
      }).appendTo('.tab-content #24hours');
      
    var ctx = $('#24hChart');

    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: temperatureHours,
        datasets: [{
          label: 'Температура',
          data: temperatureData,
          fill: false,
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

  function createdailyForecastChart(cityData) {
    
    var temp = [];
    var temperatureData = {
      max: [],
      min: [],
    };
    
    var date = [];
    var dt = formatUTCTime(cityData.list[0].dt);
    var currentDate = dt.date;
    date.push(dt.date);
    for (var i = 0; i < cityData.list.length; i++) {
      dt = formatUTCTime(cityData.list[i].dt);
      temp.push(cityData.list[i].main.temp);
      if (currentDate != dt.date) {
        currentDate = dt.date;
        date.push(dt.date)

        var maxTemp = Math.max.apply(null, temp);
        var minTemp = Math.min.apply(null, temp);
        
        temperatureData.max.push(formatTemperature(maxTemp));
        temperatureData.min.push(formatTemperature(minTemp));
        
        temp = [];
      }

      if (i == cityData.list.length-1 && dt.time != '00:00') {
        var maxTemp = Math.max.apply(null, temp);
        var minTemp = Math.min.apply(null, temp);
        console.log(maxTemp, minTemp);
        temperatureData.max.push(formatTemperature(maxTemp));
        temperatureData.min.push(formatTemperature(minTemp));
        Window.temp = temp;
        console.log(temp);
        temp = [];     
      }
    }
    

    $('<canvas></canvas>')
      .attr({
        'id': '5dChart',
        'width': 400,
        'height': 150,
      }).appendTo('.tab-content #5days');
      
    var ctx = $('#5dChart');

    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: date,
        datasets: [{
          label: 'Максимальная температура (День)',
          data: temperatureData.max,
          fill: 1,
          backgroundColor: 'rgb(81, 113, 145, 0.5)',
          borderColor: 'rgb(81, 113, 145, 0.5)',
        },{
          label: 'Минимальная температура (Ночь)',
          data: temperatureData.min,
          fill: false,
        }]
      },
      options: {
        tooltips: {

          callbacks: {
            title: function(tooltipsItems, data) {
              return date[tooltipsItems[0].index];
            },
            label: function(tooltipsItem, data) {
              return data.datasets[tooltipsItem.datasetIndex].label + ': ' 
                      + data.datasets[tooltipsItem.datasetIndex].data[tooltipsItem.index] + '°C';
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

  function createHourlyForecastTable(cityData) {

    var table = $('<table></table>')
                  .addClass('table table-hover hourly');
    var tbody = $('<tbody></tbody>');

    var dt = formatUTCTime(cityData.list[0].dt);
    var currentDate = dt.date;
    var dataHeaderRow = createTableDataHeaderRow(currentDate);
    tbody.append(dataHeaderRow);
    for (var i = 1; i < cityData.list.length; i++) {
      dt = formatUTCTime(cityData.list[i].dt);
      
      if (currentDate != dt.date) {
        currentDate = dt.date;
        dataHeaderRow = createTableDataHeaderRow(currentDate);
        tbody.append(dataHeaderRow);
      }

      var dataRow = createTableDataRow(dt.time, cityData.list[i])

      tbody.append(dataRow);
    }

    table.append(tbody);

    $('#hourly').append(table);

    function createTableDataHeaderRow(date) {
      var h4 = $('<h4></h4>').text(date);
      var th = $('<th></th>').append(h4);
      var tr = $('<tr></tr>')
                .addClass('no-hover')
                .append(th);

      return tr;
    }

    function createTableDataRow(time, hour) {
    var th = $('<th></th>')
                .addClass('hourly-time')
                .text(time);
    var div1 = $('<div></div>')
                .append('<div class="badge">' + hour.main.temp +'°C </div> ')
                .append(hour.weather[0].description);
    var div2 = $('<div></div>')
                .text(hour.wind.speed + 'м/с, облачность: ' + hour.clouds.all + '%, ' 
                  + 'влажность: ' + hour.main.humidity + '%');
    var td = $('<td></td>')
              .append([div1, div2]);
    var tr = $('<tr></tr>').append([th, td]);

    return tr;
    }
  }

  function getCityWeather(event) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?id='
              + event.data.id + '&units=metric&lang=ru&APPID=8341812113eb234cc63caae1a067b88c';
    
    var weatherLoader = new Loader('.weather');
    weatherLoader.start(); 

    $.get(url, function(data) {
      createCityWeatherPanel(data);
    })
    .fail(function() {
      alert('fail');
    })
    .always(function() {
      weatherLoader.stop();
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
    var year = date.getFullYear().toString();
    
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
          label: 'max',
          data: [30,53,31,33,55],
          borderColor: 'rgb(81, 113, 145, 0.5)',
          backgroundColor: 'rgb(44, 62, 80, 0.5)',
          fill: 1, 
        },
        {
          label: 'min',
          data: [20, 15, 28, 30, 25],
          // borderColor: 'rgb(135, 195, 255)',
          // backgroundColor: 'rgb(135, 195, 255)',
          fill: false,
        }
        ]
      },
      options: {
        tooltips: {

          callbacks: {
            title: function(tooltipsItems, data) {
              // console.log(data);
            },
            label: function(tooltipsItem, data) {
              console.log(tooltipsItem, data)
              return data.datasets[tooltipsItem.datasetIndex].label + ': ' + data.datasets[tooltipsItem.datasetIndex].data[tooltipsItem.index] + '°C';
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
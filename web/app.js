var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var request = require('request');

var indexRouter = require('./routes/index');
var locationRouter = require('./routes/locations');

if (process.argv.includes('--reconstruct-table')) {
  console.log('Reconstructing tables');
  var Mongo = require('mongodb').MongoClient;
  Mongo.connect('mongodb://localhost:27017').then((client, err) => {
    if (err) {
      console.log('Could not connect to local database');
      return;
    }
    console.log('Connected to local database');
    var places = client.db('visitleuven').collection('places');
    places.remove({});
    console.log('Cleared local database');
    getPlaces((err, res, body) => {
      if (err) {
        console.log('Could not get places from TDMS: ' + err);
        return;
      }
      var json = JSON.parse(body);
      console.log('Got places from TDMS, adding them to local database');
      places.insertMany(json.filter(place => {
        console.log(place);
        if (!place.hasOwnProperty('metadata')) {
          return false;
        }
        var metadata = place.metadata;
        if (!(metadata.hasOwnProperty('id') && metadata.hasOwnProperty('name'))) {
          return false;
        }
        if (!place.hasOwnProperty('location_info')) {
          return false;
        }
        var locationInfo = place.location_info;
        if (!locationInfo.hasOwnProperty('address')) {
          return false;
        }
        var address = locationInfo.address;
        if (!address.hasOwnProperty('geolocation')) {
          return false;
        }
        var geolocation = address.geolocation;
        return geolocation.hasOwnProperty('lat') && geolocation.hasOwnProperty('lon');
      }).map(place => {
        return {
          id: place.metadata.id,
          name: place.metadata.name,
          lat: place.location_info.address.geolocation.lat,
          long: place.location_info.address.geolocation.lon,
          audio: ''
        };
      }), (err, result) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('Inserted relevant places');
        client.close();
      });
      // var obj = {
      //   id: json[0].metadata.id,
      //   name: json[0].metadata.name,
      //   lat: json[0].location_info.address.geolocation.lat,
      //   long: json[0].location_info.address.geolocation.lon
      // };
      // var arr = [JSON.stringify(obj)];
      // for (var i = 7; i < json.length; i++) {
      //   arr.push(JSON.stringify({ id: json[i].metadata.id, name: json[i].metadata.name, lat: json[i].location_info.address.geolocation.lat, long: json[i].location_info.address.geolocation.lon }));
      // }
      return;
    });
  });
}

function getPlaces(callback) {
  console.log('Requesting access token');
  var tokenUrl = 'https://api-leuven-tdms-prod.tbnlabs.be/oauth/v2/token?client_id=hackaton&client_secret=RT63dnfe7KBJaDwv&grant_type=client_credentials';
  request(tokenUrl, (tokenErr, tokenRes, tokenBody) => {
    var accessToken = JSON.parse(tokenBody).access_token;
    console.log('Received access token');
    var placesUrl = 'http://api-leuven-tdms-prod.tbnlabs.be/api/v1?access_token=' + accessToken + '&format=json&size=50';
    request(placesUrl, callback);
  })
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/locations', locationRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

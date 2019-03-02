var express = require('express');
var Mongo = require('mongodb').MongoClient;
var router = express.Router();

Mongo.connect('mongodb://localhost:27017').then((client, err) => {
  if (err) {
    console.log(err)
  } else {
    var places = client.db('visitleuven').collection('places');

    router.get('/place/:placeId', function(req, res, next) {
      var placeId = req.params.placeId;
      places.find({'id': Number(placeId)}).toArray((err, places) => {
        console.log(placeId + ': ' + places);
        if (err) {
          console.log(err);
        }
        res.send(places[0]);
      })
    });

    /* GET nearest location. */
    router.get('/nearby', function (req, res, next) {
      var lat = Number(req.query['lat']);
      var long = Number(req.query['long']);
      places.find().toArray((err, places) => {
        if (err) {
          console.log(err);
        } else {
          res.send(places.filter(place => {
            return getDistanceFromLatLonInKm(lat, long, place.lat, place.long) < 0.1;
          }).sort((placeA, placeB) => {
            var distancePlaceA = getDistanceFromLatLonInKm(lat, long, placeA.lat, placeA.long);
            var distancePlaceB = getDistanceFromLatLonInKm(lat, long, placeB.lat, placeB.long);
            return distancePlaceA - distancePlaceB;
          }).map(place => {
            place.distance = getDistanceFromLatLonInKm(lat, long, place.lat, place.long);
            return place;
          }));
        }
      });
    });
  }
});

// Below taken from: https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

module.exports = router;

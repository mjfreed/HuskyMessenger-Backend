//express is the framework we're going to use to handle requests
const express = require('express');
//Create a new instance of express
const app = express();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhttp = new XMLHttpRequest();
var xhttp2 = new XMLHttpRequest();
let db = require('../utilities/utils').db;

var link = "https://api.darksky.net/forecast/c37d7103858d1eb3c90fb52c534a1839/";
var test = "https://maps.googleapis.com/maps/api/geocode/json?address=" //95131
var key = "&key=AIzaSyAyo9c4PmK4xV-tkiUTTJngkqu9daQIWOw";

var router = express.Router();


//Returns lat and long of a zip code.
router.post("/getWeatherZip", (req, res) => {
    let zipcode = req.body['zipcode'];
    zipcode = zipcode.substring(0,5);

    xhttp.open("GET", test + zipcode + key);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var googleResponse = JSON.parse(this.responseText);
            var out = googleResponse.results;
            var temp = JSON.stringify(out);
            var abc = temp.substring(1, temp.length - 1);
            var finalInfo = JSON.parse(abc);
            console.log(finalInfo.geometry.bounds.northeast);
            var lat1 = finalInfo.geometry.bounds.northeast.lat;
            var long1 = finalInfo.geometry.bounds.northeast.lng;

            if(lat1 == null || long1 == null) {
                res.send({ success:false});

            }else {
                res.send({ lat: lat1, long:long1 });

            }
        }
    };
});


//Gets all weather info for a lat long location.
router.post("/getWeather", (req, res) => {
    let lat = req.body['lat'];
    let long = req.body['long'];

    var link2 = link + lat + "," + long;
    console.log(link2);
    xhttp2.open("GET", link2);
    xhttp2.send();

    xhttp2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var weatherInfo = JSON.parse(this.responseText);
            var current = weatherInfo.currently;
            var hourly = weatherInfo.hourly;
            var daily = weatherInfo.daily;
            res.send({ allInfo: weatherInfo, current: current, hourly: hourly, daily: daily });
            console.log("here");
        }
    };
});

//Saves weather location lat long to database.
router.post("/addWeatherLocation", (req, res) => {

    let username = req.body['username'];
    let city = req.body['city'];
    let lat = req.body['lat'];
    let long = req.body['long'];
    let query = "Insert into zips(username, city, lat, long) values ('" + username + "',' "+city+"',' "+lat+"',' "+long+"')";
    console.log(query);
    db.none(query)
        .then((rows) => {
            res.send({
                success: true,
            })
        }).catch((err) => {
            res.send({
                success: false,
            })
        });

});

//Gets all saved locations for a username.
router.post("/getWeatherLocations", (req, res) => {

    let username = req.body['username'];

    let query = "Select * from zips where username='" + username + "'";

    db.manyOrNone(query)
    .then((rows) => {
        res.send({
            data:rows,
            success: true,
        })
    }).catch((err) => {
        res.send({
            success: false,
        })
    });


});








module.exports = router;
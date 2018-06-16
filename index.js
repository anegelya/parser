const http = require('http');
const { parse } = require('querystring');
var colors = require('colors');


var ssl = require('ssl-root-cas').inject();

var request = require('request');
var fs = require('fs');
var nodemailer = require('nodemailer');
var googleMapsClient = require('@google/maps').createClient({
    Promise: Promise,
    key: 'AIzaSyB0m93p7v5XDVZtvpS7ZpSvAM9BURmyQcA'
});
var emails = [];
var promises = [];

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    // lookingFor();

    const server = http.createServer((req, res) => {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); // convert Buffer to string
            });
            req.on('end', () => {
                var obj = parse(body);
                console.log(obj);
                lookingFor(Number(obj.lat), Number(obj.lng))
                
                res.end('ok');
            });
        }
        else {
            res.end(`
                <!doctype html>
                <html>
                                
                <style>
                /* Always set the map height explicitly to define the size of the div
                * element that contains the map. */
                #map {
                    height: 100%;
                }
                /* Optional: Makes the sample page fill the window. */
                html, body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
                </style>
                <body>
                    <div id="map"></div>
                    <form action="/" method="post">
                        <input type="text" name="lat" id="lat"/><br />
                        <input type="text" name="lng" id="lng"/><br />
                        <button>Save</button>
                    </form>
                </body>
                <script>
                    var map;
                    function initMap() {
                        var map = new google.maps.Map(document.getElementById('map'), {
                          zoom: 15,
                          center: {lat: 41.41153020638758, lng: 2.20210717866928 }
                        });
                        var lat = document.querySelector("#lat");
                        var lng = document.querySelector("#lng");
                      
                        map.addListener('click', function(e) {
                          placeMarkerAndPanTo(e.latLng, map);
                          lat.value = e.latLng.toJSON().lat;
                          lng.value = e.latLng.toJSON().lng;
                        });
                      }
                      
                      function placeMarkerAndPanTo(latLng, map) {
                        var marker = new google.maps.Marker({
                          position: latLng,
                          map: map
                        });

                        console.log(latLng.toJSON());
                        // map.panTo(latLng);
                      }
                    </script>
                    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB0m93p7v5XDVZtvpS7ZpSvAM9BURmyQcA&callback=initMap"
                    async defer></script>
                </html>
            `);
        }
    });
    server.listen(3000,function() {
        console.log('Server unning in http://localhost:3000'.bgGreen);
    });

    function lookingFor(lat, lng) {
        googleMapsClient.placesRadar({
            keyword: 'boda',
            location: [lat, lng],
            radius: 5000,
            type: ''
        }, function(err, response){
            response.json.results.forEach(result => {
                if(result.place_id) {
                    googleMapsClient.place({
                        placeid: result.place_id
                    }, function(err, resp) {
                        var URL = resp.json.result.website;
                        request(URL, function (err, res, body) {
                            if (err) console.log(err);
                            if(body) {
                                var result = body.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                                if(result) {
                                    result.forEach(email => {
                                        if(email) {
                                            console.log(email);
                                            // fs.appendFileSync('emails.txt', result+ ', ');
                                            dbo.collection('emails').update({'email': email}, {'email': email,
                                                                                            'isSend': false}, {upsert: true}, function(err, result) {
                                                if(err) console.log(err);
                                                // console.log(result);
                                                db.close;
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
            });
        }
    );
}
});



var smtpConfig = {
    host: 'mail.ukraine.com.ua',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'info@kavananich.com',
        pass: 'vH5fV1oh31BO'
    }
};

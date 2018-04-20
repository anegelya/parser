require('ssl-root-cas').inject();

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

googleMapsClient.placesRadar({
        location: [41.459642, 2.251449],
        radius: 5000,
        type: 'hotel'
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
										dbo.collection('emails').update({'email': email}, {'email': email}, {upsert: true}, function(err, result) {
											if(err) throw err;
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

// // setup e-mail data with unicode symbols
// var mailOptions = {
//     from: 'info@kavananich.com <info@kavananich.com>', // sender address
//     to: 'a.negelya@windowslive.com', // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello world ?', // plaintext body
//     html: '<b>Hello world ?</b>' // html body
// };

// var transporter = nodemailer.createTransport(smtpConfig);

// // send mail with defined transport object
// transporter.sendMail(mailOptions, function(error, info){
//     if(error){
//         return console.log(error);
//     }
//     console.log('Message sent: ' + info.response);
// });

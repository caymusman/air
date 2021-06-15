var express = require("express");
var app = express();

require('url').URL;

dotenv = require('dotenv').config()
let myKey = process.env.REACT_APP_API_KEY;
let timeKey = process.env.REACT_APP_TIMEZONE_KEY;

const fetch = require("node-fetch");

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
})

app.get("/api/geo/:input", (req, res) => {
  //required because node-fetch doesn't support Unicode fetch.
  let url = new URL('http://api.openweathermap.org/geo/1.0/direct?q=' + sanitize(req.params.input) + '&limit=5&appid=' + myKey)
  fetch(url)
  .then(response => response.json())
  .then(json => res.send(json));
})

app.get("/api/air/:lat/:lon", (req, res) => {
  fetch('http://api.openweathermap.org/data/2.5/air_pollution?lat=' + req.params.lat + '&lon=' + req.params.lon + '&appid=' + myKey)
  .then(response => response.json())
  .then(json => res.send(json));
})

app.get("/api/time/:lat/:lon", (req, res) => {
  fetch('http://api.timezonedb.com/v2.1/get-time-zone?key=' + timeKey + '&format=json&by=position&lat=' + req.params.lat + "&lng= +" + req.params.lon)
  .then(response => response.json())
  .then(response => res.send(response))
  .catch(err => console.log("The server time error: " + err));
})

app.use(express.static(__dirname + '/public'));


app.get("*", (req, res) => {
  res.status(404);
  res.redirect("/")
})

let port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Listening on port ' + port);
});


function sanitize(input){
  let regex = /^([a-zA-Z\u0080-\u024F]+(?:\. |-| |'))*[a-zA-Z\u0080-\u024F]*$/;
  return regex.test(input) ? input : "error";
}
var express = require("express");
var app = express();

dotenv = require('dotenv').config()
let myKey = process.env.REACT_APP_API_KEY;
let timeKey = process.env.REACT_APP_TIMEZONE_KEY;

const fetch = require("node-fetch");

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
})

app.get("/api/geo/:input", (req, res) => {
  fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + req.params.input + '&limit=5&appid=' + myKey)
  .then(response => response.json())
  .then(json => {
    res.send(json)});
})

app.get("/api/air/:lat/:lon", (req, res) => {
  console.log("inside air get");
  fetch('http://api.openweathermap.org/data/2.5/air_pollution?lat=' + req.params.lat + '&lon=' + req.params.lon + '&appid=' + myKey)
  .then(response => response.json())
  .then(json => res.send(json));
})

app.get("/api/time/:lat/:lon", (req, res) => {
  console.log("inside time");
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
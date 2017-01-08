/**
 * Created by Ashwin on 1/6/2017.
 */

// Import: Twit, API keys, request
var Twit = require('twit');
var config = require('./config');
var request = require("request");
var schedule = require('node-schedule');

// Authenticate API keys and create new Twit object
var T = new Twit(config);

// Schedule a new tweet every day at 12:01 PM
schedule.scheduleJob({hour: 00, minute: 01}, function(){

    // Create date every day and format it for the api url call
    var d = new Date();
    var date = d.getFullYear() + "-" + padDigits(d.getUTCMonth() + 1, 2) + "-" +  padDigits(d.getDay() + 1, 2);

    // Insert new date into the url
    var url = "http://api.wordnik.com:80/v4/words.json/wordOfTheDay?date=" + date + "&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";

    sendTweets(url);
});


function sendTweets(url) {
    // Make a request to the Wordnik API for word of the day
    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var text = (date + ": \"" + body.word + "\" (" + body.definitions[0].partOfSpeech +  ") - " + body.definitions[0].text); // Print the json response
            tweetSomething(text);
            console.log("Just tweeted:\n", text);
        }
    });
}

function tweetSomething(text) {
    var tweet = {
        status: text
    };

    T.post('statuses/update', tweet, function (err, data, response) {
        console.log(data);
    });
}

function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}
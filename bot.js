/**
 * Created by Ashwin on 1/6/2017.
 */

process.env['access_token'] = "817642973819125760-SeertG9oMmI4qRNeVbf2d6fPy1JHqMM";
process.env['access_token_secret'] = "DQuJitMbwQNhGGut1ceT1XPNLqEEX43sqYqlTjjNwnpQE";
process.env['consumer_key'] = "5b1RGsfmljoaoIr3kywC1Mdde";
process.env['consumer_secret'] = "LQB0szxg9qqJ24iyJkXthuNwG5hQr9wCO40vueiOkKdoU8dwie";

// Import: Twit, API keys, request
var Twit = require('twit');
var config = require('./config');
var request = require("request");
var schedule = require('node-schedule');

// Authenticate API keys and create new Twit object
var T = new Twit(config);

setInterval(sendTweets, 1000*60*60*24);


function sendTweets() {

    // Create date every day and format it for the api url call
    var d = new Date();
    var date = d.getFullYear() + "-" + padDigits(d.getUTCMonth() + 1, 2) + "-" +  padDigits(d.getDate(), 2);

    // Insert new date into the url
    var url = "http://api.wordnik.com:80/v4/words.json/wordOfTheDay?date=" + date + "&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";


    // Make a request to the Wordnik API for word of the day
    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            var text = (date + ": \"" + body.word + "\" (" + body.definitions[0].partOfSpeech +  ") - " + body.definitions[0].text); // Print the json response
            tweetSomething(text);
            console.log("Just tweeted:\n" + text);
        }
    });
}

function tweetSomething(text) {
    var tweet = {
        status: text
    };

    // If tweet exceeds the 140 character limit, split the tweet and finish it in a reply chain
    if (tweet.status.length > 140){
        var otherHalf = " " + tweet.status.substring(140);
        tweet.status = tweet.status.substring(0,140);

        T.post('statuses/update', tweet, function (err, data, response) {
            console.log("Just sent tweet:\n" + tweet);

             var replyTweet = {
                status: "@" + data.user.screen_name + otherHalf,
                in_reply_to_status_id: data.id_str
            };

            T.post('statuses/update', replyTweet, function (err, data, response) {
                console.log("Just replied with:\n" + replyTweet);
            });
        });
    }

    else {
        T.post('statuses/update', tweet, function (err, data, response) {
            console.log("Just sent tweet:\n" + tweet);
        });
    }
}

// Pads digits for date parameter in url
function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}
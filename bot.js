/**
 * Created by Ashwin on 1/6/2017.
 */

// process.env['access_token'] = "817642973819125760-SeertG9oMmI4qRNeVbf2d6fPy1JHqMM";
// process.env['access_token_secret'] = "DQuJitMbwQNhGGut1ceT1XPNLqEEX43sqYqlTjjNwnpQE";
// process.env['consumer_key'] = "5b1RGsfmljoaoIr3kywC1Mdde";
// process.env['consumer_secret'] = "LQB0szxg9qqJ24iyJkXthuNwG5hQr9wCO40vueiOkKdoU8dwie";
// process.env['access_key'] = "e3d33762e4a0e893916110068f50f29100793a317a2c6b40f";

// Import: Twit, API keys, request
var Twit = require('twit');
var config = require('./config');
var request = require("request");
var schedule = require('node-schedule');

// Authenticate API keys and create new Twit object
var T = new Twit(config);

//setInterval(sendTweets, 1000*60*60*24);
tweetSomething("Everything is all good");


function sendTweets() {

    // Create date every day and format it for the api url call
    var d = new Date();
    var date = d.getFullYear() + "-" + padDigits(d.getUTCMonth() + 1, 2) + "-" +  padDigits(d.getDate(), 2);

    // Insert new date into the url
    var url = "http://api.wordnik.com:80/v4/words.json/wordOfTheDay?date=" + date + "&api_key=" + process.env.access_key;


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
    var textArr = text.trim().split(" ");
    var tweetTemp = [];
    var toTweet = [];
    var count = 0;
    while (textArr.length > 0){
        var word = textArr[0];
        if (count + word.length + 1 < 140){
            count += word.length + 1;
            textArr.shift();
            tweetTemp.push(word);
        }
        else{
            toTweet.push(tweetTemp.join(" "));
            count = 16; // Length of @WordOfTheDayRobotUSA
            tweetTemp = [];
        }
    }

    if(tweetTemp.length > 0)
        toTweet.push(tweetTemp.join(" "));

    var tweet = {
        status: toTweet[0]
    };

    toTweet.shift();


    // If tweet exceeds the 140 character limit, split the tweet and finish it in a reply chain
    if (toTweet.length >= 1){
        // Send initial tweet
        T.post('statuses/update', tweet, function (err, data, response) {
            console.log("Just sent tweet:\n" + JSON.stringify(tweet));
            console.log("Error: " + err);
            console.log("toTweet length: " + toTweet.length);

            // Start reply chain
            tweet = {
                status: "@WordOfTheDayUSA " + toTweet[0],
                in_reply_to_status_id: data.id_str
            };

            T.post('statuses/update', tweet, function (err, data, response) {
                console.log("Just sent reply:\n" + JSON.stringify(tweet));
                console.log("Error: " + err);

                toTweet.shift();
                console.log("toTweet length: " + toTweet.length);
            });

        });


    }

    // Otherwise send tweet are usual
     else {
        T.post('statuses/update', tweet, function (err, data, response) {
            console.log("Just sent tweet:\n" + tweet);
            console.log("Error: " + err);
        });
    }
}

// Pads digits for date parameter in url
function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}
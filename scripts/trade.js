const Store = require('electron-store');
const $ = require('jQuery');
const keys = new coinbaseKeys();
const store = new Store();
const tokenRequestURL = "https://api.coinbase.com/oauth/token?";
const clientSecret = keys.clientSecret;
const clientId = keys.clientId;
const APICallURL = "https://api.coinbase.com/v2/user";
const Client = require('coinbase').Client;
const database = firebase.database();
const mailgunKey = new mailgunKeys();
//================================================>
// var fs = require('fs');
// var readline = require('readline');
// var google = require('googleapis');
// var googleAuth = require('google-auth-library');
// const Base64 = require('js-base64').Base64;
//================================================>

let client = new Client({'apiKey': clientId,
                         'apiSecret': clientSecret});
let accessTokenString;
let btcPrice;
let ethPrice;
let ltcPrice;




var api_key = mailgunKey.apiKey;
var domain = mailgunKey.domain;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

var data = {
  from: 'Excited User <me@samples.mailgun.org>',
  to: 'wsiewert94@gmail.com',
  subject: 'Hello',
  text: 'Testing some Mailgun awesomness! blah foobar'
};

mailgun.messages().send(data, function (error, body) {
  console.log(body);
});


//================================================>
// sendMessage("wsiewert94@gmail.com", "Hello, email sent!", function(){
//   console.log("Email Successful!");
// });
//
// function sendMessage(userId, email, callback) {
//   // Using the js-base64 library for encoding:
//   // https://www.npmjs.com/package/js-base64
//   var base64EncodedEmail = Base64.encodeURI(email);
//   var request = gapi.client.gmail.users.messages.send({
//     'userId': userId,
//     'resource': {
//       'raw': base64EncodedEmail
//     }
//   });
//   request.execute(callback);
// }
//================================================>


refreshCurrencyValues()

getNewAccessToken().done(function(data){
  overwriteLocalStorageTokens(data);
  getUserData().done(function(data){
    addHTMLToPage(data);
    });
}).fail(function(){console.log("failed to load new access token");});

$("#buy-btn").click(function(){
  let currency = $('#select').val()
  $('#buy-or-sell').html("Buy");
  $('#currency-header').html(currency.slice(currency.length-5,currency.length));
  $('#currency').html("$");
  $('#total-price-symbol').html("0.00");
  $('#submit-transaction').attr("class","btn btn-primary");
  $('#submit-transaction').html("Buy");
});

$('#select').change(function(){
    let currency = $('#select').val()
    $('#currency-header').html(currency.slice(currency.length-5,currency.length));
});

$('#update-form-btn').click(function(){
  let currency = btcPrice;
  if($('#select').val() === "Bitcoin (BTC)"){
    currency = btcPrice;
  } else if($('#select').val() === "Ethereum (ETH)"){
    currency = ethPrice;
  } else if($('#select').val() === "Litecoin (LTC)"){
    currency = ltcPrice;
  }
  $('#total-price-symbol').html((parseInt($('#purchase-input').val())/parseInt(currency)).toFixed(4));
});

$("#sell-btn").click(function(){
  $('#buy-or-sell').html("Sell");
  $('#submit-transaction').attr("class","btn btn-success");
  $('#submit-transaction').html("Sell");
  $('#currency-header').html("($) USD");
});

$('#submit-transaction').click(function(){
  //1. Give trade feedback
  //2. add transaction to firebase
  addTransactionToFirebase();
  //3. send notification email
  //4. if auto-trade use another button to automate and create new BrowserWindow
  //5. alert window shows you made a successful trade.
  alert("Successful Transaction! You purchased " + $('#total-price-symbol').text() + " " + $('#select').val());
  //6. Refresh page
  location.reload();
});

function addTransactionToFirebase(){
  let date = new Date();
  let formatedDate = date.toString();
  let transactionData = {
    date : formatedDate.slice(0,formatedDate.length-15),
    boughtsold : 'Buy',
    currency : $('#select').val(),
    price : $('#total-price-symbol').text()
  }
  let uniqueIdListRef = firebase.database().ref('uniqueid');
  let newTransaction = uniqueIdListRef.push();
  newTransaction.set(transactionData);
}

function getNewAccessToken(){
  var settings = {
    "async": true,
    "url": "https://api.coinbase.com/oauth/token?grant_type=refresh_token&refresh_token=" + store.get('refresh_token') + "&client_id=" + clientId + "&client_secret=" + clientSecret,
    "method": "POST"
  }
  return $.ajax(settings);
}

function overwriteLocalStorageTokens(tokenObject){
  store.clear();
  store.store = tokenObject;
  accessTokenString = "Bearer " + store.get('access_token');
}

function getUserData() {
  let settings = {
    "async": true,
    "crossDomain": true,
    "url": APICallURL,
    "method": "GET",
    "headers": {
      "authorization": accessTokenString
    }
  }
  return $.ajax(settings);
}

function refreshCurrencyValues(){
  client.getBuyPrice({'currencyPair': 'BTC-USD'}, function(err, price) {
    $('#feed-price-btc').html("$ " + price.data.amount);
    btcPrice = price.data.amount;
  });
  client.getBuyPrice({'currencyPair': 'ETH-USD'}, function(err, price) {
    $('#feed-price-eth').html("$ " + price.data.amount);
    ethPrice = price.data.amount;

  });
  client.getBuyPrice({'currencyPair': 'LTC-USD'}, function(err, price) {
    $('#feed-price-ltc').html("$ " + price.data.amount);
    ltcPrice = price.data.amount;
  });
}

function addHTMLToPage(userData) {
  $('#navbar-user-icon').html("<li><a href=\"profile.html\"><img src=\"" + userData.data.avatar_url + "\" alt=\"IMAGE-NOT-FOUND\" id=\"navbar-icon\"></a></li>");
  $('#navbar-user-name').html("<li><a href=\"profile.html\">" + userData.data.name + "</a><li>");
}

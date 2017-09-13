const Store = require('electron-store');
const $ = require('jQuery');
const keys = new coinbaseKeys();
const store = new Store();
const tokenRequestURL = "https://api.coinbase.com/oauth/token?";
const clientSecret = keys.clientSecret;
const clientId = keys.clientId;
const APICallURL = "https://api.coinbase.com/v2/user";
const Client = require('coinbase').Client;
let client = new Client({'apiKey': clientId,
                         'apiSecret': clientSecret});
let accessTokenString;

client.getBuyPrice({'currencyPair': 'BTC-USD'}, function(err, price) {
  $('#feed-price-btc').html("$ " + price.data.amount);
});
client.getBuyPrice({'currencyPair': 'ETH-USD'}, function(err, price) {
  $('#feed-price-eth').html("$ " + price.data.amount);
});
client.getBuyPrice({'currencyPair': 'LTC-USD'}, function(err, price) {
  $('#feed-price-ltc').html("$ " + price.data.amount);
});

getNewAccessToken().done(function(data){
  overwriteLocalStorageTokens(data);
  getUserData().done(function(data){
    addHTMLToPage(data);
    console.log(data);
    });
}).fail(function(){console.log("failed to load new access token");});

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
      "authorization": accessTokenString,
      "cb-version": keys.APIVersion
    }
  }
  return $.ajax(settings);
}

function addHTMLToPage(userData) {
  $('#navbar-user-icon').html("<li><a href=\"profile.html\"><img src=\"" + userData.data.avatar_url + "\" alt=\"IMAGE-NOT-FOUND\" id=\"navbar-icon\"></a></li>");
  $('#navbar-user-name').html("<li><a href=\"profile.html\">" + userData.data.name + "</a><li>");
}

new TradingView.MediumWidget({
  "container_id": "tv-medium-widget-6d4eb",
  "symbols": [
    [
      "Bitcoin",
      "COINBASE:BTCUSD|1y"
    ],
    [
      "Ethereum",
      "COINBASE:ETHUSD|1y"
    ],
    [
      "Litecoin",
      "COINBASE:LTCUSD|1y"
    ]
  ],
  "gridLineColor": "#e9e9ea",
  "fontColor": "rgba(101, 101, 101, 1)",
  "underLineColor": "rgba(66, 66, 66, 1)",
  "trendLineColor": "rgba(0, 255, 0, 1)",
  "width": "1200px",
  "height": "400px",
  "locale": "en"
});

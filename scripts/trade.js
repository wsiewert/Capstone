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
let btcPrice;
let ethPrice;
let ltcPrice;

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
  //3. send notification email
  //4. if auto-trade use another button to automate and create new BrowserWindow
  //5. alert window shows you made a successful trade.
  alert("Successful Transaction! You purchased " + $('#total-price-symbol').text() + " " + $('#select').val());
  //6. Refresh page
  location.reload();
});

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

const Store = require('electron-store');
const $ = require('jQuery');
const keys = new coinbaseKeys();
const store = new Store();
const tokenRequestURL = "https://api.coinbase.com/oauth/token?";
const clientSecret = keys.clientSecret;
const clientId = keys.clientId;
const APICallURL = "https://api.coinbase.com/v2/user";
let accessTokenString;

getNewAccessToken().done(function(data){
  overwriteLocalStorageTokens(data);
  getUserData().done(function(data){
    addHTMLToPage(data);
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
      "authorization": accessTokenString
    }
  }
  return $.ajax(settings);
}

function addHTMLToPage(userData) {
  $('#navbar-user-icon').html("<li><a href=\"profile.html\"><img src=\"" + userData.data.avatar_url + "\" alt=\"IMAGE-NOT-FOUND\" id=\"navbar-icon\"></a></li>");
  $('#navbar-user-name').html("<li><a href=\"profile.html\">" + userData.data.name + "</a><li>");
}

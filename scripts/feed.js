const Store = require('electron-store');
const $ = require('jQuery');
const keys = new coinbaseKeys();

const store = new Store();

const tokenRequestURL = "https://api.coinbase.com/oauth/token?";
const clientSecret = keys.clientSecret;
const clientId = keys.clientId;


//On page load:
//Get newest access_token whenever page is loaded.
    //let refreshedAccessToken = getNewAccessToken().done(function(data) => {return data;});
//overwriteLocalStorageTokens(getNewAccessToken().done(function(data) {return data;}));
getNewAccessToken().done(function(data){
  console.log(data);
  console.log("--------------------------");
  overwriteLocalStorageTokens(data);
  getUserData().done(function(data){
    console.log(data);
    addHTMLToPage(data);
    });
}).fail(function(){console.log("failed to load new access token");});

//console.log(store.store);
//Make an API call.
//load page with HTML information.

const APICallURL = "https://api.coinbase.com/v2/user";
let accessTokenString;

//====================HELPER FUNCTIONS=============================>



// function getNewAccessToken() {
//   //console.log(store.get('refresh_token'));
//   //console.log(clientId);
//   let ajaxResult;
//   let ajaxSettings = {
//     "async": true,
//     "url": tokenRequestURL,
//     "method": "POST",
//     "grant_type": 'refresh_token',
//     "refresh_token": store.get('refresh_token'),
//     "client_id": clientId,
//     "client_secret": clientSecret
//   };
//   ajaxResult = $.ajax(ajaxSettings)
//   console.log("getNewAccessToken: before return");
//   return ajaxResult;
// }
//===================================getNewAccessToken-POSTMAN-FORMAT===================================>
function getNewAccessToken(){
  console.log(store.get('access_token'));
  console.log(store.get('refresh_token'));
  var settings = {
    "async": true,
    "url": "https://api.coinbase.com/oauth/token?grant_type=refresh_token&refresh_token=" + store.get('refresh_token') + "&client_id=" + clientId + "&client_secret=" + clientSecret,
    "method": "POST"
  }
  return $.ajax(settings);
}

//===================================getNewAccessToken-POSTMAN-FORMAT===================================>

function overwriteLocalStorageTokens(tokenObject){
  console.log(store.store);
  store.clear();
  store.store = tokenObject;
  accessTokenString = "Bearer " + store.get('access_token');
  console.log(store.store);
}

//API Call
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
  $('.image-div').html("<img src=\"" + userData.data.avatar_url + "\" alt=\"IMAGE-NOT-FOUND\">");
  $('.user-name').html("<h2>" + userData.data.name + "</h2>");
}

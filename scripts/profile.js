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
let client = new Client({'apiKey': clientId,
                         'apiSecret': clientSecret});
let accessTokenString;

getTradeHistory();

getNewAccessToken().done(function(data){
  overwriteLocalStorageTokens(data);
  getUserData().done(function(data){
    addHTMLToPage(data);
    getUserAccountBalance(data.data.id);
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

function getUserAccountBalance(accountId){
  client.getUser(accountId, function(err, account) {
    //console.log(account);
    //console.log(err);
  });
  // $.get("https://api.coinbase.com/v2/users/" + accountId,
  //   function(data, status){
  //     console.log(data);
  //     console.log(status);
  //   }
  // );
}

function getTradeHistory() {
  //let dbRef = firebase.database().ref('transactions');
  let dbRef = firebase.database().ref('uniqueid');
  dbRef.on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
      addHTMLTradeHistory(childData);
      console.log(childData);
    });
  });
}

function addHTMLToPage(userData) {
  $('#navbar-user-icon').html("<li><a href=\"profile.html\"><img src=\"" + userData.data.avatar_url + "\" alt=\"IMAGE-NOT-FOUND\" id=\"navbar-icon\"></a></li>");
  $('#navbar-user-name').html("<li><a href=\"profile.html\">" + userData.data.name + "</a><li>");
  $('#profile-picture').attr("src",userData.data.avatar_url);
  $('#profile-name-heading').html(userData.data.name);
}

function addHTMLTradeHistory(transactionObject){
  let boughtsold = transactionObject.boughtsold;
  let curreny = transactionObject.currency;
  let date = transactionObject.date;
  let price = transactionObject.price;
  let tableString = "<tr><td>" + date + "</td><td>" + boughtsold + "</td><td>" + curreny + "</td><td>" + price + "</td></tr>";
  $(tableString).prependTo('#transaction-history-entry');
}

const BrowserWindow = require('electron').remote.BrowserWindow;
const Store = require('electron-store');
const {ipcRenderer} = require('electron');
var $ = require('jQuery');
//==============================================================================================>

var useSandbox = false;
var productionAuthURI = 'https://www.coinbase.com/oauth/authorize/?';
const clientSecret = "";

var appArgs = {
  client_id         : '',
  redirect_uri      : '',
  response_type     : 'code' //don't change this
};

var scopes = [
   'wallet:user:read',
  // 'wallet:user:update',
   'wallet:user:email',
   'wallet:accounts:read',
  // 'wallet:accounts:update',
  // 'wallet:accounts:create',
  // 'wallet:accounts:delete',
  // 'wallet:payment-methods:read',
  // 'wallet:payment-methods:delete',
  // 'wallet:payment-methods:limits',
  // 'wallet:transactions:read',
  // 'wallet:transactions:send',
  // 'wallet:transactions:request',
  // 'wallet:transactions:transfer',
  // 'wallet:buys:read',
  // 'wallet:buys:create',
  // 'wallet:sells:read',
  // 'wallet:sells:create',
  // 'wallet:addresses:read',
  // 'wallet:addresses:create',
  // 'wallet:orders:read',
  // 'wallet:orders:create',
  // 'wallet:orders:refund',
  // 'wallet:checkouts:read',
  // 'wallet:checkouts:create',
  // 'wallet:deposits:read',
  // 'wallet:deposits:create',
  // 'wallet:withdrawals:read',
  // 'wallet:withdrawals:create'
];

var metaArgs = {
  send_limit_amount : 100,
  send_limit_currency: 'USD',
  send_limit_period: 'day'
};

function buildAuthURI( appArgs, metaArgs, scopes ){
  var authURI = productionAuthURI;
  var queryParams = [];
  for ( var param in appArgs ){
    if ( appArgs.hasOwnProperty(param) ){
      queryParams.push(encodeURIComponent( param ) + '=' + encodeURIComponent( appArgs[param] ));
    }
  }
  if (scopes.indexOf('wallet:transactions:send') != -1){
    for ( var param1 in metaArgs){
      queryParams.push( 'meta[' + param1 + ']=' + metaArgs[param1] );
    }
  }
  authURI += queryParams.join('&') + '&scope=' + scopes.join(',');
  return authURI;
}

//=====================================================================================================>

let authCode = "Auth code not found.";
let accessTokenObject;
let authCodeCallback = "https://www.coinbase.com/oauth/authorize/";
let tokenRequestURL = "https://api.coinbase.com/oauth/token?";
let loginSuccess = false;
let authWindow;

function getCoinbaseLoginWindow() {
  let redirectRequestCount = 0;
  authWindow = new BrowserWindow({ width: 800, height: 800, show: false, webPreferences: { nodeIntegration: false }});
  authWindow.on('close', function() {authWindow = null});
  authWindow.loadURL(buildAuthURI(appArgs, metaArgs, scopes));
  authWindow.show();
  authWindow.webContents.on('will-navigate', (event, url) => {
    redirectRequestCount++;
    if(redirectRequestCount === 2){
      authCode = url.toString().substr(authCodeCallback.length);
      accessTokenObject = getAccessToken();
      console.log("got access token");
      //authWindow.close();
    }
  });

  function getAccessToken() {
    let token = {};
    $.post(tokenRequestURL,
      {
        grant_type: 'authorization_code',
        code: authCode,
        client_id: appArgs.client_id,
        client_secret: clientSecret,
        redirect_uri: appArgs.redirect_uri
      },
      function(data, status){
        console.log(status);
        if(status.toLowerCase() === "success"){
          token = data;
          loginSuccess = true;
          authWindow.close();
          console.log("loginSuccess changes to true: " + loginSuccess);
        }
      }
    );
    return token;
  }
}

function getFeedPage(){
  if(loginSuccess === true){
    console.log("ipcRenderer did load");
    ipcRenderer.send('navigate-to-feed', () => {});
  }
}

getCoinbaseLoginWindow();
authWindow.on('closed', function() {
  console.log("window was closed");
  getFeedPage();
  authWindow = {};
});

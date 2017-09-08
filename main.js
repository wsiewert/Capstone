const {app, BrowserWindow} = require('electron');
const nativeImage = require('electron').nativeImage;
const path = require('path');
const url = require('url');
const Store = require('electron-store');
const {ipcMain} = require('electron');

let firstTimeLoggedIn = true;
let win;

//check local storage, if user exists, set firstTimeLoggedIn = false.

function createWindow() {
  win = new BrowserWindow({width:800, height:600, minWidth: 500, minHeight: 400, center: true, icon:__dirname+'/img/cryptotradelogo.png'});
  win.loadURL(url.format({
    pathname: path.join(__dirname, getInitialStartPageURL()),
    protocol: 'file:',
    slashes: true
  }));
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

ipcMain.on('navigate-to-feed', () => {
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'feed.html'),
    protocol: 'file:',
    slashes: true
  }));
});

app.on('window-all-closed', () => {
  if(process.platform === 'darwin'){
    //quits on MacOS
    app.quit();
  } else if (process.platform !== ' darwin'){
    //quits on windowsOS/LinuxOS
    app.quit();
  }
});

function getInitialStartPageURL() {
  if(firstTimeLoggedIn === true){
    return "index.html";
  } else if (firstTimeLoggedIn === false) {
    return "feed.html";
  }
}

// const store = new Store();
// //store.set('key','value');
// //console.log(store.get('key'));
// console.log(store.has('key'));

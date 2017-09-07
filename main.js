const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow({width:800, height:600, minWidth: 500, minHeight: 400, center: true, icon:__dirname+'/img/cryptotradelogo.png'});

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  //win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if(process.platform === 'darwin'){
    //quits on MacOS
    app.quit();
  } else if (process.platform !== ' darwin'){
    //quits on windowsOS/LinuxOS
    app.quit();
  }
});

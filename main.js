const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const log = require('electron-log');
const {Store} = require("./Store");

// Set env
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

const store = new Store({
    configName: 'user-settings',
    default: {
        settings: {
            cpuOverload: 80,
            alertFrequency: 5
        }
    }
});

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'SysTop',
        width: isDev ? 800 : 355,
        height: 500,
        icon: './assets/icons/icon.png',
        resizable: isDev,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile('./app/index.html');
}

app.on('ready', () => {
    createMainWindow();
    mainWindow.webContents.on('dom-ready', () => {
       mainWindow.webContents.send('settings:get', store.get('settings'))
    });
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
})

const menu = [
    ...(isMac ? [{role: 'appMenu'}] : []),
    {
        role: 'fileMenu',
    },
    ...(isDev
        ? [
            {
                label: 'Developer',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {type: 'separator'},
                    {role: 'toggledevtools'},
                ],
            },
        ]
        : []),
];

ipcMain.on('settings:set', (e, value) => {
    store.set('settings', value);
    mainWindow.webContents.send('settings:get', store.get('settings'));
});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

app.allowRendererProcessReuse = true

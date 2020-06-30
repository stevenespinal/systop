const electron = require("electron");
const fs = require('fs');
const path = require('path');

class Store {
    constructor(options) {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        this.path = path.join(userDataPath, options.configName + '.json');
        this.data = parseDataFile(this.path, options.default);
    }

    get(key) {
        return this.data[key]
    }

    set(key, val) {
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }
}

function parseDataFile(path, options) {
    try {
        return JSON.parse(fs.readFileSync(path));
    } catch (error) {
        return options;
    }
}

module.exports = {Store}
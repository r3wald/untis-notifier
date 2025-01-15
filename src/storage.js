'use strict';

const fs = require("fs");

module.exports = class Storage {

    constructor(folder) {
        this.folder = folder;
    }

    write(key, value) {
        const data = JSON.stringify(value);
        return fs.writeFileSync(this.folder + '/' + key + '.json', data);
    }

    read(key) {
        try {
            const contents = fs.readFileSync(this.folder + '/' + key + '.json');
            return JSON.parse(contents.toString());
        } catch (e) {
        }
        return null;
    }
}

const fse = require('fs-extra');
const fs = require('fs');

class Fileutils {

    static removePath (path) {
        try {
            fse.removeSync(path);
            console.log(path + ' removed');
        } catch (err) {
            console.log(err.message);
        }
    }

    static exists (path) {
        return fs.existsSync(path);
    }

    static makeDirWhenNotExists (path) {

        if (!fs.existsSync(path)) {
            Fileutils.makeDir(path);
        }
    }

    static makeDir (path) {
        try {
            fse.ensureDirSync(path);
            console.log(path + ' created')
        } catch (err) {
            console.error(err.message)
        }
    }

    static copyDir (path, target) {
        try {
            this.makeDir(target);
            fse.copySync(path, target);
        } catch (err) {
            console.log(err.message);
        }
    }

    static async copyFile (path, target) {
        try {
            fse.copySync(path, target);
        } catch (err) {
            console.log(err.message);
        }
    }

}

module.exports = Fileutils;

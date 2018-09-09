const fse = require('fs-extra');
const fs = require('fs');

class Utils {

    static async removePath (path) {
        try {
            await fse.remove(path);
            console.log(path + ' removed');
        } catch (err) {
            console.log(err.message);
        }
    }

    static async makeDirWhenNotExists (path) {

        if (!fs.existsSync(path)) {
            await Utils.makeDir(path);
        }
    }

    static async makeDir (path) {
        try {
            await fse.ensureDir(path);
            console.log(path + ' created')
        } catch (err) {
            console.error(err.message)
        }
    }

    static async copyDir (path, target) {
        try {
            this.makeDir(target);
            await fse.copy(path, target);
        } catch (err) {
            console.log(err.message);
        }
    }

    static async copyFile (path, target) {
        try {
            await fse.copy(path, target);
        } catch (err) {
            console.log(err.message);
        }
    }

}

module.exports = Utils;

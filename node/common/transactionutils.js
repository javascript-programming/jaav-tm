const { createHash, randomBytes } = require('crypto');
const stringify = require('json-stable-stringify');
const base58check = require('bs58check');
const secp = require('secp256k1');

function hashFunc (algo) {
    return (data) => createHash(algo).update(data).digest()
}

class TransActionUtils {

    static get sha256 () {
        this._sha256 = this._sha256 || hashFunc('sha256');
        return this._sha256;
    }

    static get ripemd160 () {
        this._ripemd160 = this._ripemd160 || hashFunc('ripemd160');
        return this._ripemd160;
    }

    static addressHash (data) {
        let hash = this.ripemd160(this.sha256(data));
        return base58check.encode(hash);
    }

    static createNewKeyAndAddress() {

        let privKey;

        do {
            privKey = randomBytes(32);
        } while (!secp.privateKeyVerify(privKey));

        const pubKey = secp.publicKeyCreate(privKey).toString('hex');
        privKey = privKey.toString('hex');
        const address = this.addressHash(pubKey);

        return { address, privKey, pubKey };
    }

    static signByAccount (message, privKey) {
        const mess = Buffer.from(this.sha256(message), 'utf-8');
        const sign = secp.sign(mess, new Buffer(privKey, "hex"));
        return sign.signature;
    }

    static verifyByAccount (message, signature, account, pubKey) {
        const mess = Buffer.from(this.sha256(message), 'utf-8');
        return secp.verify(mess, signature, new Buffer(pubKey, 'hex')) && account === this.addressHash(pubkey);
    }

    static clone (obj) {
        return JSON.parse(stringify(obj));
    }

    static verifyPublicAccountKey (privKey, pubKey) {

        let result = false;
        try {
            result = pubKey === secp.publicKeyCreate(new Buffer(privKey, "hex")).toString('hex');
        } catch(ex){}

        return result;
    }

    static getSigMsg (tx) {
        tx = this.clone(tx);
        return stringify(tx);
    }

    static createTx (account, privKey, pubKey, cmd, params, to, value) {

        if (!account || !privKey || !pubKey)
            return;

        return this.signTx({
            cmd     : cmd,
            pubkey  : pubKey,
            params  : params || {},
            to      : to,
            value   : value
        }, privKey);

    }

    static verifyTx (tx) {
        let signature = tx.signature;

        if (signature) {
            delete tx.signature;
            let stx = this.getSigMsg(tx);
            return this.verifyByAccount(stx, signature, tx.account, tx.pubkey);

        } else {
            console.log('Transaction has no signature');
            return false;
        }
    }

    static signTx (tx, privKey) {
        let stx = this.getSigMsg(tx);
        tx.signature = this.signByAccount(stx, privKey);
        return tx;
    }
}

module.exports = TransActionUtils;

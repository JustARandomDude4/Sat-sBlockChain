"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
class Transaction {
    constructor(amount, payer, //public key   like username
    payee //public key    lik username
    ) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    toString() {
        return JSON.stringify(this);
    }
} // we shall serialize everything a sstrings
class Block {
    constructor(prevhash, transaction, // Transaction class object
    ts = Date.now() //time stamp
    ) {
        this.prevhash = prevhash;
        this.transaction = transaction;
        this.ts = ts;
    }
    get hash() {
        const str = JSON.stringify(this); // to create string verisonof block
        // createHash function from crypto  which specifies a specific hashing algo called SHA256
        const hash = crypto.createHash('SHA256');
        // hash the str(string version of block)  return a hashvalue/digest
        hash.update(str).end();
        return hash.digest('hex');
    }
}
class Chain {
    constructor() {
        this.chain = [new Block('', new Transaction(100, 'genesis', 'Satwika'))];
    }
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    mine(nonce) {
        let solution = 1;
        console.log('💎⛏ Mining...');
        while (true) //creates a hash with md5 algo 
         {
            const hash = crypto.createHash('MD5');
            hash.update((nonce + solution).toString()).end(); //add nonnce and number
            const attempt = hash.digest('hex');
            if (attempt.substr(0, 4) === '0000') {
                return solution;
            }
            solution += 1;
        }
    }
    addBlock(transaction, senderPublicKey, signature) {
        //const newBlock=new Block(this.lastBlock.hash,transaction);
        //this.chain.push(newBlock);
        const verifier = crypto.createVerify('SHA256');
        verifier.update(transaction.toString());
        const isValid = verifier.verify(senderPublicKey, signature);
        if (isValid) {
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.chain.push(newBlock);
        }
    }
}
// we only want one block, so creatinga  singleton instance
Chain.instance = new Chain();
class Wallet {
    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
    }
    sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
const Satwika = new Wallet();
const Sahiti = new Wallet();
const Maanvi = new Wallet();
Satwika.sendMoney(20, Sahiti.publicKey);
Sahiti.sendMoney(13, Maanvi.publicKey);
Maanvi.sendMoney(5, Sahiti.publicKey);
console.log(Chain.instance);

import * as crypto from "crypto";

class Transaction
{
    constructor
    (
        public amount: number,
        public payer: string,    //public key   like username
        public payee: string    //public key    lik username
    ) {}

    toString()   //to convert the object to a string
    {
        return JSON.stringify(this);
    }
}  // we shall serialize everything a sstrings

class Block
{
    constructor
    (
        public prevhash: string,
        public transaction: Transaction,   // Transaction class object
        public ts=Date.now()     //time stamp
    ) {}

    get hash()
    {
        const str= JSON.stringify(this);    // to create string verisonof block
        
        // createHash function from crypto  which specifies a specific hashing algo called SHA256
        const hash=crypto.createHash('SHA256');  
        
        // hash the str(string version of block)  return a hashvalue/digest
        hash.update(str).end();   
        return hash.digest('hex');        
    }

}

class Chain
{
    // we only want one block, so creatinga  singleton instance
    public static instance=new Chain();

    chain: Block[];      //chain as an array of blocks

    constructor()   //instantiate 1st block of the chain(its called genesis b)
    {
        this.chain=[new Block('', new Transaction(100,'genesis','Satwika'))];
    }

    get lastBlock()
    {
        return this.chain[this.chain.length-1];
    }

    mine(nonce: number)
    {
        let solution=1;

        console.log('💎⛏ Mining...');

        while(true)  //creates a hash with md5 algo 
        {
            const  hash=crypto.createHash('MD5');

            hash.update((nonce+solution).toString()).end();  //add nonnce and number

            const attempt=hash.digest('hex');

            if(attempt.substr(0,4)==='0000')
            {
                return solution;
            }
            solution+=1;
        }
    }
    addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer)
    {
        //const newBlock=new Block(this.lastBlock.hash,transaction);
        //this.chain.push(newBlock);

        const verifier=crypto.createVerify('SHA256');
        verifier.update(transaction.toString());

        const isValid=verifier.verify(senderPublicKey,signature);

        if(isValid)
        {
            const newBlock=new Block(this.lastBlock.hash,transaction);
            this.chain.push(newBlock);
        }
    }

}

class Wallet 
{
    public publicKey: string;
    public privateKey: string;
  
    constructor() 
    {
      const keypair = crypto.generateKeyPairSync('rsa', {
                                                          modulusLength: 2048,
                                                          publicKeyEncoding: { type: 'spki', format: 'pem' },
                                                          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
                                                         });
  
      this.privateKey = keypair.privateKey;
      this.publicKey = keypair.publicKey;
    }
  
    sendMoney(amount: number, payeePublicKey: string) 
    {
      const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
  
      const sign = crypto.createSign('SHA256');
      sign.update(transaction.toString()).end();
  
      const signature = sign.sign(this.privateKey); 
      Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
  
const Satwika=new Wallet();
const Sahiti=new Wallet();
const Maanvi=new Wallet();
Satwika.sendMoney(20,Sahiti.publicKey);
Sahiti.sendMoney(13,Maanvi.publicKey);
Maanvi.sendMoney(5,Sahiti.publicKey);

console.log(Chain.instance)
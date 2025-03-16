const crypto = require('crypto');

class Encryption {
    encrypt(str) {
        const salt = '11aa22bb33cc'
        //crypto.randomBytes(4).toString('hex');
        const iterations = 500000; // Simulates computationally intensive work
        const keyLength = 12;
        const hash = crypto.pbkdf2Sync(str, salt, iterations, keyLength, 'sha512').toString('hex');
        return hash;
      }
    }
    
  
module.exports = Encryption;
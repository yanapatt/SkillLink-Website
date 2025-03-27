const fs = require('fs');
const path = require('path');
const { uuid } = require('uuidv4');
const Encryption = require('../util');
const LinkedList = require('./linkedList');

util = new Encryption();

class AccountModel {
  constructor() {
    this.accounts = new LinkedList();
    this.filePath = path.join(__dirname, '..', 'database', 'accounts.json');
    this.loadAccountsFromFile();
  }

  ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  }

  createAccount(account) {
    account.accountId = uuid();
    account.password = util.encrypt(account.password);
    account.accountType = account.accountType || 'User';

    const formattedAccountDoc = {
      accountId: account.accountId,
      accountType: account.accountType,
      username: account.username,
      email: account.email,
      password: account.password,
      phone: account.phone
    }

    this.accounts.insertLast(formattedAccountDoc);
    this.saveAccountsToFile();
  }

  authenticateAccount(username, password) {
    let foundAccount = null;
    this.accounts.forEachNode((account) => {
      if (account.username === username && account.password === util.encrypt(password)) {
        foundAccount = account;
      }
    });
    return foundAccount;
  }

  getAllAccounts() {
    const encryptedAccounts = [];
    this.accounts.forEachNode((account) => {
      encryptedAccounts.push(this.encryptAccounts(account));
    });
    return encryptedAccounts;
  }

  encryptAccounts(account) {
    return { ...account, password: "**********" }; 
  }

  saveAccountsToFile() {
    const accountsData = this.accounts.toArray();
    fs.writeFileSync(this.filePath, JSON.stringify(accountsData, null, 2));
  }

  loadAccountsFromFile() {
    if (fs.existsSync(this.filePath)) {
      const data = JSON.parse(fs.readFileSync(this.filePath));
      data.forEach((account) => {
        if (!account.accountId) account.accountId = uuid();
        this.accounts.insertLast(account);
      });
    }
  }
}

module.exports = AccountModel;

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

  //
  ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  }

  //
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

  //
  authenticateAccount(username, password) {
    let foundAccount = null;
    this.accounts.forEachNode((account) => {
      if (account.username === username && account.password === util.encrypt(password)) {
        foundAccount = account;
      }
    });
    return foundAccount;
  }

  //
  getAllAccounts() {
    return this.accounts.toArray().map(this.encryptAccounts);
  }

  //
  encryptAccounts(account) {
    return { ...account, password: "**********" };
  }

  //
  saveAccountsToFile() {
    try {
      this.ensureDirectoryExistence(this.filePath);
      const accountsData = JSON.stringify(this.accounts.toArray(), null, 2);

      fs.writeFileSync(`${this.filePath}.tmp`, accountsData);
      fs.renameSync(`${this.filePath}.tmp`, this.filePath);
    } catch (error) {
      console.error("Error saving accounts to file:", error.message);
    }
  }

  //
  loadAccountsFromFile() {
    if (!fs.existsSync(this.filePath)) return;

    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      if (!data.trim()) return;

      const parsedData = JSON.parse(data);

      if (Array.isArray(parsedData)) {
        parsedData.forEach((account) => {
          if (!this.findAccountById(account.accountId)) {
            this.accounts.insertLast({
              accountId: account.accountId || uuid(),
              accountType: account.accountType || "User",
              username: account.username,
              email: account.email,
              password: account.password,
              phone: account.phone
            });
          }
        });
      }
    } catch (error) {
      console.error("Error loading accounts from file:", error.message);
    }
  }

  //
  findAccountById(accountId) {
    let found = null;
    this.accounts.forEachNode((account) => {
      if (account.accountId === accountId) {
        found = account;
      }
    });
    return found;
  }
}

module.exports = AccountModel;

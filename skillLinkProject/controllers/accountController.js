const fs = require('fs');
const path = require('path');
const Encryption = require('../util');
const AccountModel = require('../models/accountModel');

util = new Encryption();

// Middleware to check authentication
exports.authenticate = (req, res, next) => {
  if (req.session.accountSession) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// Show login page
exports.showLoginPage = (req, res) => {
  // Pass unsanitized error message from query parameters
  res.render('login', { error: req.query.error || null });
};

// Show register page
exports.showRegisterPage = (req, res) => {
  res.render('register', { error: null });
}

// Handle login
exports.login = (req, res) => {
  const { username, password } = req.body;
  const account = new AccountModel();
  const accountSession = account.authenticateAccount(username, password);

  if (accountSession) {
    req.session.accountSession = username;
    console.log(username + " has logged in");
    res.redirect('/');
  } else {
    console.log("Username or password is incorrect");
    res.render('login', { error: `Invalid credentials for username: ${username}` });
  }
};

exports.register = (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    if (!username || !email || !password || !phone) {
      throw new Error('All fields are required!');
    }

    const account = new AccountModel();
    account.createAccount({ username, email, password, phone });
    console.log(`${username} registered successfully.`);
    res.redirect('/login');

  } catch (error) {
    res.render('register', { error: error.message });
  }
}


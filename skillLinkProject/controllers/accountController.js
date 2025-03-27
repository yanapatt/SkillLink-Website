const AccountModel = require('../models/accountModel');

exports.authenticate = (req, res, next) => {
  if (req.session.accountSession) {
    next();
  } else {
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

exports.showLoginPage = (req, res) => {
  res.render('login', { error: req.query.error || null });
};

exports.showRegisterPage = (req, res) => {
  res.render('register', { error: null });
}

exports.login = (req, res) => {
  const { username, password } = req.body;
  const account = new AccountModel();
  const accountSession = account.authenticateAccount(username, password);

  if (accountSession) {
    req.session.accountSession = accountSession.accountId;
    console.log(username + " has logged in");
    console.log("Account ID stored in session:", req.session.accountSession);
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


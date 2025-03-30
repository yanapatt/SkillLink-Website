const AccountModel = require('../models/accountModel');
const accountModel = new AccountModel();

const handleError = (res, view, errorMessage) => {
  console.error(errorMessage);
  res.render(view, { error: errorMessage });
};

exports.authenticate = (req, res, next) => {
  req.session.accountSession ? next() : res.redirect('/login');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};

exports.showLoginPage = (req, res) => res.render('login', { error: req.query.error || null });

exports.showRegisterPage = (_req, res) => res.render('register', { error: null });

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const accountSession = accountModel.authenticateAccount(username, password);

    if (!accountSession) {
      return handleError(res, 'login', `Invalid credentials for username: ${username}`);
    }

    req.session.accountSession = accountSession.accountId;
    console.log(`${username} has logged in (AccountID: ${req.session.accountSession})`);

    return res.redirect('/');
  } catch (error) {
    return handleError(res, 'login', 'An error occurred during login.');
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, phone, accountType } = req.body;

    if (![username, email, password, phone].every(Boolean)) {
      throw new Error('All fields are required!');
    }

    accountModel.createAccount({
      username,
      email,
      password,
      phone,
      accountType: accountType || 'User'
    });

    console.log(`${username} registered successfully.`);
    return res.redirect('/login');
  } catch (error) {
    return handleError(res, 'register', error.message);
  }
};
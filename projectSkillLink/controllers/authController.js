
const Encryption = require('../util');

util = new Encryption();
// Hardcoded username and password
const credentials = {
    username: 'admin',
    password: '6002968392b901e9305d87e3', 
    //'123',
  };
  
  // Middleware to check authentication
  exports.authenticate = (req, res, next) => {
    if (req.session.user) {
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



// Handle login
exports.login = (req, res) => {
  const { username, password } = req.body;
  secret = util.encrypt(password);
  if (username === credentials.username && secret === credentials.password) {
    req.session.user = username;
    console.log(username + " has logged in");
    res.redirect('/');
  } else {
    // Reflect the unsanitized username in the error message
    const error = `Invalid credentials for username: ${username}`;
    console.log("username or password is not correct");
    res.render('login', { error });
  }
};


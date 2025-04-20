const express = require('express');
const path = require('path');
const session = require('express-session');
const postController = require('./controllers/postController');
const accountController = require('./controllers/accountController');

// Initialize Express app
const app = express();
// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static file middleware for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true
  })
);

// Login and Register
app.get('/login', accountController.showLoginPage);
app.post('/login', accountController.login);
app.get('/register', accountController.showRegisterPage);
app.post('/register', accountController.register);
app.get('/logout', accountController.authenticate, accountController.logout);

// Index page
app.get('/', accountController.authenticate, postController.renderDisplay);

// CRUD operations for posts
app.post('/add', accountController.authenticate, postController.createNewPost); // Create new post

app.post('/search', accountController.authenticate, postController.searchPostByAction); // Search posts
app.get('/clear-search', accountController.authenticate, postController.clearSearch); // Clear search result
app.get('/view/:postTitle', accountController.authenticate, postController.aboutPost); // View a post by its name

app.post('/update/:postTitle', accountController.authenticate, postController.updatePost); // Update post details
app.post('/posts/:postTitle/rate', accountController.authenticate, postController.ratingPost); // Rate a post

app.post('/remove-posts', accountController.authenticate, postController.removePostsByAction); // Delete multiple posts
app.post('/remove-first', accountController.authenticate, postController.removeFirstPost); // Delete first post
app.post('/remove-last', accountController.authenticate, postController.removeLastPost); // Delete last post

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

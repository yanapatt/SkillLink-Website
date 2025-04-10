const express = require('express');
const path = require('path');
const session = require('express-session');
const postController = require('./controllers/postController');
const accountController = require('./controllers/accountController');
const sessionMiddleware = require('./controllers/sessionMiddleware');

// Initialize Express app
const app = express();
// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static file middleware for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Routes
app.use(sessionMiddleware);

// Login and Register routes are not protected
app.get('/login', accountController.showLoginPage);
app.post('/login', accountController.login);
app.get('/register', accountController.showRegisterPage);
app.post('/register', accountController.register);
app.get('/logout', accountController.authenticate, accountController.logout);

app.get('/', accountController.authenticate, postController.renderPosts); // Retrieve posts, only if authenticated
//app.get('/my-posts', accountController.authenticate, postController.getMyPosts); // Retrieve my posts
//app.post('/add', accountController.authenticate, postController.createPosts); // Add new post
//app.get('/sort', accountController.authenticate, postController.sortPostsByRating); // Sort posts by rating
//app.get('/view/:postTitle', accountController.authenticate, postController.aboutPost); // View a post by its name
//app.get('/edit/:postTitle', accountController.authenticate, postController.aboutPost); // View a post for editing
//app.post('/update/:postTitle', accountController.authenticate, postController.updatePost); // Update post details
//app.post('/posts/:postTitle/rate', accountController.authenticate, postController.ratePost); // Rate a post

// Search and clear search routes
//app.post('/search', accountController.authenticate, postController.searchPosts); // Search posts
//app.get('/clear-search', accountController.authenticate, postController.clearSearch); // Clear search results

// Delete post routes
//app.post('/remove-multiple-posts', accountController.authenticate, postController.removeMultiplePosts); // Delete multiple posts
//app.post('/remove/:postTitle', accountController.authenticate, postController.removePostByTitle); // Delete a post by name
//app.post('/remove-image/:postTitle', accountController.authenticate, postController.removeImage); // Delete an image from a post
//app.post('/remove-by-action', accountController.authenticate, postController.removePostByAction); // Delete post by action (newest or oldest)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

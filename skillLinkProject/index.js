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

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
// Login and Register routes are not protected
app.get('/login', accountController.showLoginPage);
app.post('/login', accountController.login);
app.get('/register', accountController.showRegisterPage);
app.post('/register', accountController.register);
app.get('/logout', accountController.authenticate, accountController.logout);

// Routes that require authentication (protect with accountController.authenticate)
app.get('/', accountController.authenticate, postController.getPosts); // Retrieve posts, only if authenticated

//app.post('/add', accountController.authenticate, postController.createPosts); // Add new post
//app.get('/sort', accountController.authenticate, postController.sortPostsByRating); // Sort posts by rating
//app.get('/view/:name', accountController.authenticate, postController.aboutPost); // View a post by its name
//app.get('/edit/:name', accountController.authenticate, postController.aboutPost); // View a post for editing
//app.post('/update/:name', accountController.authenticate, postController.updatePost); // Update post details
//app.post('/posts/:name/rate', accountController.authenticate, postController.ratePost); // Rate a post

// Search and clear search routes
//app.post('/search', accountController.authenticate, postController.searchPosts); // Search posts
//app.get('/clear-search', accountController.authenticate, postController.clearSearch); // Clear search results

// Delete post routes
//app.post('/delete', accountController.authenticate, postController.deleteMultiplePosts); // Delete multiple posts
//app.post('/delete/:name', accountController.authenticate, postController.deletePost); // Delete a post by name
//app.post('/delete-image/:name', accountController.authenticate, postController.deleteImage); // Delete an image from a post
//app.post('/delete-post', accountController.authenticate, postController.deletePostByAction); // Delete post by action (newest or oldest)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

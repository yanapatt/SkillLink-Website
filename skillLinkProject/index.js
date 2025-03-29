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
app.get('/', accountController.authenticate, postController.getPosts);

app.get('/logout', accountController.logout);
app.get('/login', accountController.showLoginPage);
app.post('/login', accountController.login);
app.get('/register', accountController.showRegisterPage);
app.post('/register', accountController.register);

app.post('/add', accountController.authenticate, postController.createPosts);
app.get('/sort', accountController.authenticate, postController.sortPostsByRating);
app.get('/view/:name', postController.aboutPost);
app.get('/edit/:name', postController.aboutPost);
app.post('/update/:name', postController.updatePost);
app.post('/posts/:name/rate', accountController.authenticate, postController.ratePost);

app.post('/search', accountController.authenticate, postController.searchPosts);
app.get('/clear-search', postController.clearSearch);

app.post('/delete', accountController.authenticate, postController.deleteMultiplePosts);
app.post('/delete/:name', postController.deletePost);
app.post('/delete-image/:name', postController.deleteImage);
app.post('/delete-post', accountController.authenticate, postController.deletePostByAction);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const fs = require('fs');
const path = require('path');
const Post = require('../models/postModel');
const LinkedList = require('../models/linkedList');
const multer = require('multer');
const AccountModel = require('../models/accountModel');
const postModel = new Post();
const postsFilePath = path.join(__dirname, '..', 'database', 'posts.json');
const uploadsDir = path.resolve(__dirname, '../uploads');

postModel.loadPostsFromFile(postsFilePath);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const accountModel = new AccountModel();

function getUsernameFromSession(req) {
  const accountId = req.session.accountSession;
  let username = 'Guest';

  accountModel.loadAccountsFromFile();

  if (accountId) {
    accountModel.accounts.forEachNode((account) => {
      if (account.accountId === accountId) {
        username = account.username;
      }
    });
  }
  return username;
}

exports.createPosts = [upload.single('image'), (req, res) => {
  const accountId = req.session.accountSession;

  if (!accountId) {
    return res.status(400).send("Account not found in session!");
  }

  const post = {
    name: req.body.name,
    description: req.body.description,
    rating: req.body.rating
  };

  if (req.file) {
    post.imageUrl = `/uploads/${req.file.filename}`;
  }

  postModel.addPost(post, accountId);
  console.log("Create post successful!")
  postModel.savePostsToFile(postsFilePath);
  res.redirect('/');
}];

exports.deleteMultiplePosts = (req, res) => {
  let { postNames, rating, action } = req.body;

  if (action === 'removeByRating') {
    const postArray = postModel.posts.toArray();
    const postsToRemove = postArray.filter((post) => post.rating === rating);

    postsToRemove.forEach((post) => {
      if (post.imageUrl) {
        const imagePath = path.join(__dirname, '..', post.imageUrl);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log('Error deleting image:', err);
          } else {
            console.log(`Image for post "${post.name}" deleted`);
          }
        });
      }
    });
    const filteredPosts = postArray.filter((post) => post.rating !== rating);
    postModel.posts = new LinkedList();
    filteredPosts.forEach((post) => postModel.posts.insertLast(post));
  }

  if (postNames) {
    postNames = Array.isArray(postNames) ? postNames : [postNames];
    postNames.forEach((name) => {
      const post = postModel.posts.toArray().find(post => post.name === name);

      if (post && post.imageUrl) {
        const imagePath = path.join(__dirname, '..', post.imageUrl);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log('Error deleting image:', err);
          } else {
            console.log(`Image for post "${name}" deleted`);
          }
        });
      }
      postModel.posts.removeByName(name);
    });
  }

  postModel.savePostsToFile(postsFilePath);
  console.log(postModel.posts.getSize());
  res.redirect('/');
};

exports.getPosts = (req, res) => {
  const allPosts = postModel.getAllPosts();
  const summary = postModel.summarizeByRating();
  const username = getUsernameFromSession(req);

  const posts = allPosts.map(post => {
    let postUsername = 'Unknown';
    accountModel.accounts.forEachNode((account) => {
      if (account.accountId === post.accountId) {
        postUsername = account.username;
      }
    });
    post.username = postUsername;
    return post;
  });

  res.render('index', { posts, summary, username });
};

exports.viewPost = (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find((post) => post.name === postName);
  res.render('post', { post });
};

exports.editPost = (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find((post) => post.name === postName);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  res.render('edit', { post });
};

exports.updatePost = [upload.single('image'), (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find((post) => post.name === postName);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  post.description = req.body.description;
  post.rating = req.body.rating;

  if (req.file) {
    if (post.imageUrl) {
      const oldImagePath = path.join(__dirname, '..', post.imageUrl);
      fs.unlink(oldImagePath, (err) => {
        if (err) console.log('Error deleting old image:', err);
      });
    }
    post.imageUrl = `/uploads/${req.file.filename}`;
  }

  postModel.savePostsToFile(postsFilePath);
  res.redirect('/');
}];

exports.deletePost = (req, res) => {
  const postName = req.params.name;
  const post = postModel.posts.toArray().find(post => post.name === postName);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  if (post.imageUrl) {
    const imagePath = path.join(__dirname, '..', post.imageUrl);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.log('Error deleting image:', err);
      } else {
        console.log(`Image for post "${postName}" deleted`);
      }
    });
  }

  postModel.posts.removeByName(postName);
  postModel.savePostsToFile(postsFilePath);
  console.log(`Post "${postName}" deleted successfully!`);
  res.redirect('/');
};

exports.deleteImage = (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find(post => post.name === postName);

  if (!post) {
    console.error("Post not found:", postName);
    return res.status(404).json({ error: "Post not found" });
  }

  if (post.imageUrl) {
    const imagePath = path.join(__dirname, '..', post.imageUrl);
    console.log(imagePath);
    console.log("Deleting image:", imagePath);

    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting image:', err);
        return res.status(500).json({ error: "Error deleting image", details: err.message });
      }

      post.imageUrl = null;
      res.json({ success: true });
    });
  } else {
    console.error("No image found for post:", postName);
    res.status(400).json({ error: "No image to delete" });
  }
};

exports.sortPostsByRating = (req, res) => {
  const sortedPosts = postModel.sortByRating();
  const summary = postModel.summarizeByRating();
  const username = getUsernameFromSession(req);
  res.render('index', { posts: sortedPosts, summary, username });
};

exports.searchPosts = (req, res) => {
  const { searchTerm, searchType } = req.body;

  if (!searchTerm) {
    return res.send("กรุณากรอกคำค้นหา");
  }

  let foundPosts;

  if (searchType === 'title') {
    foundPosts = postModel.searchByTitle(searchTerm);
  } else if (searchType === 'author') {
    foundPosts = postModel.searchByAuthor(searchTerm);
  } else {
    return res.send("ประเภทการค้นหาไม่ถูกต้อง");
  }

  const summary = postModel.summarizeByRating();
  const foundPostsArray = foundPosts.toArray();
  const username = getUsernameFromSession(req);

  if (foundPostsArray.length > 0) {
    return res.render('index', { posts: foundPostsArray, summary, username });
  }

  res.send("ไม่พบ Post ที่ต้องการ");
};

exports.clearSearch = (req, res) => {
  res.redirect('/');
}

exports.deleteOldestPost = (req, res) => {
  if (postModel.posts.getSize() > 0) {
    const post = postModel.posts.toArray()[0];
    if (post && post.imageUrl) {
      const imagePath = path.join(__dirname, '..', post.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log('Error deleting image:', err);
        } else {
          console.log(`Image for post "${post.name}" deleted`);
        }
      });
    }

    postModel.posts.removeFirst();
    postModel.savePostsToFile(postsFilePath);
    console.log("First post has been removed");
  } else {
    console.log("No posts to remove");
  }
  console.log(postModel.posts.getSize());
  res.redirect('/');
};

exports.deleteNewestPost = (req, res) => {
  if (postModel.posts.getSize() > 0) {
    const post = postModel.posts.toArray().slice(-1)[0];
    if (post && post.imageUrl) {
      const imagePath = path.join(__dirname, '..', post.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log('Error deleting image:', err);
        } else {
          console.log(`Image for post "${post.name}" deleted`);
        }
      });
    }
    postModel.posts.removeLast();
    postModel.savePostsToFile(postsFilePath);
    console.log("Last post has been removed");
  } else {
    console.log("No posts to remove");
  }
  console.log(postModel.posts.getSize());
  res.redirect('/');
};

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Post = require('../models/postModel');
const AccountModel = require('../models/accountModel');

const postModel = new Post();
const accountModel = new AccountModel();
const postsFilePath = path.join(__dirname, '..', 'database', 'posts.json');
const uploadsDir = path.resolve(__dirname, '../uploads');

function initializeData() {
  postModel.loadPostsFromFile(postsFilePath);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
}
initializeData();

function deleteImageFile(imgUrl) {
  if (imgUrl) {
    const imgPath = path.join(__dirname, '..', imgUrl);
    fs.unlink(imgPath, (err) => {
      if (err) {
        console.log('Error to deleting this image:', err);
      } else {
        console.log(`This Image at ${imgPath} has been deleted`);
      }
    })
  }
}

const deleteOldImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    if (imageUrl) {
      const oldImagePath = path.join(__dirname, '..', imageUrl);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          reject(`Error deleting old image: ${err}`);
        } else {
          resolve(`Old image at ${oldImagePath} has been deleted`);
        }
      });
    } else {
      resolve('No old image to delete');
    }
  });
};

const updatePostDetails = async (post, req) => {
  try {
    post.description = req.body.description;
    post.rating = req.body.rating;

    if (req.file) {
      await deleteOldImage(post.imageUrl);
      post.imageUrl = `/uploads/${req.file.filename}`;
    }

    return post;
  } catch (error) {
    throw new Error(`Error updating post details: ${error}`);
  }
};

function savePosts() {
  postModel.savePostsToFile(postsFilePath);
}

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage: storage });

function getUsernameFromSession(req) {
  if (!req.session || !req.session.accountSession) {
    return 'Guest';
  }

  const accountId = req.session.accountSession;
  let username = 'Guest';

  if (!accountModel.accounts || accountModel.accounts.isEmpty()) {
    accountModel.loadAccountsFromFile();
  }

  accountModel.accounts.forEachNode((account) => {
    if (account.accountId === accountId) {
      username = account.username;
      return;
    }
  });

  return username;
}

const getUsernameFromAccountId = (accountId) => {
  let postUsername = 'Unknown';
  accountModel.accounts.forEachNode((account) => {
    if (account.accountId === accountId) {
      postUsername = account.username;
    }
  });
  return postUsername;
};

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
  savePosts();
  res.redirect('/');
}];

exports.deleteMultiplePosts = (req, res) => {
  let { postNames, rating, action } = req.body;

  if (action === 'removeByRating') {
    postModel.posts.forEachNode((post) => {
      if (post.rating === rating) {
        if (post.imageUrl) {
          deleteImageFile(post.imageUrl);
        }
        postModel.posts.removeByName(post.name);
      }
    });
  }

  if (postNames) {
    postNames = Array.isArray(postNames) ? postNames : [postNames];
    postNames.forEach((name) => {
      postModel.posts.forEachNode((post) => {
        if (post.name === name) {
          if (post.imageUrl) {
            deleteImageFile(post.imageUrl);
          }
          postModel.posts.removeByName(post.name);
        }
      });
    });
  }

  savePosts();
  console.log(postModel.posts.getSize());
  res.redirect('/');
};

exports.deletePostByAction = (req, res) => {
  const { action } = req.body;
  if (!action || (action !== 'oldest' && action !== 'newest')) {
    return res.status(400).send("Invalid action. Please specify 'oldest' or 'newest'.");
  }

  if (postModel.posts.getSize() > 0) {
    let post;
    // ลบโพสต์แรก (Oldest)
    if (action === 'oldest') {
      post = postModel.posts.head ? postModel.posts.head.value : null; // เข้าถึงโพสต์แรก
      if (post) {
        if (post.imageUrl) {
          deleteImageFile(post.imagePath);
        }

        postModel.posts.removeFirst();
        console.log("First post has been removed");
      }
    }
    // ลบโพสต์ล่าสุด (Newest)
    else if (action === 'newest') {
      post = postModel.posts.tail ? postModel.posts.tail.value : null;
      if (post) {
        if (post.imageUrl) {
          deleteImageFile(post.imagePath);
        }

        postModel.posts.removeLast();
        console.log("Last post has been removed");
      }
    }
    savePosts();
    console.log(postModel.posts.getSize());
    res.redirect('/');
  } else {
    console.log("No posts to remove");
    res.redirect('/');
  }
};

exports.getPosts = (req, res) => {
  const allPosts = postModel.posts.map((post) => {
    let postUsername = getUsernameFromAccountId(post.accountId);
    post.username = postUsername;
    return post;
  });

  const summary = postModel.summarizeByRating();
  const username = getUsernameFromSession(req);

  res.render('index', { posts: allPosts, summary, username });
};

exports.aboutPost = (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find((post) => post.name === postName);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  if (req.query.action === 'edit') {
    res.render('edit', { post });
  } else {
    res.render('post', { post });
  }
};

exports.updatePost = [upload.single('image'), async (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find((post) => post.name === postName);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  try {
    await updatePostDetails(post, req);
    savePosts();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating post');
  }
}];

exports.deletePost = (req, res) => {
  const postName = req.params.name;
  const post = postModel.posts.toArray().find(post => post.name === postName);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  if (post.imageUrl) {
    deleteImageFile(post.imagePath);
  }

  postModel.posts.removeByName(postName);
  savePosts();
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

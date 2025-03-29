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

const getUsernameFromSession = (req) => {
  if (!req.session || !req.session.accountSession) {
    return 'Guest';
  }

  const accountId = req.session.accountSession;
  let username = 'Guest';
  let accountType = 'User';

  if (!accountModel.accounts || accountModel.accounts.isEmpty()) {
    accountModel.loadAccountsFromFile();
  }

  accountModel.accounts.forEachNode((account) => {
    if (account.accountId === accountId) {
      username = account.username;
      accountType = account.accountType || 'User';
      return;
    }
  });

  return { username, accountType };
};

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
  const { username, accountType } = getUsernameFromSession(req);

  res.render('index', { posts: allPosts, summary, username, accountType });
};

exports.aboutPost = (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find((post) => post.name === postName);

  // หากไม่พบโพสต์
  if (!post) {
    return res.status(404).send("Post not found");
  }

  // ดึง accountId ของผู้ใช้จาก session
  const accountId = req.session.accountSession; // สมมติว่า accountSession เก็บ accountId ของผู้ใช้ที่ล็อกอิน

  // ตรวจสอบว่าโพสต์นี้เป็นของผู้ใช้ที่กำลังล็อกอินอยู่หรือไม่
  if (req.query.action === 'edit') {
    // เฉพาะเจ้าของโพสต์ที่สามารถแก้ไขได้
    if (post.accountId !== accountId) {
      return res.status(403).send("You are not authorized to edit this post");
    }
    res.render('edit', { post, accountId });
  } else {
    res.render('post', { post, accountId });
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
  const { username, accountType } = getUsernameFromSession(req);
  res.render('index', { posts: sortedPosts, summary, username, accountType });
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
  const { username, accountType } = getUsernameFromSession(req);

  if (foundPosts.length > 0) {
    return res.render('index', { posts: foundPosts, summary, username, accountType });
  }

  res.send("ไม่พบ Post ที่ต้องการ");
};

exports.clearSearch = (req, res) => {
  res.redirect('/');
}

const addRatingToPost = (post, newRating) => {
  if (typeof newRating === 'number' && newRating >= 1 && newRating <= 5) {
    post.rating.insertLast(newRating);
    return true;
  }
  return false;
};

exports.ratePost = (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find(post => post.name === postName);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  const accountId = req.session.accountSession;  // accountId ของผู้ใช้ที่กำลังให้คะแนน
  const rating = parseInt(req.body.rating);

  if (rating < 1 || rating > 5) {
    return res.status(400).send("Invalid rating value. Must be between 1 and 5.");
  }

  // ตรวจสอบว่าโพสต์นี้มีคะแนนจากผู้ใช้คนนี้อยู่หรือไม่
  if (post.ratings) {
    const existingRatingIndex = post.ratings.findIndex(rating => rating.accountId === accountId);

    if (existingRatingIndex !== -1) {
      // ถ้ามีคะแนนจากผู้ใช้อยู่แล้ว ให้ลบคะแนนเก่าออก
      post.ratings[existingRatingIndex].rating = rating;  // แก้ไขคะแนนเป็นคะแนนใหม่
    } else {
      // ถ้าไม่มีคะแนนจากผู้ใช้คนนั้น ให้เพิ่มคะแนนใหม่
      post.ratings.push({ accountId, rating });
    }
  } else {
    // ถ้าไม่มีการตั้งค่า ratings ให้สร้าง array ขึ้นมาแล้วเพิ่มคะแนนใหม่
    post.ratings = [{ accountId, rating }];
  }

  // คำนวณคะแนนเฉลี่ย
  post.rating = (post.ratings && post.ratings.size > 0)
    ? post.ratings.reduce((acc, rating) => acc + rating.rating, 0) / post.ratings.size
    : 0;

  // ทำให้มั่นใจว่า post.rating เป็นตัวเลข
  post.rating = Number(post.rating) || 0;

  // บันทึกการเปลี่ยนแปลง
  savePosts();

  console.log(`Post "${postName}" has been rated successfully!`);
  res.redirect(`/view/${postName}`);
};





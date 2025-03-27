const fs = require('fs');
const path = require('path');
const Post = require('../models/postModel');
const LinkedList = require('../models/linkedList');
const multer = require('multer');

// Initialize the Post model
const postModel = new Post();
const postsFilePath = path.join(__dirname, '..', 'database', 'posts.json'); // Changed to point to the 'database' folder

// Load posts from file on app start
postModel.loadPostsFromFile(postsFilePath);

const uploadsDir = path.resolve(__dirname, '../uploads');

// ตรวจสอบว่าโฟลเดอร์ 'uploads' มีอยู่แล้วหรือไม่
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);  // สร้างโฟลเดอร์ถ้ายังไม่มี
}

// ตั้งค่าการเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // เก็บไฟล์ในโฟลเดอร์ uploads/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // ตั้งชื่อไฟล์ใหม่
  }
});

const upload = multer({ storage: storage });

// ฟังก์ชัน addPost ที่ใช้ multer เพื่อจัดการไฟล์และข้อมูลที่ส่งมาในฟอร์ม
exports.addPost = [upload.single('image'), (req, res) => {
  console.log("Session Data:", req.session);
  console.log("Session Account ID:", req.session.accountSession);

  const accountId = req.session.accountSession;

  if (!accountId) {
    return res.status(400).send("Account not found in session!");
  } 

  // เช็คว่ามีข้อมูลในฟอร์มหรือไม่
  const post = {
    name: req.body.name,
    description: req.body.description,
    priority: req.body.priority
  };

  // เช็คว่าไฟล์มีหรือไม่
  if (req.file) {
    post.imageUrl = `/uploads/${req.file.filename}`;  // บันทึกรูปภาพที่อัพโหลด
  }

  // เพิ่ม post ลงในฐานข้อมูล
  postModel.addPost(post, accountId);
  console.log("New post has been added");

  // บันทึก post ลงในไฟล์ JSON
  postModel.savePostsToFile(postsFilePath); // Updated to use the new path for posts.json
  res.redirect('/');
}];

exports.deleteMultiplePosts = (req, res) => {
  let { postNames, priority, action } = req.body; // Array of post names to delete

  if (action === 'removeByPriority') {
    // ลบ post ตาม Priority ที่เลือก
    const postArray = postModel.posts.toArray(); // แปลงเป็น Array ก่อน
    const postsToRemove = postArray.filter((post) => post.priority === priority);  // หา post ที่ตรงกับ priority ที่เลือก

    // ลบไฟล์ภาพที่เกี่ยวข้องกับ post ที่จะถูกลบ
    postsToRemove.forEach((post) => {
      if (post.imageUrl) {
        const imagePath = path.join(__dirname, '..', post.imageUrl); // Updated to use the new path for images
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log('Error deleting image:', err);
          } else {
            console.log(`Image for post "${post.name}" deleted`);
          }
        });
      }
    });

    // กรอง post ที่ไม่ตรงกับ priority ที่เลือกออกมา และเพิ่มกลับเข้าไปใน LinkedList
    const filteredPosts = postArray.filter((post) => post.priority !== priority);

    postModel.posts = new LinkedList();  // สร้าง LinkedList ใหม่
    filteredPosts.forEach((post) => postModel.posts.insertLast(post));  // เพิ่ม post ที่เหลือกลับเข้าไป
  }

  if (postNames) {
    postNames = Array.isArray(postNames) ? postNames : [postNames];
    postNames.forEach((name) => {
      // ก่อนลบ post, ต้องค้นหาว่ามี imageUrl หรือไม่ใน post ที่ชื่อ `name`
      const post = postModel.posts.toArray().find(post => post.name === name);

      if (post && post.imageUrl) {
        // ถ้ามี imageUrl, ลบไฟล์จากโฟลเดอร์ uploads
        const imagePath = path.join(__dirname, '..', post.imageUrl); // Updated to use the new path for images
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log('Error deleting image:', err);
          } else {
            console.log(`Image for post "${name}" deleted`);
          }
        });
      }

      // ลบ post จาก LinkedList
      postModel.posts.removeByName(name);
    });
  }

  // บันทึกการเปลี่ยนแปลงลงในไฟล์ posts.json
  postModel.savePostsToFile(postsFilePath); // Updated to use the new path for posts.json
  console.log(postModel.posts.getSize());
  res.redirect('/');  // เปลี่ยนเส้นทางไปยังหน้าหลัก
};

// Controller functions
exports.getPosts = (req, res) => {
  const posts = postModel.getAllPosts();
  const summary = postModel.summarizeByPriority();
  res.render('index', { posts, summary });
};

exports.viewPost = (req, res) => {
  const postName = req.params.name;
  const post = postModel.getAllPosts().find((post) => post.name === postName);
  res.render('post', { post });
};

exports.deletePost = (req, res) => {
  const postName = req.params.name;

  // ค้นหา post ที่ตรงกับชื่อที่รับมา
  const post = postModel.posts.toArray().find(post => post.name === postName);

  if (post && post.imageUrl) {
    // ถ้ามี imageUrl, ลบไฟล์จากโฟลเดอร์ uploads
    const imagePath = path.join(__dirname, '..', post.imageUrl); // Updated to use the new path for images
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.log('Error deleting image:', err);
      } else {
        console.log(`Image for post "${postName}" deleted`);
      }
    });
  }

  // ลบ post จาก LinkedList
  postModel.posts.removeByName(postName);

  // บันทึกการเปลี่ยนแปลงลงในไฟล์ posts.json
  postModel.savePostsToFile(postsFilePath); // Updated to use the new path for posts.json
  console.log(postModel.posts.getSize());

  // เปลี่ยนเส้นทางไปยังหน้าหลัก
  res.redirect('/');
};

exports.sortPostsByPriority = (req, res) => {
  const sortedPosts = postModel.sortByPriority();
  const summary = postModel.summarizeByPriority();
  res.render('index', { posts: sortedPosts, summary });
};

exports.searchPosts = (req, res) => {
  const { searchTerm, searchType } = req.body;

  if (!searchTerm) {
    return res.send("กรุณากรอกคำค้นหา");
  }

  let foundPosts;

  if (searchType === 'name') {
    foundPosts = postModel.searchByName(searchTerm);
  } else if (searchType === 'description') {
    foundPosts = postModel.searchByDescription(searchTerm);
  } else {
    return res.send("ประเภทการค้นหาไม่ถูกต้อง");
  }

  const summary = postModel.summarizeByPriority();

  if (foundPosts.length > 0) {
    return res.render('index', { posts: foundPosts, summary });
  }

  res.send("ไม่พบ Post ที่ต้องการ");
};

// ฟังก์ชันในการลบ post แรก (Oldest Post)
exports.deleteOldestPost = (req, res) => {
  if (postModel.posts.getSize() > 0) {  // ตรวจสอบว่ามี post ใน LinkedList หรือไม่
    const post = postModel.posts.toArray()[0];  // หางานแรก
    if (post && post.imageUrl) {
      // ถ้ามี imageUrl, ลบไฟล์จากโฟลเดอร์ uploads
      const imagePath = path.join(__dirname, '..', post.imageUrl); // Updated to use the new path for images
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log('Error deleting image:', err);
        } else {
          console.log(`Image for post "${post.name}" deleted`);
        }
      });
    }

    // ลบ post แรกจาก LinkedList
    postModel.posts.removeFirst();
    postModel.savePostsToFile(postsFilePath);  // บันทึกการเปลี่ยนแปลง
    console.log("First post has been removed");
  } else {
    console.log("No posts to remove");  // ถ้าไม่มี post ใน LinkedList
  }

  console.log(postModel.posts.getSize());
  res.redirect('/');  // เปลี่ยนเส้นทางไปยังหน้าหลัก
};

// ฟังก์ชันในการลบ post ล่าสุด (Last Post)
exports.deleteNewestPost = (req, res) => {
  if (postModel.posts.getSize() > 0) {  // ตรวจสอบว่ามี post ใน LinkedList หรือไม่
    const post = postModel.posts.toArray().slice(-1)[0];  // หางานล่าสุด (Last post)
    if (post && post.imageUrl) {
      // ถ้ามี imageUrl, ลบไฟล์จากโฟลเดอร์ uploads
      const imagePath = path.join(__dirname, '..', post.imageUrl); // Updated to use the new path for images
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log('Error deleting image:', err);
        } else {
          console.log(`Image for post "${post.name}" deleted`);
        }
      });
    }

    // ลบ post ล่าสุดจาก LinkedList
    postModel.posts.removeLast();
    postModel.savePostsToFile(postsFilePath);  // บันทึกการเปลี่ยนแปลง
    console.log("Last post has been removed");
  } else {
    console.log("No posts to remove");  // ถ้าไม่มี post ใน LinkedList
  }

  console.log(postModel.posts.getSize());
  res.redirect('/');  // เปลี่ยนเส้นทางไปยังหน้าหล
};

const fs = require('fs');
const path = require('path');
const LinkedList = require('./linkedList');
const AccountModel = require('./accountModel');

class Post {
  constructor() {
    this.posts = new LinkedList();
    this.accountModel = new AccountModel();
    this.filePath = path.join(__dirname, '..', 'database', 'posts.json');
    this.loadPostsFromFile();
  }

  ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  }

  addPost(post, accountId) {
    const account = this.findAccountById(accountId);

    if (account) {
      const newPost = {
        name: post.name,
        accountId: account.accountId,
        description: post.description,
        rating: 0,  // ค่าเริ่มต้นเป็น 0
        imageUrl: post.imageUrl || null,
        ratings: new LinkedList()  // ใช้ LinkedList สำหรับ ratings
      };

      // ถ้ามีการให้คะแนนจากผู้ใช้
      if (post.ratings && Array.isArray(post.ratings)) {
        post.ratings.forEach(rate => {
          newPost.ratings.insertLast(rate);  // ใส่ rating ใหม่ลงใน LinkedList
        });
        newPost.rating = this.calculateAverageRating(newPost.ratings);  // คำนวณเฉลี่ยจาก LinkedList
      }

      if (!this.findPostByName(newPost.name)) {
        this.posts.insertLast(newPost);  // เพิ่มโพสต์ใหม่ลงใน LinkedList
      } else {
        console.error(`Post with name "${newPost.name}" already exists.`);
      }
    } else {
      console.error(`Invalid accountId: "${accountId}".`);
    }
  }

  //
  summarizeByRating() {
    const postRatings = [];
    this.posts.forEachNode((post) => {
      if (post.ratings.size > 0) {
        const avgRating = this.calculateAverageRating(post.ratings);
        postRatings.push({ post, avgRating });
      }
    });

    postRatings.sort((a, b) => b.avgRating - a.avgRating);  // เรียงโพสต์จากคะแนนสูงสุด

    return postRatings.slice(0, 5);  // เลือก 5 อันดับโพสต์ที่ดีที่สุด
  }

  sortByRating() {
    const sortedPosts = [];

    this.posts.forEachNode((post) => {
      // เก็บเฉพาะ post ที่ต้องการคืนค่าพร้อมเรียงตาม rating
      sortedPosts.push(post);
    });

    // เรียงโพสต์จาก rating ที่สูงสุด
    return sortedPosts.sort((a, b) => b.rating - a.rating);  // เรียงโพสต์ตาม rating ภายใน
  }

  //
  calculateAverageRating(ratingsLinkedList) {
    if (ratingsLinkedList.size === 0) {
      return 0;  // ถ้าไม่มีคะแนน จะคืนค่า 0
    }

    let total = 0;
    ratingsLinkedList.forEachNode((node) => {
      total += node.data.rating;  // ใช้ node.data.rating แทน rate.rating
    });

    return total / ratingsLinkedList.size;  // คำนวณค่าเฉลี่ย
  }

  findAccountById(accountId) {
    let found = null;
    this.accountModel.accounts.forEachNode((acc) => {
      if (acc.accountId === accountId) {
        found = acc;
      }
    });
    return found;
  }

  //
  findPostByName(name) {
    let found = null;
    this.posts.forEachNode((post) => {
      if (post.name.toLowerCase() === name.toLowerCase()) {
        found = post;
      }
    });
    return found;
  }

  //
  getAllPosts() {
    const allPosts = [];
    this.posts.forEachNode(post => allPosts.push(post));  // นำโพสต์ทั้งหมดมาจาก LinkedList
    return allPosts;
  }

  //
  searchByTitle(name) {
    const foundPosts = new LinkedList();
    this.posts.forEachNode((post) => {
      if (post.name && post.name.toLowerCase().includes(name.toLowerCase())) {
        foundPosts.insertLast(post);
      }
    });
    return foundPosts.toArray();
  }

  searchByAuthor(username) {
    const foundPosts = new LinkedList();
    const account = this.accountModel.accounts.toArray().find(acc => acc.username.toLowerCase() === username.toLowerCase());

    if (account) {
      this.posts.forEachNode((post) => {
        if (post.accountId === account.accountId) {
          foundPosts.insertLast(post);
        }
      });
    } else {
      console.error('Username not found');
    }

    return foundPosts.toArray();
  }

  //
  savePostsToFile() {
    try {
      this.ensureDirectoryExistence(this.filePath);
      const postsData = JSON.stringify(this.posts.toArray(), null, 2);

      fs.writeFileSync(`${this.filePath}.tmp`, postsData);
      fs.renameSync(`${this.filePath}.tmp`, this.filePath);
    } catch (error) {
      console.error("Error saving posts to file:", error.message);
    }
  }

  //
  loadPostsFromFile() {
    if (!fs.existsSync(this.filePath)) return;

    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      if (!data.trim()) return;

      const parsedData = JSON.parse(data);

      if (Array.isArray(parsedData)) {
        parsedData.forEach((post) => {
          if (!this.findPostByName(post.name)) {
            const newPost = {
              name: post.name,
              accountId: post.accountId,
              description: post.description,
              rating: post.rating || 0,  // ตั้งค่า rating เป็น 0
              imageUrl: post.imageUrl || null,
              ratings: post.ratings || new LinkedList()  // ถ้าไม่มี ratings ให้เป็น LinkedList
            };

            this.posts.insertLast(newPost);
          }
        });
      }
    } catch (error) {
      console.error("Error loading posts from file:", error.message);
    }
  }

}

module.exports = Post;

const fs = require('fs');
const Encryption = require('../util');
const LinkedList = require('./linkedList');
const path = require('path');
const AccountModel = require('./accountModel');

const util = new Encryption();

class Post {
  constructor(accountModel) {
    this.posts = new LinkedList();
    this.accountModel = new AccountModel(); // รับ accountModel เพื่อใช้ในการค้นหา accountId
  }

  // Add a new post with accountId
  addPost(post, accountId) {
    let account = null;
    this.accountModel.accounts.forEachNode((acc) => {
      if (acc.accountId === accountId) {
        account = acc;  // เจอแล้วให้เก็บบัญชีที่ตรงกัน
      }
    });

    if (account) {
      post.accountId = account.accountId;
      const newPost = {
        name: post.name,
        accountId: account.accountId,
        description: post.description,
        priority: post.priority,
        imageUrl: post.imageUrl
      };
      this.posts.insertLast(newPost);

    } else {
      console.log("Account not found!");
    }
  }

  // Get all posts with encrypted username
  getAllPosts() {
    const encryptedPosts = [];
    this.posts.forEachNode((post) => {
      encryptedPosts.push(this.encryptPost(post));
    });
    return encryptedPosts;
  }

  // Summarize posts by priority
  summarizeByPriority() {
    const summary = {};
    this.posts.forEachNode((post) => {
      summary[post.priority] = (summary[post.priority] || 0) + 1;
    });
    return summary;
  }

  // Sort posts by priority
  sortByPriority() {
    const sortedPosts = this.posts.toArray().sort((a, b) => a.priority - b.priority);
    return sortedPosts.map(post => this.encryptPost(post));
  }

  // Search for posts by name
  searchByName(name) {
    const foundPosts = new LinkedList();
    this.posts.forEachNode((post) => {
      if (post.name.toLowerCase().includes(name.toLowerCase())) {
        foundPosts.insertLast(post);
      }
    });
    return foundPosts.toArray().map(post => this.encryptPost(post));
  }

  // Search for posts by description
  searchByDescription(description) {
    const foundPosts = new LinkedList();
    this.posts.forEachNode((post) => {
      if (post.description.toLowerCase().includes(description.toLowerCase())) {
        foundPosts.insertLast(post);
      }
    });
    return foundPosts.toArray().map(post => this.encryptPost(post));
  }

  // Encrypt the username in the post
  encryptPost(post) {
    return post.username
      ? { ...post, username: util.encrypt(post.username) } : post;
  }

  // Save posts to a file
  savePostsToFile(filePath) {
    this.ensureFileExistence(filePath);
    console.log("Save to file successful!");
    fs.writeFileSync(filePath, JSON.stringify(this.posts.toArray(), null, 2));
  }

  // Load posts from a file
  loadPostsFromFile(filePath) {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath));
      data.forEach((post) => this.addPost(post));
    }
  }

  // Ensure the directory for the file exists
  ensureFileExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  }
}

module.exports = Post;

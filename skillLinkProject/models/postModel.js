const fs = require('fs');
const LinkedList = require('./linkedList');
const path = require('path');
const AccountModel = require('./accountModel');

class Post {
  constructor() {
    this.posts = new LinkedList();
    this.accountModel = new AccountModel();
  }

  ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  }

  addPost(post, accountId) {
    let account = null;
    this.accountModel.accounts.forEachNode((acc) => {
      if (acc.accountId === accountId) {
        account = acc;
      }
    });

    if (account) {
      post.accountId = account.accountId;
      const newPost = {
        name: post.name,
        accountId: account.accountId,
        description: post.description,
        rating: post.rating,
        imageUrl: post.imageUrl
      };
      this.posts.insertLast(newPost);
    }
  }

  getAllPosts() {
    const allPosts = [];
    this.posts.forEachNode((post) => {
      allPosts.push(post);
    });
    return allPosts;
  }

  summarizeByRating() {
    const summary = {};
    this.posts.forEachNode((post) => {
      summary[post.rating] = (summary[post.rating] || 0) + 1;
    });
    return summary;
  }

  sortByRating() {
    const sortedPosts = this.posts.toArray().sort((a, b) => a.rating - b.rating);
    return sortedPosts;
  }

  searchByTitle(name) {
    const foundPosts = new LinkedList();
    this.posts.forEachNode((post) => {
      if (post.name.toLowerCase().includes(name.toLowerCase())) {
        foundPosts.insertLast(post);
      }
    });
    return foundPosts;
  }

  searchByAuthor(username) {
    const foundPosts = new LinkedList();
    this.posts.forEachNode((post) => {
      if (post.username.toLowerCase().includes(username.toLowerCase())) {
        foundPosts.insertLast(post);
      }
    });
    return foundPosts;
  }

  savePostsToFile(filePath) {
    this.ensureDirectoryExistence(filePath);
    fs.writeFileSync(filePath, JSON.stringify(this.posts.toArray(), null, 2));
  }

  loadPostsFromFile(filePath) {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath));
      data.forEach((post) => this.addPost(post, post.accountId));
    }
  }
}

module.exports = Post;

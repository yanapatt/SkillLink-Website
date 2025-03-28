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
        rating: post.rating,
        imageUrl: post.imageUrl || null
      };

      if (!this.findPostByName(newPost.name)) {
        this.posts.insertLast(newPost);
      } else {
        console.error(`Post with name "${newPost.name}" already exists.`);
      }
    } else {
      console.error(`Invalid accountId: "${accountId}".`);
    }
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

  findPostByName(name) {
    let found = null;
    this.posts.forEachNode((post) => {
      if (post.name.toLowerCase() === name.toLowerCase()) {
        found = post;
      }
    });
    return found;
  }

  getAllPosts() {
    return this.posts.toArray();
  }

  summarizeByRating() {
    const summary = {};
    this.posts.forEachNode((post) => {
      summary[post.rating] = (summary[post.rating] || 0) + 1;
    });
    return summary;
  }

  sortByRating() {
    return this.posts.toArray().sort((a, b) => a.rating - b.rating);
  }

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
    let accountArray = this.accountModel.accounts.toArray();

    if (Array.isArray(accountArray)) {
      const account = accountArray.find(account => account.username.toLowerCase() === username.toLowerCase());

      if (account) {
        this.posts.forEachNode((post) => {
          if (post.accountId === account.accountId) {
            foundPosts.insertLast(post);
          }
        });
      } else {
        console.error('Username not found');
      }
    } else {
      console.error('accounts is undefined or not an array');
    }

    return foundPosts.toArray();
  }

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

  loadPostsFromFile() {
    if (!fs.existsSync(this.filePath)) return;

    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      if (!data.trim()) return;

      const parsedData = JSON.parse(data);

      if (Array.isArray(parsedData)) {
        parsedData.forEach((post) => {
          if (!this.findPostByName(post.name)) {
            this.posts.insertLast({
              name: post.name,
              accountId: post.accountId,
              description: post.description,
              rating: post.rating,
              imageUrl: post.imageUrl || null
            });
          }
        });
      }
    } catch (error) {
      console.error("Error loading posts from file:", error.message);
    }
  }
}

module.exports = Post;

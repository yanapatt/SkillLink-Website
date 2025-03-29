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
        rating: new LinkedList(),
        imageUrl: post.imageUrl || null
      };

      if (post.rating && Array.isArray(post.rating)) {
        post.rating.forEach((rate) => {
          newPost.rating.insertLast(rate); 
        });
      }

      if (!this.findPostByName(newPost.name)) {
        this.posts.insertLast(newPost);
      } else {
        console.error(`Post with name "${newPost.name}" already exists.`);
      }
    } else {
      console.error(`Invalid accountId: "${accountId}".`);
    }
  }

  summarizeByRating() {
    const postRatings = [];
    this.posts.forEachNode((post) => {
      if (post.rating && post.rating.length > 0) {
        const avgRating = this.calculateAverageRating(post.rating);
        postRatings.push({ post, avgRating });
      }
    });

    postRatings.sort((a, b) => b.avgRating - a.avgRating);

    const top5Posts = postRatings.slice(0, 5);
    return top5Posts;
  }

  sortByRating() {
    return this.posts.toArray().sort((a, b) => {
      const avgA = this.calculateAverageRating(a.rating);
      const avgB = this.calculateAverageRating(b.rating);
      return avgA - avgB;
    });
  }

  calculateAverageRating(ratingList) {
    if (ratingList.length === 0) {
      return 0; // Return 0 if the list is empty
    }

    let total = 0;
    let count = 0;

    // Iterate over the LinkedList using forEachNode
    ratingList.forEachNode((rate) => {
      total += rate;
      count++;
    });

    return count > 0 ? total / count : 0;
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
            const newPost = {
              name: post.name,
              accountId: post.accountId,
              description: post.description,
              rating: post.rating || new LinkedList(), 
              imageUrl: post.imageUrl || null
            };

            if (Array.isArray(post.rating)) {
              post.rating.forEach((rate) => {
                newPost.rating.insertLast(rate); 
              });
            }

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

const PostService = require("../models/postService"); // เรียกใช้ postService
const PostRepository = require("../models/postRepository"); // เรียกใช้ postRepository

// สร้าง instance ของ PostRepository และ PostService
const postRepo = new PostRepository();
const postService = new PostService(postRepo);

// Create Post
exports.createPosts = async (req, res) => {
    try {
        const postData = req.body; // รับข้อมูลจาก request
        const newPost = await postService.createPost(postData); // สร้างโพสต์ใหม่
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create post" });
    }
};

// Access Post
exports.getPosts = async (req, res) => {
    try {
        const posts = await postService.getAllPosts(); // ดึงโพสต์ทั้งหมด
        console.log("Get post successful!: ", posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve posts" });
    }
};

exports.searchPosts = async (req, res) => {
    try {
        const { query } = req.body;
        const posts = await postService.searchPosts(query); // ค้นหาโพสต์จาก query
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to search posts" });
    }
};

exports.clearSearch = (req, res) => {
    // สามารถจัดการการล้างผลการค้นหาที่เก็บไว้
    res.status(200).json({ message: "Search cleared" });
};

exports.aboutPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await postService.getPostById(postId); // แสดงรายละเอียดโพสต์ตาม ID
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve post" });
    }
};

exports.sortPostsByRating = async (req, res) => {
    try {
        const posts = await postService.sortPostsByRating(); // จัดเรียงโพสต์ตามคะแนน
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to sort posts" });
    }
};

exports.ratePost = async (req, res) => {
    try {
        const { postId, rating } = req.body;
        const updatedPost = await postService.ratePost(postId, rating); // ให้คะแนนโพสต์
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to rate post" });
    }
};

// Delete Post
exports.removePostByRating = async (req, res) => {
    try {
        const { rating } = req.params;
        const result = await postService.removePostByRating(rating); // ลบโพสต์ตามคะแนน
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove post by rating" });
    }
};

exports.removePostByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        const result = await postService.removePostByTitle(title); // ลบโพสต์ตาม title
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove post by title" });
    }
};

exports.removeMultiplePosts = async (req, res) => {
    try {
        const { title, rating } = req.body;
        const result = await postService.removeMultiplePosts(title, rating); // ลบโพสต์หลายอัน
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove multiple posts" });
    }
};

exports.removePostByAction = async (req, res) => {
    try {
        const { action } = req.params;
        const result = await postService.removePostByAction(action); 
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove post by action" });
    }
};

// Update Post
exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const updateData = req.body;
        const updatedPost = await postService.updatePost(postId, updateData); 
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update post" });
    }
};

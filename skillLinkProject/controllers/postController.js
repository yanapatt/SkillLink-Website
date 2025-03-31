const PostService = require("../models/postService"); // เรียกใช้ postService
const PostRepository = require("../models/postRepository"); // เรียกใช้ postRepository
const AccountRepository = require("../models/accountRepository");
const ImageRepository = require("../models/imageRepository");

const postRepo = new PostRepository();
const accRepo = new AccountRepository();
const imgRepo = new ImageRepository();
const postService = new PostService(postRepo, accRepo, imgRepo);

// Create Post
exports.createPosts = [imgRepo.uploadImage(), async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const accountId = req.session.accountSession.accId; // ดึง accountId จาก session
        const postData = req.body; // รับข้อมูลจาก request body
        const imgFile = req.file; // รับไฟล์จาก multer

        console.log("Post data: ", postData);
        console.log("Image file: ", imgFile);

        // สร้างโพสต์ใหม่ผ่าน postService และจัดการภาพ
        const newPost = await postService.createPost(postData, accountId, imgFile);
        console.log("Create post successful!: ", newPost);

        // รีไดเรคกลับไปยังหน้า index
        res.redirect('/'); // หรือใช้ res.render หากต้องการส่งข้อมูลเพิ่มเติม
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create post" });
    }
}];

// Access Post
exports.getPosts = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        // ดึงโพสต์ทั้งหมดจาก service
        const posts = await postService.getAllPosts();
        console.log("Get post successful!: ", posts);

        // ดึงข้อมูลชื่อผู้ใช้จาก session
        let { accUsername, accRole } = req.session.accountSession;

        // เชื่อมโยงข้อมูล accountId ในโพสต์กับข้อมูล account ในระบบ
        const allPosts = await Promise.all(posts.map(async (post) => {
            try {
                // หา accountId ใน post และเชื่อมโยงกับข้อมูลผู้ใช้จาก accountService
                const account = accRepo.retrieveAccountById(post.accountId); // ใช้ accountService ในการดึงข้อมูลบัญชี
                if (account) {
                    // ถ้าพบข้อมูล account ให้เพิ่มข้อมูล username และ role
                    post.accUsername = account.accUsername; // username ของผู้โพสต์
                    post.accRole = account.accRole || 'User'; // ถ้าไม่มี accRole ให้ใช้ 'User'
                } else {
                    // ถ้าไม่พบข้อมูล account ให้ใช้ค่า default
                    post.accUsername = 'Unknown User';
                    post.accRole = 'User';
                }
            } catch (error) {
                console.error("Error retrieving account:", error);
                post.accUsername = 'Unknown User';
                post.accRole = 'User';
            }
            return post;
        }));

        // ส่งข้อมูลไปยังหน้า index ผ่าน res.render
        res.render('index', {
            posts: allPosts,
            accUsername: accUsername,
            accRole: accRole
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve posts" });
    }
};

// ฟังก์ชันค้นหาโพสต์
exports.searchPosts = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { query } = req.body;
        const posts = await postService.searchPosts(query); // ค้นหาโพสต์จาก query
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to search posts" });
    }
};

// ฟังก์ชันแสดงรายละเอียดโพสต์
exports.aboutPost = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

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

// ฟังก์ชันจัดเรียงโพสต์ตามคะแนน
exports.sortPostsByRating = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const posts = await postService.sortPostsByRating(); // จัดเรียงโพสต์ตามคะแนน
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to sort posts" });
    }
};

// ฟังก์ชันให้คะแนนโพสต์
exports.ratePost = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { postId, rating } = req.body;
        const updatedPost = await postService.ratePost(postId, rating); // ให้คะแนนโพสต์
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to rate post" });
    }
};

// ฟังก์ชันลบโพสต์ตามคะแนน
exports.removePostByRating = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { rating } = req.params;
        const result = postService.removePostByRating(rating); // ลบโพสต์ตามคะแนน
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove post by rating" });
    }
};

// ฟังก์ชันลบโพสต์ตาม title
exports.removePostByTitle = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { title } = req.params;
        const result = postService.removePostByTitle(title); // ลบโพสต์ตาม title
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to remove post by title" });
    }
};

// ฟังก์ชันลบโพสต์หลายอัน
exports.removeMultiplePosts = async (req, res) => {
    try {
        const { postTitles } = req.body; // รับ postTitles จากฟอร์ม

        if (!postTitles || postTitles.length === 0) {
            return res.status(400).json({ success: false, message: "No posts selected for deletion." });
        }

        postService.removeMultiplePosts(postTitles);
        res.redirect('/'); // Redirect กลับไปที่หน้าแรก
    } catch (error) {
        console.error("Error deleting multiple posts:", error.message);
        res.status(500).json({ success: false, message: "Failed to delete selected posts." });
    }
};

// ฟังก์ชันลบโพสต์ตาม action
exports.removePostByAction = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const { action } = req.body; // รับ action จาก body
        if (!action || (action !== 'oldest' && action !== 'newest')) {
            return res.status(400).send("Invalid action. Please specify 'oldest' or 'newest'.");
        }

        if (action === 'oldest') {
            // เรียกใช้ removeFirstPost จาก postService
            result = await postService.removeFirstPost();
        } else if (action === 'newest') {
            // เรียกใช้ removeLastPost จาก postService
            result = await postService.removeLastPost();
        }

        //console.log(result.message); // แสดงข้อความผลลัพธ์ใน console
        res.redirect('/'); // Redirect กลับไปที่หน้าแรก
    } catch (error) {
        console.error("Error deleting post by action:", error);
        res.status(500).send("Failed to delete post by action");
    }
};

// ฟังก์ชันอัพเดทโพสต์
exports.updatePost = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

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

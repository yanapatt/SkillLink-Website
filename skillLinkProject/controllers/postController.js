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

        if (postData.postTitle) {
            postData.postTitle = postData.postTitle.trim();
        }

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

// Controller สำหรับ "Get My Posts"
exports.getMyPosts = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const accountId = req.session.accountSession.accId; // ดึง accountId จาก session
        const myPosts = postService.getMyPosts(accountId); // ใช้ getMyPosts เพื่อดึงโพสต์ของผู้ใช้

        // ส่งผลลัพธ์ไปที่หน้า index
        res.render('index', {
            posts: myPosts,
            accUsername: req.session.accountSession.accUsername,
            accRole: req.session.accountSession.accRole
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get your posts" });
    }
};

// ฟังก์ชันค้นหาโพสต์
exports.searchPosts = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        // รับข้อมูลจาก request body
        const { searchValue, searchType } = req.body;

        // ตรวจสอบว่า searchValue และ searchType มีค่าหรือไม่
        if (!searchValue || !searchType) {
            return res.status(400).json({ message: "Search value and type are required." });
        }

        // สร้าง query object สำหรับการค้นหา
        const query = {
            searchType,   // ประเภทการค้นหาที่จะใช้ 
            searchValue,   // คำค้นหาที่จะใช้ค้นหา
        };

        // ค้นหาโพสต์จาก query
        const posts = postService.searchPosts(query);
        res.render('index', {
            posts,
            searchValue,
            searchType,
            accUsername: req.session.accountSession.accUsername,
            accRole: req.session.accountSession.accRole
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to search posts" });
    }
};

exports.clearSearch = (req, res) => {
    res.redirect('/');
}

// ฟังก์ชันแสดงรายละเอียดโพสต์
exports.aboutPost = async (req, res) => {
    try {
        // ตรวจสอบการล็อกอิน
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const postTitle = req.params.postTitle; // รับชื่อโพสต์จาก URL parameter
        const post = await postService.getPostByTitle(postTitle); // เรียกฟังก์ชัน getPostByName จาก PostService

        // ตรวจสอบว่าโพสต์ถูกพบหรือไม่
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // ตรวจสอบว่า action คือ 'edit' หรือไม่
        if (req.query.action === 'edit') {
            // ตรวจสอบว่าโพสต์นี้เป็นของผู้ใช้ที่ล็อกอินหรือไม่
            if (post.accountId !== req.session.accountSession.accId) {
                return res.status(403).json({ message: "You are not authorized to edit this post." });
            }
            // ส่งไปที่หน้าแก้ไขโพสต์
            return res.render('edit', { post, accUsername: req.session.accountSession.accUsername, accRole: req.session.accountSession.accRole, accId: req.session.accountSession.accId });
        } else {
            // ส่งไปที่หน้าดูโพสต์
            return res.render('post', { post, accUsername: req.session.accountSession.accUsername, accRole: req.session.accountSession.accRole, accId: req.session.accountSession.accId });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to retrieve post" });
    }
};

// อัพเดทโพสต์
exports.updatePost = [
    imgRepo.uploadImage(), // ใช้ multer สำหรับจัดการไฟล์
    async (req, res) => {
        try {
            if (!req.session.accountSession) {
                return res.status(401).json({ message: "Unauthorized. Please log in." });
            }

            const postTitle = req.params.postTitle;
            const updateData = req.body;
            const newImgFile = req.file;

            let updatedPostData = {
                postTitle: updateData.postTitle.trim(),
                postDesc: updateData.postDesc.trim(),
            };
            
            // อัปเดตโพสต์ในฐานข้อมูล
            const result = await postService.updatePost(postTitle, updatedPostData, newImgFile);

            if (!result.success) {
                return res.status(404).json({ message: result.message });
            }

            res.redirect("/");

        } catch (error) {
            console.error("Error updating post:", error);
            res.status(500).json({ message: "Failed to update post" });
        }
    }
];

// ฟังก์ชันลบรูปภาพจากโพสต์
exports.removeImage = async (req, res) => {
    try {
        if (!req.session.accountSession) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }

        const postTitle = req.params.postTitle;

        // ส่ง `deleteImage: true` เพื่อให้ `updatePost()` ลบรูป
        const result = await postService.updatePost(postTitle, { deleteImage: true });

        if (!result.success) {
            return res.status(404).json({ success: false, message: result.message });
        }

        res.json({ success: true, message: "Image removed successfully." });

    } catch (error) {
        console.error("Error removing image:", error);
        res.status(500).json({ success: false, message: "Failed to remove image" });
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

        const postTitle = req.params.postTitle; // รับค่าตรง ๆ จาก params
        console.log("Deleting Post Title:", postTitle);

        const result = postService.removePostByTitle(postTitle); // ลบโพสต์ตาม title

        if (!result) {
            return res.status(404).json({ message: "Post not found" });
        }

        console.log("Post deleted successfully:", result);

        // หลังจากลบเสร็จให้ redirect กลับไปหน้าแรก
        res.redirect('/');
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

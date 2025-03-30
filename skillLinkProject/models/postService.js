const LinkedList = require("./linkedList");

class PostService {
    constructor(postRepo, accountRepo, imgRepo) {
        this.postRepo = postRepo;
        this.accountRepo = accountRepo;
        this.imgRepo = imgRepo;
    }

    // จัด Format Documents JSON
    formatPostDoc(postData, accountId, imageUrl) {
        return {
            postTitle: postData.postTitle,
            accountId: accountId,
            postDesc: postData.postDesc,
            postRating: postData.postRating || 0,  // ใช้ค่า default หากไม่มีคะแนน
            postImgUrl: imageUrl || null,  // ใช้ URL ของภาพถ้ามี
            ratingsCount: postData.ratingsCount || new LinkedList()
        };
    }

    // สร้าง Post
    async createPost(postData, accountId, imgFile) {
        try {
            // ตรวจสอบและอัปโหลดภาพ
            let imageUrl = null;
            if (imgFile) {
                // ใช้ imgRepo เพื่อเก็บภาพและรับ URL ของภาพ
                imageUrl = await this.imgRepo.saveImageToFolder(imgFile);
            }

            // จัดรูปแบบข้อมูลโพสต์
            const formattedPostDoc = this.formatPostDoc(postData, accountId, imageUrl);

            // เพิ่มโพสต์ลงใน LinkedList
            this.postRepo.insertPosts(formattedPostDoc);

            return formattedPostDoc;  // ส่งกลับโพสต์ที่ถูกจัดรูปแบบแล้ว
        } catch (error) {
            throw new Error("Failed to create post: " + error.message);
        }
    }

    // แสดง Post ทั้งหมดจากไฟล์
    getAllPosts() {
        return this.postRepo.retrieveAllPosts();
    }

    // คำนวณ Average Rating Score
    calculateAverageRating(ratingsList) {
        if (ratingsList.size === 0) return 0;

        let total = 0;
        ratingsList.forEachNode(node => total += node.data.rating);

        return total / ratingsList.size;
    }

    // ลบโพสต์ตามเงื่อนไข (rating หรือ title)
    removePost(post, action) {
        if (post.postImgUrl) {
            this.imgRepo.removeImageFromFolder(post.postImgUrl)
                .then((message) => {
                    console.log(message);
                })
                .catch(err => {
                    console.error('Error deleting image:', err);
                });
        }

        if (action === 'rating') {
            this.postRepo.removePosts(post.postTitle);
        } else if (action === 'title') {
            this.postRepo.removePosts(post.postTitle);
        }
    }

    // ลบโพสต์ตามคะแนน Rating
    removePostByRating(rating) {
        const parsedRating = parseFloat(rating);
        this.postRepo.retrieveAllPosts().forEach((post) => {
            const postRating = parseFloat(post.postRating);
            if (postRating === parsedRating) {
                this.removePost(post, 'rating');
            }
        });
    }

    // ลบ Post ตามชื่อหัวข้อของ Post
    removePostByTitle(postTitle) {
        const targetPost = this.postRepo.retrieveAllPosts().find(post => post.postTitle === postTitle);

        if (!targetPost) {
            console.log(`Post "${postTitle}" not found`);
            return { success: false, message: "Post not found" };
        }

        this.removePost(targetPost, 'title');
        return { success: true, message: `Post "${postTitle}" deleted successfully!` };
    }

    // ลบหลาย ๆ Posts ในคราวเดียว สามารถลบตามชื่อหัวข้อ Post หรือยอด Rating
    removeMultiplePosts(postTitles, rating, action) {
        if (action === 'removeByRating') {
            this.removePostByRating(rating);
        }
        else if (action === 'removeByTitle') {
            if (postTitles) {
                postTitles = Array.isArray(postTitles) ? postTitles : [postTitles];

                postTitles.forEach((title) => {
                    this.removePostByTitle(title);
                });
            }
        } else {
            return { success: false, message: "Invalid action. Please specify 'removeByTitle' or 'removeByRating'." };
        }

        return { success: true, message: "Posts have been removed successfully." };
    }

    // ลบ Post แรกสุดออกจาก LinkedList
    removeFirstPost() {
        if (this.postRepo.posts.isEmpty()) {
            console.log("No posts available to remove.");
            return { success: false, message: "No posts available." };
        }

        const firstPost = this.postRepo.posts.head.value;
        this.removePost(firstPost, 'title');
        return { success: true, message: `First post "${firstPost.postTitle}" deleted successfully!` };
    }

    // ลบ Post ล่าสุดออกจาก LinkedList
    removeLastPost() {
        if (this.postRepo.posts.isEmpty()) {
            console.log("No posts available to remove.");
            return { success: false, message: "No posts available." };
        }

        const lastPost = this.postRepo.posts.tail.value;
        this.removePost(lastPost, 'title');
        return { success: true, message: `Last post "${lastPost.postTitle}" deleted successfully!` };
    }
}

module.exports = PostService;

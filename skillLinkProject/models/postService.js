const { render } = require("ejs");
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
                console.log("Image file: ", imgFile);
                imageUrl = await this.imgRepo.saveImageToFolder(imgFile); // ใช้ imgRepo เพื่อสร้าง URL
            }

            // จัดรูปแบบข้อมูลโพสต์
            const formattedPostDoc = this.formatPostDoc(postData, accountId, imageUrl);

            // เพิ่มโพสต์ลงใน LinkedList
            this.postRepo.insertPosts(formattedPostDoc);

            console.log("Post created successfully:", formattedPostDoc);
            return formattedPostDoc; // ส่งกลับโพสต์ที่ถูกจัดรูปแบบแล้ว
        } catch (error) {
            console.error("Error creating post:", error.message);
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
    async removeMultiplePosts(postTitles) {
        if (!postTitles || postTitles.length === 0) {
            return { success: false, message: "No posts selected for deletion." };
        }

        // ตรวจสอบว่า postTitles เป็น array หรือไม่
        postTitles = Array.isArray(postTitles) ? postTitles : [postTitles];

        try {
            // ใช้ Promise.all เพื่อจัดการการลบโพสต์และภาพแบบ asynchronous
            const deletionResults = await Promise.all(
                postTitles.map(async (title) => {
                    const targetPost = this.postRepo.retrieveAllPosts().find(post => post.postTitle === title);

                    if (targetPost) {
                        try {
                            // ลบภาพที่เกี่ยวข้อง (ถ้ามี)
                            if (targetPost.postImgUrl) {
                                await this.imgRepo.removeImageFromFolder(targetPost.postImgUrl);
                            }

                            // ลบโพสต์
                            this.postRepo.removePosts(title);
                            return { title, success: true, message: `Post "${title}" deleted successfully.` };
                        } catch (error) {
                            console.error(`Error deleting post "${title}":`, error.message);
                            return { title, success: false, message: `Failed to delete post "${title}".` };
                        }
                    } else {
                        console.log(`Post "${title}" not found.`);
                        return { title, success: false, message: `Post "${title}" not found.` };
                    }
                })
            );

            return { success: true, results: deletionResults };
        } catch (error) {
            console.error("Error deleting multiple posts:", error.message);
            throw new Error("Failed to delete multiple posts: " + error.message);
        }
    }

    // ลบ Post แรกสุดออกจาก LinkedList
    async removeFirstPost() {
        try {
            if (this.postRepo.posts.isEmpty()) {
                console.log("No posts available to remove.");
                return { success: false, message: "No posts available." };
            }

            const firstPost = this.postRepo.posts.head.value;

            // ลบภาพที่เกี่ยวข้อง (ถ้ามี)
            if (firstPost.postImgUrl) {
                await this.imgRepo.removeImageFromFolder(firstPost.postImgUrl);
            }

            this.postRepo.removeFirst(); // ลบโพสต์แรก
            return { success: true, message: `First post "${firstPost.postTitle}" deleted successfully!` };
        } catch (error) {
            console.error("Error removing first post:", error.message);
            throw new Error("Failed to remove first post: " + error.message);
        }
    }

    // ลบ Post ล่าสุดออกจาก LinkedList
    async removeLastPost() {
        try {
            if (this.postRepo.posts.isEmpty()) {
                console.log("No posts available to remove.");
                return { success: false, message: "No posts available." };
            }

            const lastPost = this.postRepo.posts.tail.value;

            // ลบภาพที่เกี่ยวข้อง (ถ้ามี)
            if (lastPost.postImgUrl) {
                await this.imgRepo.removeImageFromFolder(lastPost.postImgUrl);
            }

            this.postRepo.removeLast(); // ลบโพสต์ล่าสุด
            return { success: true, message: `Last post "${lastPost.postTitle}" deleted successfully!` };
        } catch (error) {
            console.error("Error removing last post:", error.message);
            throw new Error("Failed to remove last post: " + error.message);
        }
    }
}

module.exports = PostService;

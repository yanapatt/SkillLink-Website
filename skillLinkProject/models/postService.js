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

    // คำนวณ Average Rating Score
    calculateAverageRating(ratingsList) {
        if (ratingsList.size === 0) return 0;

        let total = 0;
        ratingsList.forEachNode(node => total += node.data.rating);

        return total / ratingsList.size;
    }

    // ค้นหาโพสต์ตามชื่อหรือผู้เขียน
    searchPosts({ searchType, searchValue }) {
        const foundPosts = new LinkedList();

        if (searchType === 'title') {
            this.postRepo.retrieveAllPosts().forEach((post) => {
                if (post.postTitle.toLowerCase().includes(searchValue.toLowerCase())) {
                    foundPosts.insertLast(post);
                }
            });
        }
        else if (searchType === 'author') {
            // ค้นหาบัญชีจาก accounts.json โดยใช้ accUsername
            const account = this.accountRepo.retrieveAccountByUsername(searchValue);

            if (account) {
                const targetAccountId = account.accId; // ดึง accountId ของ accUsername ที่พบ
                this.postRepo.retrieveAllPosts().forEach((post) => {
                    if (post.accountId === targetAccountId) {
                        foundPosts.insertLast(post);
                    }
                });
            } else {
                console.error(`Account not found for username: ${searchValue}`);
            }
        }
        else {
            console.error('Invalid search type');
        }

        return foundPosts.toArray(); // ส่งกลับเป็น array ของโพสต์ที่ค้นพบ
    }

    // โพสต์ของฉัน
    getMyPosts(accountId) {
        if (!accountId) {
            console.error("Account ID is required for getting my posts.");
            return [];
        }

        const foundPosts = new LinkedList();

        this.postRepo.retrieveAllPosts().forEach((post) => {
            if (post.accountId === accountId) {
                foundPosts.insertLast(post);
            }
        });

        return foundPosts.toArray(); // ส่งกลับเป็น array ของโพสต์ของผู้ใช้
    }

    // แสดงโพสต์ตามชื่อหัวข้อ
    getPostByTitle(postTitle) {
        const foundPosts = this.postRepo.retrieveAllPosts().find(post => post.postTitle === postTitle);
        if (!foundPosts) {
            console.log(`Post "${postTitle}" not found`);
            return { success: false, message: "Post not found" };
        }
        return foundPosts;
    }

    // แสดง Post ทั้งหมดจากไฟล์
    getAllPosts() {
        return this.postRepo.retrieveAllPosts();
    }

    // อัปเดตข้อมูลของโพสต์ (แก้คำอธิบาย และเปลี่ยนรูปภาพได้)
    async updatePost(postTitle, updatedData, newImgFile) {
        try {
            // ค้นหาโพสต์ที่ต้องการแก้ไข
            const targetPost = this.postRepo.retrieveAllPosts().find(post => post.postTitle === postTitle);

            if (!targetPost) {
                console.log(`Post "${postTitle}" not found`);
                return { success: false, message: "Post not found" };
            }

            // อัปเดตคำอธิบายโพสต์ (ถ้ามีการแก้ไข)
            if (updatedData.postDesc) {
                targetPost.postDesc = updatedData.postDesc;
            }

            // ถ้ามีภาพใหม่ ให้อัปโหลดภาพใหม่ และลบภาพเก่า
            if (newImgFile) {
                console.log(`Updating image for post: ${postTitle}`);

                // ลบภาพเก่าออกก่อน (ถ้ามี)
                if (targetPost.postImgUrl) {
                    try {
                        await this.imgRepo.removeImageFromFolder(targetPost.postImgUrl); // ลบภาพเก่า
                        console.log(`Old image removed successfully.`);
                    } catch (error) {
                        console.error(`Error removing old image: ${error.message}`);
                    }
                }

                // อัปโหลดภาพใหม่
                try {
                    targetPost.postImgUrl = await this.imgRepo.saveImageToFolder(newImgFile); // อัปโหลดภาพใหม่
                    console.log(`New image uploaded successfully.`);
                } catch (error) {
                    console.error(`Error uploading new image: ${error.message}`);
                }
            }

            // อัปเดตโพสต์ใน LinkedList
            this.postRepo.updatePost(targetPost);

            console.log(`Post "${postTitle}" updated successfully!`);
            return { success: true, message: `Post "${postTitle}" updated successfully!`, updatedPost: targetPost };
        } catch (error) {
            console.error(`Error updating post "${postTitle}":`, error.message);
            return { success: false, message: `Failed to update post "${postTitle}".` };
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

    // ลบ Post ตามชื่อหัวข้อของ Post และลบภาพประกอบด้วย
    removePostByTitle(postTitle) {
        const targetPost = this.postRepo.retrieveAllPosts().find(post => post.postTitle === postTitle);

        if (!targetPost) {
            console.log(`Post "${postTitle}" not found`);
            return { success: false, message: "Post not found" };
        }

        try {
            // ลบภาพที่เกี่ยวข้อง (ถ้ามี)
            if (targetPost.postImgUrl) {
                console.log(`Deleting image: ${targetPost.postImgUrl}`);
                this.imgRepo.removeImageFromFolder(targetPost.postImgUrl);
            }

            // ลบโพสต์
            this.removePost(targetPost, 'title');

            console.log(`Post "${postTitle}" deleted successfully!`);
            return { success: true, message: `Post "${postTitle}" deleted successfully!` };
        } catch (error) {
            console.error(`Error deleting post "${postTitle}":`, error.message);
            return { success: false, message: `Failed to delete post "${postTitle}".` };
        }
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
                    try {
                        // ลบภาพที่เกี่ยวข้อง (ถ้ามี)
                        const targetPost = this.postRepo.retrieveAllPosts().find(post => post.postTitle === title);
                        console.log("Target Post: ", targetPost.postImgUrl);
                        if (targetPost && targetPost.postImgUrl) {
                            await this.imgRepo.removeImageFromFolder(targetPost.postImgUrl);
                            // ลบโพสต์ใน postRepo
                        }

                        this.postRepo.removePosts(title); // ลบโพสต์ออกจาก LinkedList
                        return { title, success: true, message: `Post "${title}" deleted successfully.` };
                    } catch (error) {
                        console.error(`Error deleting post "${title}":`, error.message);
                        return { title, success: false, message: `Failed to delete post "${title}".` };
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

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
            ratingsCount: postData.ratingsCount || [] // ในอนาคตเปลี่ยนเป็น LinkedList
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

    // อัปเดตคะแนน Rating ของโพสต์
    async ratePost(postTitle, accountId, newRating) {
        try {
            const post = this.postRepo.retrieveAllPosts().find(post => post.postTitle === postTitle);
            if (!post) return { success: false, message: "Post not found" };

            const existingRatingIndex = post.ratingsCount.findIndex(rating => rating.accountId === accountId);

            if (existingRatingIndex !== -1) {
                post.ratingsCount[existingRatingIndex].rating = newRating;
            } else {
                post.ratingsCount.push({ accountId, rating: newRating });
            }

            post.postRating = this.calculateAverageRating(post.ratingsCount);
            await this.postRepo.updatePost(postTitle, { postRating: post.postRating, ratingsCount: post.ratingsCount });

            return { success: true, message: `Post "${postTitle}" rating updated successfully!`, updatedPost: post };
        } catch (error) {
            return { success: false, message: "Failed to update rating" };
        }
    }

    // เรียงโพสต์ตาม Rating จากมากไปน้อย
    sortPostsByRating() {
        return this.postRepo.retrieveAllPosts().sort((a, b) => b.postRating - a.postRating);
    }

    // คำนวณ Average Rating Score
    calculateAverageRating(ratingsArray) {
        if (ratingsArray.length === 0) return 0;
        const total = ratingsArray.reduce((sum, rating) => sum + rating.rating, 0);
        return total / ratingsArray.length;
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

    // แสดงโพสต์ที่มีคะแนนสูงสุด 5 โพสต์
    getTopRatedPosts() {
        const allPosts = this.postRepo.retrieveAllPosts();

        // เรียงโพสต์ตาม postRating จากมากไปหาน้อย
        const sortedPosts = allPosts.sort((a, b) => b.postRating - a.postRating);

        // เลือกแค่ 5 โพสต์แรกที่มีคะแนนสูงสุด
        return sortedPosts.slice(0, 5);
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
            const targetPost = this.postRepo.retrieveAllPosts().find(post => post.postTitle === postTitle);

            if (!targetPost) {
                console.log(`Post "${postTitle}" not found`);
                return { success: false, message: "Post not found" };
            }

            // อัปเดตคำอธิบายโพสต์
            if (updatedData.postDesc) {
                targetPost.postDesc = updatedData.postDesc;
            }

            // ถ้าผู้ใช้ต้องการลบภาพ
            if (updatedData.deleteImage === true && targetPost.postImgUrl) {
                console.log(`Deleting image for post: ${postTitle}`);
                try {
                    await this.imgRepo.removeImageFromFolder(targetPost.postImgUrl); // ลบภาพเก่า
                    targetPost.postImgUrl = ''; // ล้างค่า URL รูป
                    console.log(`Old image removed successfully.`);
                } catch (error) {
                    console.error(`Error removing old image: ${error.message}`);
                }
            }

            // อัปโหลดภาพใหม่ (ถ้ามี)
            if (newImgFile) {
                console.log(`Updating image for post: ${postTitle}`);
                try {
                    targetPost.postImgUrl = await this.imgRepo.saveImageToFolder(newImgFile);
                    console.log(`New image uploaded successfully.`);
                } catch (error) {
                    console.error(`Error uploading new image: ${error.message}`);
                }
            }

            // ส่งค่าที่อัปเดตไปยัง repo
            await this.postRepo.updatePost(postTitle, {
                postDesc: targetPost.postDesc,
                postImgUrl: targetPost.postImgUrl
            });

            console.log(`Post "${postTitle}" updated successfully!`);
            return { success: true, message: `Post "${postTitle}" updated successfully!`, updatedPost: targetPost };

        } catch (error) {
            console.error(`Error updating post "${postTitle}":`, error.message);
            return { success: false, message: `Failed to update post "${postTitle}".` };
        }
    }

    // ลบโพสต์ตามคะแนน Rating
    async removePostsByRating(rating) {
        try {
            const parsedRating = parseFloat(rating);
            if (isNaN(parsedRating)) {
                return { success: false, message: "Invalid rating value." };
            }

            // ค้นหาโพสต์ที่มีคะแนนต่ำกว่าหรือเท่ากับค่าที่กำหนด
            const postsToDelete = this.postRepo.retrieveAllPosts().filter(post => parseFloat(post.postRating) <= parsedRating);

            if (postsToDelete.length === 0) {
                return { success: false, message: "No posts found with rating <= " + parsedRating };
            }

            await Promise.all(postsToDelete.map(async (post) => {
                try {
                    // ลบโพสต์จาก LinkedList
                    this.removePostByTitle(post.postTitle);
                } catch (error) {
                    console.error(`Error deleting image for post "${post.postTitle}":`, error.message);
                }
            }));

            return { success: true, message: `Deleted ${postsToDelete.length} post(s) with rating <= ${parsedRating}.` };
        } catch (error) {
            console.error("Error deleting posts by rating:", error.message);
            return { success: false, message: "Failed to delete posts by rating." };
        }
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
            this.postRepo.removePosts(postTitle); // ลบโพสต์ออกจาก LinkedList

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
                        if (targetPost && targetPost.postImgUrl) {
                            await this.imgRepo.removeImageFromFolder(targetPost.postImgUrl);
                        }

                        this.postRepo.removePosts(title); // ลบโพสต์ออกจาก LinkedList
                        return { title, success: true, message: `Post "${title}" deleted successfully.` };
                    } catch (error) {
                        console.error(`Error deleting post "${title}":`, error.message);
                        return { title, success: false, message: `Failed to delete post "${title}".` };
                    }
                })
            );

            // ตรวจสอบว่ามีโพสต์ใดล้มเหลวทั้งหมดหรือไม่
            const allFailed = deletionResults.every(result => !result.success);
            if (allFailed) {
                throw new Error("All posts failed to delete.");
            }

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
            console.error("Error removing first post:", error.message); // ยังไม่ผ่าน 
            throw new Error("Failed to remove first post: " + error.message); // ยังไม่ผ่าน
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
            console.error("Error removing last post:", error.message); // ยังไม่ผ่าน
            throw new Error("Failed to remove last post: " + error.message); // ยังไม่ผ่าน
        }
    }
}

module.exports = PostService;

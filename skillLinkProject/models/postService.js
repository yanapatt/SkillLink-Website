const LinkedList = require("./linkedList");

class PostService {
    constructor(postRepo, accountRepo, imgRepo) {
        this.postRepo = postRepo;
        this.accountRepo = accountRepo;
        this.imgRepo = imgRepo;
    }

    // จัด Format Documents JSON
    formatPostDoc(postData, authorName, authorId, imageUrl) {
        return {
            postTitle: postData.postTitle,
            authorName: authorName,
            authorId: authorId,
            postDesc: postData.postDesc,
            postRating: postData.postRating || 0,  // ใช้ค่า default หากไม่มีคะแนน
            postImgUrl: imageUrl || null,  // ใช้ URL ของภาพถ้ามี
            ratingsCount: postData.ratingsCount || new LinkedList(),
        };
    }

    // คำนวณคะแนนเฉลี่ยของโพสต์
    calculateAverageRating(postTitle) {
        const targetPosts = this.postRepo.retrievePostsByAction(postTitle, "byTitle");
        if (targetPosts.getSize() === 0) return 0;

        let totalRatingSum = 0;
        let totalRatingCount = 0;

        targetPosts.forEachNode(post => {
            const scores = post.ratingsCount.map(r => r.ratingScore);
            totalRatingSum += scores.reduce((acc, s) => acc + s, 0);
            totalRatingCount += scores.length;
        });

        return totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;
    }

    // อัพเดตคะแนนโพสต์
    async ratingPost(postTitle, ratingScore, authorId) {
        try {
            const targetPosts = this.postRepo.retrievePostsByAction(postTitle, "byTitle");
            if (targetPosts.getSize() === 0) return;

            const post = targetPosts.head.value;
            const ratingList = post.ratingsCount;

            const existingRating = ratingList.find(r => r.authorId === authorId);
            if (existingRating) {
                existingRating.ratingScore = ratingScore;
            } else {
                ratingList.insertLast({ authorId, ratingScore });
            }

            const allScores = ratingList.map(r => r.ratingScore); // ใช้ map จาก LinkedList เลย
            const ratingCount = allScores.length;
            const newRating = allScores.reduce((acc, score) => acc + score, 0) / ratingCount;

            post.postRating = newRating;

            const newData = {
                postRating: newRating,
                ratingsCount: ratingList,
            };

            await this.postRepo.updateData(postTitle, newData, post.postImgUrl);

        } catch (error) {
            console.error("Error rating post:", error.message);
        }
    }

    // สร้าง Post
    async createPost(postData, authorName, authorId, imageUrl) {
        try {
            let imageExist = null;
            if (imageUrl) {
                console.log("Received imageUrl:", imageUrl);
                try {
                    imageExist = await this.imgRepo.saveImage(imageUrl);
                } catch (imageError) {
                    console.error("Error saving image:", imageError.message);
                }
            }

            const postDoc = this.formatPostDoc(postData, authorName, authorId, imageExist);
            this.postRepo.insertLastPost(postDoc);
            return postDoc;
        } catch (error) {
            console.error("Error creating post:", error.message);
        }
    }

    // อัพเดตข้อมูล Post
    async updateDataInPost(postTitle, newData, newImgFile) {
        try {
            const targetPosts = this.postRepo.retrievePostsByAction(postTitle, "byTitle");

            if (targetPosts.getSize() === 0) {
                return;
            }

            const post = targetPosts.head.value;

            if (newData.deleteImg === "true" && post.postImgUrl) {
                await this.imgRepo.removeImage(post.postImgUrl);
                post.postImgUrl = null;
            }

            if (newImgFile) {
                const savedImgUrl = await this.imgRepo.saveImage(newImgFile);
                post.postImgUrl = savedImgUrl;
            }

            await this.postRepo.updateData(postTitle, newData, post.postImgUrl);
        } catch (error) {
            console.error("Error updating post:", error.message);
        }
    }

    // ลบ Post ตาม Action
    async removePostsByAction(value, action) {
        try {
            if (this.postRepo.posts.isEmpty()) {
                return;
            }

            const targetPosts = this.postRepo.retrievePostsByAction(value, action);
            if (targetPosts.getSize() === 0) {
                return;
            }

            targetPosts.forEachNode((post) => {
                if (post.postImgUrl) {
                    this.imgRepo.removeImage(post.postImgUrl);
                }
            });

            this.postRepo.removePostsByFilter((post) => {
                if (action === "byTitle") {
                    return post.postTitle === value;
                } else if (action === "byRating") {
                    const ratingThreshold = parseFloat(value);
                    if (isNaN(ratingThreshold)) return false;
                    return post.postRating >= ratingThreshold;
                }
                return false;
            });
        } catch (error) {
            console.error("Error removing posts:", error.message);
        }
    }

    // ลบ Post แรก
    async removeFirstPostWithImage() {
        try {
            if (this.postRepo.posts.isEmpty()) {
                return;
            }

            const firstPost = this.postRepo.posts.head.value;

            if (firstPost.postImgUrl) {
                await this.imgRepo.removeImage(firstPost.postImgUrl);
            }

            this.postRepo.removeFirstPost();
        } catch (error) {
            console.error("Error removing first post:", error.message);
        }
    }

    // ลบ Post ล่าสุด
    async removeLastPostWithImage() {
        try {
            if (this.postRepo.posts.isEmpty()) {
                return;
            }

            const lastPost = this.postRepo.posts.tail.value;

            if (lastPost.postImgUrl) {
                await this.imgRepo.removeImage(lastPost.postImgUrl);
            }

            this.postRepo.removeLastPost();
        } catch (error) {
            console.error("Error removing last post:", error.message);
        }
    }
}

module.exports = PostService;

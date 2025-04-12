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
                    throw new Error("Failed to save image");
                }
            }

            const postDoc = this.formatPostDoc(postData, authorName, authorId, imageExist);
            this.postRepo.insertLastPost(postDoc);
            return postDoc;
        } catch (error) {
            console.error("Error creating post:", error.message);
            throw new Error("Failed to create post");
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
            if (firstPost) {
                if (firstPost.postImgUrl) {
                    await this.imgRepo.removeImage(firstPost.postImgUrl);
                }
                this.postRepo.removeFirstPost();
            }
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
            if (lastPost) {
                if (lastPost.postImgUrl) {
                    await this.imgRepo.removeImage(lastPost.postImgUrl);
                }
                this.postRepo.removeLastPost();
            }
        } catch (error) {
            console.error("Error removing last post:", error.message);
        }
    }
}

module.exports = PostService;

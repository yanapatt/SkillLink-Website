const LinkedList = require("./linkedList");

class PostService {
    constructor(postRepo, accountRepo, imgRepo) {
        this.postRepo = postRepo;
        this.accountRepo = accountRepo;
        this.imgRepo = imgRepo;
    }

    // จัด Format Documents JSON
    formatPostDoc(postData, accId, imageUrl) {
        return {
            postTitle: postData.postTitle,
            accId: accId,
            postDesc: postData.postDesc,
            postRating: postData.postRating || 0,  // ใช้ค่า default หากไม่มีคะแนน
            postImgUrl: imageUrl || null,  // ใช้ URL ของภาพถ้ามี
            ratingsCount: postData.ratingsCount || new LinkedList(),
        };
    }

    // สร้าง Post
    async createPost(postData, accId, imageUrl) {
        try {
            if (!postData || !accId) {
                throw new Error("Post data or Account ID is missing.");
            }

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

            const postDoc = this.formatPostDoc(postData, accId, imageExist);
            this.postRepo.insertLastPost(postDoc);
            return postDoc;
        } catch (error) {
            console.error("Error creating post:", error.message);
            throw new Error("Failed to create post");
        }
    }
}

module.exports = PostService;

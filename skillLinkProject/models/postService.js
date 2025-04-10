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
}

module.exports = PostService;

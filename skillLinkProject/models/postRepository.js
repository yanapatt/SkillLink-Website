const fs = require("fs");
const path = require("path");
const LinkedList = require("./linkedList");

class PostRepository {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'database', 'posts.json');
        this.posts = new LinkedList();
        this.loadFromFile();
        this.alreadyExistence();
    }

    // ยืนยันให้ชัวร์ว่า Directory ถูกสร้างหรือยัง
    alreadyExistence() {
        const dirname = path.dirname(this.filePath);
        if (!fs.existsSync(dirname)) {
            console.log("Directory has been exist at:", dirname);
            fs.mkdirSync(dirname, { recursive: true });
        }
    }

    // บันทึกข้อมูล JSON ลงไฟล์
    saveToFile() {
        try {
            this.alreadyExistence();
            fs.writeFileSync(`${this.filePath}.tmp`, JSON.stringify(this.posts.toArray(), null, 2));
            fs.renameSync(`${this.filePath}.tmp`, this.filePath);
        } catch (err) {
            console.error("Error saving posts to file:", err.message);
        }
    }

    // โหลดข้อมูลจาก JSON ไฟล์
    loadFromFile() {
        if (!fs.existsSync(this.filePath)) return;
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            if (!data || !data.trim()) return;
            JSON.parse(data).forEach(post => this.posts.insertLast(post));
        } catch (err) {
            console.error("Error loading posts from file:", err.message);
        }
    }

    // ดึงข้อมูลโพสต์ทั้งหมดจาก LinkedList
    retrieveAllPosts() {
        const result = new LinkedList();
        let current = this.posts.head;
        while (current) {
            result.insertLast(current.value);
            current = current.next;
        }
        return result;
    }

    // ดึงข้อมูลโพสต์ตาม Action ที่กำหนด
    retrievePostsByAction(value, action) {
        const allPosts = this.retrieveAllPosts();
        let targetPosts = new LinkedList();

        switch (action) {
            // ดึงโพสต์ที่มีคะแนนมากที่สุด n โพสต์แรก
            case 'topRated':
                const limit = value || 5;
                const sortedPosts = allPosts
                    .sort((a, b) => b.postRating - a.postRating)
                    .slice(0, limit);
                sortedPosts.forEach(post => targetPosts.insertLast(post));
                break;

            // ดึงโพสต์ตามชื่อ Post
            case 'byTitle':
                const foundPosts = allPosts.find((post) => post.title === value);
                if (foundPosts) {
                    targetPosts.insertLast(foundPosts);
                } else {
                    console.error("No posts found with the given title.");
                }
                break;

            // ดึงโพสต์ตาม Account ID ณ ขณะนั้น
            case 'myPosts':
                if (!value) {
                    console.error("Account ID is required for getting my posts.");
                    return targetPosts;
                }

                allPosts.forEachNode((post) => {
                    if (post.accountId === value) {
                        targetPosts.insertLast(post);
                    }
                });
                break;

            default:
                console.error("Invalid action specified.");
                break;
        }
        return targetPosts;
    }

    // ตรวจสอบว่า Post ชื่อเดียวกันมีอยู่แล้วหรือไม่
    isPostTitleExist(title) {
        let current = this.posts.head;
        while (current) {
            if (current.value.title === title) {
                return true;
            }
            current = current.next;
        }
        return false; 
    }

    // เพิ่มโพสต์ใหม่ที่ตำแหน่งแรก
    insertFirstPost(post) {
        this.posts.insertFirst(post);
        this.saveToFile();
        console.log("Post inserted at the beginning:", post);
    }

    // ลบโพสต์ที่เก่าที่สุดที่ตำแหน่งแรก
    removeFirstPost() {
        const removedPost = this.posts.removeFirst();
        if (removedPost) {
            this.saveToFile();
            console.log("Post removed from the beginning:", removedPost);
        } else {
            console.error("No posts to remove from the beginning.");
        }
    }

    // เพิ่มโพสต์ใหม่ที่ตำแหน่งสุดท้าย
    insertLastPost(post) {
        this.posts.insertLast(post);
        this.saveToFile();
        console.log("Post inserted at the end:", post);
    }

    // ลบโพสต์ที่ใหม่ที่สุดที่ตำแหน่งสุดท้าย
    removeLastPost() {
        const removedPost = this.posts.removeLast();
        if (removedPost) {
            this.saveToFile();
            console.log("Post removed from the end:", removedPost);
        } else {
            console.error("No posts to remove from the end.");
        }
    }

    // ลบโพสต์ทั้งหมด
    removePostsByFilter(filterCallback) {
        this.posts.removeAllNodes(filterCallback);
        this.saveToFile();
    }
}

module.exports = PostRepository;
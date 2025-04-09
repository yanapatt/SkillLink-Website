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
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log("Directory created at:", dir);
        }
    }

    // บันทึกข้อมูล JSON ลงไฟล์
    saveToFile() {
        const tempPath = `${this.filePath}.tmp`;
        const jsonData = JSON.stringify(this.posts.toArray(), null, 2);
        fs.writeFileSync(tempPath, jsonData);
        fs.renameSync(tempPath, this.filePath);
    }

    // โหลดข้อมูลจาก JSON ไฟล์
    loadFromFile() {
        if (!fs.existsSync(this.filePath)) return;

        const raw = fs.readFileSync(this.filePath, 'utf8');
        if (!raw.trim()) return;

        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
            data.forEach(post => this.posts.insertLast(post));
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
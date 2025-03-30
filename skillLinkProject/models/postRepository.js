const fs = require("fs");
const path = require("path");
const LinkedList = require("./linkedList");

class PostRepository {
    constructor(filePath) {
        this.filePath = filePath;
        this.posts = new LinkedList();
        this.loadFromFile();
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
            if (!data.trim()) return;
            JSON.parse(data).forEach(post => this.posts.insertLast(post));
        } catch (error) {
            console.error("Error loading posts from file:", error.message);
        }
    }
    
    // ดึงข้อมูล Post ทีมีทั้งหมด
    retrieveAllPosts() {
        // ในอนาคตอาจจะปรับให้เป็น LinkedList โดยสมบูรณ์
        return this.posts.toArray();
    }

    // ดึงข้อมูล Post โดยค้นหาจากชื่อ Post
    retrieveByPostName(name) {
        let foundPosts = null; 
        this.posts.forEachNode(post => {
            if (post.name.toLowerCase() === name.toLowerCase()) {
                foundPosts = post;
            }
        });
        console.log("Retrieve posts successful!:", foundPosts);
        return foundPosts;
    }

    // เพิ่ม Post ลงบน LinkedList
    insertPosts(post) {
        if (!this.retrieveByPostName(post.name)) {
            this.posts.insertLast(post);
            this.saveToFile();
        } else {
            console.error(`Post with name "${post.name}" already exists.`);
        }
    }
}

module.exports = PostRepository;
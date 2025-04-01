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
            if (!data.trim()) return;
            JSON.parse(data).forEach(post => this.posts.insertLast(post));
        } catch (err) {
            console.error("Error loading posts from file:", err.message);
        }
    }

    // ดึงข้อมูล Post ทีมีทั้งหมด
    retrieveAllPosts() {
        // ในอนาคตอาจจะปรับให้เป็น LinkedList โดยสมบูรณ์
        return this.posts.toArray();
    }

    // ดึงข้อมูล Post โดยค้นหาจากชื่อ Post
    retrieveByPostTitle(title) {
        let foundNode = null;

        this.posts.forEachNode((node) => {
            // Trim ชื่อโพสต์เพื่อหลีกเลี่ยงช่องว่างที่ไม่ต้องการ
            if (node.value && node.value.postTitle.toLowerCase() === title.toLowerCase()) {
                foundNode = node; // คืนค่าเป็นโหนดจริง
            }
        });

        return foundNode;
    }

    // เพิ่ม Post ลงบน LinkedList
    insertPosts(post) {
        if (!this.retrieveByPostTitle(post.postTitle)) {
            this.posts.insertLast(post);
            this.saveToFile();
        } else {
            console.error(`Post with name "${post.postTitle}" already exists.`);
        }
    }

    // ลบ Post เดี่ยวโดยชื่อหัวข้อ Post
    removePosts(title) {
        if (this.posts.isEmpty()) {
            console.log("No posts available to remove.");
            return; // ถ้าไม่มีโพสต์ให้ลบ ให้หยุดการทำงาน
        }
        /*const targetNode = this.retrieveByPostTitle(title);

        if (!targetNode) {
            console.log(`Post with title "${title}" not found.`);
            return; // ถ้าไม่พบโพสต์ที่ต้องการลบ ให้หยุดการทำงาน
        }*/

        // ลบโพสต์ออกจาก LinkedList
        this.posts.removeByPostTitle(title);  // เปลี่ยนจาก removeByName เป็น removeByPostTitle
        console.log(`Post with title "${title}" has been deleted successfully!`);

        // บันทึกการเปลี่ยนแปลงลงไฟล์
        this.saveToFile();
    }

    // ลบโพสต์แรกสุดใน LinkedList
    removeFirst() {
        if (this.posts.isEmpty()) {
            console.log("No posts available to remove.");
            return { success: false, message: "No posts available." };
        }

        const firstPost = this.posts.head.value;

        this.posts.removeFirst();
        this.saveToFile();

        // ส่งคืนผลลัพธ์
        return { success: true, message: `First post "${firstPost.postTitle}" has been deleted successfully!` };
    }

    // ลบโพสต์ล่าสุดใน LinkedList
    removeLast() {
        if (this.posts.isEmpty()) {
            console.log("No posts available to remove.");
            return { success: false, message: "No posts available." };
        }

        const lastPost = this.posts.tail.value;

        this.posts.removeLast();
        this.saveToFile();

        // ส่งคืนผลลัพธ์
        return { success: true, message: `Last post "${lastPost.postTitle}" has been deleted successfully!` };
    }
}


module.exports = PostRepository;
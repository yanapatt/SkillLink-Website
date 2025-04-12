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
        const results = new LinkedList();

        switch (action) {
            case 'byTitle':
                allPosts.forEachNode((post) => {
                    if (post.postTitle.toLowerCase().includes(value.toLowerCase())) {
                        results.insertLast(post);
                    }
                });
                break;

            case 'byAuthor':
                allPosts.forEachNode((post) => {
                    if (post.authorName && post.authorName.toLowerCase().includes(value.toLowerCase())) {
                        results.insertLast(post);
                    }
                });
                break;

            case 'sortByRating':
                const sortedByRating = allPosts.toArray()
                    .sort((a, b) => b.postRating - a.postRating);
                sortedByRating.forEach(post => results.insertLast(post));
                break;

            case 'topRated':
                const limit = value || 5;
                const sorted = allPosts.toArray()
                    .sort((a, b) => b.postRating - a.postRating)
                    .slice(0, limit);
                sorted.forEach(post => results.insertLast(post));
                break;

            case 'byRating':
                const ratingThreshold = parseFloat(value);
                if (isNaN(ratingThreshold)) {
                    console.error("Invalid rating value");
                    break;
                }

                allPosts.forEachNode((post) => {
                    if (post.postRating === ratingThreshold) {
                        results.insertLast(post);
                    }
                });
                break;

            case 'myPosts':
                if (!value) break;
                allPosts.forEachNode((post) => {
                    if (post.authorId === value) {
                        results.insertLast(post);
                    }
                });
                break;

            default:
                console.error("Invalid action");
        }
        return results;
    }

    // ตรวจสอบว่า Post ชื่อเดียวกันมีอยู่แล้วหรือไม่
    checkPostTitleExistence(value) {
        let current = this.posts.head;
        while (current) {
            const post = current.value;
            if (post.postTitle === value) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    // อัปเดตข้อมูลโพสต์ตามชื่อ
    updateData(postTitle, newData, newImgUrl) {
        let current = this.posts.head;
        while (current) {
            const post = current.value;
            if (post.postTitle === postTitle) {
                post.postDesc = newData.postDesc || post.postDesc;
                post.postRating = newData.postRating || post.postRating;
                post.postImgUrl = newImgUrl || post.postImgUrl;
                post.ratingsCount = newData.ratingsCount || post.ratingsCount;
                this.saveToFile();
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
    }

    // ลบโพสต์ที่เก่าที่สุดที่ตำแหน่งแรก
    removeFirstPost() {
        this.posts.removeFirst();
        this.saveToFile();
        console.log("First post removed.");
    }

    // เพิ่มโพสต์ใหม่ที่ตำแหน่งสุดท้าย
    insertLastPost(post) {
        this.posts.insertLast(post);
        this.saveToFile();
    }

    // ลบโพสต์ที่ใหม่ที่สุดที่ตำแหน่งสุดท้าย
    removeLastPost() {
        this.posts.removeLast();
        this.saveToFile();
        console.log("Last post removed.");
    }

    // ลบโพสต์ทั้งหมด
    removePostsByFilter(filterCallback) {
        this.posts.removeAllNodes(filterCallback);
        this.saveToFile();
    }
}

module.exports = PostRepository;
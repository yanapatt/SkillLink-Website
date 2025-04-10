const fs = require("fs");
const multer = require("multer");
const path = require("path");

class ImageRepository {
    constructor() {
        this.uploadsDir = path.join(__dirname, "..", "uploads"); // กำหนดที่อยู่ของโฟลเดอร์ uploads
        this.ensureUploadsDirExists(); // ตรวจสอบว่าโฟลเดอร์ uploads มีอยู่
        this.storage = this.configureStorage(); // ตั้งค่าการจัดเก็บของ multer
        this.upload = multer({ storage: this.storage }); // กำหนดการตั้งค่า multer
    }

    // ฟังก์ชันเพื่อให้แน่ใจว่า uploadsDir มีอยู่
    ensureUploadsDirExists() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }

    // ฟังก์ชันสำหรับกำหนดการตั้งค่าของ multer
    configureStorage() {
        return multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, this.uploadsDir); // ใช้ uploadsDir ที่ได้กำหนดไว้
            },
            filename: (req, file, cb) => {
                cb(null, `${Date.now()}${path.extname(file.originalname)}`);
            }
        });
    }

    // ฟังก์ชันที่ใช้ในการอัพโหลดภาพ
    uploadImage() {
        return this.upload.single('postImgUrl');
    }

    // ฟังก์ชันบันทึกภาพลงโฟลเดอร์
    saveImage(imgUrl) {
        if (!imgUrl || !imgUrl.filename) {
            throw new Error("Invalid image file");
        }
        const imageUrl = `/uploads/${imgUrl.filename}`; 
        console.log("Image URL:", imageUrl);
        return imageUrl;
    }

    // ฟังก์ชันลบภาพจากโฟลเดอร์
    async removeImage(imgUrl) {
        const imgPath = path.join(__dirname, '..', imgUrl);
        try {
            await fs.promises.unlink(imgPath);
            console.log(`Image at ${imgPath} deleted successfully`);
        } catch (err) {
            throw new Error(`Error deleting image: ${err.message}`);
        }
    }
}

module.exports = ImageRepository;

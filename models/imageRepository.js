const fs = require("fs");
const multer = require('multer');
const path = require('path');

class ImageRepository {
    constructor(multerFileName) {
        // กำหนดการตั้งค่าของ multer ภายใน ImageRepository
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadsDir = path.resolve(__dirname, '../uploads');
                // ตรวจสอบและสร้างโฟลเดอร์ uploads หากยังไม่มี
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                cb(null, uploadsDir);
            },
            filename: (req, file, cb) => {
                // ตั้งชื่อไฟล์ให้เป็นเวลาแบบ Unix timestamp เพื่อป้องกันการซ้ำ
                cb(null, `${Date.now()}${path.extname(file.originalname)}`);
            }
        });
        // กำหนดให้ multer ใช้งาน storage ที่กำหนด
        this.upload = multer({ storage: this.storage });
        this.multerFileName = multerFileName;
    }

    // ฟังก์ชันที่ใช้ในการอัพโหลดภาพ
    uploadImage() {
        return this.upload.single('postImgUrl'); // ฟังก์ชันนี้จะให้ multer จัดการไฟล์อัพโหลด
    }

    // ฟังก์ชันบันทึกภาพลงโฟลเดอร์
    saveImageToFolder(imgFile) {
        if (!imgFile || !imgFile.path) {
            throw new Error("Invalid image file");
        }

        // ใช้ path ของไฟล์ที่ multer สร้างขึ้น
        const imageUrl = `/uploads/${imgFile.filename}`;
        console.log("Image URL:", imageUrl);
        return imageUrl;
    }

    // ฟังก์ชันลบภาพออกจากโฟลเดอร์
    removeImageFromFolder(imgUrl) {
        const imgPath = path.join(__dirname, '..', imgUrl); // สร้าง path ของไฟล์ภาพ
        return new Promise((resolve, reject) => {
            fs.unlink(imgPath, (err) => {
                if (err) {
                    console.error(`Error deleting image at ${imgPath}:`, err);
                    reject(`Error deleting image: ${err.message}`);
                } else {
                    console.log(`Image at ${imgPath} deleted successfully`);
                    resolve(`Image at ${imgPath} deleted successfully`);
                }
            });
        });
    }
}

module.exports = ImageRepository;
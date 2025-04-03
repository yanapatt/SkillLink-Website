const fs = require("fs");
const multer = require("multer");
const path = require("path");

class ImageRepository {
    constructor(multerFileName) {
        const uploadsDir = path.resolve(__dirname, "../uploads"); // กำหนดตัวแปรที่นี้

        // กำหนดการตั้งค่าของ multer ภายใน ImageRepository
        this.storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadsDir = path.resolve(__dirname, '../uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                cb(null, uploadsDir);
            },
            filename: (req, file, cb) => {
                cb(null, `${Date.now()}${path.extname(file.originalname)}`);
            }
        });

        this.upload = multer({ storage: this.storage });
        this.multerFileName = multerFileName;
    }

    // ฟังก์ชันที่ใช้ในการอัพโหลดภาพ
    uploadImage() {
        return this.upload.single('postImgUrl');
    }

    // ฟังก์ชันบันทึกภาพลงโฟลเดอร์
    saveImageToFolder(imgFile) {
        if (!imgFile || !imgFile.path) {
            throw new Error("Invalid image file");
        }
        const imageUrl = `/uploads/${imgFile.filename}`;
        console.log("Image URL:", imageUrl);
        return imageUrl;
    }

    // ฟังก์ชันลบภาพออกจากโฟลเดอร์
    removeImageFromFolder(imgUrl) {
        const imgPath = path.join(__dirname, '..', imgUrl);
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

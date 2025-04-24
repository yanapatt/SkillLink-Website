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
    generateFilename(originalname) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${uniqueSuffix}-${originalname}`;
    }

    // ฟังก์ชันเพื่อให้แน่ใจว่า uploadsDir มีอยู่
    ensureUploadsDirExists() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }

    // ฟังก์ชันสำหรับกำหนดการตั้งค่าของ multer
    getDestinationCallback() {
        return (req, file, cb) => {
            cb(null, this.uploadsDir);
        };
    }

    getFilenameCallback() {
        return (req, file, cb) => {
            const filename = this.generateFilename(file.originalname);
            cb(null, filename);
        };
    }


    configureStorage() {
        return multer.diskStorage({
            destination: this.getDestinationCallback(),
            filename: this.getFilenameCallback()
        });
    }

    // ฟังก์ชันที่ใช้ในการอัพโหลดภาพ
    uploadImage() {
        return (req, res, next) => {
            if (!req.file) {
                return res.status(400).send('No file uploaded');
            }

            // ส่วนที่เหลือของการอัปโหลดไฟล์
            const validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(req.file.mimetype)) {
                return res.status(400).send('Invalid file type');
            }

            // หากทุกอย่างปกติ ให้เรียก next()
            next();
        };
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
    async removeImage(imageUrl) {
        const imagePath = path.join(__dirname, '..', imageUrl);
        try {
            await fs.promises.unlink(imagePath);
        } catch (err) {
            console.error('Error deleting image:', err.message);
            throw new Error('File not found'); // เพิ่มการ throw ใหม่
        }
    }

}

module.exports = ImageRepository; 
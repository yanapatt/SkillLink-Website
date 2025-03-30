const fs = require('fs');
const path = require('path');

class ImageRepository {
    constructor() {
    }

    // ยืนยันให้ชัวร์ว่า Directory ถูกสร้างหรือยัง
    alreadyExistence() {
        const uploadsDir = path.resolve(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            console.log("Directory has been exist at:", uploadsDir);
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    }

    // เซฟภาพลง Folder
    saveImageToFolder(imgFile) {
        const filename = `${Date.now()}${path.extname(imgFile.originalname)}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, imgFile.buffer);
        console.log("Images has been create at:", filePath);
        return `/uploads/${filename}`;
    }

    // ลบ Link ออกและนำภาพออกจาก Folder
    removeImageFromFolder(imgUrl) {
        const imgPath = path.join(__dirname, '..', imgUrl);
        return new Promise((resolve, reject) => {
            fs.unlink(imgPath, (err) => {
                if (err) {
                    reject(`Error deleting image: ${err}`);
                } else {
                    resolve(`Image at ${imgPath} deleted successfully`);
                }
            });
        });
    }

    // ลบภาพเก่าออกก่อนแล้วเก็บภาพใหม่
    handleImages(oldImgUrl, newImgFile) {
        return new Promise((resolve, reject) => {
            this.removeImageFromFolder(oldImgUrl)
                .then((message) => {
                    console.log(message);

                    const newImgUrl = this.saveImageToFolder(newImgFile);
                    resolve(newImgUrl);
                })
                .catch((err) => {
                    reject(`Error removing old image and saving new image: ${err}`);
                });
        });
    }
}

module.exports = ImageRepository;
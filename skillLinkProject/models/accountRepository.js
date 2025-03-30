const fs = require("fs");
const path = require("path");
const LinkedList = require("./linkedList");

class AccountRepository {
    constructor(filePath) {
        this.filePath = filePath;
        this.accounts = new LinkedList();
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
            fs.writeFileSync(`${this.filePath}.tmp`, JSON.stringify(this.accounts.toArray(), null, 2));
            fs.renameSync(`${this.filePath}.tmp`, this.filePath);
        } catch (error) {
            console.error("Error saving accounts to file:", error.message);
        }
    }

    // โหลดข้อมูลจาก JSON ไฟล์
    loadFromFile() {
        if (!fs.existsSync(this.filePath)) return;
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            if (!data.trim()) return;
            JSON.parse(data).forEach(acc => this.accounts.insertLast(acc));
        } catch (error) {
            console.error("Error loading accounts from file:", error.message);
        }
    }

    // ดึงข้อมูล Accounts ทีมีทั้งหมด
    retrieveAllAccounts() {
        // ในอนาคตอาจจะปรับให้เป็น LinkedList โดยสมบูรณ์
        return this.accounts.toArray();
    }

    // ดึงข้อมูล Account โดยค้นหาจาก AccountId
    retrieveAccountById(accId) {
        let foundAccounts = null;
        this.accounts.forEachNode(acc => {
            if (acc.accId === accId) {
                foundAccounts = acc;
            }
        });
        return foundAccounts;
    }

    // เพิ่ม Accounts ลงบน LinkedList
    insertAccounts(acc) {
        if (!this.retrieveAccountById(acc.accountId)) {
            this.accounts.insertLast(acc);
            this.saveToFile();
        } else {
            console.error(`Account with ID "${account.accountId}" already exists.`);
        }
    }
}

module.exports = AccountRepository;
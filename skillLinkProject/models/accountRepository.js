const fs = require("fs");
const path = require("path");
const LinkedList = require("./linkedList");

class AccountRepository {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'database', 'accounts.json');;
        this.accounts = new LinkedList();
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
            console.log("Data has been loading successful!: ", data);
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

    // ดึงข้อมูล Account โดยค้นหาจาก Username
    retrieveAccountByUsername(accUsername) {
        let foundAccounts = null;
        this.accounts.forEachNode(acc => {
            if (acc.accUsername === accUsername) {
                foundAccounts = acc;
            }
        });
        return foundAccounts;
    }

    // เพิ่ม Accounts ลงบน LinkedList
    insertAccounts(acc) {
        const existingAccount = this.retrieveAccountById(acc.accountId);
        if (existingAccount) {
            console.error(`Account with ID "${acc.accountId}" already exists.`);
            return;  // ไม่เพิ่มบัญชีใหม่ถ้ามีอยู่แล้ว
        }
        // โค้ดสำหรับเพิ่มบัญชีใหม่
        this.accounts.insertLast(acc);
        this.saveToFile();
    }

}

module.exports = AccountRepository;
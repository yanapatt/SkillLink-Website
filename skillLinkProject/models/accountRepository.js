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
            console.log("Directory does not exist, creating it at:", dirname);
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
            const accounts = JSON.parse(data);
            accounts.forEach(acc => this.accounts.insertLast(acc));
        } catch (error) {
            console.error("Error loading accounts from file:", error.message);
        }
    }


    // ดึงข้อมูล Accounts ทีมีทั้งหมด
    retrieveAllAccounts() {
        const result = new LinkedList();
        let current = this.accounts.head;
        while (current) {
            result.insertLast(current.value);
            current = current.next;
        }
        return result;
    }

    retrieveAccountByAction(value, action) {
        const allAccounts = this.retrieveAllAccounts();
        const targetAccounts = new LinkedList();

        if (!['username', 'accId', 'email'].includes(action)) {
            console.error("Invalid action specified:", action);
            return targetAccounts;
        }

        allAccounts.forEachNode((acc) => {
            if (action === "username" && acc.accUsername === value) {
                targetAccounts.insertLast(acc);
            } else if (action === "accId" && acc.accId === value) {
                targetAccounts.insertLast(acc);
            } else if (action === "email" && acc.accEmail === value) {
                targetAccounts.insertLast(acc);
            }
        });
        return targetAccounts;
    }

    // ตรวจสอบว่า Account มีอยู่หรือไม่
    checkAccountExistence(value, action) {
        const existingAccounts = this.retrieveAccountByAction(value, action);
        return existingAccounts.getSize() > 0;
    }

    // เพิ่ม Account ลงบน LinkedList
    insertAccounts(acc) {
        if (!acc.accId) {
            console.error("Account ID is required.");
            return;
        }

        if (this.checkAccountExistence(acc.accUsername, "username")) {
            console.error("Username already exists:", acc.accUsername);
            return;
        }

        if (this.checkAccountExistence(acc.accEmail, "email")) {
            console.error("Email already exists:", acc.accEmail);
            return;
        }

        this.accounts.insertLast(acc);
        this.saveToFile();
    }
}

module.exports = AccountRepository;
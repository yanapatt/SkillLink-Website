const fs = require('fs');
const path = require('path');
const Encryption = require('../util');
const LinkedList = require('./linkedList');

util = new Encryption();

class AccountModel {
  constructor() {
    this.accounts = new LinkedList();
    this.filePath = path.join(__dirname, '..', 'database', 'accounts.json'); // ที่อยู่ไฟล์ accounts.json
    this.ensureDirectoryExistence(this.filePath); // ตรวจสอบและสร้างโฟลเดอร์
    this.loadAccountsFromFile(); // โหลดข้อมูลบัญชีจากไฟล์ (ถ้ามี)
  }

  // ฟังก์ชันนี้ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่ หากไม่มีจะสร้างโฟลเดอร์
  ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  }

  createAccount(account) {
    account.password = util.encrypt(account.password); // เข้ารหัสรหัสผ่าน
    this.accounts.insertLast(account);
    this.saveAccountsToFile(); // บันทึกข้อมูลบัญชีลงในไฟล์
  }

  // ฟังก์ชันนี้ใช้บันทึกข้อมูลบัญชีในไฟล์
  saveAccountsToFile() {
    const accountsData = this.accounts.toArray();
    console.log("Saving accounts to file:", this.filePath);
    fs.writeFileSync(this.filePath, JSON.stringify(accountsData, null, 2)); // บันทึกข้อมูลเป็น JSON
  }

  loadAccountsFromFile() {
    if (fs.existsSync(this.filePath)) {
      const data = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      data.forEach((account) => this.accounts.insertLast(account)); // โหลดข้อมูลจากไฟล์และเพิ่มใน LinkedList
    }
  }

  // ฟังก์ชันสำหรับการตรวจสอบข้อมูลบัญชีที่ล็อกอิน
  authenticateAccount(username, password) {
    let foundAccount = null;
    this.accounts.forEachNode((account) => {
      if (account.username === username && account.password === util.encrypt(password)) {
        foundAccount = account;
      }
    });
    return foundAccount;
  }

  // ฟังก์ชันที่ใช้ดึงข้อมูลบัญชีทั้งหมด (ไม่เข้ารหัส)
  getAllAccounts() {
    const encryptedAccounts = [];
    this.accounts.forEachNode((account) => {
      encryptedAccounts.push(this.encryptAccounts(account));
    });
    return encryptedAccounts;
  }

  encryptAccounts(account) {
    return { ...account, password: "**********" }; // ซ่อนรหัสผ่าน
  }
}

module.exports = AccountModel;

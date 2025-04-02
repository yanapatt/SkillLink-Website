const AccountRepository = require("../models/accountRepository");
const fs = require("fs");
const path = require("path");
const LinkedList = require("../models/linkedList");

// Mock fs module
jest.mock('fs');

// Mock LinkedList class
jest.mock('../models/linkedList', () => {
    return jest.fn().mockImplementation(() => {
        return {
            insertLast: jest.fn(),
            toArray: jest.fn().mockReturnValue([{ accId: "123", accUsername: "testuser", accEmail: "test@example.com" }]),
            forEachNode: jest.fn()
        };
    });
});

describe("AccountRepository", () => {
    let accountRepo;

    beforeEach(() => {
        accountRepo = new AccountRepository(); // เตรียมการใช้ repository ใหม่ในแต่ละครั้ง
    });

    // ✅ Test: การเพิ่มบัญชี (insertAccounts)
    test("should insert an account and save to file", () => {
        const accountData = {
            accId: "123",
            accUsername: "testuser",
            accEmail: "test@example.com",
            accPassword: "encrypted_password"
        };

        accountRepo.insertAccounts(accountData);

        // ตรวจสอบว่า insertLast ถูกเรียกใช้งาน
        expect(accountRepo.accounts.insertLast).toHaveBeenCalledWith(accountData);

        // ตรวจสอบว่า saveToFile ถูกเรียก
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    // ❌ Test: ตรวจสอบกรณีบัญชีมีอยู่แล้ว (insertAccounts)
    test("should not insert an account if it already exists", () => {
        const accountData = {
            accId: "123",
            accUsername: "testuser",
            accEmail: "test@example.com",
            accPassword: "encrypted_password"
        };

        // Mock การคืนค่าบัญชีที่มีอยู่แล้ว
        accountRepo.retrieveAccountById = jest.fn().mockReturnValue(accountData);

        accountRepo.insertAccounts(accountData);

        // ตรวจสอบว่า insertLast ไม่ได้ถูกเรียก
        expect(accountRepo.accounts.insertLast).not.toHaveBeenCalled();
    });

    // ✅ Test: ดึงข้อมูลบัญชีทั้งหมด (retrieveAllAccounts)
    test("should retrieve all accounts", () => {
        const accounts = accountRepo.retrieveAllAccounts();

        // ตรวจสอบผลลัพธ์ที่ได้รับ
        expect(accounts).toEqual([{ accId: "123", accUsername: "testuser", accEmail: "test@example.com" }]);
    });

    // ✅ Test: ดึงข้อมูลบัญชีตาม AccountId (retrieveAccountById)
    test("should retrieve account by ID", () => {
        const account = accountRepo.retrieveAccountById("123");

        // ตรวจสอบว่า forEachNode ถูกเรียกและมีค่าผลลัพธ์เป็นบัญชีที่ตรงกับ ID
        expect(accountRepo.accounts.forEachNode).toHaveBeenCalled();
        expect(account).toEqual({ accId: "123", accUsername: "testuser", accEmail: "test@example.com" });
    });

    // ✅ Test: ดึงข้อมูลบัญชีตาม Username (retrieveAccountByUsername)
    test("should retrieve account by username", () => {
        const account = accountRepo.retrieveAccountByUsername("testuser");

        // ตรวจสอบว่า forEachNode ถูกเรียกและผลลัพธ์ถูกต้อง
        expect(accountRepo.accounts.forEachNode).toHaveBeenCalled();
        expect(account).toEqual({ accId: "123", accUsername: "testuser", accEmail: "test@example.com" });
    });

    // ✅ Test: ตรวจสอบการโหลดข้อมูลจากไฟล์ (loadFromFile)
    test("should load accounts from file", () => {
        // Mock fs.readFileSync
        fs.readFileSync.mockReturnValue(JSON.stringify([{ accId: "123", accUsername: "testuser", accEmail: "test@example.com" }]));

        accountRepo.loadFromFile();

        // ตรวจสอบว่า loadFromFile โหลดข้อมูลอย่างถูกต้อง
        expect(accountRepo.accounts.insertLast).toHaveBeenCalled();
    });

    // ✅ Test: ตรวจสอบการบันทึกข้อมูลไปยังไฟล์ (saveToFile)
    test("should save accounts to file", () => {
        accountRepo.saveToFile();

        // ตรวจสอบว่า fs.writeFileSync ถูกเรียกใช้
        expect(fs.writeFileSync).toHaveBeenCalled();
    });
});

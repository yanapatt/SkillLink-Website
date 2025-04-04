const AccountService = require("../models/accountService")
const { uuid } = require('uuidv4');

// Mock Dependencies
const mockAccountRepo = {
    insertAccounts: jest.fn(),
    retrieveAccountByUsername: jest.fn(),
    retrieveAllAccounts: jest.fn()
};

jest.mock('../util', () => {
    return jest.fn().mockImplementation(() => ({
        encrypt: jest.fn((password) => `encrypted_${password}`)
    }));
});


const Encryption = require('../util'); // Mock Encryption

describe("AccountService", () => {
    let accountService;

    beforeEach(() => {
        accountService = new AccountService(mockAccountRepo);
    });

    // ✅ Test: createAccount() - สร้างบัญชีสำเร็จ
    test("should create an account successfully", () => {
        const accountData = {
            accUsername: "testuser",  // ข้อมูลบัญชีที่จะใช้สร้าง
            accEmail: "test@example.com",
            accPassword: "password123",  // รหัสผ่าน
            accPhone: "0812345678"
        };

        // สร้างบัญชีด้วยข้อมูลที่ให้มา
        const createdAccount = accountService.createAccount(accountData);

        // ตรวจสอบว่า account ที่ถูกสร้างมี accId (UUID) หรือไม่
        expect(createdAccount).toHaveProperty("accId"); // UUID ควรจะถูกสร้าง
        // ตรวจสอบว่ารหัสผ่านถูกเข้ารหัสถูกต้องหรือไม่ (mock ไว้ว่าเข้ารหัสแล้ว)
        expect(createdAccount.accPassword).toBe("encrypted_password123"); // ควรใช้ mock encryption
        // ตรวจสอบว่า insertAccounts ถูกเรียกด้วยข้อมูลที่คาดหวัง
        expect(mockAccountRepo.insertAccounts).toHaveBeenCalledWith(expect.objectContaining({
            accUsername: "testuser",
            accEmail: "test@example.com"
        }));
    });

    // ❌ Test: createAccount() - ข้อมูลไม่ครบ
    test("should return null when required fields are missing", () => {
        // กรณีที่ข้อมูลไม่ครบ
        const incompleteData = { accUsername: "testuser" }; // ขาดข้อมูลอื่น ๆ เช่น email, password
        const result = accountService.createAccount(incompleteData);

        // คาดว่าเมื่อข้อมูลไม่ครบจะคืนค่า null
        expect(result).toBeNull();
    });

    // ✅ Test: authenticateAccount() - Login สำเร็จ
    test("should authenticate account with valid credentials", () => {
        // Mock ข้อมูลบัญชีที่มี username และ password ที่ถูกต้อง
        mockAccountRepo.retrieveAccountByUsername.mockReturnValue({
            accUsername: "testuser",
            accPassword: "encrypted_password123"  // รหัสผ่านที่เข้ารหัสแล้ว
        });

        // ทดสอบการเข้าสู่ระบบด้วย username และ password ที่ถูกต้อง
        const result = accountService.authenticateAccount("testuser", "password123");

        // คาดว่า login สำเร็จจะต้องไม่เป็น null
        expect(result).not.toBeNull();
    });

    // ❌ Test: authenticateAccount() - รหัสผิด
    test("should return null for incorrect password", () => {
        // Mock ข้อมูลบัญชีที่มีรหัสผ่านที่ถูกต้อง
        mockAccountRepo.retrieveAccountByUsername.mockReturnValue({
            accUsername: "testuser",
            accPassword: "encrypted_password123"  // รหัสผ่านที่เข้ารหัสแล้ว
        });

        // ทดสอบการเข้าสู่ระบบด้วยรหัสผ่านที่ไม่ถูกต้อง
        const result = accountService.authenticateAccount("testuser", "wrongpassword");

        // คาดว่า login จะล้มเหลว และต้องคืนค่า null
        expect(result).toBeNull();
    });

    // ❌ Test: authenticateAccount() - ไม่มีบัญชี
    test("should return null if account does not exist", () => {
        // Mock ข้อมูลว่าไม่มีบัญชีนี้
        mockAccountRepo.retrieveAccountByUsername.mockReturnValue(null);

        // ทดสอบการเข้าสู่ระบบด้วย username ที่ไม่มีในฐานข้อมูล
        const result = accountService.authenticateAccount("unknownUser", "password");

        // คาดว่า login จะล้มเหลว และต้องคืนค่า null เพราะไม่พบบัญชี
        expect(result).toBeNull();
    });

    // ✅ Test: getAllEncryptAccounts() - ดึงข้อมูลบัญชีทั้งหมดและมาสก์รหัสผ่าน
    test("should return all accounts with masked passwords", () => {
        const mockAccounts = [
            { accUsername: "user1", accPassword: "encrypted_pass1" },
            { accUsername: "user2", accPassword: "encrypted_pass2" }
        ];

        // Mock ให้ retrieveAllAccounts คืนค่าบัญชีทั้งหมด
        mockAccountRepo.retrieveAllAccounts.mockReturnValue(mockAccounts);

        // ทดสอบฟังก์ชัน getAllEncryptAccounts ที่ต้องทำการมาสก์รหัสผ่าน
        const result = accountService.getAllEncryptAccounts();

        // คาดว่ารหัสผ่านจะถูกมาสก์เป็น "**********"
        expect(result).toEqual([
            { accUsername: "user1", password: "**********" },
            { accUsername: "user2", password: "**********" }
        ]);
    });


});


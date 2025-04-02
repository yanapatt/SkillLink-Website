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
            accUsername: "testuser",
            accEmail: "test@example.com",
            accPassword: "password123",
            accPhone: "0812345678"
        };

        const createdAccount = accountService.createAccount(accountData);

        expect(createdAccount).toHaveProperty("accId"); // UUID ควรจะถูกสร้าง
        expect(createdAccount.accPassword).toBe("encrypted_password123"); // ควรใช้ mock encryption
        expect(mockAccountRepo.insertAccounts).toHaveBeenCalledWith(expect.objectContaining({
            accUsername: "testuser",
            accEmail: "test@example.com"
        }));
    });

    // ❌ Test: createAccount() - ข้อมูลไม่ครบ
    test("should return null when required fields are missing", () => {
        const incompleteData = { accUsername: "testuser" };
        const result = accountService.createAccount(incompleteData);
        expect(result).toBeNull();
    });

    // ✅ Test: authenticateAccount() - Login สำเร็จ
    test("should authenticate account with valid credentials", () => {
        mockAccountRepo.retrieveAccountByUsername.mockReturnValue({
            accUsername: "testuser",
            accPassword: "encrypted_password123"
        });

        const result = accountService.authenticateAccount("testuser", "password123");
        expect(result).not.toBeNull();
    });

    // ❌ Test: authenticateAccount() - รหัสผิด
    test("should return null for incorrect password", () => {
        mockAccountRepo.retrieveAccountByUsername.mockReturnValue({
            accUsername: "testuser",
            accPassword: "encrypted_password123"
        });

        const result = accountService.authenticateAccount("testuser", "wrongpassword");
        expect(result).toBeNull();
    });

    // ❌ Test: authenticateAccount() - ไม่มีบัญชี
    test("should return null if account does not exist", () => {
        mockAccountRepo.retrieveAccountByUsername.mockReturnValue(null);
        const result = accountService.authenticateAccount("unknownUser", "password");
        expect(result).toBeNull();
    });

    test("should return all accounts with masked passwords", () => {
        const mockAccounts = [
            { accUsername: "user1", accPassword: "encrypted_pass1" },
            { accUsername: "user2", accPassword: "encrypted_pass2" }
        ];

        // Mock ให้ return ค่า mockAccounts
        mockAccountRepo.retrieveAllAccounts.mockReturnValue(mockAccounts);

        // ฟังก์ชันที่ต้องการทดสอบ
        const result = accountService.getAllEncryptAccounts();

        // ตรวจสอบผลลัพธ์หลังจากมาสก์รหัสผ่าน
        expect(result).toEqual([
            { accUsername: "user1", password: "**********" },
            { accUsername: "user2", password: "**********" }
        ]);
    });


});

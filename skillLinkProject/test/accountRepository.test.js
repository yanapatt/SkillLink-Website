const AccountRepository = require("../models/accountRepository");
const fs = require("fs");
const LinkedList = require("../models/linkedList");

// Mock fs module
jest.mock("fs");

// Mock LinkedList class
jest.mock("../models/linkedList", () => {
    return jest.fn().mockImplementation(() => {
        const nodes = [
            { accId: "123", accUsername: "testuser", accEmail: "test@example.com" }
        ];
        return {
            insertLast: jest.fn(),
            toArray: jest.fn(() => [...nodes]),
            forEachNode: jest.fn((callback) => {
                nodes.forEach(callback);
            })
        };
    });
});

describe("AccountRepository", () => {
    let accountRepo;

    beforeEach(() => {
        accountRepo = new AccountRepository();
        jest.clearAllMocks(); // รีเซ็ต mock ก่อนรันแต่ละ test
    });

    // ✅ ตรวจสอบกรณีบัญชีมีอยู่แล้ว (ไม่ควรเพิ่มบัญชีซ้ำ)
    test("should not insert an account if it already exists", () => {
        const accountData = {
            accountId: "123",
            accUsername: "testuser",
            accEmail: "test@example.com",
            accPassword: "encrypted_password"
        };

        // Mock ว่ามีบัญชีนี้อยู่แล้ว
        accountRepo.retrieveAccountById = jest.fn().mockReturnValue(accountData);

        accountRepo.insertAccounts(accountData);

        // ตรวจสอบว่า insertLast ไม่ถูกเรียก (เพราะบัญชีมีอยู่แล้ว)
        expect(accountRepo.accounts.insertLast).not.toHaveBeenCalled();
    });

    // ✅ ตรวจสอบกรณีบัญชีไม่ซ้ำ (ควรเพิ่มบัญชีใหม่)
    test("should insert an account if it does not already exist", () => {
        const newAccountData = {
            accountId: "124",
            accUsername: "newuser",
            accEmail: "new@example.com",
            accPassword: "new_encrypted_password"
        };

        // Mock ว่าไม่มีบัญชีนี้อยู่
        accountRepo.retrieveAccountById = jest.fn().mockReturnValue(null);

        accountRepo.insertAccounts(newAccountData);

        // ตรวจสอบว่า insertLast ถูกเรียก (เพราะบัญชีไม่ซ้ำ)
        expect(accountRepo.accounts.insertLast).toHaveBeenCalledWith(newAccountData);
    });

    // ✅ ดึงข้อมูลบัญชีทั้งหมด
    test("should retrieve all accounts", () => {
        const accounts = accountRepo.retrieveAllAccounts();

        // ตรวจสอบผลลัพธ์ที่ได้รับ
        expect(accounts).toEqual([{ accId: "123", accUsername: "testuser", accEmail: "test@example.com" }]);
    });

    // ✅ ดึงข้อมูลบัญชีตาม AccountId
    test("should retrieve account by ID", () => {
        const account = accountRepo.retrieveAccountById("123");

        // ตรวจสอบว่า forEachNode ถูกเรียกและคืนค่าถูกต้อง
        expect(accountRepo.accounts.forEachNode).toHaveBeenCalled();
        expect(account).toEqual({ accId: "123", accUsername: "testuser", accEmail: "test@example.com" });
    });

    // ✅ ดึงข้อมูลบัญชีตาม Username
    test("should retrieve account by username", () => {
        const account = accountRepo.retrieveAccountByUsername("testuser");

        // ตรวจสอบว่า forEachNode ถูกเรียกและคืนค่าถูกต้อง
        expect(accountRepo.accounts.forEachNode).toHaveBeenCalled();
        expect(account).toEqual({ accId: "123", accUsername: "testuser", accEmail: "test@example.com" });
    });

    // ✅ โหลดข้อมูลจากไฟล์
    test("should load accounts from file", () => {
        // Mock fs.readFileSync
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(JSON.stringify([
            { accId: "123", accUsername: "testuser", accEmail: "test@example.com" }
        ]));

        accountRepo.loadFromFile();

        // ตรวจสอบว่า insertLast ถูกเรียกสำหรับแต่ละบัญชีที่โหลดมา
        expect(accountRepo.accounts.insertLast).toHaveBeenCalledWith({
            accId: "123",
            accUsername: "testuser",
            accEmail: "test@example.com"
        });
    });

    // ✅ บันทึกข้อมูลไปยังไฟล์
    test("should save accounts to file", () => {
        // Mock toArray ให้คืนค่าข้อมูลบัญชี
        accountRepo.accounts.toArray.mockReturnValue([
            { accId: "123", accUsername: "testuser", accEmail: "test@example.com" }
        ]);

        accountRepo.saveToFile();

        // ตรวจสอบว่า fs.writeFileSync ถูกเรียกใช้
        expect(fs.writeFileSync).toHaveBeenCalled();

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('accounts.json'), // ตรวจสอบว่า path มีคำว่า "accounts.json"
            expect.stringContaining('"accId":"123"')  // ตรวจสอบว่า content มี "accId": "123"
        );
    });
});
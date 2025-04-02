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

        const mockLinkedList = {
            insertLast: jest.fn(),  // mock insertLast
            toArray: jest.fn(() => [{ accId: "123", accUsername: "testuser", accEmail: "test@example.com" }]),
            forEachNode: jest.fn((callback) => {
                [{ accId: "123", accUsername: "testuser", accEmail: "test@example.com" }].forEach(callback);
            }),
        };

        accountRepo.accounts = mockLinkedList;  // ใช้ mock LinkedList ที่กำหนด
        jest.clearAllMocks();  // รีเซ็ต mock ก่อนการทดสอบแต่ละครั้ง
    });

    test("should insert an account if it does not already exist", () => {
        const newAccountData = {
            accId: "124", // ต้องมี accId ในข้อมูล
            accUsername: "newuser",
            accEmail: "new@example.com",
            accPassword: "new_encrypted_password"
        };

        // Mock ฟังก์ชัน retrieveAccountById ให้คืนค่า null (ไม่มีบัญชีนี้)
        jest.spyOn(accountRepo, 'retrieveAccountById').mockReturnValue(null);

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

        // ตรวจสอบว่า insertLast ถูกเรียกกับข้อมูลที่ถูกต้อง
        expect(accountRepo.accounts.insertLast).toHaveBeenCalled(); ({
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

        // ตรวจสอบว่า fs.renameSync ถูกเรียก
        expect(fs.renameSync).toHaveBeenCalledWith(
            expect.stringContaining('accounts.json.tmp'), // ตรวจสอบชื่อไฟล์ .tmp
            expect.stringContaining('accounts.json') // ตรวจสอบว่าเปลี่ยนเป็นไฟล์ .json
        );
    });
});


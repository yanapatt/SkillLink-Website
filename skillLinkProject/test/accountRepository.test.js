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

        // Mock LinkedList ให้มีฟังก์ชันที่ต้องการ
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

    // ✅ Test: ควร insert บัญชีใหม่ถ้ายังไม่มีในระบบ
    test("should insert an account if it does not already exist", () => {
        const newAccountData = {
            accId: "124", // ต้องมี accId ในข้อมูล
            accUsername: "newuser",
            accEmail: "new@example.com",
            accPassword: "new_encrypted_password"
        };

        // Mock ฟังก์ชัน retrieveAccountById ให้คืนค่า null (ไม่มีบัญชีนี้)
        jest.spyOn(accountRepo, 'retrieveAccountById').mockReturnValue(null);

        // ทดสอบการเพิ่มบัญชีใหม่
        accountRepo.insertAccounts(newAccountData);

        // ตรวจสอบว่า insertLast ถูกเรียก (เพราะบัญชีไม่ซ้ำ)
        expect(accountRepo.accounts.insertLast).toHaveBeenCalledWith(newAccountData);
    });

    // ✅ Test: ดึงข้อมูลบัญชีทั้งหมด
    test("should retrieve all accounts", () => {
        const accounts = accountRepo.retrieveAllAccounts();

        // ตรวจสอบผลลัพธ์ที่ได้รับจากการดึงข้อมูลบัญชีทั้งหมด
        expect(accounts).toEqual([{ accId: "123", accUsername: "testuser", accEmail: "test@example.com" }]);
    });

    // ✅ Test: ดึงข้อมูลบัญชีตาม AccountId
    test("should retrieve account by ID", () => {
        const account = accountRepo.retrieveAccountById("123");

        // ตรวจสอบว่า forEachNode ถูกเรียกและคืนค่าถูกต้อง
        expect(accountRepo.accounts.forEachNode).toHaveBeenCalled();
        expect(account).toEqual({ accId: "123", accUsername: "testuser", accEmail: "test@example.com" });
    });

    // ✅ Test: ดึงข้อมูลบัญชีตาม Username
    test("should retrieve account by username", () => {
        const account = accountRepo.retrieveAccountByUsername("testuser");

        // ตรวจสอบว่า forEachNode ถูกเรียกและคืนค่าถูกต้อง
        expect(accountRepo.accounts.forEachNode).toHaveBeenCalled();
        expect(account).toEqual({ accId: "123", accUsername: "testuser", accEmail: "test@example.com" });
    });

    // ✅ Test: โหลดข้อมูลบัญชีจากไฟล์
    test("should load accounts from file", () => {
        // Mock fs.readFileSync ให้คืนค่าข้อมูลบัญชีจากไฟล์
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(JSON.stringify([
            { accId: "123", accUsername: "testuser", accEmail: "test@example.com" }
        ]));

        // ทดสอบการโหลดข้อมูลจากไฟล์
        accountRepo.loadFromFile();

        // ตรวจสอบว่า insertLast ถูกเรียกกับข้อมูลที่ถูกต้อง
        expect(accountRepo.accounts.insertLast).toHaveBeenCalled();
    });

    // ✅ Test: บันทึกข้อมูลบัญชีไปยังไฟล์
    test("should save accounts to file", () => {
        // Mock toArray ให้คืนค่าข้อมูลบัญชี
        accountRepo.accounts.toArray.mockReturnValue([
            { accId: "123", accUsername: "testuser", accEmail: "test@example.com" }
        ]);

        // ทดสอบการบันทึกข้อมูลบัญชีไปยังไฟล์
        accountRepo.saveToFile();

        // ตรวจสอบว่า fs.writeFileSync ถูกเรียกใช้เพื่อบันทึกไฟล์
        expect(fs.writeFileSync).toHaveBeenCalled();

        // ตรวจสอบว่า fs.renameSync ถูกเรียก
        expect(fs.renameSync).toHaveBeenCalledWith(
            expect.stringContaining('accounts.json.tmp'), // ตรวจสอบชื่อไฟล์ .tmp
            expect.stringContaining('accounts.json') // ตรวจสอบว่าเปลี่ยนเป็นไฟล์ .json
        );
    });

    // Test: ควรไม่ทำอะไรถ้าไฟล์ accounts.json ไม่มีอยู่
    test("should return if accounts.json does not exist", () => {
        fs.existsSync.mockReturnValue(false); // จำลองว่าไฟล์ไม่มีอยู่
        accountRepo.loadFromFile();

        // ตรวจสอบว่า fs.readFileSync ไม่ถูกเรียก
        expect(fs.readFileSync).not.toHaveBeenCalled(); // ต้องไม่พยายามอ่านไฟล์
    });

    // Test: ควรไม่ทำอะไรถ้าไฟล์ accounts.json ว่างเปล่า
    test("should return if accounts.json is empty", () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(""); // ไฟล์มีอยู่ แต่ไม่มีข้อมูล

        // ทดสอบการโหลดข้อมูลจากไฟล์
        accountRepo.loadFromFile();

        // ตรวจสอบว่าไม่มีการ insert ข้อมูล
        expect(accountRepo.accounts.insertLast).not.toHaveBeenCalled(); // ต้องไม่มีการ insert ข้อมูล
    });

    // Test: ควรโยนข้อผิดพลาดหากไม่มี Account ID
    test("should throw an error if account ID is missing", () => {
        // ทดสอบการ insert บัญชีที่ขาด ID
        expect(() => {
            accountRepo.insertAccounts({ accUsername: "test", accEmail: "test@example.com" });
        }).toThrow("Account ID is missing.");  // คาดว่าโยนข้อผิดพลาด
    });

    // Test: ควรไม่ insert ข้อมูลถ้าบัญชีมีอยู่แล้ว
    test("should not insert account if it already exists", () => {
        const existingAccount = {
            accId: "123",
            accUsername: "testuser",
            accEmail: "test@example.com"
        };

        // Mock ให้ retrieveAccountById คืนค่าบัญชีที่มีอยู่แล้ว
        jest.spyOn(accountRepo, "retrieveAccountById").mockReturnValue(existingAccount);

        // ทดสอบการ insert ข้อมูลบัญชีที่มีอยู่แล้ว
        accountRepo.insertAccounts(existingAccount);

        // ตรวจสอบว่า insertLast ไม่ถูกเรียก (ไม่ควรเพิ่มข้อมูลซ้ำ)
        expect(accountRepo.accounts.insertLast).not.toHaveBeenCalled(); // ต้องไม่มีการ insert ข้อมูลซ้ำ
    });

    // Test: ควร log ข้อผิดพลาดหาก loadFromFile ล้มเหลว
    test("should log error if loadFromFile fails", () => {
        // Mock fs.readFileSync ให้โยนข้อผิดพลาด
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockImplementation(() => { throw new Error("File error"); });

        // Mock console.error
        console.error = jest.fn(); // Mock console.error
        accountRepo.loadFromFile();

        // ตรวจสอบว่า console.error ถูกเรียกเพื่อ log ข้อผิดพลาด
        expect(console.error).toHaveBeenCalledWith("Error loading accounts from file:", "File error");
    });
});



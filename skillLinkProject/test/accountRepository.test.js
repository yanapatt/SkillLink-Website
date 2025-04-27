const fs = require("fs");
const path = require("path");
const AccountRepository = require("../models/accountRepository");
const LinkedList = require("../models/linkedList");

jest.mock("fs");

describe("AccountRepository", () => {
    let accountRepo;

    beforeEach(() => {
        accountRepo = new AccountRepository();
        jest.clearAllMocks();

        // Mock console.error
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should create directory if it does not exist", () => {
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => { });

        accountRepo.alreadyExistence();

        expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(accountRepo.filePath));
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(accountRepo.filePath), { recursive: true });
    });

    test("should not create directory if it already exists", () => {
        fs.existsSync.mockReturnValue(true);

        accountRepo.alreadyExistence();

        expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(accountRepo.filePath));
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    test("should handle error when renaming file in saveToFile", () => {
        accountRepo.accounts.toArray = jest.fn(() => [{ accId: "1", accUsername: "testuser" }]);
        fs.writeFileSync.mockImplementation(() => { });
        fs.renameSync.mockImplementation(() => {
            throw new Error("Rename error");
        });

        accountRepo.saveToFile();

        expect(console.error).toHaveBeenCalledWith("Error saving accounts to file:", "Rename error");
    });

    test("should handle error when renaming file in saveToFile", () => {
        accountRepo.accounts.toArray = jest.fn(() => [{ accId: "1", accUsername: "testuser" }]);
        fs.writeFileSync.mockImplementation(() => { });
        fs.renameSync.mockImplementation(() => {
            throw new Error("Rename error");
        });

        accountRepo.saveToFile();

        expect(console.error).toHaveBeenCalledWith("Error saving accounts to file:", "Rename error");
    });
    test("should load accounts from file", () => {
        const mockData = JSON.stringify([{ accId: "1", accUsername: "testuser" }]);
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockData);
        accountRepo.accounts.insertLast = jest.fn();

        accountRepo.loadFromFile();

        expect(fs.readFileSync).toHaveBeenCalledWith(accountRepo.filePath, "utf8");
        expect(accountRepo.accounts.insertLast).toHaveBeenCalledWith({ accId: "1", accUsername: "testuser" });
    });

    test("should handle empty JSON file gracefully", () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(""); // ไฟล์ว่างเปล่า
        accountRepo.accounts.insertLast = jest.fn();

        accountRepo.loadFromFile();

        expect(fs.readFileSync).toHaveBeenCalledWith(accountRepo.filePath, "utf8");
        expect(accountRepo.accounts.insertLast).not.toHaveBeenCalled();
    });

    test("should retrieve all accounts", () => {
        const testAccount1 = { accId: "1", accUsername: "user1" };
        const testAccount2 = { accId: "2", accUsername: "user2" };

        accountRepo.accounts.head = {
            value: testAccount1,
            next: { value: testAccount2, next: null }
        };

        const allAccounts = accountRepo.retrieveAllAccounts().toArray();
        expect(allAccounts).toEqual([testAccount1, testAccount2]);
    });

    test("should retrieve account by username", () => {
        const testAccount = { accId: "1", accUsername: "testuser", accEmail: "test@example.com" };
        accountRepo.accounts.head = { value: testAccount, next: null };

        const result = accountRepo.retrieveAccountByAction("testuser", "username").toArray();
        expect(result).toEqual([testAccount]);
    });
    test("should return empty list if action is invalid in retrieveAccountByAction", () => {
        const result = accountRepo.retrieveAccountByAction("testuser", "invalidAction").toArray();

        expect(result).toEqual([]);
        expect(console.error).toHaveBeenCalledWith("Invalid action specified:", "invalidAction");
    });
    test("should check if account exists by username", () => {
        const testAccount = { accId: "1", accUsername: "testuser" };
        accountRepo.accounts.head = { value: testAccount, next: null };

        const exists = accountRepo.checkAccountExistence("testuser", "username");
        expect(exists).toBe(true);

        const notExists = accountRepo.checkAccountExistence("nonexistent", "username");
        expect(notExists).toBe(false);
    });
    test("should return false if action is invalid in checkAccountExistence", () => {
        // Mock ข้อมูลใน accounts
        accountRepo.accounts.head = {
            value: { accId: "1", accUsername: "testuser", accEmail: "test@example.com" },
            next: null
        };

        const result = accountRepo.checkAccountExistence("testuser", "invalidAction");

        // ตรวจสอบว่าผลลัพธ์เป็น false
        expect(result).toBe(false);

        // หากมีการแจ้งเตือนข้อผิดพลาด
        expect(console.error).not.toHaveBeenCalled(); // หรือ .toHaveBeenCalledWith(...) หากมีการแจ้งเตือน
    });
    test("should insert account and save to file", () => {
        accountRepo.accounts.insertLast = jest.fn();
        accountRepo.saveToFile = jest.fn();

        const newAccount = { accId: "1", accUsername: "testuser" };
        accountRepo.insertAccounts(newAccount);

        expect(accountRepo.accounts.insertLast).toHaveBeenCalledWith(newAccount);
        expect(accountRepo.saveToFile).toHaveBeenCalled();
    });

    test("should not insert account if accId is missing", () => {
        accountRepo.accounts.insertLast = jest.fn();
        accountRepo.saveToFile = jest.fn();

        const invalidAccount = { accUsername: "testuser" };
        accountRepo.insertAccounts(invalidAccount);

        expect(accountRepo.accounts.insertLast).not.toHaveBeenCalled();
        expect(accountRepo.saveToFile).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith("Account ID is required.");
    });
    test("should handle error when mkdirSync fails", () => {
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => {
            throw new Error("mkdir error");
        });

        accountRepo.alreadyExistence();

        expect(console.error).toHaveBeenCalledWith("Error creating directory:", "mkdir error");
    });

    test("should handle JSON parse error in loadFromFile", () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue("invalid JSON");

        accountRepo.loadFromFile();

        expect(console.error).toHaveBeenCalledWith(
            "Error loading accounts from file:",
            expect.stringContaining("Unexpected token")
        );
    });

    test("should retrieve account by accId and email", () => {
        const testAccount = { accId: "1", accUsername: "testuser", accEmail: "test@example.com" };
        accountRepo.accounts.head = { value: testAccount, next: null };

        const byId = accountRepo.retrieveAccountByAction("1", "accId").toArray();
        expect(byId).toEqual([testAccount]);

        const byEmail = accountRepo.retrieveAccountByAction("test@example.com", "email").toArray();
        expect(byEmail).toEqual([testAccount]);
    });

    test("should check if account exists by accId and email", () => {
        const testAccount = { accId: "1", accUsername: "testuser", accEmail: "test@example.com" };
        accountRepo.accounts.head = { value: testAccount, next: null };

        expect(accountRepo.checkAccountExistence("1", "accId")).toBe(true);
        expect(accountRepo.checkAccountExistence("test@example.com", "email")).toBe(true);
    });
    test("should not insert to result if email does not match", () => {
        const testAccount = { accId: "1", accUsername: "user1", accEmail: "email@example.com" };
        accountRepo.accounts.head = { value: testAccount, next: null };

        const result = accountRepo.retrieveAccountByAction("wrong@example.com", "email").toArray();
        expect(result).toEqual([]); // ไม่เจอ
    });

});
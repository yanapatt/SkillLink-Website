const fs = require("fs");
const path = require("path");
const AccountRepository = require("../models/accountRepository");

jest.mock("fs");
beforeEach(() => {
    accountRepo = new AccountRepository();
    jest.clearAllMocks();

    // Mock console.error
    jest.spyOn(console, "error").mockImplementation(() => { });
});

afterEach(() => {
    // Restore console.error
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

test("should save accounts to file", () => {
    accountRepo.accounts.toArray = jest.fn(() => [{ accId: "1", accUsername: "testuser" }]);
    fs.writeFileSync.mockImplementation(() => { });
    fs.renameSync.mockImplementation(() => { });

    accountRepo.saveToFile();

    expect(fs.writeFileSync).toHaveBeenCalledWith(
        `${accountRepo.filePath}.tmp`,
        JSON.stringify([{ accId: "1", accUsername: "testuser" }], null, 2)
    );
    expect(fs.renameSync).toHaveBeenCalledWith(`${accountRepo.filePath}.tmp`, accountRepo.filePath);
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

test("should not load accounts if file does not exist", () => {
    fs.existsSync.mockReturnValue(false);
    accountRepo.accounts.insertLast = jest.fn();

    accountRepo.loadFromFile();

    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(accountRepo.accounts.insertLast).not.toHaveBeenCalled();
});
test("should handle empty or invalid JSON file gracefully", () => {
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
test("should handle error when creating directory", () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {
        throw new Error("Permission denied");
    });

    accountRepo.alreadyExistence();

    expect(console.error).toHaveBeenCalledWith(
        "Error creating directory:",
        expect.stringContaining("Permission denied")
    );
});
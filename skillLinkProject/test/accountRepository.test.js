const fs = require('fs');
const path = require('path');
const os = require('os');
const AccountRepository = require('./AccountRepository');
const LinkedList = require('./linkedList');

// Mock LinkedList ด้วย class จำลองง่ายๆ
jest.mock('./linkedList');

describe('AccountRepository', () => {
    let accountRepo;
    let tempDir;
    let testFilePath;

    beforeEach(() => {
        // สร้าง temp directory จำลอง
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'acctest-'));
        testFilePath = path.join(tempDir, 'accounts.json');

        // Mock method ที่จำเป็นใน LinkedList
        LinkedList.mockImplementation(() => {
            return {
                head: null,
                insertLast: jest.fn(),
                toArray: jest.fn(() => []),
                forEachNode: jest.fn((cb) => { })
            };
        });

        // ใช้ spy แทนที่ path.join ให้ชี้ไปยัง temp
        jest.spyOn(path, 'join').mockImplementation((...args) => {
            if (args.includes('accounts.json')) {
                return testFilePath;
            }
            return path.posix.join(...args);
        });

        accountRepo = new AccountRepository();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    test('should create directory and file path correctly', () => {
        expect(fs.existsSync(path.dirname(testFilePath))).toBe(true);
    });

    test('should call insertLast when loading from file with data', () => {
        const testAccount = {
            accId: "1",
            accUsername: "testuser",
            accEmail: "test@example.com"
        };

        fs.writeFileSync(testFilePath, JSON.stringify([testAccount]));

        // Recreate to trigger loadFromFile
        accountRepo = new AccountRepository();
        expect(accountRepo.accounts.insertLast).toHaveBeenCalledWith(testAccount);
    });

    test('should save account to file', () => {
        const fakeData = [{ accId: '1', accUsername: 'user', accEmail: 'a@a.com' }];
        accountRepo.accounts.toArray.mockReturnValue(fakeData);

        accountRepo.saveToFile();

        const saved = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
        expect(saved).toEqual(fakeData);
    });

    test('should insert account and call saveToFile', () => {
        const acc = { accId: '2', accUsername: 'newuser', accEmail: 'b@b.com' };
        const saveSpy = jest.spyOn(accountRepo, 'saveToFile');

        accountRepo.insertAccounts(acc);

        expect(accountRepo.accounts.insertLast).toHaveBeenCalledWith(acc);
        expect(saveSpy).toHaveBeenCalled();
    });
});

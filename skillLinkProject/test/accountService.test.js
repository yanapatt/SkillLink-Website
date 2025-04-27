const AccountService = require('../models/accountService');
const Encryption = require('../util');
const AccountRepository = require('../models/accountRepository');

jest.mock('../models/accountRepository');
jest.mock('../util');

describe('AccountService', () => {
    let accountService;
    let mockRepo;
    let mockEncryption;

    // Mock console.error to suppress error logs during tests
    beforeAll(() => {
        console.error = jest.fn();
    });

    beforeEach(() => {
        mockRepo = new AccountRepository();
        mockEncryption = new Encryption();

        // Mock methods
        mockRepo.insertAccounts = jest.fn();
        mockRepo.retrieveAccountByAction = jest.fn();

        accountService = new AccountService(mockRepo);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createAccount', () => {
        test('should create an account with valid data', () => {
            const encryptSpy = jest
                .spyOn(mockEncryption, 'encrypt')
                .mockImplementation((password) => `encrypted-${password}`);

            const accountData = {
                accId: '1',
                accRole: 'Admin',
                accUsername: 'testuser',
                accEmail: 'test@example.com',
                accPassword: 'password123',
                accPhone: '1234567890'
            };

            // สร้าง instance ปกติ (ไม่ต้อง inject mockEncryption)
            const accountService = new AccountService(mockRepo);

            accountService.util = mockEncryption;

            // เรียกฟังก์ชัน
            const result = accountService.createAccount(accountData);

            // ตรวจสอบว่าถูกเรียกด้วย password เดิม
            expect(encryptSpy).toHaveBeenCalledWith('password123');
            expect(result.accPassword).toBe('encrypted-password123');
            expect(mockRepo.insertAccounts).toHaveBeenCalledWith(result);

            encryptSpy.mockRestore();
        });

        test('should return null if required fields are missing', () => {
            const accountData = {
                accUsername: 'testuser',
                accEmail: 'test@example.com'
            };

            const result = accountService.createAccount(accountData);

            expect(result).toBeNull();
            expect(mockRepo.insertAccounts).not.toHaveBeenCalled();
            expect.assertions(2);
        });

        test('should default accRole to "User" if not provided', () => {
            const mockAccountData = {
                accId: '1',
                accUsername: 'testuser',
                accEmail: 'test@example.com',
                accPassword: 'password123',
                accPhone: '1234567890'
            };

            // Mock ของ repo
            const mockRepo = {
                insertAccounts: jest.fn()
            };

            const accountService = new AccountService(mockRepo);

            // ทดสอบการสร้างบัญชี
            const result = accountService.createAccount(mockAccountData);

            // ตรวจสอบว่า accRole ถูกตั้งค่าเป็น 'User' หากไม่กำหนด
            expect(result.accRole).toBe('User');
        });

    });

    describe('authenticateAccount', () => {
        test('should return account if username and password are correct', () => {
            const mockAccount = {
                accId: '1',
                accRole: 'User',
                accUsername: 'testuser',
                accEmail: 'test@example.com',
                accPassword: 'encrypted-password123',
                accPhone: '1234567890'
            };

            // Mock repo result
            mockRepo.retrieveAccountByAction.mockReturnValue({
                size: 1,
                forEachNode: jest.fn((callback) => callback(mockAccount))  // Mock forEachNode
            });

            // สร้าง spy บน mockEncryption
            const encryptSpy = jest
                .spyOn(mockEncryption, 'encrypt')
                .mockImplementation((password) => `encrypted-${password}`);

            // ตั้งค่า accountService.util เป็น mockEncryption
            accountService.util = mockEncryption;

            // เรียกฟังก์ชันที่ต้องการทดสอบ
            const result = accountService.authenticateAccount('testuser', 'password123');

            // ตรวจสอบว่า retrieveAccountByAction ถูกเรียกด้วย username ที่ถูกต้อง
            expect(mockRepo.retrieveAccountByAction).toHaveBeenCalledWith('testuser', 'username');

            // ตรวจสอบว่า encrypt ถูกเรียกด้วย password ที่ส่งเข้าไป
            expect(encryptSpy).toHaveBeenCalledWith('password123');

            // ตรวจสอบว่าผลลัพธ์เป็น mockAccount
            expect(result).toEqual(mockAccount);

            // ตรวจสอบว่า accountFound ถูกตั้งค่าตาม username
            expect(result.accUsername).toBe('testuser');  // ตรวจสอบว่า username ตรงกับ mockAccount

            // ตรวจสอบว่า forEachNode ถูกเรียก 1 ครั้ง
            expect(mockRepo.retrieveAccountByAction().forEachNode).toHaveBeenCalledTimes(1);

            // ล้าง spy
            encryptSpy.mockRestore();

            // ตรวจว่ามี assertion ทั้งหมด 5 อัน
            expect.assertions(5);
        });

        test('should return null if username does not exist', () => {
            mockRepo.retrieveAccountByAction.mockReturnValue({
                size: 0,
                forEachNode: jest.fn()
            });

            const result = accountService.authenticateAccount('nonexistent', 'password123');

            expect(mockRepo.retrieveAccountByAction).toHaveBeenCalledWith('nonexistent', 'username');
            expect(result).toBeNull();

            expect.assertions(2);
        });

        test('should return null if password is incorrect', () => {
            const mockAccount = {
                accId: '1',
                accRole: 'User',
                accUsername: 'testuser',
                accEmail: 'test@example.com',
                accPassword: 'encrypted-correct-password',
                accPhone: '1234567890'
            };

            // Mock return value from the repository
            mockRepo.retrieveAccountByAction.mockReturnValue({
                size: 1,
                forEachNode: (callback) => callback(mockAccount)
            });

            // Mock the encryption to simulate incorrect password encryption
            jest.spyOn(mockEncryption, 'encrypt').mockReturnValue('encrypted-wrong-password');

            accountService.util = mockEncryption;

            const result = accountService.authenticateAccount('testuser', 'wrong-password');

            // Check that result is null due to incorrect password
            expect(result).toBeNull();

            // Check that encryption was called with the wrong password
            expect(mockEncryption.encrypt).toHaveBeenCalledWith('wrong-password');

            // Verify assertions are met
            expect.assertions(2);
        });

        test('should return null and log error if account not found', () => {
            const username = 'nonexistentuser';
            const password = 'password123';

            // Mock repo return value as empty (ไม่มีข้อมูลใน forEachNode)
            mockRepo.retrieveAccountByAction.mockReturnValue({
                size: 1,
                forEachNode: jest.fn() // ไม่มีการทำอะไรเมื่อมีการเรียก
            });

            // สร้าง spy สำหรับตรวจสอบการเรียก console.error
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            // เรียกฟังก์ชัน authenticateAccount
            const result = accountService.authenticateAccount(username, password);

            // ตรวจสอบว่า retrieveAccountByAction ถูกเรียกด้วย username ที่ถูกต้อง
            expect(mockRepo.retrieveAccountByAction).toHaveBeenCalledWith(username, 'username');
            // ตรวจสอบว่า console.error ถูกเรียกเมื่อไม่พบบัญชี
            expect(consoleErrorSpy).toHaveBeenCalledWith(`No account found with username: ${username}`);
            // ตรวจสอบว่า result เป็น null
            expect(result).toBeNull();

            // ล้าง spy
            consoleErrorSpy.mockRestore();

            // ตรวจว่ามี assertion ทั้งหมด 3 อัน
            expect.assertions(3);
        });
    });
});

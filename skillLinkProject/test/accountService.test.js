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
            // สร้าง spy สำหรับตรวจสอบการเรียก encrypt
            const encryptSpy = jest.spyOn(mockEncryption, 'encrypt').mockImplementation((password) => `encrypted-${password}`);

            const accountData = {
                accId: '1',
                accRole: 'Admin',
                accUsername: 'testuser',
                accEmail: 'test@example.com',
                accPassword: 'password123',
                accPhone: '1234567890'
            };

            // เรียกฟังก์ชัน createAccount
            const result = accountService.createAccount(accountData);

            // ตรวจสอบว่า encrypt ถูกเรียกด้วยรหัสผ่าน 'password123'
            expect(encryptSpy).toHaveBeenCalledWith('password123');  // ตรวจสอบว่าเรียกด้วยค่าที่ถูกต้อง

            // ตรวจสอบว่า accPassword ใน accountData ถูกเปลี่ยนเป็นรหัสผ่านที่เข้ารหัสแล้ว
            expect(result.accPassword).toBe('encrypted-password123');  // ค่าที่เข้ารหัสแล้ว

            // ตรวจสอบว่า insertAccounts ถูกเรียก
            expect(mockRepo.insertAccounts).toHaveBeenCalledWith(result);

            // ล้าง spy หลังการทดสอบ
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

            mockRepo.retrieveAccountByAction.mockReturnValue({
                size: 1,
                forEachNode: (callback) => callback(mockAccount)
            });

            // สร้าง spy สำหรับตรวจสอบการเรียก encrypt
            const encryptSpy = jest.spyOn(mockEncryption, 'encrypt').mockImplementation((password) => `encrypted-${password}`);

            const result = accountService.authenticateAccount('testuser', 'password123');

            expect(mockRepo.retrieveAccountByAction).toHaveBeenCalledWith('testuser', 'username');
            expect(encryptSpy).toHaveBeenCalledWith('password123');
            expect(result).toEqual(mockAccount);

            encryptSpy.mockRestore();
            expect.assertions(3);
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

            const result = accountService.authenticateAccount('testuser', 'wrong-password');

            // Check that result is null due to incorrect password
            expect(result).toBeNull();

            // Check that encryption was called with the wrong password
            expect(mockEncryption.encrypt).toHaveBeenCalledWith('wrong-password');

            // Verify assertions are met
            expect.assertions(2);
        });
    });
});

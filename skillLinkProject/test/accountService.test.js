const AccountService = require('../models/accountService');
const Encryption = require('../util');
const AccountRepository = require('../models/accountRepository');

jest.mock('../models/accountRepository');
jest.mock('../util');

describe('AccountService', () => {
    let accountService;
    let mockRepo;
    let mockEncryption;

    beforeEach(() => {
        mockRepo = new AccountRepository();
        mockEncryption = new Encryption();

        // Mock methods
        mockRepo.insertAccounts = jest.fn();
        mockRepo.retrieveAccountByAction = jest.fn();
        mockEncryption.encrypt = jest.fn((password) => `encrypted-${password}`);

        accountService = new AccountService(mockRepo);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createAccount', () => {
        test('should create an account with valid data', () => {
            const accountData = {
                accId: '1',
                accRole: 'Admin',
                accUsername: 'testuser',
                accEmail: 'test@example.com',
                accPassword: 'password123',
                accPhone: '1234567890'
            };

            const result = accountService.createAccount(accountData);

            expect(mockEncryption.encrypt).toHaveBeenCalledWith('password123');
            expect(mockRepo.insertAccounts).toHaveBeenCalledWith({
                accId: '1',
                accRole: 'Admin',
                accUsername: 'testuser',
                accEmail: 'test@example.com',
                accPassword: 'encrypted-password123',
                accPhone: '1234567890'
            });
            expect(result).toEqual({
                accId: '1',
                accRole: 'Admin',
                accUsername: 'testuser',
                accEmail: 'test@example.com',
                accPassword: 'encrypted-password123',
                accPhone: '1234567890'
            });
        });

        test('should return null if required fields are missing', () => {
            const accountData = {
                accUsername: 'testuser',
                accEmail: 'test@example.com'
            };

            const result = accountService.createAccount(accountData);

            expect(result).toBeNull();
            expect(mockRepo.insertAccounts).not.toHaveBeenCalled();
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

            const result = accountService.authenticateAccount('testuser', 'password123');

            expect(mockRepo.retrieveAccountByAction).toHaveBeenCalledWith('testuser', 'username');
            expect(mockEncryption.encrypt).toHaveBeenCalledWith('password123');
            expect(result).toEqual(mockAccount);
        });

        test('should return null if username does not exist', () => {
            mockRepo.retrieveAccountByAction.mockReturnValue({
                size: 0,
                forEachNode: jest.fn()
            });

            const result = accountService.authenticateAccount('nonexistent', 'password123');

            expect(mockRepo.retrieveAccountByAction).toHaveBeenCalledWith('nonexistent', 'username');
            expect(result).toBeNull();
        });

        test('should return null if password is incorrect', () => {
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

            const result = accountService.authenticateAccount('testuser', 'wrongpassword');

            expect(mockRepo.retrieveAccountByAction).toHaveBeenCalledWith('testuser', 'username');
            expect(mockEncryption.encrypt).toHaveBeenCalledWith('wrongpassword');
            expect(result).toBeNull();
        });
    });
});
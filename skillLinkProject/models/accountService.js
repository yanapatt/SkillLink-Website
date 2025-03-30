const Encryption = require('../util');
const { uuid } = require('uuidv4');

class AccountService {
    constructor(accountRepo) {
        this.accountRepo = accountRepo;
        this.util = new Encryption();
    }

    // จัด Format Documents JSON
    formatAccountDoc(acc) {
        return {
            accId: acc.accId || uuid(),
            accRole: acc.accRole || 'User',
            accUsername: acc.accUsername,
            accEmail: acc.accEmail,
            accPassword: acc.accPassword,
            accPhone: acc.accPhone
        }
    }

    // สร้าง Accounts
    createAccount(accData) {
        if (!accData.accUsername || !accData.accEmail || !accData.accPassword || !accData.accPhone) {
            console.error("Missing required fields");
            return null;
        }

        accData.accPassword = this.util.encrypt(accData.accPassword);
        const formattedAccount = this.formatAccountDoc(accData);

        this.accountRepo.insertAccounts(formattedAccount);
        return formattedAccount;
    }

    // ตรวจสอบบัญชีตอน Login
    authenticateAccount(accId, username, password) {
        const account = this.accountRepo.retrieveAccountById(accId);

        if (!account) {
            console.error(`No account found with accountId: ${accId}`);
            return null;
        }

        if (account.username !== username) {
            console.error(`Username does not match for accountId: ${accId}`);
            return null;
        }

        const isPasswordValid = account.accPassword === util.encrypt(password);
        if (isPasswordValid) {
            return account;
        } else {
            console.error("Invalid password.");
            return null;
        }
    }

    // Return ค่า Account ทั้งหมด แบบเข้ารหัส Password
    getAllEncryptAccounts() {
        return this.accountRepo.retrieveAllAccounts().map(this.encryptAccounts);
    }

    // เข้ารหัส Password
    encryptAccounts(acc) {
        return { ...acc, password: "**********" };
    }

    /*
    Sprint 4 TODO
    
    // อัปเดตข้อมูลบัญชี
    updateAccount(accountId, updateData) {
        //TODO
    }

    // ลบบัญชี
    deleteAccount(accountId) {
        //TODO
    }
    */
}

module.exports = AccountService;
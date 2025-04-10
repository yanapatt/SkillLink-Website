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
            accId: acc.accId,
            accRole: acc.accRole || 'User',
            accUsername: acc.accUsername,
            accEmail: acc.accEmail,
            accPassword: acc.accPassword,
            accPhone: acc.accPhone
        }
    }

    // สร้าง Accounts
    createAccount(accData) {
        if (!accData.accRole, !accData.accUsername || !accData.accEmail || !accData.accPassword || !accData.accPhone) {
            console.error("Missing required fields");
            return null;
        }

        accData.accId = uuid();
        accData.accPassword = this.util.encrypt(accData.accPassword);

        const account = this.formatAccountDoc(accData);
        this.accountRepo.insertAccounts(account);
        return account;
    }

    // ตรวจสอบบัญชีตอน Login
    authenticateAccount(username, password) {
        const account = this.accountRepo.retrieveAccountByUsername(username);

        if (!account) {
            console.error(`No account found with username: ${username}`);
            return null;
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = this.util.encrypt(password) === account.accPassword;
        if (!isPasswordValid) {
            console.error("Invalid password.");
            return null;
        }

        return account;
    }

    encryptAccounts(acc) {
        const { accPassword, ...rest } = acc; // เอาฟิลด์ accPassword ออก
        return { ...rest, password: "**********" }; // เพิ่มฟิลด์ password ที่มาสก์แล้ว
    }
}

module.exports = AccountService;
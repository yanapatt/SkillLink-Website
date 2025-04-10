const Encryption = require('../util');

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
}

module.exports = AccountService;
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
        const accounts = this.accountRepo.retrieveAccountByAction(username, "username");

        if (!accounts || accounts.size === 0) {
            console.error(`No account found with username: ${username}`);
            return null;
        }

        let accountFound = null;
        accounts.forEachNode((acc) => {
            if (acc.accUsername === username) {
                accountFound = acc;
            }
        });

        if (!accountFound) {
            console.error(`No account found with username: ${username}`);
            return null;
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = this.util.encrypt(password) === accountFound.accPassword;
        if (!isPasswordValid) {
            console.error(`Invalid password for account: ${username}`);
            return null;
        }

        return accountFound;
    }
}

module.exports = AccountService;
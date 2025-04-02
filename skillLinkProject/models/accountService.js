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
        console.log(accData);

        if (!accData.accRole, !accData.accUsername || !accData.accEmail || !accData.accPassword || !accData.accPhone) {
            console.error("Missing required fields");
            return null;
        }

        accData.accId = accData.accId || uuid();
        accData.accPassword = this.util.encrypt(accData.accPassword);
        const formattedAccount = this.formatAccountDoc(accData);

        this.accountRepo.insertAccounts(formattedAccount);
        return formattedAccount;
    }

    // ตรวจสอบบัญชีตอน Login
    authenticateAccount(username, password) {
        try {
            const account = this.accountRepo.retrieveAccountByUsername(username); // ใช้ await

            if (!account) {
                console.error(`No account found with username: ${username}`);
                return null;
            }

            // ตรวจสอบรหัสผ่าน
            const isPasswordValid = this.util.encrypt(password) === account.accPassword; // ใช้ this.util
            if (!isPasswordValid) {
                console.error("Invalid password.");
                return null;
            }

            return account;
        } catch (error) {
            console.error("Error during authentication:", error);
            return null;
        }
    }

    // Return ค่า Account ทั้งหมด แบบเข้ารหัส Password
    getAllEncryptAccounts() {
        return this.accountRepo.retrieveAllAccounts().map(this.encryptAccounts);
    }

    // เข้ารหัส Password
    encryptAccounts(acc) {
        const { accPassword, ...rest } = acc; // เอาฟิลด์ accPassword ออก
        return { ...rest, password: "**********" }; // เพิ่มฟิลด์ password ที่มาสก์แล้ว
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
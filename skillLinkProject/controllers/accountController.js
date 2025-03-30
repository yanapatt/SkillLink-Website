const AccountService = require('../models/accountService');
const AccountRepository = require('../models/accountRepository');
const { uuid } = require('uuidv4');


const accountRepo = new AccountRepository();
const accountService = new AccountService(accountRepo);

// ฟังก์ชันจัดการ error
const handleError = (res, view, errorMessage) => {
    console.error(errorMessage);
    res.render(view, { error: errorMessage });
};

// ตรวจสอบการล็อกอิน
exports.authenticate = (req, res, next) => {
    req.session.accountSession ? next() : res.redirect('/login');
};

// ล็อกเอาท์
exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
};

// แสดงหน้า login
exports.showLoginPage = (req, res) => res.render('login', { error: req.query.error || null });

// แสดงหน้า register
exports.showRegisterPage = (req, res) => res.render('register', { error: null });

// การล็อกอิน
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const accountSession = await accountService.authenticateAccount(username, password);

        if (!accountSession) {
            return handleError(res, 'login', `Invalid credentials for username: ${username}`);
        }

        // เก็บข้อมูลลงใน session
        req.session.accountSession = {
            accId: accountSession.accId,
            accUsername: accountSession.accUsername,
            accRole: accountSession.accRole
        };

        console.log(`${username} has logged in (AccountID: ${req.session.accountSession.accId})`);

        return res.redirect('/');
    } catch (error) {
        return handleError(res, 'login', 'An error occurred during login.');
    }
};

// การสมัครสมาชิก
exports.register = async (req, res) => {
    try {
        const { username, email, password, phone, accountRole } = req.body;

        if (![username, email, password, phone].every(Boolean)) {
            throw new Error('All fields are required!');
        }

        // สร้างบัญชีใหม่
        const newAccount = accountService.createAccount({
            accId: uuid(),
            accRole: accountRole,
            accUsername: username,
            accEmail: email,
            accPassword: password,
            accPhone: phone
        });


        // เก็บข้อมูลใน session หลังจากการสมัคร
        req.session.accountSession = {
            accId: newAccount.accId,
            accUsername: newAccount.accUsername,
            accRole: newAccount.accRole
        };

        console.log(`${username} registered successfully.`);

        return res.redirect('/login');
    } catch (error) {
        return handleError(res, 'register', error.message);
    }
};

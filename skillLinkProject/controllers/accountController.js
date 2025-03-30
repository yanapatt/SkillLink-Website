const AccountService = require('../services/accountService');
const AccountRepository = require('../repositories/accountRepository');

// สร้าง instance ของ AccountRepository และ AccountService
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

        req.session.accountSession = accountSession.accountId;
        console.log(`${username} has logged in (AccountID: ${req.session.accountSession})`);

        return res.redirect('/');
    } catch (error) {
        return handleError(res, 'login', 'An error occurred during login.');
    }
};

// การสมัครสมาชิก
exports.register = async (req, res) => {
    try {
        const { username, email, password, phone, accountType } = req.body;

        if (![username, email, password, phone].every(Boolean)) {
            throw new Error('All fields are required!');
        }

        await accountService.createAccount({
            username,
            email,
            password,
            phone,
            accountType: accountType || 'User'
        });

        console.log(`${username} registered successfully.`);
        return res.redirect('/login');
    } catch (error) {
        return handleError(res, 'register', error.message);
    }
};

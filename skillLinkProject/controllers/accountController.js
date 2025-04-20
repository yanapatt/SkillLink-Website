const AccountService = require('../models/accountService');
const AccountRepository = require('../models/accountRepository');
const { uuid } = require('uuidv4');

const accountRepo = new AccountRepository();
const accountService = new AccountService(accountRepo);

// ฟังก์ชันสำหรับจัดการข้อผิดพลาด
const handleError = (res, view, errorMessage) => {
    console.error(errorMessage);
    res.render(view, { error: errorMessage });
};

// ล็อกอิน
exports.authenticate = (req, res, next) => {
    if (req.session.accountSession) {
        next();
    } else {
        res.redirect('/login');
    }
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
exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    const accountSession = accountService.authenticateAccount(username, password);

    if (!accountSession) {
        return handleError(res, 'login', `Invalid username or password for: ${username}`);
    }

    req.session.accountSession = {
        accId: accountSession.accId,
        accUsername: accountSession.accUsername,
        accRole: accountSession.accRole
    };

    req.session.save(() => { });

    console.log('User logged in:', req.session.accountSession.accId);
    return res.redirect('/');
};

// การสมัครสมาชิก
exports.register = async (req, res) => {
    const { username, email, password, phone, accountRole } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
    if (![username, email, password, phone].every(Boolean)) {
        return handleError(res, 'register', 'All fields are required!');
    }

    // ตรวจสอบว่า username
    if (accountRepo.checkAccountExistence(username, "username")) {
        return res.render('register', { error: "Username already exists." });
    }

    // ตรวจสอบว่า email มีอยู่ในระบบหรือไม่
    if (accountRepo.checkAccountExistence(email, "email")) {
        return res.render('register', { error: "Email already exists." });
    }

    // สร้างบัญชีใหม่
    accountService.createAccount({
        accId: uuid(),
        accRole: accountRole,
        accUsername: username,
        accEmail: email,
        accPassword: password,
        accPhone: phone
    });
    
    return res.redirect('/login');
};


const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

jest.setTimeout(10000);

describe('Register Page Test', () => {
    let driver;

    beforeAll(async () => {
        const serviceBuilder = new chrome.ServiceBuilder(require('chromedriver').path);
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeService(serviceBuilder)
            .build();

        await driver.get('http://localhost:3000/register');
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    // ทดสอบว่าเมื่อกรอก username ที่ซ้ำจะมีข้อความ "Username already exists."
    it('should show error message if username already exists', async () => {
        const existingUsername = 'admin'; // สมมุติว่ามีชื่อผู้ใช้ที่ซ้ำในระบบ
        await driver.findElement(By.name('username')).sendKeys(existingUsername);
        await driver.findElement(By.name('email')).sendKeys('test@example.com');
        await driver.findElement(By.name('password')).sendKeys('password123');
        await driver.findElement(By.name('phone')).sendKeys('0123456789');
        await driver.findElement(By.name('accountRole')).sendKeys('User');
        await driver.findElement(By.css('button.secondary-btn')).click();

        // รอ error message ด้วยการใช้ driver.wait() และ until
        const usernameErrorMessage = await driver.wait(
            until.elementLocated(By.css('div[style="color: red; margin-top: 10px;"]')),
            10000
        );
        await driver.sleep(1000);
        const errorText = await usernameErrorMessage.getText();
        expect(errorText).toContain('Username already exists');
    });

    // ทดสอบว่าเมื่อกรอก email ที่ซ้ำจะมีข้อความ "Email already exists."
    it('should show error message if email already exists', async () => {
        const existingEmail = 'admin@gmail.com';

        // กรอกข้อมูล
        await driver.findElement(By.name('username')).sendKeys('newUser123');
        await driver.findElement(By.name('email')).sendKeys(existingEmail);
        await driver.findElement(By.name('password')).sendKeys('password123');
        await driver.findElement(By.name('phone')).sendKeys('0123456789');
        await driver.findElement(By.name('accountRole')).sendKeys('User');

        // คลิกปุ่มสมัคร
        await driver.findElement(By.css('button.secondary-btn')).click();
        await driver.sleep(1000);

        // รอ error message ด้วยการใช้ driver.wait() และ until
        const emailErrorMessage = await driver.wait(
            until.elementLocated(By.css('div[style="color: red; margin-top: 10px;"]')),
            5000
        );
        const errorText = await emailErrorMessage.getText();
        expect(errorText).toContain('Email already exists');
    });
});

describe('Login Page Test', () => {
    let driver;

    beforeAll(async () => {
        const serviceBuilder = new chrome.ServiceBuilder(require('chromedriver').path);
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeService(serviceBuilder)
            .build();

        await driver.get('http://localhost:3000/login');
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    it('should show invalid username or password error', async () => {
        const username = 'wrongUsername';
        const password = 'wrongPassword';

        await driver.findElement(By.name('username')).sendKeys(username);
        await driver.findElement(By.name('password')).sendKeys(password);
        await driver.findElement(By.css('button.secondary-btn')).click();

        // รอ error message ด้วยการใช้ driver.wait() และ until
        const errorMessage = await driver.wait(
            until.elementLocated(By.css('p[style="color: red;"]')),
            5000
        );
        const errorText = await errorMessage.getText();
        expect(errorText).toContain(`Invalid username or password for: ${username}`);
    });

    it('should redirect to index page after successful login', async () => {
        const username = 'yanapatt'; // ใส่ชื่อผู้ใช้ที่ถูกต้อง
        const password = '123'; // ใส่รหัสผ่านที่ถูกต้อง

        await driver.findElement(By.name('username')).sendKeys(username);
        await driver.findElement(By.name('password')).sendKeys(password);
        await driver.findElement(By.css('button.secondary-btn')).click();

        await driver.wait(until.urlIs('http://localhost:3000/'), 10000);

        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toBe('http://localhost:3000/');
    });
});

describe('Index page for user test', () => {
    let driver;

    beforeAll(async () => {
        const serviceBuilder = new chrome.ServiceBuilder(require('chromedriver').path);
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeService(serviceBuilder)
            .build();

        // ไปที่หน้า Login ก่อน
        await driver.get('http://localhost:3000/login');

        // ขั้นตอนการ Login
        const username = 'yanapatt'; // ชื่อผู้ใช้
        const password = '123'; // รหัสผ่าน

        // กรอกข้อมูลเพื่อ Login
        await driver.findElement(By.name('username')).sendKeys(username);
        await driver.findElement(By.name('password')).sendKeys(password);
        await driver.findElement(By.css('button.secondary-btn')).click();

        // รอให้หน้า Index (หน้าหลัก) โหลดหลังจาก Login
        await driver.wait(until.urlIs('http://localhost:3000/'), 5000); // ตรวจสอบ URL ของหน้า Index
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    // ถ้า Post ซ้ำให้แสดงข้อความว่าซ้ำ
    it('should show error message if post title already exists', async () => {
        const existingPostTitle = 'Help Me'; // ชื่อโพสต์ที่ซ้ำ

        // กรอกข้อมูลโพสต์
        await driver.findElement(By.name('postTitle')).sendKeys(existingPostTitle);
        await driver.findElement(By.name('postDesc')).sendKeys('This is a test description.');
        await driver.findElement(By.css('div.right-content button.primary-outline-btn')).click();

        // รอให้ error message แสดง
        const errorMessage = await driver.wait(
            until.elementLocated(By.id('error-message')),
            5000
        );

        // ตรวจสอบข้อความ error
        const errorText = await errorMessage.getText();
        expect(errorText).toContain(`Post title "${existingPostTitle}" already exists.`);
    });

    // ทดสอบการค้นหาที่มีผลลัพธ์
    it('should display search results when searching for an existing post title', async () => {
        const searchQuery = 'Help Me'; // ชื่อโพสต์ที่มีอยู่แล้วในระบบ

        // กรอกคำค้นหาในฟิลด์ค้นหา
        await driver.findElement(By.name('value')).sendKeys(searchQuery);
        await driver.findElement(By.css('button.secondary-btn')).click();

        // รอให้ผลลัพธ์การค้นหาปรากฏ
        await driver.wait(until.elementLocated(By.css('.sub-content')), 5000);

        // ตรวจสอบว่าผลลัพธ์การค้นหามีโพสต์ที่ตรงกับคำค้นหาหรือไม่
        const resultItems = await driver.findElements(By.css('.sub-content li'));
        expect(resultItems.length).toBeGreaterThan(0); // ควรมีโพสต์ที่ตรงกับคำค้นหา
    });

    it('should display search results when searching for an existing post owner', async () => {
        const searchQuery = 'yanapatt'; // ชื่อโพสต์ที่มีอยู่แล้วในระบบ (ชื่อเจ้าของโพสต์)

        // เลือกตัวเลือก "Search by Author"
        const searchTypeDropdown = await driver.findElement(By.css('select[name="action"]'));
        await searchTypeDropdown.click(); // คลิกที่ select
        await searchTypeDropdown.findElement(By.css('option[value="byAuthor"]')).click(); // คลิกเลือก "byAuthor"

        // กรอกคำค้นหาในฟิลด์ค้นหา
        await driver.findElement(By.name('value')).sendKeys(searchQuery);

        // คลิกปุ่มค้นหา
        await driver.findElement(By.css('button.secondary-btn')).click();

        // รอให้ผลลัพธ์การค้นหาปรากฏ
        await driver.wait(until.elementLocated(By.css('.sub-content')), 5000);
        await driver.sleep(1000);

        // ตรวจสอบว่าผลลัพธ์การค้นหามีโพสต์ที่ตรงกับคำค้นหาหรือไม่
        const resultItems = await driver.findElements(By.css('.sub-content li'));
        expect(resultItems.length).toBeGreaterThan(0); // ควรมีโพสต์ที่ตรงกับคำค้นหาผู้โพสต์
    });

    it('should display "Not Found!" when no posts match the search query', async () => {
        const searchQuery = 'NonExistentPost'; // คำค้นหาที่ไม่พบโพสต์ในระบบ

        // กรอกคำค้นหาในฟิลด์ค้นหา
        await driver.findElement(By.name('value')).sendKeys(searchQuery);
        await driver.findElement(By.css('button.secondary-btn')).click();

        // รอให้ผลลัพธ์การค้นหาปรากฏ
        await driver.wait(until.elementLocated(By.css('.sub-content')), 5000);

        // ตรวจสอบข้อความ "Not Found!" หากไม่พบโพสต์
        const notFoundMessage = await driver.findElement(By.css('.sub-content p')).getText();
        expect(notFoundMessage).toBe('Not Found!'); // ควรแสดงข้อความ "Not Found!" เมื่อไม่พบโพสต์
    });
});

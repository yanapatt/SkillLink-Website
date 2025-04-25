const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ImageRepository = require('../models/imageRepository');

// Mocking modules
jest.mock('fs');
jest.mock('multer');

// Fix multer mock setup
const mockSingle = jest.fn(() => (req, res, next) => {
    req.file = { mimetype: 'image/jpeg', filename: 'mock-file.jpg' }; // mock file
    next();
});
// Mocking multer
const mockMulter = jest.fn(() => ({
    diskStorage: jest.fn(() => ({
        destination: jest.fn(),  // mock destination
        filename: jest.fn(),     // mock filename
    })),
}));

multer.mockImplementation(mockMulter);

multer.mockImplementation(mockMulter);

// Fix fs.promises
fs.promises = {
    unlink: jest.fn(),
};

describe('ImageRepository', () => {
    let imageRepo;

    beforeEach(() => {
        jest.clearAllMocks();

        imageRepo = new ImageRepository();

        // Mock diskStorage ให้คืนค่าที่แท้จริง
        multer.diskStorage = jest.fn(({ destination, filename }) => ({
            destination,
            filename,
        }));

        // mock multer ให้ใช้งานได้ตามจริง
        multer.mockImplementation((opts) => ({
            storage: opts.storage,
            single: mockSingle,
        }));
    });


    // Ensure Uploads Dir Exists
    describe('ensureUploadsDirExists', () => {
        test('should create uploads directory if it does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            fs.mkdirSync.mockClear();

            imageRepo.ensureUploadsDirExists();

            expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
        });

        test('should not create uploads directory if it exists', () => {
            fs.existsSync.mockReturnValue(true);
            fs.mkdirSync.mockClear();

            imageRepo.ensureUploadsDirExists();

            expect(fs.mkdirSync).not.toHaveBeenCalled();
        });
    });

    test('should configure storage correctly', () => {
        expect(imageRepo.upload).toBeDefined();
    });

    describe('uploadImage', () => {
        test('should upload an image', () => {
            const mockReq = { file: { mimetype: 'image/jpeg', filename: 'mock-file.jpg' } };  // mock file
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                json: jest.fn(),
            };
            const mockNext = jest.fn();

            const uploadFunction = imageRepo.uploadImage();
            uploadFunction(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        test('should handle invalid file type with wrong mimetype', () => {
            const mockFile = { mimetype: 'image/gif' };
            const mockReq = { file: mockFile };
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const mockNext = jest.fn();

            const uploadFunction = imageRepo.uploadImage();
            uploadFunction(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.send).toHaveBeenCalledWith('Invalid file type');
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should handle missing file in request', () => {
            const mockReq = {}; // ไม่มีไฟล์
            const mockRes = { status: jest.fn().mockReturnThis(), send: jest.fn() };
            const mockNext = jest.fn();

            const uploadFunction = imageRepo.uploadImage();
            uploadFunction(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.send).toHaveBeenCalledWith('No file uploaded');
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('saveImage', () => {
        test('should save image URL correctly', () => {
            const mockImgUrl = { filename: 'image123.jpg' };
            const result = imageRepo.saveImage(mockImgUrl);
            expect(result).toBe('/uploads/image123.jpg');
        });

        test('should throw error when saving image with invalid data', () => {
            const invalidImgUrl = {};
            expect(() => imageRepo.saveImage(invalidImgUrl)).toThrow('Invalid image file');
        });
    });

    describe('removeImage', () => {
        test('should remove image from filesystem', async () => {
            const mockImgUrl = '/uploads/image123.jpg';
            const imgPath = path.join(__dirname, '..', mockImgUrl);

            fs.promises.unlink.mockResolvedValue();

            await imageRepo.removeImage(mockImgUrl);

            expect(fs.promises.unlink).toHaveBeenCalledWith(imgPath);
        });

        test('should handle error when removing image', async () => {
            const mockImgUrl = '/uploads/image123.jpg';

            fs.promises.unlink.mockRejectedValue(new Error('File not found'));

            await expect(imageRepo.removeImage(mockImgUrl)).rejects.toThrow('File not found');
        });

        test('should handle error when removing image with invalid path', async () => {
            const invalidImgUrl = '/invalid/path/image123.jpg';

            fs.promises.unlink.mockRejectedValue(new Error('File not found'));

            await expect(imageRepo.removeImage(invalidImgUrl)).rejects.toThrow('File not found');
        });
    });
    describe('generateFilename', () => {
        test('should return a filename with timestamp and original name', () => {
            const original = 'test.jpg';
            const result = imageRepo.generateFilename(original);
            expect(result).toMatch(/\d{13}-\d+-test\.jpg$/);
        });
    });

    describe('configureStorage', () => {
        test('should return diskStorage with destination and filename functions', () => {
            const storage = imageRepo.configureStorage();
            expect(typeof storage.destination).toBe('function');
            expect(typeof storage.filename).toBe('function');
        });
    });
    test('should call destination callback with correct path', () => {
        const storage = imageRepo.configureStorage();  // ดึง storage ที่มี destination callback จริง
        const cb = jest.fn();

        storage.destination({}, {}, cb);  // เรียก destination
        expect(cb).toHaveBeenCalledWith(null, imageRepo.uploadsDir);  // ตรวจสอบว่าเรียก callback ด้วย path ที่ถูก
    });

    test('should call filename callback with generated filename', () => {
        const storage = imageRepo.configureStorage();
        const cb = jest.fn();
        const mockOriginalName = 'test.jpg';

        jest.spyOn(imageRepo, 'generateFilename'); // ดักจับ generateFilename
        imageRepo.generateFilename.mockReturnValue('12345-test.jpg');

        storage.filename({}, { originalname: mockOriginalName }, cb);  // เรียก filename function
        expect(imageRepo.generateFilename).toHaveBeenCalledWith(mockOriginalName);
        expect(cb).toHaveBeenCalledWith(null, '12345-test.jpg');
    });
});

describe('getDestinationCallback', () => {
    test('should call cb with uploadsDir path', () => {
        const imageRepo = new ImageRepository();
        const cb = jest.fn();
        const destinationFn = imageRepo.getDestinationCallback();
        destinationFn({}, {}, cb);
        expect(cb).toHaveBeenCalledWith(null, imageRepo.uploadsDir);
    });
});

describe('ImageRepository', () => {
    let imageRepo;

    beforeEach(() => {
        jest.clearAllMocks();
        imageRepo = new ImageRepository();
    });

    describe('getFilenameCallback', () => {
        test('should call cb with generated filename', () => {
            const cb = jest.fn();
            const file = { originalname: 'test.jpg' };

            // Mock generateFilename ใน instance
            imageRepo.generateFilename = jest.fn().mockReturnValue('12345-test.jpg');

            const filenameFn = imageRepo.getFilenameCallback();
            filenameFn({}, file, cb);

            expect(cb).toHaveBeenCalledWith(null, '12345-test.jpg');
            expect(imageRepo.generateFilename).toHaveBeenCalledWith('test.jpg');
        });
    });

    // ... tests อื่น ๆ ...
});

describe('multer', () => {
    test('should call multer with diskStorage', () => {
        expect(multer).toHaveBeenCalledWith(expect.objectContaining({
            storage: expect.any(Object)
        }));
        expect(multer.diskStorage).toHaveBeenCalled();
    });
});

describe('ImageRepository', () => {
    let imageRepo;

    beforeEach(() => {
        jest.clearAllMocks();
        imageRepo = new ImageRepository();
    });

    // ... test อื่น ๆ ...

    describe('mockSingle', () => {
        test('should call mockSingle and set req.file', () => {
            const req = {};
            const res = {};
            const next = jest.fn();

            mockSingle()(req, res, next);

            expect(req.file).toEqual({ mimetype: 'image/jpeg', filename: 'mock-file.jpg' });
            expect(next).toHaveBeenCalled();
        });

        test('should handle error when removing image', async () => {
            const mockImgUrl = '/uploads/image123.jpg';
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            fs.promises.unlink.mockRejectedValue(new Error('File not found'));

            await expect(imageRepo.removeImage(mockImgUrl)).rejects.toThrow('File not found');
            expect(consoleSpy).toHaveBeenCalledWith('Error deleting image:', 'File not found');

            consoleSpy.mockRestore();
        });
    });
});
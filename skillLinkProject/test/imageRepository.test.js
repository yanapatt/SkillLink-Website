const fs = require("fs");
const path = require("path");
const httpMocks = require("node-mocks-http");
const ImageRepository = require("../models/imageRepository");

jest.mock("fs", () => ({
    existsSync: jest.fn(), // Mock ให้คืนค่า false เสมอ
    mkdirSync: jest.fn(),
    unlink: jest.fn(),
}));


describe("ImageRepository", () => {
    let imageRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        fs.existsSync.mockReturnValue(false);
        imageRepository = new ImageRepository("testFile");
    });

    it("should store files in the correct directory with a unique filename", (done) => {
        const req = httpMocks.createRequest({
            method: "POST",
            url: "/upload",
            headers: { "content-type": "multipart/form-data" },
        });
        const res = httpMocks.createResponse();
        const file = { originalname: "test.jpg", mimetype: "image/jpeg" };
        const cb = jest.fn();

        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => {});

        imageRepository.storage.getDestination(req, file, cb);
        expect(fs.existsSync).toHaveBeenCalledWith(path.resolve(__dirname, "../uploads"));
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.resolve(__dirname, "../uploads"), { recursive: true });
        done();
    });

    it("should generate a unique filename", (done) => {
        const req = httpMocks.createRequest({
            method: "POST",
            url: "/upload",
            headers: { "content-type": "multipart/form-data" },
        });
        const res = httpMocks.createResponse();
        const file = { originalname: "test.jpg", mimetype: "image/jpeg" };
        const cb = jest.fn();

        imageRepository.storage.getFilename(req, file, cb);
        expect(cb).toHaveBeenCalledWith(null, expect.stringMatching(/^[0-9]+\.jpg$/));
        done();
    });
});

describe("ImageRepository - Additional Methods", () => {
    let imageRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        imageRepository = new ImageRepository();
    });

    describe("uploadImage", () => {
        it("should return a multer middleware function", () => {
            const middleware = imageRepository.uploadImage();
            expect(typeof middleware).toBe("function");
        });

        it("should process file upload correctly", (done) => {
            const req = httpMocks.createRequest({
                method: "POST",
                url: "/upload",
                headers: {
                    "content-type": "multipart/form-data",
                },
                file: {
                    originalname: "test.jpg",
                    mimetype: "image/jpeg",
                },
            });
            const res = httpMocks.createResponse();

            const middleware = imageRepository.uploadImage();
            middleware(req, res, (err) => {
                expect(err).toBeUndefined();
                done();
            });
        });
    });

    describe("saveImageToFolder", () => {
        it("should return the correct image URL when a valid file is provided", () => {
            const mockFile = { path: "/uploads/test.jpg", filename: "test.jpg" };

            const result = imageRepository.saveImageToFolder(mockFile);

            expect(result).toBe("/uploads/test.jpg");
        });

        it("should throw an error if the file is invalid", () => {
            expect(() => imageRepository.saveImageToFolder(null)).toThrow("Invalid image file");
            expect(() => imageRepository.saveImageToFolder({})).toThrow("Invalid image file");
        });
    });

    describe("removeImageFromFolder", () => {
        it("should delete the image file successfully", async () => {
            const mockImgUrl = "/uploads/test.jpg";
            const mockImgPath = path.join(__dirname, "..", mockImgUrl);

            fs.unlink.mockImplementation((filePath, callback) => callback(null));

            const result = await imageRepository.removeImageFromFolder(mockImgUrl);

            expect(fs.unlink).toHaveBeenCalledWith(mockImgPath, expect.any(Function));
            expect(result).toBe(`Image at ${mockImgPath} deleted successfully`);
        });

        it("should handle errors during image deletion", async () => {
            const mockImgUrl = "/uploads/test.jpg";
            const mockImgPath = path.join(__dirname, "..", mockImgUrl);

            fs.unlink.mockImplementation((filePath, callback) => callback(new Error("Deletion error")));

            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            await expect(imageRepository.removeImageFromFolder(mockImgUrl)).rejects.toBe("Error deleting image: Deletion error");

            expect(fs.unlink).toHaveBeenCalledWith(mockImgPath, expect.any(Function));
            expect(consoleErrorSpy).toHaveBeenCalledWith(`Error deleting image at ${mockImgPath}:`, expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });
});

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ImageRepository = require("../models/imageRepository");

jest.mock("fs");
jest.mock("multer");

describe("ImageRepository", () => {
    let imageRepo;

    beforeEach(() => {
        imageRepo = new ImageRepository("postImgUrl");
        jest.clearAllMocks();
    });

    describe("uploadImage", () => {
        test("should configure multer with correct storage settings", () => {
            const mockSingle = jest.fn();
            multer.mockReturnValue({ single: mockSingle });

            const uploadMiddleware = imageRepo.uploadImage();

            expect(multer).toHaveBeenCalledWith({ storage: expect.any(Object) });
            expect(uploadMiddleware).toBe(mockSingle());
        });
    });

    describe("saveImageToFolder", () => {
        test("should return the correct image URL when valid file is provided", () => {
            const mockFile = { path: "/uploads/test.jpg", filename: "test.jpg" };

            const result = imageRepo.saveImageToFolder(mockFile);

            expect(result).toBe("/uploads/test.jpg");
        });

        test("should throw an error when invalid file is provided", () => {
            expect(() => imageRepo.saveImageToFolder(null)).toThrow("Invalid image file");
            expect(() => imageRepo.saveImageToFolder({})).toThrow("Invalid image file");
        });
    });

    describe("removeImageFromFolder", () => {
        test("should resolve when image is successfully deleted", async () => {
            fs.unlink.mockImplementation((filePath, callback) => callback(null));

            const result = await imageRepo.removeImageFromFolder("/uploads/test.jpg");

            expect(fs.unlink).toHaveBeenCalledWith(
                path.join(__dirname, "..", "/uploads/test.jpg"),
                expect.any(Function)
            );
            expect(result).toBe("Image at " + path.join(__dirname, "..", "/uploads/test.jpg") + " deleted successfully");
        });

        test("should reject when there is an error deleting the image", async () => {
            fs.unlink.mockImplementation((filePath, callback) =>
                callback(new Error("File not found"))
            );

            await expect(
                imageRepo.removeImageFromFolder("/uploads/test.jpg")
            ).rejects.toBe("Error deleting image: File not found");

            expect(fs.unlink).toHaveBeenCalledWith(
                path.join(__dirname, "..", "/uploads/test.jpg"),
                expect.any(Function)
            );
        });
    });
});
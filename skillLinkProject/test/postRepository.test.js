const fs = require("fs");
const path = require("path");
const PostRepository = require("../models/postRepository");

jest.mock("fs");

describe("PostRepository", () => {
    let postRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        postRepository = new PostRepository();
    });

    /*
    กรณีที่ Directory ยังไม่มีอยู่:
        ทดสอบว่า alreadyExistence จะสร้าง Directory ใหม่เมื่อไม่มีอยู่ ใช้ fs.existsSync เพื่อจำลองว่า Directory ไม่มีอยู่ และตรวจสอบว่า fs.mkdirSync ถูกเรียก
    กรณีที่ Directory มีอยู่แล้ว:
        ทดสอบว่า alreadyExistence จะไม่สร้าง Directory ใหม่ถ้ามีอยู่แล้ว ตรวจสอบว่า fs.mkdirSync ไม่ถูกเรียก
    */
    describe("alreadyExistence", () => {
        it("should create the directory if it does not exist", () => {
            fs.existsSync.mockReturnValue(false);
            fs.mkdirSync.mockImplementation(() => { });

            postRepository.alreadyExistence();

            expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(postRepository.filePath));
            expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(postRepository.filePath), { recursive: true });
        });

        it("should create the directory if it does not exist", () => {
            fs.existsSync.mockReturnValue(false); // Mock ว่า directory ไม่มีอยู่
            fs.mkdirSync.mockImplementation(() => { }); // Mock การสร้าง directory

            postRepository.alreadyExistence();

            // ตรวจสอบว่า fs.existsSync ถูกเรียก
            expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(postRepository.filePath));

            // ตรวจสอบว่า fs.mkdirSync ถูกเรียก
            expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(postRepository.filePath), { recursive: true });
        });
    });

    /* 
    บันทึกโพสต์ลงไฟล์:
        ทดสอบว่า saveToFile เขียนข้อมูลโพสต์ลงไฟล์ JSON ชั่วคราว (.tmp) และเปลี่ยนชื่อไฟล์เป็นไฟล์จริง
    จัดการข้อผิดพลาดระหว่างการบันทึก:
        จำลองข้อผิดพลาดใน fs.writeFileSync และตรวจสอบว่า console.error ถูกเรียกพร้อมข้อความที่ถูกต้อง
    */
    describe("saveToFile", () => {
        it("should save posts to a file", () => {
            const mockPosts = [{ postTitle: "Test Post", postDesc: "Description" }];
            postRepository.posts.insertLast(mockPosts[0]);

            fs.writeFileSync.mockImplementation(() => { });
            fs.renameSync.mockImplementation(() => { });

            postRepository.saveToFile();

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                `${postRepository.filePath}.tmp`,
                JSON.stringify(mockPosts, null, 2)
            );
            expect(fs.renameSync).toHaveBeenCalledWith(`${postRepository.filePath}.tmp`, postRepository.filePath);
        });

        it("should handle errors during saving", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
            fs.writeFileSync.mockImplementation(() => {
                throw new Error("Write error");
            });

            postRepository.saveToFile();

            expect(consoleErrorSpy).toHaveBeenCalledWith("Error saving posts to file:", "Write error");
        });
    });

    /*
    โหลดโพสต์จากไฟล์:
        ทดสอบว่า loadFromFile โหลดโพสต์จากไฟล์ JSON และเพิ่มลงใน LinkedList อย่างถูกต้อง
    จัดการไฟล์ว่าง:
        ทดสอบว่า loadFromFile จะต้องไม่ล้มเหลวเมื่อไฟล์ว่าง และ LinkedList ยังคงว่าง
    จัดการข้อผิดพลาดระหว่างการโหลด:
        จำลองข้อผิดพลาดใน fs.readFileSync และตรวจสอบว่า console.error ถูกเรียกพร้อมข้อความที่ถูกต้อง
    */
    describe("loadFromFile", () => {
        it("should load posts from a file", () => {
            const mockData = JSON.stringify([{ postTitle: "Test Post", postDesc: "Description" }]);
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(mockData);

            postRepository.loadFromFile();

            expect(fs.readFileSync).toHaveBeenCalledWith(postRepository.filePath, "utf8");
            expect(postRepository.posts.toArray()).toEqual(JSON.parse(mockData));
        });

        it("should handle errors during loading", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockImplementation(() => {
                throw new Error("Read error");
            });

            postRepository.loadFromFile();
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error loading posts from file:", "Read error");
        });
    });

    /*
    อัปเดตโพสต์ที่มีอยู่:
        ทดสอบว่า updatePost อัปเดตคำอธิบาย (postDesc) หรือ URL รูปภาพ (postImgUrl) ของโพสต์ที่มีอยู่
    จัดการโพสต์ที่ไม่มีอยู่:
        ทดสอบว่า updatePost คืนค่าข้อผิดพลาดเมื่อไม่พบโพสต์ที่ต้องการอัปเดต
    จัดการข้อผิดพลาดระหว่างการอัปเดต:
        จำลองข้อผิดพลาดใน saveToFile และตรวจสอบว่า console.error ถูกเรียกพร้อมข้อความที่ถูกต้อง
    */
    describe("updatePost", () => {
        it("should update an existing post", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Old Description" };
            postRepository.posts.insertLast(mockPost);

            const updatedData = { postDesc: "New Description" };
            const result = postRepository.updatePost("Test Post", updatedData);

            expect(result.success).toBe(true);
            expect(result.updatedPost.postDesc).toBe("New Description");
        });

        it("should return an error if the post does not exist", () => {
            const result = postRepository.updatePost("Nonexistent Post", { postDesc: "New Description" });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Post with title "Nonexistent Post" not found.');
        });
    });

    describe("updatePost", () => {
        it("should update an existing post's description", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Old Description", postImgUrl: "old-url.jpg" };
            postRepository.posts.insertLast(mockPost);

            const updatedData = { postDesc: "New Description" };
            const result = postRepository.updatePost("Test Post", updatedData);

            expect(result.success).toBe(true);
            expect(result.updatedPost.postDesc).toBe("New Description");
            expect(result.updatedPost.postImgUrl).toBe("old-url.jpg"); // Ensure other properties are unchanged
        });

        it("should update an existing post's image URL", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Old Description", postImgUrl: "old-url.jpg" };
            postRepository.posts.insertLast(mockPost);

            const updatedData = { postImgUrl: "new-url.jpg" };
            const result = postRepository.updatePost("Test Post", updatedData);

            expect(result.success).toBe(true);
            expect(result.updatedPost.postImgUrl).toBe("new-url.jpg"); // Ensure the image URL is updated
            expect(result.updatedPost.postDesc).toBe("Old Description"); // Ensure other properties are unchanged
        });

        it("should update both description and image URL", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Old Description", postImgUrl: "old-url.jpg" };
            postRepository.posts.insertLast(mockPost);

            const updatedData = { postDesc: "New Description", postImgUrl: "new-url.jpg" };
            const result = postRepository.updatePost("Test Post", updatedData);

            expect(result.success).toBe(true);
            expect(result.updatedPost.postDesc).toBe("New Description");
            expect(result.updatedPost.postImgUrl).toBe("new-url.jpg");
        });

        it("should return an error if the post does not exist", () => {
            const result = postRepository.updatePost("Nonexistent Post", { postDesc: "New Description" });

            expect(result.success).toBe(false);
            expect(result.message).toBe('Post with title "Nonexistent Post" not found.');
        });
    });

    describe("updatePost", () => {
        it("should log an error and return failure if an exception occurs", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Old Description" };
            postRepository.posts.insertLast(mockPost);

            // Mock saveToFile to throw an error
            jest.spyOn(postRepository, "saveToFile").mockImplementation(() => {
                throw new Error("Mock saveToFile error");
            });

            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            const result = postRepository.updatePost("Test Post", { postDesc: "New Description" });

            expect(consoleErrorSpy).toHaveBeenCalledWith("Error updating post:", "Mock saveToFile error");
            expect(result.success).toBe(false);
            expect(result.message).toBe("Failed to update post.");
        });
    });

    /*
    ค้นหาโพสต์ตามชื่อ:
        ทดสอบว่า retrieveByPostTitle คืนค่าโพสต์ที่ตรงกับชื่อที่ระบุ
    จัดการชื่อที่ไม่พบ:
        ทดสอบว่า retrieveByPostTitle คืนค่า null เมื่อไม่พบโพสต์ที่ตรงกับชื่อ
    ข้ามโหนดที่ไม่ถูกต้อง:
        ทดสอบว่า retrieveByPostTitle ข้ามโหนดที่มีค่า null หรือ undefined
    */
    describe("retrieveByPostTitle", () => {
        it("should retrieve a post by its title", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Description" };
            postRepository.posts.insertLast(mockPost);

            const result = postRepository.retrieveByPostTitle("Test Post");

            expect(result.value).toEqual(mockPost);
        });

        it("should return null if the post is not found", () => {
            const result = postRepository.retrieveByPostTitle("Nonexistent Post");

            expect(result).toBeNull();
        });
    });

    /*
    เพิ่มโพสต์ใหม่:
        ทดสอบว่า insertPosts เพิ่มโพสต์ใหม่ลงใน LinkedList ถ้าโพสต์นั้นยังไม่มีอยู่
    จัดการโพสต์ที่ซ้ำกัน:
        ทดสอบว่า insertPosts ไม่เพิ่มโพสต์ที่มีชื่อซ้ำ และตรวจสอบว่า console.error ถูกเรียกพร้อมข้อความที่ถูกต้อง
    */
    describe("insertPosts", () => {
        it("should insert a new post if it does not already exist", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Description" };

            postRepository.insertPosts(mockPost);

            expect(postRepository.posts.toArray()).toContainEqual(mockPost);
        });

        it("should not insert a post if it already exists", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Description" };
            postRepository.posts.insertLast(mockPost);

            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            postRepository.insertPosts(mockPost);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Post with name "Test Post" already exists.');
        });
    });

    describe("insertPosts", () => {
        it("should log an error if a post with the same title already exists", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Description" };
            postRepository.posts.insertLast(mockPost); // Insert the post into the LinkedList

            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            postRepository.insertPosts(mockPost); // Attempt to insert the same post again

            expect(consoleErrorSpy).toHaveBeenCalledWith(`Post with name "Test Post" already exists.`);
            expect(postRepository.posts.toArray()).toHaveLength(1); // Ensure no duplicate posts are added

            consoleErrorSpy.mockRestore(); // Restore the original console.error
        });

        it("should insert a new post if it does not already exist", () => {
            const mockPost = { postTitle: "Unique Post", postDesc: "Description" };

            postRepository.insertPosts(mockPost);

            expect(postRepository.posts.toArray()).toContainEqual(mockPost); // Ensure the post is added
        });
    });

    /*
    ลบโพสต์ตามชื่อ:
        ทดสอบว่า removePosts ลบโพสต์ที่ตรงกับชื่อที่ระบุ
    จัดการกรณีไม่มีโพสต์:
        ทดสอบว่า removePosts แสดงข้อความว่าไม่มีโพสต์ให้ลบเมื่อ LinkedList ยังคงว่าง
    */
    describe("removePosts", () => {
        it("should remove a post by its title", () => {
            const mockPost = { postTitle: "Test Post", postDesc: "Description" };
            postRepository.posts.insertLast(mockPost);

            postRepository.removePosts("Test Post");

            expect(postRepository.posts.toArray()).not.toContainEqual(mockPost);
        });

        it("should log a message if no posts are available to remove", () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });

            postRepository.removePosts("Test Post");

            expect(consoleLogSpy).toHaveBeenCalledWith("No posts available to remove.");
        });
    });

    /*
    ลบโพสต์แรก:
        ทดสอบว่า removeFirst ลบโพสต์แรกใน LinkedList และคืนค่าข้อความสำเร็จ
    จัดการกรณีไม่มีโพสต์:
        ทดสอบว่า removeFirst แสดงข้อความว่าไม่มีโพสต์ให้ลบเมื่อ LinkedList ยังคงว่าง
    */
    describe("removeFirst", () => {
        it("should remove the first post", () => {
            const mockPosts = [
                { postTitle: "First Post", postDesc: "Description 1" },
                { postTitle: "Second Post", postDesc: "Description 2" },
            ];
            mockPosts.forEach((post) => postRepository.posts.insertLast(post));

            const result = postRepository.removeFirst();

            expect(result.success).toBe(true);
            expect(result.message).toBe('First post "First Post" has been deleted successfully!');
            expect(postRepository.posts.toArray()).not.toContainEqual(mockPosts[0]);
        });
    });

    describe("removeFirst", () => {
        it("should log a message and return failure if no posts are available to remove", () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });

            const result = postRepository.removeFirst();

            expect(consoleLogSpy).toHaveBeenCalledWith("No posts available to remove.");
            expect(result).toEqual({ success: false, message: "No posts available." });

            consoleLogSpy.mockRestore(); // Restore the original console.log
        });
    });

    /*
    ลบโพสต์สุดท้าย:
        ทดสอบว่า removeLast ลบโพสต์สุดท้ายใน LinkedList และคืนค่าข้อความสำเร็จ
    จัดการกรณีไม่มีโพสต์:
        ทดสอบว่า removeLast แสดงข้อความว่าไม่มีโพสต์ให้ลบเมื่อ LinkedList ว่างเปล่า
    */
    describe("removeLast", () => {
        it("should remove the last post", () => {
            const mockPosts = [
                { postTitle: "First Post", postDesc: "Description 1" },
                { postTitle: "Second Post", postDesc: "Description 2" },
            ];
            mockPosts.forEach((post) => postRepository.posts.insertLast(post));

            const result = postRepository.removeLast();

            expect(result.success).toBe(true);
            expect(result.message).toBe('Last post "Second Post" has been deleted successfully!');
            expect(postRepository.posts.toArray()).not.toContainEqual(mockPosts[1]);
        });
    });

    describe("removeLast", () => {
        it("should log a message and return failure if no posts are available to remove", () => {
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });

            const result = postRepository.removeLast();

            expect(consoleLogSpy).toHaveBeenCalledWith("No posts available to remove.");
            expect(result).toEqual({ success: false, message: "No posts available." });

            consoleLogSpy.mockRestore(); // Restore the original console.log
        });
    });
});
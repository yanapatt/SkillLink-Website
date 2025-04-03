const PostService = require("../models/postService");

describe("PostService", () => {
    let postRepoMock, accountRepoMock, imgRepoMock, postService;

    beforeEach(() => {
        postRepoMock = {
            retrievePostByTitle: jest.fn(),
            retrieveAllPosts: jest.fn(),
            insertPosts: jest.fn(),
            updatePost: jest.fn(),
            removePosts: jest.fn(),
            removeFirst: jest.fn(),
            removeLast: jest.fn(),
            posts: {
                isEmpty: jest.fn(),
                head: { value: null },
                tail: { value: null },
            }
        };

        accountRepoMock = {
            retrieveAccountById: jest.fn(),
            retrieveAllAccounts: jest.fn(),
            retrieveAccountByUsername: jest.fn(),
        };

        imgRepoMock = {
            removeImageFromFolder: jest.fn(),
            saveImageToFolder: jest.fn(),
        };

        postService = new PostService(postRepoMock, accountRepoMock, imgRepoMock);
    });

    describe("formatPostDoc", () => {
        //ตรวจสอบการจัดรูปแบบข้อมูลโพสต์เมื่อมีข้อมูลครบทุกฟิลด์
        it("should format post data correctly with all fields provided", () => {
            const postData = {
                postTitle: "Test Post",
                postDesc: "Description",
                postRating: 4.5,
                ratingsCount: [{ accountId: "123", rating: 4.5 }],
            };
            const accountId = "123";
            const imageUrl = "http://example.com/image.jpg";

            const result = postService.formatPostDoc(postData, accountId, imageUrl);

            expect(result).toEqual({
                postTitle: "Test Post",
                accountId: "123",
                postDesc: "Description",
                postRating: 4.5,
                postImgUrl: "http://example.com/image.jpg",
                ratingsCount: [{ accountId: "123", rating: 4.5 }],
            });
        });

        //ตรวจสอบการจัดรูปแบบข้อมูลโพสต์เมื่อไม่มีฟิลด์บางส่วน
        it("should use default values if optional fields are missing", () => {
            const postData = { postTitle: "Test Post", postDesc: "Description" };
            const accountId = "123";

            const result = postService.formatPostDoc(postData, accountId);

            expect(result).toEqual({
                postTitle: "Test Post",
                accountId: "123",
                postDesc: "Description",
                postRating: 0,
                postImgUrl: null,
                ratingsCount: [],
            });
        });
    });

    describe("createPost", () => {
        //ตรวจสอบการสร้างโพสต์พร้อมภาพ
        it("should create a post with an image", async () => {
            const postData = { postTitle: "Test Post", postDesc: "Description" };
            const accountId = "123";
            const imgFile = "image.jpg";

            imgRepoMock.saveImageToFolder.mockResolvedValue("http://example.com/image.jpg");

            const result = await postService.createPost(postData, accountId, imgFile);

            expect(imgRepoMock.saveImageToFolder).toHaveBeenCalledWith(imgFile);
            expect(postRepoMock.insertPosts).toHaveBeenCalledWith({
                postTitle: "Test Post",
                accountId: "123",
                postDesc: "Description",
                postRating: 0,
                postImgUrl: "http://example.com/image.jpg",
                ratingsCount: [],
            });
            expect(result.postImgUrl).toBe("http://example.com/image.jpg");
        });

        //ตรวจสอบการสร้างโพสต์โดยไม่มีภาพ
        it("should create a post without an image", async () => {
            const postData = { postTitle: "Test Post", postDesc: "Description" };
            const accountId = "123";

            const result = await postService.createPost(postData, accountId, null);

            expect(imgRepoMock.saveImageToFolder).not.toHaveBeenCalled();
            expect(postRepoMock.insertPosts).toHaveBeenCalledWith({
                postTitle: "Test Post",
                accountId: "123",
                postDesc: "Description",
                postRating: 0,
                postImgUrl: null,
                ratingsCount: [],
            });
            expect(result.postImgUrl).toBeNull();
        });

        //ตรวจสอบการจัดการข้อผิดพลาดระหว่างการสร้างโพสต์
        it("should handle errors during post creation", async () => {
            const postData = { postTitle: "Test Post", postDesc: "Description" };
            const accountId = "123";

            postRepoMock.insertPosts.mockImplementation(() => {
                throw new Error("Insert error");
            });

            await expect(postService.createPost(postData, accountId, null)).rejects.toThrow(
                "Failed to create post: Insert error"
            );
        });
    });

    describe("ratePost", () => {
        //ตรวจสอบการให้คะแนนโพสต์จากผู้ใช้ที่มีอยู่
        it("should update the rating for an existing user", async () => {
            const postTitle = "Test Post";
            const accountId = "123";
            const newRating = 5;

            const posts = [
                {
                    postTitle: "Test Post",
                    postRating: 4,
                    ratingsCount: [{ accountId: "123", rating: 4 }],
                },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = await postService.ratePost(postTitle, accountId, newRating);

            expect(postRepoMock.updatePost).toHaveBeenCalledWith(postTitle, {
                postRating: 5,
                ratingsCount: [{ accountId: "123", rating: 5 }],
            });
            expect(result).toEqual({
                success: true,
                message: `Post "${postTitle}" rating updated successfully!`,
                updatedPost: posts[0],
            });
        });

        //ตรวจสอบการให้คะแนนโพสต์จากผู้ใช้ใหม่
        it("should add a new rating for a new user", async () => {
            const postTitle = "Test Post";
            const accountId = "456";
            const newRating = 4;

            const posts = [
                {
                    postTitle: "Test Post",
                    postRating: 4,
                    ratingsCount: [{ accountId: "123", rating: 4 }],
                },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = await postService.ratePost(postTitle, accountId, newRating);

            expect(postRepoMock.updatePost).toHaveBeenCalledWith(postTitle, {
                postRating: 4,
                ratingsCount: [
                    { accountId: "123", rating: 4 },
                    { accountId: "456", rating: 4 },
                ],
            });
            expect(result).toEqual({
                success: true,
                message: `Post "${postTitle}" rating updated successfully!`,
                updatedPost: posts[0],
            });
        });

        //ตรวจสอบการให้คะแนนโพสต์ที่ไม่มีอยู่ในระบบ
        it("should return an error if the post is not found", async () => {
            const postTitle = "Nonexistent Post";
            const accountId = "123";
            const newRating = 5;

            postRepoMock.retrieveAllPosts.mockReturnValue([]);

            const result = await postService.ratePost(postTitle, accountId, newRating);

            expect(result).toEqual({
                success: false,
                message: "Post not found",
            });
        });

        //ตรวจสอบการให้คะแนนโพสต์ที่มีคะแนนเป็นค่าลบ
        it("should handle errors during the update process", async () => {
            const postTitle = "Test Post";
            const accountId = "123";
            const newRating = 5;

            const posts = [
                {
                    postTitle: "Test Post",
                    postRating: 4,
                    ratingsCount: [{ accountId: "123", rating: 4 }],
                },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);
            postRepoMock.updatePost.mockImplementation(() => {
                throw new Error("Update error");
            });

            const result = await postService.ratePost(postTitle, accountId, newRating);

            expect(result).toEqual({
                success: false,
                message: "Failed to update rating",
            });
        });
    });

    describe("sortPostsByRating", () => {
        //ตรวจสอบการเรียงโพสต์ตามคะแนนในลำดับที่ถูกต้อง
        it("should sort posts by rating in descending order", () => {
            const posts = [
                { postTitle: "Post A", postRating: 3 },
                { postTitle: "Post B", postRating: 5 },
                { postTitle: "Post C", postRating: 4 },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.sortPostsByRating();

            expect(result).toEqual([
                { postTitle: "Post B", postRating: 5 },
                { postTitle: "Post C", postRating: 4 },
                { postTitle: "Post A", postRating: 3 },
            ]);
        });

        //ตรวจสอบกรณีไม่มีโพสต์ในระบบ
        it("should return an empty array if there are no posts", () => {
            postRepoMock.retrieveAllPosts.mockReturnValue([]);

            const result = postService.sortPostsByRating();

            expect(result).toEqual([]);
        });

        //ตรวจสอบการจัดการโพสต์ที่มีคะแนนเท่ากัน
        it("should handle posts with the same rating", () => {
            const posts = [
                { postTitle: "Post A", postRating: 4 },
                { postTitle: "Post B", postRating: 4 },
                { postTitle: "Post C", postRating: 5 },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.sortPostsByRating();

            expect(result).toEqual([
                { postTitle: "Post C", postRating: 5 },
                { postTitle: "Post A", postRating: 4 },
                { postTitle: "Post B", postRating: 4 },
            ]);
        });
    });

    describe("calculateAverageRating", () => {
        //ตรวจสอบการคำนวณค่าเฉลี่ยของคะแนน
        it("should calculate the average rating correctly", () => {
            const ratingsArray = [
                { accountId: "123", rating: 4 },
                { accountId: "456", rating: 5 },
            ];

            const result = postService.calculateAverageRating(ratingsArray);

            expect(result).toBe(4.5);
        });

        //ตรวจสอบการคำนวณค่าเฉลี่ยเมื่อมีคะแนนเป็นศูนย์
        it("should return 0 if there are no ratings", () => {
            const ratingsArray = [];

            const result = postService.calculateAverageRating(ratingsArray);

            expect(result).toBe(0);
        });

        //ตรวจสอบการคำนวณค่าเฉลี่ยเมื่อมีคะแนนเป็นค่าลบ
        it("should handle a single rating", () => {
            const ratingsArray = [{ accountId: "123", rating: 5 }];

            const result = postService.calculateAverageRating(ratingsArray);

            expect(result).toBe(5);
        });
    });

    describe("searchPosts", () => {
        //ค้นหาโพสต์ตามชื่อ
        it("should find posts by title", () => {
            const posts = [
                { postTitle: "Test Post 1", postDesc: "Description 1" },
                { postTitle: "Another Post", postDesc: "Description 2" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.searchPosts({ searchType: "title", searchValue: "Test" });

            expect(result).toEqual([{ postTitle: "Test Post 1", postDesc: "Description 1" }]);
        });

        //ค้นหาโพสต์ตามผู้เขียน
        it("should find posts by author", () => {
            const account = { accId: "123", accUsername: "testuser" };
            const posts = [
                { postTitle: "Post 1", accountId: "123" },
                { postTitle: "Post 2", accountId: "456" },
            ];
            accountRepoMock.retrieveAccountByUsername.mockReturnValue(account);
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.searchPosts({ searchType: "author", searchValue: "testuser" });

            expect(result).toEqual([{ postTitle: "Post 1", accountId: "123" }]);
        });

        //ค้นหาโพสต์ที่ไม่มีชื่อที่ตรงกัน
        it("should return an empty array if no posts match the title", () => {
            const posts = [
                { postTitle: "Test Post 1", postDesc: "Description 1" },
                { postTitle: "Another Post", postDesc: "Description 2" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.searchPosts({ searchType: "title", searchValue: "Nonexistent" });

            expect(result).toEqual([]);
        });

        //ค้นหาโพสต์ที่ไม่มีผู้เขียนที่ตรงกัน
        it("should return an empty array if no posts match the author", () => {
            const account = { accId: "123", accUsername: "testuser" };
            const posts = [
                { postTitle: "Post 1", accountId: "456" },
                { postTitle: "Post 2", accountId: "789" },
            ];
            accountRepoMock.retrieveAccountByUsername.mockReturnValue(account);
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.searchPosts({ searchType: "author", searchValue: "testuser" });

            expect(result).toEqual([]);
        });

        //ตรวจสอบกรณีไม่พบผู้เขียนในระบบ
        it("should log an error if the account is not found", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
            accountRepoMock.retrieveAccountByUsername.mockReturnValue(null);

            const result = postService.searchPosts({ searchType: "author", searchValue: "unknownuser" });

            expect(consoleErrorSpy).toHaveBeenCalledWith("Account not found for username: unknownuser");
            expect(result).toEqual([]);
        });

        //ตรวจสอบกรณีประเภทการค้นหาไม่ถูกต้อง
        it("should log an error for an invalid search type", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            const result = postService.searchPosts({ searchType: "invalid", searchValue: "Test" });

            expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid search type");
            expect(result).toEqual([]);
        });
    });

    describe("getTopRatedPosts", () => {
        //ตรวจสอบการดึงโพสต์ที่มีคะแนนสูงสุด 5 โพสต์
        it("should return the top 5 posts by rating", () => {
            const posts = [
                { postTitle: "Post A", postRating: 3 },
                { postTitle: "Post B", postRating: 5 },
                { postTitle: "Post C", postRating: 4 },
                { postTitle: "Post D", postRating: 2 },
                { postTitle: "Post E", postRating: 1 },
                { postTitle: "Post F", postRating: 0 },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.getTopRatedPosts();

            expect(result).toEqual([
                { postTitle: "Post B", postRating: 5 },
                { postTitle: "Post C", postRating: 4 },
                { postTitle: "Post A", postRating: 3 },
                { postTitle: "Post D", postRating: 2 },
                { postTitle: "Post E", postRating: 1 },
            ]);
        });

        //คืนโพสต์ทั้งหมดหากมีน้อยกว่า 5 โพสต์
        it("should return all posts if there are less than 5 posts", () => {
            const posts = [
                { postTitle: "Post A", postRating: 3 },
                { postTitle: "Post B", postRating: 5 },
                { postTitle: "Post C", postRating: 4 },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.getTopRatedPosts();

            expect(result).toEqual([
                { postTitle: "Post B", postRating: 5 },
                { postTitle: "Post C", postRating: 4 },
                { postTitle: "Post A", postRating: 3 },
            ]);
        });

        //ตรวจสอบกรณีไม่มีโพสต์ในระบบ
        it("should return an empty array if there are no posts", () => {
            postRepoMock.retrieveAllPosts.mockReturnValue([]);

            const result = postService.getTopRatedPosts();

            expect(result).toEqual([]);
        });

        //ตรวจสอบกรณีโพสต์ที่มีคะแนนเท่ากัน
        it("should handle posts with the same rating", () => {
            const posts = [
                { postTitle: "Post A", postRating: 4 },
                { postTitle: "Post B", postRating: 4 },
                { postTitle: "Post C", postRating: 5 },
                { postTitle: "Post D", postRating: 3 },
                { postTitle: "Post E", postRating: 2 },
                { postTitle: "Post F", postRating: 1 },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.getTopRatedPosts();

            expect(result).toEqual([
                { postTitle: "Post C", postRating: 5 },
                { postTitle: "Post A", postRating: 4 },
                { postTitle: "Post B", postRating: 4 },
                { postTitle: "Post D", postRating: 3 },
                { postTitle: "Post E", postRating: 2 },
            ]);
        });
    });

    describe("getMyPosts", () => {
        //ตรวจสอบการดึงโพสต์ตาม ID ของผู้ใช้
        it("should return posts for the given account ID", () => {
            const posts = [
                { postTitle: "Post A", accountId: "123" },
                { postTitle: "Post B", accountId: "456" },
                { postTitle: "Post C", accountId: "123" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.getMyPosts("123");

            expect(result).toEqual([
                { postTitle: "Post A", accountId: "123" },
                { postTitle: "Post C", accountId: "123" },
            ]);
        });

        //ตรวจสอบกรณีไม่มีโพสต์ที่ตรงกับ ID ของผู้ใช้
        it("should return an empty array if no posts match the account ID", () => {
            const posts = [
                { postTitle: "Post A", accountId: "456" },
                { postTitle: "Post B", accountId: "789" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.getMyPosts("123");

            expect(result).toEqual([]);
        });

        //ตรวจสอบกรณีไม่มีการส่ง accountId
        it("should log an error and return an empty array if account ID is not provided", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            const result = postService.getMyPosts(null);

            expect(consoleErrorSpy).toHaveBeenCalledWith("Account ID is required for getting my posts.");
            expect(result).toEqual([]);
        });
    });

    describe("getPostByTitle", () => {
        //คืนโพสต์ที่ตรงกับชื่อ
        it("should return the post with the given title", () => {
            const posts = [
                { postTitle: "Post A", postDesc: "Description A" },
                { postTitle: "Post B", postDesc: "Description B" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.getPostByTitle("Post A");

            expect(result).toEqual({ postTitle: "Post A", postDesc: "Description A" });
        });

        //ตรวจสอบกรณีไม่มีโพสต์ที่ตรงกับชื่อ
        it("should return an error message if the post is not found", () => {
            const posts = [
                { postTitle: "Post A", postDesc: "Description A" },
                { postTitle: "Post B", postDesc: "Description B" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.getPostByTitle("Nonexistent Post");

            expect(result).toEqual({ success: false, message: "Post not found" });
        });
    });

    describe("getAllPosts", () => {
        //คืนโพสต์ทั้งหมดในระบบ
        it("should return all posts", () => {
            const posts = [
                { postTitle: "Post A", postDesc: "Description A" },
                { postTitle: "Post B", postDesc: "Description B" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.getAllPosts();

            expect(result).toEqual(posts);
        });

        //ตรวจสอบกรณีไม่มีโพสต์ในระบบ
        it("should return an empty array if there are no posts", () => {
            postRepoMock.retrieveAllPosts.mockReturnValue([]);

            const result = postService.getAllPosts();

            expect(result).toEqual([]);
        });
    });

    describe("updatePost", () => {
        //อัปเดตคำอธิบายโพสต์
        it("should update the post description", async () => {
            const posts = [
                { postTitle: "Test Post", postDesc: "Old Description", postImgUrl: "http://example.com/image.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const updatedData = { postDesc: "New Description" };

            const result = await postService.updatePost("Test Post", updatedData, null);

            expect(postRepoMock.updatePost).toHaveBeenCalledWith("Test Post", {
                postDesc: "New Description",
                postImgUrl: "http://example.com/image.jpg",
            });
            expect(result.success).toBe(true);
            expect(result.message).toBe('Post "Test Post" updated successfully!');
        });

        //ลบภาพประกอบของโพสต์
        it("should remove the image if deleteImage is true", async () => {
            const posts = [
                { postTitle: "Test Post", postDesc: "Description", postImgUrl: "http://example.com/image.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const updatedData = { deleteImage: true };

            const result = await postService.updatePost("Test Post", updatedData, null);

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/image.jpg");
            expect(postRepoMock.updatePost).toHaveBeenCalledWith("Test Post", {
                postDesc: "Description",
                postImgUrl: "",
            });
            expect(result.success).toBe(true);
        });

        //อัปโหลดภาพใหม่
        it("should upload a new image if provided", async () => {
            const posts = [
                { postTitle: "Test Post", postDesc: "Description", postImgUrl: "http://example.com/image.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            imgRepoMock.saveImageToFolder.mockResolvedValue("http://example.com/new-image.jpg");

            const result = await postService.updatePost("Test Post", {}, "new-image.jpg");

            expect(imgRepoMock.saveImageToFolder).toHaveBeenCalledWith("new-image.jpg");
            expect(postRepoMock.updatePost).toHaveBeenCalledWith("Test Post", {
                postDesc: "Description",
                postImgUrl: "http://example.com/new-image.jpg",
            });
            expect(result.success).toBe(true);
        });

        //จัดการข้อผิดพลาดระหว่างการลบภาพ
        it("should handle errors when removing the old image", async () => {
            const posts = [
                { postTitle: "Test Post", postDesc: "Description", postImgUrl: "http://example.com/image.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            imgRepoMock.removeImageFromFolder.mockImplementation(() => {
                throw new Error("Remove error");
            });

            const updatedData = { deleteImage: true };

            const result = await postService.updatePost("Test Post", updatedData, null);

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/image.jpg");
            expect(postRepoMock.updatePost).toHaveBeenCalledWith("Test Post", {
                postDesc: "Description",
                postImgUrl: "",
            });
            expect(result.success).toBe(true); // แม้จะมี error ในการลบภาพ แต่การอัปเดตโพสต์ยังสำเร็จ
        });

        //จัดการข้อผิดพลาดระหว่างการอัปโหลดภาพ
        it("should handle errors when uploading a new image", async () => {
            const posts = [
                { postTitle: "Test Post", postDesc: "Description", postImgUrl: "http://example.com/image.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            imgRepoMock.saveImageToFolder.mockImplementation(() => {
                throw new Error("Upload error");
            });

            const result = await postService.updatePost("Test Post", {}, "new-image.jpg");

            expect(imgRepoMock.saveImageToFolder).toHaveBeenCalledWith("new-image.jpg");
            expect(postRepoMock.updatePost).toHaveBeenCalledWith("Test Post", {
                postDesc: "Description",
                postImgUrl: "http://example.com/image.jpg", // URL รูปภาพเดิมยังคงอยู่
            });
            expect(result.success).toBe(true); // แม้จะมี error ในการอัปโหลดภาพ แต่การอัปเดตโพสต์ยังสำเร็จ
        });

        //ตรวจสอบกรณีไม่พบโพสต์
        it("should return an error if the post is not found", async () => {
            postRepoMock.retrieveAllPosts.mockReturnValue([]);

            const result = await postService.updatePost("Nonexistent Post", {}, null);

            expect(result.success).toBe(false);
            expect(result.message).toBe("Post not found");
        });

        //จัดการข้อผิดพลาดระหว่างการอัปเดตโพสต์
        it("should handle errors during the update process", async () => {
            const posts = [
                { postTitle: "Test Post", postDesc: "Description", postImgUrl: "http://example.com/image.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            postRepoMock.updatePost.mockImplementation(() => {
                throw new Error("Update error");
            });

            const result = await postService.updatePost("Test Post", {}, null);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Failed to update post "Test Post".');
        });
    });

    describe("removePostsByRating", () => {
        //ลบโพสต์ที่มีคะแนนน้อยกว่าหรือเท่ากับค่าที่กำหนด
        it("should remove posts with rating less than or equal to the given value", async () => {
            const posts = [
                { postTitle: "Post A", postRating: 3, postImgUrl: "http://example.com/imageA.jpg" },
                { postTitle: "Post B", postRating: 5, postImgUrl: "http://example.com/imageB.jpg" },
                { postTitle: "Post C", postRating: 2, postImgUrl: "http://example.com/imageC.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = await postService.removePostsByRating(3);

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageC.jpg");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post C");
            expect(postRepoMock.removePosts).not.toHaveBeenCalledWith("Post B");
            expect(result).toEqual({
                success: true,
                message: "Deleted 2 post(s) with rating <= 3.",
            });
        });

        //ตรวจสอบกรณีไม่มีโพสต์ที่ตรงกับเงื่อนไข
        it("should return an error if no posts match the rating criteria", async () => {
            const posts = [
                { postTitle: "Post A", postRating: 5 },
                { postTitle: "Post B", postRating: 6 },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = await postService.removePostsByRating(3);

            expect(imgRepoMock.removeImageFromFolder).not.toHaveBeenCalled();
            expect(postRepoMock.removePosts).not.toHaveBeenCalled();
            expect(result).toEqual({
                success: false,
                message: "No posts found with rating <= 3",
            });
        });

        //ตรวจสอบกรณีค่าคะแนนไม่ถูกต้อง
        it("should return an error if the rating value is invalid", async () => {
            const result = await postService.removePostsByRating("invalid");

            expect(imgRepoMock.removeImageFromFolder).not.toHaveBeenCalled();
            expect(postRepoMock.removePosts).not.toHaveBeenCalled();
            expect(result).toEqual({
                success: false,
                message: "Invalid rating value.",
            });
        });

        //จัดการข้อผิดพลาดระหว่างการลบโพสต์
        it("should handle errors during post deletion", async () => {
            const posts = [
                { postTitle: "Post A", postRating: 3, postImgUrl: "http://example.com/imageA.jpg" },
                { postTitle: "Post B", postRating: 2, postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            postRepoMock.removePosts.mockImplementationOnce(() => {
                throw new Error("Deletion error");
            });

            const result = await postService.removePostsByRating(3);

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageB.jpg");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post B");
            expect(result).toEqual({
                success: true,
                message: "Deleted 2 post(s) with rating <= 3.",
            });
        });

        //จัดการข้อผิดพลาดระหว่างการลบภาพ
        it("should handle unexpected errors gracefully", async () => {
            postRepoMock.retrieveAllPosts.mockImplementation(() => {
                throw new Error("Unexpected error");
            });

            const result = await postService.removePostsByRating(3);

            expect(result).toEqual({
                success: false,
                message: "Failed to delete posts by rating.",
            });
        });

        //ตรวจสอบการจัดการข้อผิดพลาดระหว่างการลบภาพ
        it("should handle errors during image deletion gracefully", async () => {
            const posts = [
                { postTitle: "Post A", postRating: 3, postImgUrl: "http://example.com/imageA.jpg" },
                { postTitle: "Post B", postRating: 2, postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            // Mock ให้เกิดข้อผิดพลาดเมื่อพยายามลบภาพ
            imgRepoMock.removeImageFromFolder.mockImplementationOnce(() => {
                throw new Error("Image deletion error");
            });

            const result = await postService.removePostsByRating(3);

            // ตรวจสอบว่าฟังก์ชันยังคงพยายามลบโพสต์อื่น ๆ แม้จะเกิดข้อผิดพลาด
            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageB.jpg");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post B");

            // ตรวจสอบว่าผลลัพธ์ยังคงแสดงความสำเร็จ
            expect(result).toEqual({
                success: true,
                message: "Deleted 2 post(s) with rating <= 3.",
            });
        });

        it("should log an error if deleting an image fails", async () => {
            const posts = [
                { postTitle: "Post A", postRating: 3, postImgUrl: "http://example.com/imageA.jpg" },
                { postTitle: "Post B", postRating: 2, postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);
        
            // Mock ให้เกิดข้อผิดพลาดเมื่อพยายามลบภาพ
            imgRepoMock.removeImageFromFolder.mockImplementationOnce(() => {
                throw new Error("Image deletion error");
            });
        
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        
            const result = await postService.removePostsByRating(3);
        
            // ตรวจสอบว่า console.error ถูกเรียก
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                `Error deleting image for post "Post A":`,
                "Image deletion error"
            );
        
            // ตรวจสอบว่าภาพอื่นยังถูกลบสำเร็จ
            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageB.jpg");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post B");
        
            // ตรวจสอบผลลัพธ์
            expect(result).toEqual({
                success: true,
                message: "Deleted 2 post(s) with rating <= 3.",
            });
        
            consoleErrorSpy.mockRestore();
        });
    });

    describe("removePostByTitle", () => {
        //ลบโพสต์พร้อมภาพประกอบ
        it("should remove a post by title and delete its image", () => {
            const posts = [
                { postTitle: "Post A", postImgUrl: "http://example.com/imageA.jpg" },
                { postTitle: "Post B", postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.removePostByTitle("Post A");

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(result).toEqual({
                success: true,
                message: 'Post "Post A" deleted successfully!',
            });
        });

        //ลบโพสต์โดยไม่มีภาพประกอบ
        it("should remove a post by title without an image", () => {
            const posts = [
                { postTitle: "Post A", postImgUrl: null },
                { postTitle: "Post B", postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.removePostByTitle("Post A");

            expect(imgRepoMock.removeImageFromFolder).not.toHaveBeenCalled();
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(result).toEqual({
                success: true,
                message: 'Post "Post A" deleted successfully!',
            });
        });

        //ตรวจสอบกรณีไม่พบโพสต์
        it("should return an error if the post is not found", () => {
            const posts = [
                { postTitle: "Post B", postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = postService.removePostByTitle("Nonexistent Post");

            expect(imgRepoMock.removeImageFromFolder).not.toHaveBeenCalled();
            expect(postRepoMock.removePosts).not.toHaveBeenCalled();
            expect(result).toEqual({
                success: false,
                message: "Post not found",
            });
        });

        //จัดการข้อผิดพลาดระหว่างการลบภาพ
        it("should handle errors during image deletion", () => {
            const posts = [
                { postTitle: "Post A", postImgUrl: "http://example.com/imageA.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            imgRepoMock.removeImageFromFolder.mockImplementation(() => {
                throw new Error("Image deletion error");
            });

            const result = postService.removePostByTitle("Post A");

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(result).toEqual({
                success: true,
                message: 'Post "Post A" deleted successfully!',
            });
        });

        //จัดการข้อผิดพลาดระหว่างการลบโพสต์
        it("should handle errors during post deletion", () => {
            const posts = [
                { postTitle: "Post A", postImgUrl: "http://example.com/imageA.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            postRepoMock.removePosts.mockImplementation(() => {
                throw new Error("Post deletion error");
            });

            const result = postService.removePostByTitle("Post A");

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(result).toEqual({
                success: false,
                message: 'Failed to delete post "Post A".',
            });
        });
    });

    describe("removeMultiplePosts", () => {
        //ลบโพสต์หลายรายการสำเร็จ
        it("should remove multiple posts successfully", async () => {
            const posts = [
                { postTitle: "Post A", postImgUrl: "http://example.com/imageA.jpg" },
                { postTitle: "Post B", postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            const result = await postService.removeMultiplePosts(["Post A", "Post B"]);

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageB.jpg");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post B");
            expect(result).toEqual({
                success: true,
                results: [
                    { title: "Post A", success: true, message: 'Post "Post A" deleted successfully.' },
                    { title: "Post B", success: true, message: 'Post "Post B" deleted successfully.' },
                ],
            });
        });

        //ตรวจสอบกรณีไม่มีโพสต์ที่เลือกสำหรับการลบ
        it("should return an error if no posts are selected for deletion", async () => {
            const result = await postService.removeMultiplePosts([]);

            expect(result).toEqual({
                success: false,
                message: "No posts selected for deletion.",
            });
        });

        //จัดการข้อผิดพลาดระหว่างการลบโพสต์บางรายการ
        it("should handle errors during deletion of individual posts", async () => {
            const posts = [
                { postTitle: "Post A", postImgUrl: "http://example.com/imageA.jpg" },
                { postTitle: "Post B", postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            imgRepoMock.removeImageFromFolder.mockImplementationOnce(() => {
                throw new Error("Image deletion error");
            });

            const result = await postService.removeMultiplePosts(["Post A", "Post B"]);

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageB.jpg");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post A");
            expect(postRepoMock.removePosts).toHaveBeenCalledWith("Post B");
            expect(result).toEqual({
                success: true,
                results: [
                    { title: "Post A", success: false, message: 'Failed to delete post "Post A".' },
                    { title: "Post B", success: true, message: 'Post "Post B" deleted successfully.' },
                ],
            });
        });

        //จัดการข้อผิดพลาดระหว่างการดึงข้อมูลโพสต์
        it("should handle errors gracefully when retrieving posts", async () => {
            postRepoMock.retrieveAllPosts.mockImplementation(() => {
                throw new Error("Unexpected error");
            });

            await expect(postService.removeMultiplePosts(["Post A"])).rejects.toThrow(
                "Failed to delete multiple posts: Unexpected error"
            );
        });

        //จัดการข้อผิดพลาดระหว่างที่ Posts หลายรายการถูกลบ
        it("should handle errors during multiple post deletion", async () => {
            const posts = [
                { postTitle: "Post A", postImgUrl: "http://example.com/imageA.jpg" },
                { postTitle: "Post B", postImgUrl: "http://example.com/imageB.jpg" },
            ];
            postRepoMock.retrieveAllPosts.mockReturnValue(posts);

            // Mock ให้เกิดข้อผิดพลาดในระหว่างการลบโพสต์
            postRepoMock.removePosts.mockImplementationOnce(() => {
                throw new Error("Deletion error");
            });

            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            const result = await postService.removeMultiplePosts(["Post A", "Post B"]);

            // ตรวจสอบว่า console.error ถูกเรียก
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                "Error deleting post \"Post A\":",
                "Deletion error"
            );

            // ตรวจสอบผลลัพธ์
            expect(result).toEqual({
                success: true,
                results: [
                    { title: "Post A", success: false, message: 'Failed to delete post "Post A".' },
                    { title: "Post B", success: true, message: 'Post "Post B" deleted successfully.' },
                ],
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe("removeFirstPost", () => {
        //ลบโพสต์แรกสำเร็จ
        it("should remove the first post successfully", async () => {
            postRepoMock.posts.isEmpty.mockReturnValue(false);
            postRepoMock.posts.head.value = {
                postTitle: "Post A",
                postImgUrl: "http://example.com/imageA.jpg",
            };

            const result = await postService.removeFirstPost();

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(postRepoMock.removeFirst).toHaveBeenCalled();
            expect(result).toEqual({
                success: true,
                message: 'First post "Post A" deleted successfully!',
            });
        });

        //ตรวจสอบกรณีไม่มีโพสต์ในระบบ
        it("should return an error if there are no posts to remove", async () => {
            postRepoMock.posts.isEmpty.mockReturnValue(true);

            const result = await postService.removeFirstPost();

            expect(imgRepoMock.removeImageFromFolder).not.toHaveBeenCalled();
            expect(postRepoMock.removeFirst).not.toHaveBeenCalled();
            expect(result).toEqual({
                success: false,
                message: "No posts available.",
            });
        });

        //จัดการข้อผิดพลาดระหว่างการลบภาพ
        it("should handle errors during the removal of the first post", async () => {
            postRepoMock.posts.isEmpty.mockReturnValue(false);
            postRepoMock.posts.head.value = {
                postTitle: "Post A",
                postImgUrl: "http://example.com/imageA.jpg",
            };

            // Mock ให้เกิดข้อผิดพลาดในระหว่างการลบภาพ
            imgRepoMock.removeImageFromFolder.mockImplementation(() => {
                throw new Error("Image deletion error");
            });

            await expect(postService.removeFirstPost()).rejects.toThrow(
                "Failed to remove first post: Image deletion error"
            );

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageA.jpg");
            expect(postRepoMock.removeFirst).not.toHaveBeenCalled();
        });
    });

    describe("removeLastPost", () => {
        //ลบโพสต์สุดท้ายสำเร็จ
        it("should remove the last post successfully", async () => {
            postRepoMock.posts.isEmpty.mockReturnValue(false);
            postRepoMock.posts.tail.value = {
                postTitle: "Post Z",
                postImgUrl: "http://example.com/imageZ.jpg",
            };

            const result = await postService.removeLastPost();

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageZ.jpg");
            expect(postRepoMock.removeLast).toHaveBeenCalled();
            expect(result).toEqual({
                success: true,
                message: 'Last post "Post Z" deleted successfully!',
            });
        });

        //ตรวจสอบกรณีไม่มีโพสต์ในระบบ
        it("should return an error if there are no posts to remove", async () => {
            postRepoMock.posts.isEmpty.mockReturnValue(true);

            const result = await postService.removeLastPost();

            expect(imgRepoMock.removeImageFromFolder).not.toHaveBeenCalled();
            expect(postRepoMock.removeLast).not.toHaveBeenCalled();
            expect(result).toEqual({
                success: false,
                message: "No posts available.",
            });
        });

        //จัดการข้อผิดพลาดระหว่างการลบภาพ
        it("should handle errors during the removal of the last post", async () => {
            postRepoMock.posts.isEmpty.mockReturnValue(false);
            postRepoMock.posts.tail.value = {
                postTitle: "Post Z",
                postImgUrl: "http://example.com/imageZ.jpg",
            };

            // Mock ให้เกิดข้อผิดพลาดในระหว่างการลบภาพ
            imgRepoMock.removeImageFromFolder.mockImplementation(() => {
                throw new Error("Image deletion error");
            });

            await expect(postService.removeLastPost()).rejects.toThrow(
                "Failed to remove last post: Image deletion error"
            );

            expect(imgRepoMock.removeImageFromFolder).toHaveBeenCalledWith("http://example.com/imageZ.jpg");
            expect(postRepoMock.removeLast).not.toHaveBeenCalled();
        });
    });
});
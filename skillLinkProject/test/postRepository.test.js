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

    describe("alreadyExistence", () => {
        it("should create the directory if it does not exist", () => {
            fs.existsSync.mockReturnValue(false);
            fs.mkdirSync.mockImplementation(() => { });

            postRepository.alreadyExistence();

            expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(postRepository.filePath));
            expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(postRepository.filePath), { recursive: true });
        });

        it("should not create the directory if it already exists", () => {
            fs.existsSync.mockReturnValue(true);

            postRepository.alreadyExistence();

            expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(postRepository.filePath));
            expect(fs.mkdirSync).not.toHaveBeenCalled();
        });
    });

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

    describe("loadFromFile", () => {
        it("should load posts from a file", () => {
            const mockData = JSON.stringify([{ postTitle: "Test Post", postDesc: "Description" }]);
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(mockData);

            postRepository.loadFromFile();

            expect(fs.readFileSync).toHaveBeenCalledWith(postRepository.filePath, "utf8");
            expect(postRepository.posts.toArray()).toEqual(JSON.parse(mockData));
        });

        it("should handle empty files gracefully", () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue("");

            postRepository.loadFromFile();

            expect(postRepository.posts.toArray()).toEqual([]);
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
});
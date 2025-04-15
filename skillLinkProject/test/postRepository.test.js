const fs = require("fs");
const path = require("path");
const PostRepository = require("../models/postRepository");

jest.mock("fs");

describe("PostRepository - Basic Operations", () => {
    let postRepo;

    beforeEach(() => {
        jest.clearAllMocks();
        postRepo = new PostRepository();
    });

    test("should create the directory if it does not exist", () => {
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => { });

        postRepo.alreadyExistence();

        expect(fs.existsSync).toHaveBeenCalledWith(path.dirname(postRepo.filePath));
        expect(fs.mkdirSync).toHaveBeenCalledWith(path.dirname(postRepo.filePath), { recursive: true });
    });

    test("should save posts to a file", () => {
        postRepo.posts.insertLast({ postTitle: "Test Post", postDesc: "Description" });
        fs.writeFileSync.mockImplementation(() => { });
        fs.renameSync.mockImplementation(() => { });

        postRepo.saveToFile();

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            `${postRepo.filePath}.tmp`,
            JSON.stringify(postRepo.posts.toArray(), null, 2)
        );
        expect(fs.renameSync).toHaveBeenCalledWith(`${postRepo.filePath}.tmp`, postRepo.filePath);
    });

    test("should handle error when saving to file", () => {
        fs.existsSync.mockReturnValue(true);
        fs.writeFileSync.mockImplementation(() => {
            throw new Error("Write failed");
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        postRepo.posts.insertLast({ postTitle: "Test Error Post", postDesc: "Error Desc" });
        postRepo.saveToFile();

        expect(consoleSpy).toHaveBeenCalledWith("Error saving posts to file:", "Write failed");
        consoleSpy.mockRestore();
    });


    test("should load posts from a file", () => {
        const mockData = JSON.stringify([{ postTitle: "Test Post", postDesc: "Description" }]);
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue(mockData);

        postRepo.loadFromFile();

        expect(postRepo.posts.getSize()).toBe(1);
        expect(postRepo.posts.head.value.postTitle).toBe("Test Post");
    });

    test("should handle error when loading from file", () => {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockImplementation(() => {
            throw new Error("Read failed");
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        postRepo.loadFromFile();
        expect(consoleSpy).toHaveBeenCalledWith("Error loading posts from file:", "Read failed");

        consoleSpy.mockRestore();
    });
});

describe("PostRepository - Post Retrieval", () => {
    let postRepo;

    beforeEach(() => {
        postRepo = new PostRepository();
        postRepo.posts.insertLast({ postTitle: "Post 1", postDesc: "Description 1", postRating: 5, authorName: "Author 1" });
        postRepo.posts.insertLast({ postTitle: "Post 2", postDesc: "Description 2", postRating: 3, authorName: "Author 2" });
        postRepo.posts.insertLast({ postTitle: "Post 3", postDesc: "Description 3", postRating: 8, authorName: "Author 3" });
        postRepo.posts.insertLast({ postTitle: "Post 4", postDesc: "Description 4", postRating: 4, authorName: "Author 1" });
        postRepo.posts.insertLast({ postTitle: "Post 5", postDesc: "Description 5", postRating: 1, authorName: "Author 2" });
    });

    test("should retrieve all posts", () => {
        const allPosts = postRepo.retrieveAllPosts();
        expect(allPosts.toArray().length).toBe(5);
    });

    test("should retrieve posts by title", () => {
        const results = postRepo.retrievePostsByAction("Post 1", "byTitle");
        expect(results.toArray().length).toBe(1);
        expect(results.head.value.postTitle).toBe("Post 1");
    });

    test("should retrieve posts by author", () => {
        const results = postRepo.retrievePostsByAction("Author 2", "byAuthor");
        expect(results.toArray().length).toBe(2); // Post 2 & Post 5
        expect(results.head.value.authorName).toBe("Author 2");
    });

    test("should sort posts by rating descending", () => {
        const results = postRepo.retrievePostsByAction(null, "sortByRating");
        const sorted = results.toArray();

        expect(sorted.length).toBe(5);
        expect(sorted.map(p => p.postRating)).toEqual([8, 5, 4, 3, 1]);
    });

    test("should retrieve top-rated posts (limit = 1)", () => {
        const results = postRepo.retrievePostsByAction(1, "topRated");
        expect(results.toArray().length).toBe(1);
        expect(results.head.value.postRating).toBe(8);
    });

    test("should retrieve top 5 rated posts by default", () => {
        const results = postRepo.retrievePostsByAction(undefined, "topRated");
        const top = results.toArray();

        expect(top.length).toBe(5);
        expect(top.map(p => p.postRating)).toEqual([8, 5, 4, 3, 1]);
    });

    test("should retrieve posts by exact rating", () => {
        const results = postRepo.retrievePostsByAction("3", "byRating");
        const matched = results.toArray();

        expect(matched.length).toBe(1);
        expect(matched[0].postRating).toBe(3);
    });

    test("should log an error when rating is not a number", () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const results = postRepo.retrievePostsByAction("invalid-number", "byRating");

        expect(consoleSpy).toHaveBeenCalledWith("Invalid rating value");
        expect(results.toArray().length).toBe(0);
        consoleSpy.mockRestore();
    });

    test("should retrieve posts by authorId (myPosts)", () => {
        postRepo.posts.insertLast({ postTitle: "My Post", postDesc: "Owned", postRating: 4, authorName: "Me", authorId: "user123" });
        postRepo.posts.insertLast({ postTitle: "Other Post", postDesc: "Not Me", postRating: 3, authorName: "Someone", authorId: "user999" });

        const results = postRepo.retrievePostsByAction("user123", "myPosts");
        const matched = results.toArray();

        expect(matched.length).toBe(1);
        expect(matched[0].authorId).toBe("user123");
    });

    test("should log error when authorId (value) is missing in 'myPosts'", () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const results = postRepo.retrievePostsByAction(undefined, "myPosts");

        expect(results.toArray().length).toBe(0);

        consoleSpy.mockRestore();
    });

    test("should log an error for invalid action", () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const results = postRepo.retrievePostsByAction("anything", "invalidAction");

        expect(consoleSpy).toHaveBeenCalledWith("Invalid action");
        expect(results.toArray().length).toBe(0);
        consoleSpy.mockRestore();
    });
});

describe("PostRepository - Post Manipulation", () => {
    let postRepo;

    beforeEach(() => {
        postRepo = new PostRepository();
    });

    describe("checkPostTitleExistence", () => {
        beforeEach(() => {
            postRepo.posts.insertLast({ postTitle: "Hello World", postDesc: "Test Desc", postRating: 5 });
        });

        test("should return true if post title exists", () => {
            const exists = postRepo.checkPostTitleExistence("Hello World");
            expect(exists).toBe(true);
        });

        test("should return false if post title does not exist", () => {
            const exists = postRepo.checkPostTitleExistence("Nonexistent Title");
            expect(exists).toBe(false);
        });
    });

    describe("updateData", () => {
        beforeEach(() => {
            postRepo.posts.insertLast({ postTitle: "Hello World", postDesc: "Test Desc", postRating: 5, postImgUrl: "http://oldimage.com", ratingsCount: 10 });
        });

        test("should update post data successfully", () => {
            const newData = { postDesc: "Updated Desc", postRating: 4 };
            const newImgUrl = "http://newimage.com";

            const result = postRepo.updateData("Hello World", newData, newImgUrl);

            const updatedPost = postRepo.posts.head.value;
            expect(result).toBe(true);
            expect(updatedPost.postDesc).toBe("Updated Desc");
            expect(updatedPost.postRating).toBe(4);
            expect(updatedPost.postImgUrl).toBe("http://newimage.com");
        });

        test("should not update anything if postTitle is not found", () => {
            const newData = { postDesc: "Updated Desc", postRating: 4 };
            const newImgUrl = "http://newimage.com";

            const result = postRepo.updateData("Nonexistent Title", newData, newImgUrl);

            const originalPost = postRepo.posts.head.value;
            expect(result).toBe(false);
            expect(originalPost.postDesc).toBe("Test Desc");
            expect(originalPost.postRating).toBe(5);
            expect(originalPost.postImgUrl).toBe("http://oldimage.com");
        });

        test("should allow falsy values like 0 or empty string", () => {
            const newData = { postDesc: null, postRating: null, ratingsCount: null };
            const newImgUrl = null;

            const result = postRepo.updateData("Hello World", newData, newImgUrl);
            const updatedPost = postRepo.posts.head.value;

            expect(result).toBe(true);
            expect(updatedPost.postDesc).toBe("Test Desc");
            expect(updatedPost.postRating).toBe(5);
            expect(updatedPost.postImgUrl).toBe("http://oldimage.com");
            expect(updatedPost.ratingsCount).toBe(10);
        });
    });

    describe("insertFirstPost", () => {
        test("should insert post at the beginning", () => {
            const newPost = { postTitle: "Post 1", postDesc: "Description 1", postRating: 5, authorName: "Author 1" };

            postRepo.insertFirstPost(newPost);

            expect(postRepo.posts.getSize()).toBe(1);
            expect(postRepo.posts.head.value.postTitle).toBe("Post 1");
        });
    });

    describe("removeFirstPost", () => {
        beforeEach(() => {
            postRepo.posts.insertFirst({ postTitle: "Post 1", postDesc: "Description 1", postRating: 5, authorName: "Author 1" });
        });

        test("should remove the first post", () => {
            postRepo.removeFirstPost();

            expect(postRepo.posts.getSize()).toBe(0);
        });
    });

    describe("insertLastPost", () => {
        test("should insert post at the end", () => {
            const newPost = { postTitle: "Post 1", postDesc: "Description 1", postRating: 5, authorName: "Author 1" };

            postRepo.insertLastPost(newPost);

            expect(postRepo.posts.getSize()).toBe(1);
            expect(postRepo.posts.tail.value.postTitle).toBe("Post 1");
        });
    });

    describe("removeLastPost", () => {
        beforeEach(() => {
            postRepo.posts.insertLast({ postTitle: "Post 1", postDesc: "Description 1", postRating: 5, authorName: "Author 1" });
            postRepo.posts.insertLast({ postTitle: "Post 2", postDesc: "Description 2", postRating: 4, authorName: "Author 2" });
        });

        test("should remove the last post", () => {
            postRepo.removeLastPost();

            expect(postRepo.posts.getSize()).toBe(1);
            expect(postRepo.posts.tail.value.postTitle).toBe("Post 1");
        });
    });

    describe("removePostsByFilter", () => {
        beforeEach(() => {
            postRepo.posts.insertLast({ postTitle: "Post 1", postDesc: "Description 1", postRating: 5, authorName: "Author 1" });
            postRepo.posts.insertLast({ postTitle: "Post 2", postDesc: "Description 2", postRating: 3, authorName: "Author 2" });
        });

        test("should remove posts based on the provided filter", () => {
            const filterCallback = (post) => post.postRating < 4;
            postRepo.removePostsByFilter(filterCallback);

            expect(postRepo.posts.getSize()).toBe(1);
            expect(postRepo.posts.head.value.postTitle).toBe("Post 1");
        });
    });
});


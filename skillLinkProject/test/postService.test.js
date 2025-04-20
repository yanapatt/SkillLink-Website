const PostService = require("../models/postService");
const LinkedList = require("../models/linkedList");

let mockPostRepo, mockAccountRepo, mockImgRepo, postService;

beforeEach(() => {
    mockPostRepo = {
        posts: new LinkedList(),
        insertLastPost: jest.fn((post) => mockPostRepo.posts.insertLast(post)),
        retrievePostsByAction: jest.fn(),
        updateData: jest.fn(),
        removePostsByFilter: jest.fn(),
        removeFirstPost: jest.fn(),
        removeLastPost: jest.fn(),
    };

    mockAccountRepo = {};
    mockImgRepo = {
        saveImage: jest.fn(async (url) => url + "_saved"),
        removeImage: jest.fn(async (url) => true),
    };

    postService = new PostService(mockPostRepo, mockAccountRepo, mockImgRepo);
});

describe("PostService", () => {
    describe("PostService - CREATE", () => {
        describe("createPost", () => {
            test("should create post with image", async () => {
                const postData = { postTitle: "New", postDesc: "Test" };
                const post = await postService.createPost(postData, "Alice", "user1", "http://image.jpg");

                expect(mockImgRepo.saveImage).toHaveBeenCalled();
                expect(post.postTitle).toBe("New");
                expect(post.authorName).toBe("Alice");
                expect(post.postImgUrl).toBe("http://image.jpg_saved");
            });

            test("should create post without image", async () => {
                const postData = { postTitle: "No Image", postDesc: "Test desc" };
                const post = await postService.createPost(postData, "Bob", "user2");

                expect(mockImgRepo.saveImage).not.toHaveBeenCalled();
                expect(post.postTitle).toBe("No Image");
                expect(post.authorName).toBe("Bob");
                expect(post.postImgUrl).toBe(null);
            });

            test("should log an error if image saving fails", async () => {
                const postData = { postTitle: "New", postDesc: "Test" };

                const errorMsg = "Failed to save image";
                mockImgRepo.saveImage.mockRejectedValueOnce(new Error(errorMsg));
                const errorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

                try {
                    await postService.createPost(postData, "Alice", "user1", "http://image.jpg");
                } catch (error) {
                    expect(errorSpy).toHaveBeenCalledWith("Error saving image:", errorMsg);
                }

                errorSpy.mockRestore();
            });

            test("should log an error if creating post fails", async () => {
                const postData = { postTitle: "New", postDesc: "Test" };
                const errorMsg = "Failed to insert post";
                mockPostRepo.insertLastPost.mockImplementationOnce(() => { throw new Error(errorMsg); });
                const errorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

                try {
                    await postService.createPost(postData, "Alice", "user1", "http://image.jpg");
                } catch (error) {
                    expect(errorSpy).toHaveBeenCalledWith("Error creating post:", errorMsg);
                }

                errorSpy.mockRestore();
            });
        })
    });

    describe("PostService - READ", () => {
        describe("calculateAverageRating", () => {
            test("should return 0 for no posts", () => {
                mockPostRepo.retrievePostsByAction.mockReturnValue(new LinkedList());
                const avg = postService.calculateAverageRating("Any");
                expect(avg).toBe(0);
            });

            test("should calculate average rating", () => {
                const post = {
                    ratingsCount: new LinkedList()
                };
                post.ratingsCount.insertLast({ ratingScore: 4 });
                post.ratingsCount.insertLast({ ratingScore: 2 });

                const list = new LinkedList();
                list.insertLast(post);
                mockPostRepo.retrievePostsByAction.mockReturnValue(list);

                const avg = postService.calculateAverageRating("Any");
                expect(avg).toBe(3);
            });

            test("should return 0 when posts have no ratings", () => {
                const post = {
                    ratingsCount: new LinkedList()
                };

                const list = new LinkedList();
                list.insertLast(post);
                mockPostRepo.retrievePostsByAction.mockReturnValue(list);

                const avg = postService.calculateAverageRating("Any");
                expect(avg).toBe(0);
            });
        });
    })

    describe("PostService - UPDATE", () => {
        describe("ratingPost", () => {
            test("should add a new rating", async () => {
                const post = {
                    postTitle: "Rated",
                    ratingsCount: new LinkedList(),
                    postImgUrl: null
                };

                const list = new LinkedList();
                list.insertLast(post);
                mockPostRepo.retrievePostsByAction.mockReturnValue(list);

                await postService.ratingPost("Rated", 5, "user1");

                expect(post.ratingsCount.getSize()).toBe(1);
                expect(mockPostRepo.updateData).toHaveBeenCalled();
            });

            test("should update an existing rating", async () => {
                const ratingList = new LinkedList();
                ratingList.insertLast({ authorId: "user1", ratingScore: 3 });

                const post = {
                    postTitle: "Rated",
                    ratingsCount: ratingList,
                    postImgUrl: null
                };

                const list = new LinkedList();
                list.insertLast(post);
                mockPostRepo.retrievePostsByAction.mockReturnValue(list);

                await postService.ratingPost("Rated", 5, "user1");

                const updatedRating = post.ratingsCount.head.value;
                expect(updatedRating.ratingScore).toBe(5);
            });

            test("should log an error if updateData throws", async () => {
                const ratingList = new LinkedList();
                const post = {
                    postTitle: "Rated",
                    ratingsCount: ratingList,
                    postImgUrl: null
                };

                const list = new LinkedList();
                list.insertLast(post);
                mockPostRepo.retrievePostsByAction.mockReturnValue(list);
                const errorMsg = "Failed to update";
                mockPostRepo.updateData = jest.fn(() => {
                    throw new Error(errorMsg);
                });
                const errorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
                await postService.ratingPost("Rated", 5, "user1");
                expect(errorSpy).toHaveBeenCalledWith("Error rating post:", errorMsg);

                errorSpy.mockRestore();
            });

            test("should return early if no matching posts", async () => {
                const emptyList = new LinkedList();
                mockPostRepo.retrievePostsByAction.mockReturnValue(emptyList);
                const updateSpy = jest.spyOn(mockPostRepo, "updateData");

                await postService.ratingPost("NonExistentTitle", 4, "user1");
                expect(updateSpy).not.toHaveBeenCalled();
            });

        });

        describe("updateDataInPost", () => {
            let mockList;
            let mockPost;

            beforeEach(() => {
                mockPost = {
                    postTitle: "MyPost",
                    postDesc: "Old description",
                    postImgUrl: "oldImage.jpg"
                };

                mockList = new LinkedList();
                mockList.insertLast(mockPost);

                mockPostRepo.retrievePostsByAction.mockReturnValue(mockList);
            });

            test("should update post description", async () => {
                const newData = { postDesc: "Updated description", deleteImg: "false" };

                await postService.updateDataInPost("MyPost", newData, null);

                expect(mockPostRepo.updateData).toHaveBeenCalledWith("MyPost", "Updated description", "oldImage.jpg");
            });

            test("should delete image when deleteImg is true", async () => {
                const newData = { postDesc: "Updated", deleteImg: "true" };

                mockImgRepo.removeImage.mockResolvedValueOnce();

                await postService.updateDataInPost("MyPost", newData, null);

                expect(mockImgRepo.removeImage).toHaveBeenCalledWith("oldImage.jpg");
                expect(mockPost.postImgUrl).toBeNull();
                expect(mockPostRepo.updateData).toHaveBeenCalledWith("MyPost", "Updated", null);
            });

            test("should upload new image and update postImgUrl", async () => {
                const newData = { postDesc: "New description", deleteImg: "false" };

                mockImgRepo.saveImage.mockResolvedValueOnce("newImage.jpg");

                await postService.updateDataInPost("MyPost", newData, "newImgFile.jpg");

                expect(mockImgRepo.saveImage).toHaveBeenCalledWith("newImgFile.jpg");
                expect(mockPost.postImgUrl).toBe("newImage.jpg");
                expect(mockPostRepo.updateData).toHaveBeenCalledWith("MyPost", "New description", "newImage.jpg");
            });

            test("should do nothing if no posts found", async () => {
                const emptyList = new LinkedList();
                mockPostRepo.retrievePostsByAction.mockReturnValueOnce(emptyList);

                await postService.updateDataInPost("NotExist", { postDesc: "Nope", deleteImg: "false" }, null);

                expect(mockPostRepo.updateData).not.toHaveBeenCalled();
            });

            test("should catch and log error during update", async () => {
                const newData = { postDesc: "Boom", deleteImg: "false" };
                const errorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

                mockPostRepo.updateData.mockImplementationOnce(() => { throw new Error("Update failed"); });

                await postService.updateDataInPost("MyPost", newData, null);

                expect(errorSpy).toHaveBeenCalledWith("Error updating post:", "Update failed");

                errorSpy.mockRestore();
            });

            test("should catch and log error when saving image", async () => {
                const newData = { postDesc: "New desc", deleteImg: "false" };
                const errorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

                mockImgRepo.saveImage.mockRejectedValueOnce(new Error("Image save failed"));

                await postService.updateDataInPost("MyPost", newData, "badImage.jpg");

                expect(errorSpy).toHaveBeenCalledWith("Error updating post:", "Image save failed");

                errorSpy.mockRestore();
            });
        });
    })

    describe("PostService - DELETE", () => {
        describe("removePostsByAction", () => {
            let postWithImg;
            let postWithoutImg;
            let mockList;

            beforeEach(() => {
                postWithImg = {
                    postTitle: "ToDelete",
                    postImgUrl: "image.jpg",
                    postRating: 4.5
                };

                postWithoutImg = {
                    postTitle: "ToDelete",
                    postImgUrl: null,
                    postRating: 3.0
                };

                mockList = new LinkedList();
                mockList.insertLast(postWithImg);
                mockList.insertLast(postWithoutImg);

                mockPostRepo.posts.isEmpty = jest.fn().mockReturnValue(false);
                mockPostRepo.retrievePostsByAction.mockReturnValue(mockList);
            });

            test("should remove posts by title and delete images if present", async () => {
                await postService.removePostsByAction("ToDelete", "byTitle");

                expect(mockImgRepo.removeImage).toHaveBeenCalledWith("image.jpg");
                expect(mockPostRepo.removePostsByFilter).toHaveBeenCalledWith(expect.any(Function));

                const filterFn = mockPostRepo.removePostsByFilter.mock.calls[0][0];
                expect(filterFn(postWithImg)).toBe(true);
                expect(filterFn(postWithoutImg)).toBe(true);
            });

            test("should remove posts by rating", async () => {
                await postService.removePostsByAction("4.0", "byRating");

                const filterFn = mockPostRepo.removePostsByFilter.mock.calls[0][0];
                expect(filterFn({ postRating: 4.5 })).toBe(true);
                expect(filterFn({ postRating: 3.5 })).toBe(false);
            });

            test("should not remove anything if rating is not a number", async () => {
                await postService.removePostsByAction("notANumber", "byRating");

                const filterFn = mockPostRepo.removePostsByFilter.mock.calls[0][0];
                expect(filterFn({ postRating: 4.0 })).toBe(false);
            });

            test("should not proceed if repo is empty", async () => {
                mockPostRepo.posts.isEmpty = jest.fn().mockReturnValue(true);

                await postService.removePostsByAction("Any", "byTitle");

                expect(mockPostRepo.retrievePostsByAction).not.toHaveBeenCalled();
                expect(mockPostRepo.removePostsByFilter).not.toHaveBeenCalled();
            });

            test("should not remove if no matched posts found", async () => {
                const emptyList = new LinkedList();
                mockPostRepo.retrievePostsByAction.mockReturnValueOnce(emptyList);

                await postService.removePostsByAction("Unknown", "byTitle");

                expect(mockImgRepo.removeImage).not.toHaveBeenCalled();
                expect(mockPostRepo.removePostsByFilter).not.toHaveBeenCalled();
            });

            test("should handle and log errors", async () => {
                const errorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
                mockPostRepo.removePostsByFilter.mockImplementationOnce(() => {
                    throw new Error("Remove failed");
                });

                await postService.removePostsByAction("ToDelete", "byTitle");

                expect(errorSpy).toHaveBeenCalledWith("Error removing posts:", "Remove failed");

                errorSpy.mockRestore();
            });

            test("should not remove anything if action is unknown", async () => {
                await postService.removePostsByAction("SomeValue", "unknownAction");

                expect(mockPostRepo.removePostsByFilter).toHaveBeenCalled();
                const filterFn = mockPostRepo.removePostsByFilter.mock.calls[0][0];
                const result = filterFn({ postTitle: "SomeValue", postRating: 5.0 });

                expect(result).toBe(false);
            });

        });

        describe("removeFirstPostWithImage", () => {
            test("should not attempt to remove image if first post is null", async () => {
                const list = new LinkedList();
                mockPostRepo.retrievePostsByAction.mockReturnValue(list);

                await postService.removeFirstPostWithImage();

                expect(mockImgRepo.removeImage).not.toHaveBeenCalled();
                expect(mockPostRepo.removeFirstPost).not.toHaveBeenCalled();
            });

            test("should remove first post and delete image if present", async () => {
                const firstPost = { postImgUrl: "http://image.jpg" };
                mockPostRepo.posts.head = { value: firstPost };
                mockPostRepo.posts.isEmpty = jest.fn().mockReturnValue(false);

                await postService.removeFirstPostWithImage();

                expect(mockImgRepo.removeImage).toHaveBeenCalledWith("http://image.jpg");
                expect(mockPostRepo.removeFirstPost).toHaveBeenCalled();
            });

            test("should remove first post without image", async () => {
                const firstPost = { postImgUrl: null };
                mockPostRepo.posts.head = { value: firstPost };
                mockPostRepo.posts.isEmpty = jest.fn().mockReturnValue(false);

                await postService.removeFirstPostWithImage();

                expect(mockImgRepo.removeImage).not.toHaveBeenCalled();
                expect(mockPostRepo.removeFirstPost).toHaveBeenCalled();
            });

            test("should do nothing if post list is empty", async () => {
                mockPostRepo.posts.isEmpty = jest.fn().mockReturnValue(true);

                await postService.removeFirstPostWithImage();

                expect(mockImgRepo.removeImage).not.toHaveBeenCalled();
                expect(mockPostRepo.removeFirstPost).not.toHaveBeenCalled();
            });

            test("should handle errors and log them", async () => {
                const errorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
                mockPostRepo.posts.head = { value: { postImgUrl: "bad.jpg" } };
                mockPostRepo.posts.isEmpty = jest.fn().mockReturnValue(false);
                mockImgRepo.removeImage.mockRejectedValueOnce(new Error("Image remove failed"));

                await postService.removeFirstPostWithImage();

                expect(errorSpy).toHaveBeenCalledWith("Error removing first post:", "Image remove failed");
                errorSpy.mockRestore();
            });
        });

        describe("removeLastPostWithImage", () => {
            test("should remove last post with image", async () => {
                const post = {
                    postTitle: "LastPost",
                    postImgUrl: "last.jpg"
                };

                mockPostRepo.posts.tail = { value: post };
                mockPostRepo.posts.isEmpty = jest.fn(() => false);

                await postService.removeLastPostWithImage();

                expect(mockImgRepo.removeImage).toHaveBeenCalledWith("last.jpg");
                expect(mockPostRepo.removeLastPost).toHaveBeenCalled();
            });

            test("should remove last post without image", async () => {
                const post = {
                    postTitle: "LastPost",
                    postImgUrl: null
                };

                mockPostRepo.posts.tail = { value: post };
                mockPostRepo.posts.isEmpty = jest.fn(() => false);

                await postService.removeLastPostWithImage();

                expect(mockImgRepo.removeImage).not.toHaveBeenCalled();
                expect(mockPostRepo.removeLastPost).toHaveBeenCalled();
            });

            test("should do nothing if list is empty", async () => {
                mockPostRepo.posts.isEmpty = jest.fn(() => true);

                await postService.removeLastPostWithImage();

                expect(mockImgRepo.removeImage).not.toHaveBeenCalled();
                expect(mockPostRepo.removeLastPost).not.toHaveBeenCalled();
            });

            test("should catch and log error", async () => {
                const errorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
                mockPostRepo.posts.isEmpty = jest.fn(() => false);
                mockPostRepo.posts.tail = { value: { postImgUrl: "error.jpg" } };
                mockImgRepo.removeImage.mockRejectedValueOnce(new Error("Delete failed"));

                await postService.removeLastPostWithImage();

                expect(errorSpy).toHaveBeenCalledWith("Error removing last post:", "Delete failed");
                errorSpy.mockRestore();
            });
        });
    })
});

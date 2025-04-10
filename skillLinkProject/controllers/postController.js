const PostService = require("../models/postService"); // เรียกใช้ postService
const PostRepository = require("../models/postRepository"); // เรียกใช้ postRepository
const AccountRepository = require("../models/accountRepository");
const ImageRepository = require("../models/imageRepository");

const postRepo = new PostRepository();
const accRepo = new AccountRepository();
const imgRepo = new ImageRepository();
const postService = new PostService(postRepo, accRepo, imgRepo);

exports.renderDisplay = async (req, res) => {
    res.render('index', {
        posts: postRepo.retrieveAllPosts().toArray(),
        accUsername: req.session.accountSession.accUsername,
        accRole: req.session.accountSession.accRole
    });
}

exports.createNewPost = [imgRepo.uploadImage(), async (req, res) => {
    const imageUrl = req.file ? req.file : null;
    const accId = req.session.accountSession.accId;
    const { postTitle, postDesc } = req.body;

    if (postRepo.isPostTitleExist(postTitle)) {
        return res.render('index', {
            error: `Post title "${postTitle}" already exists.`,
            posts: postRepo.retrieveAllPosts().toArray(),
            accUsername: req.session.accountSession.accUsername,
            accRole: req.session.accountSession.accRole
        })
    }

    const postData = {
        postTitle,
        postDesc
    };

    await postService.createPost(postData, accId, imageUrl);
    res.redirect('/');
}]

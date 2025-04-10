const PostService = require("../models/postService"); // เรียกใช้ postService
const PostRepository = require("../models/postRepository"); // เรียกใช้ postRepository
const AccountRepository = require("../models/accountRepository");
const ImageRepository = require("../models/imageRepository");

const postRepo = new PostRepository();
const accRepo = new AccountRepository();
const imgRepo = new ImageRepository();
const postService = new PostService(postRepo, accRepo, imgRepo);

exports.renderDisplay = async (req, res) => {
    const allPosts = postRepo.retrieveAllPosts();
    res.render('index', {
        posts: allPosts.toArray(), 
        accUsername: req.session.accountSession.accUsername, 
        accRole: req.session.accountSession.accRole
    });
}

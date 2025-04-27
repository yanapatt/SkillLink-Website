const PostService = require("../models/postService");
const PostRepository = require("../models/postRepository");
const AccountRepository = require("../models/accountRepository");
const ImageRepository = require("../models/imageRepository");

const postRepo = new PostRepository();
const accRepo = new AccountRepository();
const imgRepo = new ImageRepository();
const postService = new PostService(postRepo, accRepo, imgRepo);

exports.renderDisplay = async (req, res) => {
    const posts = postRepo.retrieveAllPosts().toArray();
    const topFivePost = postRepo.retrievePostsByAction(5, 'topRated').toArray();

    res.render('index', {
        error: null,
        posts: posts,
        firstFivePosts: topFivePost,
        accId: req.session.accountSession.accId,
        accUsername: req.session.accountSession.accUsername,
        accRole: req.session.accountSession.accRole
    });
}

exports.createNewPost = [imgRepo.uploadImage(), async (req, res) => {
    const imageUrl = req.file ? req.file : null;
    const authorName = req.session.accountSession.accUsername;
    const authorId = req.session.accountSession.accId;
    const { postTitle, postDesc } = req.body;
    const topFivePost = postRepo.retrievePostsByAction(5, 'topRated').toArray();

    if (postRepo.checkPostTitleExistence(postTitle)) {
        return res.render('index', {
            error: `Post title "${postTitle}" already exists.`,
            posts: postRepo.retrieveAllPosts().toArray(),
            firstFivePosts: topFivePost,
            accId: req.session.accountSession.accId,
            accUsername: req.session.accountSession.accUsername,
            accRole: req.session.accountSession.accRole
        })
    }

    const postData = {
        postTitle,
        postDesc
    };

    await postService.createPost(postData, authorName, authorId, imageUrl);
    res.redirect('/');
}]

exports.aboutPost = async (req, res) => {
    const postTitle = req.params.postTitle;
    const targetPost = postRepo.retrievePostsByAction(postTitle, 'byTitle');
    const action = req.query.action;
    console.log(targetPost.toArray());

    if (action === 'edit') {
        return res.render('edit', {
            error: null,
            post: targetPost.toArray(),
            accId: req.session.accountSession.accId,
            accUsername: req.session.accountSession.accUsername,
            accRole: req.session.accountSession.accRole
        });
    }

    res.render('post', {
        error: null,
        post: targetPost.toArray(),
        accId: req.session.accountSession.accId,
        accUsername: req.session.accountSession.accUsername,
        accRole: req.session.accountSession.accRole
    });
}

exports.searchPostByAction = async (req, res) => {
    const { action, value } = req.body;
    const foundPosts = postRepo.retrievePostsByAction(value, action);
    const topFivePost = postRepo.retrievePostsByAction(5, 'topRated').toArray();

    res.render('index', {
        error: null,
        posts: foundPosts.toArray(),
        firstFivePosts: topFivePost,
        accId: req.session.accountSession.accId,
        accUsername: req.session.accountSession.accUsername,
        accRole: req.session.accountSession.accRole
    })
}

exports.clearSearch = async (req, res) => {
    res.redirect('/');
}

exports.updatePost = [imgRepo.uploadImage(), async (req, res) => {
    const postTitle = req.body.postTitle;
    const newData = {
        postDesc: req.body.postDesc,
        deleteImg: req.body.deleteImg
    };
    console.log(newData);
    const newImgFile = req.file ? req.file : null;
    await postService.updateDataInPost(postTitle, newData, newImgFile);

    res.redirect('/');
}]

exports.ratingPost = async (req, res) => {
    const postTitle = req.body.postTitle;
    const rating = parseInt(req.body.rating);
    const accId = req.session.accountSession.accId;

    await postService.ratingPost(postTitle, rating, accId);
    res.render('post', {
        error: null,
        post: postRepo.retrievePostsByAction(postTitle, 'byTitle').toArray(),
        accId: req.session.accountSession.accId,
        accUsername: req.session.accountSession.accUsername,
        accRole: req.session.accountSession.accRole
    })
}

exports.removePostsByAction = async (req, res) => {
    const { action, value } = req.body;
    if (action === 'byTitle' && value) {
        const titles = Array.isArray(value) ? value : [value];
        for (let title of titles) {
            await postService.removePostsByAction(title, action);
        }
        res.redirect('/');
    } else if (action === 'byRating' && value) {
        const rating = parseFloat(value);
        await postService.removePostsByAction(rating, action);
        res.redirect('/');
    }
};

exports.removeFirstPost = async (req, res) => {
    postService.removeFirstPostWithImage();
    res.redirect('/');
}

exports.removeLastPost = async (req, res) => {
    postService.removeLastPostWithImage();
    res.redirect('/');
}




const express = require('express')
const router = express.Router()

const PostController = require('../controllers/PostController')
const verifyToken = require('../middlewares/authentication')

router.get('/', verifyToken, PostController.get_posts)
router.get('/:postId', verifyToken, PostController.get_post)
// router.get('', verifyToken, PostController.get_posts_topic)
router.get('/activePosts/mostLikes', verifyToken, PostController.mostLiked_post)
router.get('/activePosts/mostDislikes', verifyToken, PostController.mostDisliked_post)
router.post('/', verifyToken, PostController.create_post)
router.post('/like/:postId', verifyToken, PostController.like_post)
router.post('/dislike/:postId', verifyToken, PostController.dislike_post)
router.post('/comment/:postId', verifyToken, PostController.comment_post)

module.exports = router
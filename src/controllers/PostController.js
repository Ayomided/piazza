const moment = require('moment')

const Post = require('../models/Post')
const { query } = require('express')

const PostController = {

    // get all posts, get posts by topic, get expired posts by topic
    async get_posts(req, res){
        try {
            const query = req.query
            if(!query){
                const posts = await Post.find({})
                res.status(200).send({ allposts: posts })
                for (const post of posts) {
                    const status = await updatePostStatus(post)
                    post.status = status.status
                    await post.save()
                }
            }
            else{
                const validTopics = ['tech', 'health', 'sport', 'politics']
                const postTopic = query.topic.toLowerCase()
                const expiry = query.status

                if (!validTopics.includes(postTopic)) {
                    return res.status(400).send({ message: 'Invalid topic' })
                }

                const filteredPosts = await Post.find({ topic: postTopic })

                if (filteredPosts.length === 0) {
                    return res.status(404).send({ message: 'This topic is empty' })
                }

                for (const post of filteredPosts) {
                    const status = await updatePostStatus(post)
                    post.status = status.status
                    await post.save()
                }
                if (!expiry) {
                    return res.status(200).send(filteredPosts)
                }
                else {
                    const expiredPosts = filteredPosts.filter(post => moment().isAfter(post.expiration))

                    if (expiredPosts.length > 0 && expiry === 'expired') {
                        return res.status(200).send(expiredPosts)
                    }
                }
            }
        } catch (err) {
            res.status(500).send({message:err})
        }
    },

    //get single post
    async get_post(req, res){
        try {
            const singlePost = await Post.findById(req.params.postId)
            if (!singlePost) {
                return res.status(404).send({ message: 'No posts found' })
            }
            res.status(200).send(`Here is the post you requested \n\n ${singlePost}`)
        } catch (err) {
            res.status(500).send({message:err})
        } 
    },
    
    // create post
    async create_post(req, res) {
        function calculateExpiration(input) {
            const duration = moment.duration(parseInt(input), input.slice(-1))
            return moment().add(duration).toDate()
        }

        const postData = new Post({
            title: req.body.title,
            topic: req.body.topic,
            username: req.userData.username,
            location: req.body.location,
            message: req.body.message,
            expiration: calculateExpiration(req.body.expiration),
        })

        try {
            const postToSave = await postData.save()
            const status = moment().isBefore(postData.expiration) ? 'live' : 'expired'
            postToSave.status = status
            await postToSave.save()
            res.status(201).send(postToSave)
        } catch (err) {
            res.status(500).send({ message: err })
        }
    },

    // get most liked post
    async mostLiked_post(req, res) {
        try {
            const post = await Post.findOne().sort({ like: -1 })

            if (!post) {
                return res.status(404).send({ message: 'No posts found' })
            }
            const status = moment().isBefore(post.expiration) ? 'live' : 'expired'

            if (status !== 'expired') {
                const mostLikes = post
                return res.status(200).send(mostLikes)
            }
            else {
                return res.status(404).send('No active posts found')
            }
        } catch (err) {
            res.status(500).send({ message: err })
        }
    },

    // get most disliked post
    async mostDisliked_post(req, res) {
        try {
            const post = await Post.findOne().sort({ dislike: -1 })

            if (!post) {
                return res.status(404).send({ message: 'No posts found' })
            }

            const status = moment().isBefore(post.expiration) ? 'live' : 'expired'

            if (status !== 'expired') {
                const mostDislikes = post
                return res.status(200).send(mostDislikes)
            }
            else {
                return res.status(404).send('No active posts found')
            }
        } catch (err) {
            res.status(500).send({ message: err })
        }
    },

    // like post
    async like_post(req, res) {
        try {
            const post = await Post.findById(req.params.postId)

            if (!post) {
                return res.status(404).send('Post not found')
            }

            const { status, post: updatedPost } = await updatePostStatus(post)

            if (status !== 'expired') {
                if (updatedPost.username === req.userData.username) {
                    return res.status(400).send('You cannot like your own post')
                }
                if (updatedPost.likesUser.includes(req.userData._id)) {
                    return res.status(400).send('You have liked the post already')
                }
                if (updatedPost.dislikesUser.includes(req.userData._id)) {
                    updatedPost.dislikesUser.pull(req.userData._id)
                    updatedPost.dislike -= 1
                }

                updatedPost.likesUser.push(req.userData._id)
                updatedPost.like += 1

                await updatedPost.save()

                const userLiked = req.userData.username
                return res.status(201).send(`${userLiked} liked a post. \n Post is expiring at ${post.expiration}`)
            }
            else {
                return res.status(400).send('Post Disabled, no more interactions')
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Internal Server Error', error: err.message })
        }
    },

    //dislike post
    async dislike_post(req, res) {
        try {
            const post = await Post.findById(req.params.postId)
            if (!post) {
                return res.status(404).send('Post not found')
            }
            const { status, post: updatedPost } = await updatePostStatus(post)

            if (status !== 'expired') {
                if (updatedPost.username === req.userData.username) {
                    return res.status(400).send('You cannot dislike your own post')
                }
                if (updatedPost.dislikesUser.includes(req.userData._id)) {
                    return res.status(400).send('You have disliked the post already')
                }
                if (updatedPost.likesUser.includes(req.userData._id)) {
                    updatedPost.likesUser.pull(req.userData._id)
                    updatedPost.like -= 1
                }

                updatedPost.dislikesUser.push(req.userData._id)
                updatedPost.dislike += 1

                await updatedPost.save()

                const userDisliked = req.userData.username
                return res.status(201).send(`${userDisliked} disliked a post. \n Post is expiring at ${post.expiration}`)
            }
            else {
                return res.status(400).send('Post Disabled, no more interactions')
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).send({ message: 'Internal Server Error', error: err.message });
        }
    },

    // comment on post
    async comment_post(req, res) {
        try {
            const post = await Post.findById(req.params.postId)
            if (!post) {
                return res.send('Post not found')
            }

            const { status, post: updatedPost } = await updatePostStatus(post)

            if (status !== 'expired') {
                if (updatedPost.username === req.userData.username) {
                    return res.status(400).send('You cannot comment on your own post')
                }

                post.commentsUser.push(req.userData._id)
                post.comments.push(req.body.comments)

                const userCommented = req.userData.username
                await post.save()

                return res.status(201).send({ message: `${userCommented} commented ${req.body.comments}. Post is expiring at ${post.expiration}`})
                // return res.status(201).send(`${userCommented} commented ${req.body.comments}. \n Post is expiring at ${post.expiration}`)
            }
            else {
                return res.status(400).send({message: 'Post Disabled, no more interactions'})
            }
        }
        catch (err) {
            res.status(500).send({ message: err })
        }
    },
}

async function updatePostStatus(post) {
    const status = moment().isBefore(post.expiration) ? 'live' : 'expired'
    post.status = status
    await post.save()
    return { status, post }
}

module.exports = PostController
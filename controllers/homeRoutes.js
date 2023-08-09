const router = require('express').Router();
const { User, BlogPost, Comment } = require('../models');

router.get('/', async (req, res) => {
  try {
  const blogData = await BlogPost.findAll({
    include: [
        {
            model: User,
            attributes: ['username'],
        },
        {
            model: Comment,
            include: {
                model: User,
                attributes: ['username'],
            },
        },
    ],
    order: [
        [Comment, 'created_at', 'DESC'],
    ],
});

const blogs = blogData.map((blog) => blog.get({plain: true}));

    res.render('homepage', {
        blogs,
        loggedIn: req.session?.loggedIn
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err)
  }
});

router.get('/dashboard', async (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
        return;
    }

    console.log('user_id from session', req.session.user_id);

    try {
        const userData = await User.findByPk(req.session.user_id, {
            include: [{ 
                model: BlogPost ,
                include: [{
                    model: User,
                    attributes: ['username'],
                }],
            }]
        });

        console.log('userData: ', userData);

        const user = userData.get({ plain: true });

        const blogs = user.blogposts ? user.blogposts.map(blog => ({...blog})) : [];

        console.log('blogs: ', blogs);

        res.render('dashboard', {
            ...user,
            blogs,
            loggedIn: true
        });
    } catch (err) {
        console.log(err);
        res.stats(500).json(err);
    }
});

router.post('/dashboard', async (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
        return;
    }

    try{
        const newPost = await BlogPost.create({
            title: req.body.title,
            content: req.body.content,
            user_id: req.session.user_id,
        });

        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/dashboard');
        return;
    }

    res.render('login');
});

router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({ where: { username: req.body.username }});

        if (!userData || !userData.checkPassword(req.body.password)) {
            res.status(400).json({ message: 'Invalid Login'});
            return;
        }

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.loggedIn = true;

            res.json({ user: userData, message: 'You are logged in'});
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

router.post('/comments', async (req, res) => {
    if (!req.session.loggedIn) {
        res.redirect('/login');
        return;
}

try {
    const newComment = await Comment.create({
        content: req.body.content,
        user_id: req.session.user_id,
        blogpost_id: req.body.blog_id,
    });

    res.redirect('/');
} catch (err) {
    console.log(err);
    res.status(500).json(err);
}
});

module.exports = router;
const sequelize = require('../config/connection');
const { User, BlogPost, Comment } = require('../models');

const userData = [
    {
        username: 'jgq123',
        password: 'foo'
    },
    {
        username: 'test',
        password: 'test'
    },
];

const blogPostData = [
    {
        title: 'Test Post 1',
        content: 'test test test',
        user_id: 1
    },
    {
        title: 'Test Post 2',
        content: 'test2 test2 test2',
        user_id: 2
    }
];

const commentData = [
    {
    content: 'This is a test comment',
    user_id: 2, 
    blogpost_id: 1
    },
    {
        content: 'This is a test comment',
        user_id: 1, 
        blogpost_id: 2
        },
];

const seedDatabase = async () => {
    await sequelize.sync({ force: true });
  
    await User.bulkCreate(userData, {
      individualHooks: true,
      returning: true,
    });

    await BlogPost.bulkCreate(blogPostData);

    await Comment.bulkCreate(commentData);
  
    process.exit(0);
  };
  
  seedDatabase();
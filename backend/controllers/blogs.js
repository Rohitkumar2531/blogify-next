const Blog = require('../models/Blog');
const { StatusCodes } = require('http-status-codes');

const likeBlog = async (req, res) => {
  const {
    params: { id: blogId },
    user: { userId },
  } = req;

  const blog = await Blog.findById(blogId);

  if (!blog) {
    throw new Error(`No blog with id ${blogId}`);
  }

  if (blog.likes.includes(userId)) {
    throw new Error('You already liked this blog post');
  }

  blog.likes.push(userId);
  await blog.save();

  res.status(StatusCodes.OK).json({ blog });
};

const unlikeBlog = async (req, res) => {
  const {
    params: { id: blogId },
    user: { userId },
  } = req;

  const blog = await Blog.findById(blogId);

  if (!blog) {
    throw new Error(`No blog with id ${blogId}`);
  }

  blog.likes = blog.likes.filter(
    (id) => id.toString() !== userId.toString()
  );
  await blog.save();

  res.status(StatusCodes.OK).json({ blog });
};

const addComment = async (req, res) => {
  const {
    params: { id: blogId },
    user: { userId },
    body: { text },
  } = req;

  if (!text) {
    throw new Error('Comment text cannot be empty');
  }

  const blog = await Blog.findById(blogId);

  if (!blog) {
    throw new Error(`No blog with id ${blogId}`);
  }

  blog.comments.push({ user: userId, text });
  await blog.save();

  res.status(StatusCodes.CREATED).json({ blog });
};

const getBlogComments = async (req, res) => {
  const {
    params: { id: blogId },
  } = req;

  const blog = await Blog.findById(blogId).populate('comments.user', 'name avatar');

  if (!blog) {
    throw new Error(`No blog with id ${blogId}`);
  }

  res.status(StatusCodes.OK).json({ comments: blog.comments });
};

const deleteComment = async (req, res) => {
  const {
    params: { id: blogId, commentId },
    user: { userId },
  } = req;

  const blog = await Blog.findById(blogId);

  if (!blog) {
    throw new Error(`No blog with id ${blogId}`);
  }

  const commentIndex = blog.comments.findIndex(
    (comment) => comment._id.toString() === commentId && comment.user.toString() === userId
  );

  if (commentIndex === -1) {
    throw new Error('Comment not found or user not authorized to delete it');
  }

  blog.comments.splice(commentIndex, 1);
  await blog.save();

  res.status(StatusCodes.OK).json({ msg: 'Comment deleted successfully' });
};

const getAllBlogs = async (req, res) => {
  const { author } = req.query;
  const queryObject = { status: 'published' };
  if (author) {
    queryObject.author = author;
  }
  console.log('QueryObject for getAllBlogs:', queryObject); // Add this line
  const blogs = await Blog.find(queryObject).populate('author', 'name avatar').sort('-createdAt');
  res.status(StatusCodes.OK).json({ blogs, count: blogs.length });
};

const getBlog = async (req, res) => {
  const {
    params: { id: blogId },
  } = req;

  const blog = await Blog.findOne({
    _id: blogId,
  }).populate('author', 'name avatar');
  if (!blog) {
    throw new Error(`No blog with id ${blogId}`);
  }
  res.status(StatusCodes.OK).json({ blog });
};

const createBlog = async (req, res) => {
  req.body.author = req.user.userId;
  if (!req.body.status) {
    req.body.status = 'published';
  }
  const blog = await Blog.create(req.body);
  res.status(StatusCodes.CREATED).json({ blog });
};

const getAllDrafts = async (req, res) => {
  const { author } = req.query;
  const queryObject = { status: 'draft' };
  if (author) {
    queryObject.author = author;
  }
  const blogs = await Blog.find(queryObject).populate('author', 'name avatar').sort('-createdAt');
  res.status(StatusCodes.OK).json({ blogs, count: blogs.length });
}

const updateBlog = async (req, res) => {
  const {
    body: { title, content, status, coverImage },
    user: { userId },
    params: { id: blogId },
  } = req;

  if (title === '' || content === '') {
    throw new Error('Title or content fields cannot be empty');
  }

  const blog = await Blog.findOne({ _id: blogId, author: userId });

  if (!blog) {
    throw new Error(`No blog with id ${blogId}`);
  }

  blog.title = title;
  blog.content = content;
  blog.status = status;
  if (coverImage !== undefined) {
    blog.coverImage = coverImage;
  }
  
  await blog.save();

  res.status(StatusCodes.OK).json({ blog });
};

const deleteBlog = async (req, res) => {
  const {
    user: { userId },
    params: { id: blogId },
  } = req;

  const blog = await Blog.findOneAndDelete({
    _id: blogId,
    author: userId,
  });

  if (!blog) {
    const existingBlog = await Blog.exists({ _id: blogId });
    const error = existingBlog
      ? new Error('You are not authorized to delete this blog')
      : new Error(`No blog with id ${blogId}`);
    error.statusCode = existingBlog ? StatusCodes.FORBIDDEN : StatusCodes.NOT_FOUND;
    throw error;
  }

  res.status(StatusCodes.OK).json({ msg: 'Blog deleted successfully' });
};

module.exports = {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllDrafts,
  likeBlog,
  unlikeBlog,
  addComment,
  getBlogComments,
  deleteComment,
};

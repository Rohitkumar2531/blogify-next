const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authentication');
const {
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
} = require('../controllers/blogs');

router.route('/').get(getAllBlogs).post(auth, createBlog);
router.route('/drafts').get(auth, getAllDrafts);
router
  .route('/:id')
  .get(getBlog)
  .delete(auth, deleteBlog)
  .patch(auth, updateBlog);

router.route('/:id/like').patch(auth, likeBlog);
router.route('/:id/unlike').patch(auth, unlikeBlog);
router.route('/:id/comments').post(auth, addComment).get(getBlogComments);
router.route('/:id/comments/:commentId').delete(auth, deleteComment);

module.exports = router;


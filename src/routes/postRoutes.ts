import express from "express";
import userAuth from "../middleware/authMiddleware.js";
import {
  aiResponseOnPost,
  commentPost,
  createPost,
  deletePost,
  getAiResponseOnPost,
  getComments,
  getPost,
  getPosts,
  getUserPost,
  likePost,

  replyPostComment,
} from "../controllers/PostController.js";

const router = express.Router();

// crete post
router.post("/create-post", userAuth, createPost);
// get posts
router.post("/", userAuth, getPosts);
router.post("/:id", userAuth, getPost);

router.post("/get-user-post/:id", userAuth, getUserPost);

// get comments
router.get("/comments/:postId", getComments);

//like and comment on posts
router.post("/like/:id", userAuth, likePost);

router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment/:id", userAuth, replyPostComment);
router.post("/ai-response/:id", aiResponseOnPost);
router.get("/ai-response/:id", getAiResponseOnPost);

//delete post
router.delete("/:id", userAuth, deletePost);

export default router;

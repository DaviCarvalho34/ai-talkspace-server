import express from "express";
import path from "path";
import {
    acceptRequest,
    friendRequest,
    getFriendRequest,
    suggestedFriends,
  updateUser,
} from "../controllers/UserController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

router.put("/update-user", userAuth, updateUser);
router.post("/suggested-friends", userAuth, suggestedFriends);
router.post("/get-friend-request", userAuth, getFriendRequest);
router.post("/friend-request", userAuth, friendRequest);
router.post("/accept-request", userAuth, acceptRequest);

export default router;

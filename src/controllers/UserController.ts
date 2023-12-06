import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from 'express';
import { createJWT } from "../utils/index.js";
import Users from "../models/UserModel.js";
import FriendRequest from "../models/FriendRequest.js";

export const updateUser = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, location, profileUrl, profession } = req.body;
    
        if (!(firstName || lastName || profession || location)) {
          next("Please provide all required fields");
          return;
        }
    
        const { userId } = req.body.user;
    
        const updateUser = {
          firstName,
          lastName,
          location,
          profileUrl,
          profession,
          _id: userId,
        };
        const user = await Users.findByIdAndUpdate(userId, updateUser, {
          new: true,
        });
    
        await user.populate({ path: "friends", select: "-password" });
        const token = createJWT(user?._id);
    
        user.password = undefined;
    
        res.status(200).json({
          sucess: true,
          message: "User updated successfully",
          user,
          token,
        });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
      }
})

export const friendRequest = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
    
        const { requestTo } = req.body;
    
        const requestExist = await FriendRequest.findOne({
          requestFrom: userId,
          requestTo,
        });
    
        if (requestExist) {
          next("Friend Request already sent.");
          return;
        }
    
        const accountExist = await FriendRequest.findOne({
          requestFrom: requestTo,
          requestTo: userId,
        });
    
        if (accountExist) {
          next("Friend Request already sent.");
          return;
        }
    
        const newRes = await FriendRequest.create({
          requestTo,
          requestFrom: userId,
        });
    
        res.status(201).json({
          success: true,
          message: "Friend Request sent successfully",
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "auth error",
          success: false,
          error: error.message,
        });
      }
});

export const acceptRequest = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.body.user.userId;
    
        const { rid, status } = req.body;
    
        const requestExist = await FriendRequest.findById(rid);
    
        if (!requestExist) {
          next("No Friend Request Found.");
          return;
        }
    
        const newRes = await FriendRequest.findByIdAndUpdate(
          { _id: rid },
          { requestStatus: status }
        );
    
        if (status === "Accepted") {
          const user = await Users.findById(id);
    
          user.friends.push(newRes?.requestFrom);
    
          await user.save();
    
          const friend = await Users.findById(newRes?.requestFrom);
    
          friend.friends.push(newRes?.requestTo);
    
          await friend.save();
        }
    
        res.status(201).json({
          success: true,
          message: "Friend Request " + status,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "auth error",
          success: false,
          error: error.message,
        });
      }
})

export const getFriendRequest = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
    
        const request = await FriendRequest.find({
          requestTo: userId,
          requestStatus: "Pending",
        })
          .populate({
            path: "requestFrom",
            select: "firstName lastName profileUrl profession -password",
          })
          .limit(10)
          .sort({
            _id: -1,
          });
    
        res.status(200).json({
          success: true,
          data: request,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "auth error",
          success: false,
          error: error.message,
        });
      }
});

export const suggestedFriends = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
    
        let queryObject = {};
    
        queryObject._id = { $ne: userId };
    
        queryObject.friends = { $nin: userId };
    
        let queryResult = Users.find(queryObject)
          .limit(15)
          .select("firstName lastName profileUrl profession -password");
    
        const suggestedFriends = await queryResult;
    
        res.status(200).json({
          success: true,
          data: suggestedFriends,
        });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
      }
});
import Posts from "../models/PostModel.js";
import { Request, Response, NextFunction } from 'express';
import asyncHandler from "express-async-handler";
import Users from "../models/UserModel.js";
import Comments from "../models/CommentModel.js";
import OpenAI from "openai";
import Ai from "../models/AiModel.js";

export const createPost =  asyncHandler(async(req:Request , res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
        const { description, image } = req.body;

        if(!description) {
            next("You must provide a description");
            return; 
        }

        const post = await Posts.create({
            userId,
            description,
            image
        });

        res.status(200).json({
            sucess: true,
            message: "Post created successfully",
            data: post,
          });

    } catch(error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
});

export const getPosts = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
        const { search } = req.body;
    
        const user = await Users.findById(userId);
        const friends = user?.friends?.toString().split(",") ?? [];
        friends.push(userId);
    
        const searchPostQuery = {
          $or: [
            {
              description: { $regex: search, $options: "i" },
            },
          ],
        };
    
        const posts = await Posts.find(search ? searchPostQuery : {})
          .populate({
            path: "userId",
            select: "firstName lastName location profileUrl -password s",
          })
          .sort({ _id: -1 });
    
        const friendsPosts = posts?.filter((post) => {
          return friends.includes(post?.userId?._id.toString());
        });
    
        const otherPosts = posts?.filter(
          (post) => !friends.includes(post?.userId?._id.toString())
        );
    
        let postsRes = null;
    
        if (friendsPosts?.length > 0) {
          postsRes = search ? friendsPosts : [...friendsPosts, ...otherPosts];
        } else {
          postsRes = posts;
        }
    
        res.status(200).json({
          sucess: true,
          message: "successfully",
          data: postsRes,
        });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
      }
});

export const getPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const post = await Posts.find(id).populate({
            path: "userId",
            select: "firstName lastName location profileUrl -password",
          });

          res.status(200).json({
            sucess: true,
            message: "successfully",
            data: post,
          });
    } catch(error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
});

export const getUserPost = asyncHandler (async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
    
        const post = await Posts.find({ userId: id })
          .populate({
            path: "userId",
            select: "firstName lastName location profileUrl -password",
          })
          .sort({ _id: -1 });
    
        res.status(200).json({
          sucess: true,
          message: "successfully",
          data: post,
        });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
      }
});

export const getComments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId } = req.params;
    
        const postComments = await Comments.find({ postId })
          .populate({
            path: "userId",
            select: "firstName lastName location profileUrl -password",
          })
          .populate({
            path: "replies.userId",
            select: "firstName lastName location profileUrl -password",
          })
          .sort({ _id: -1 });
    
        res.status(200).json({
          sucess: true,
          message: "successfully",
          data: postComments,
        });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
      }
});

export const likePost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;
    
        const post = await Posts.findById(id);
    
        const index = post.likes.findIndex((pid) => pid === String(userId));
    
        if (index === -1) {
          post.likes.push(userId);
        } else {
          post.likes = post.likes.filter((pid) => pid !== String(userId));
        }
    
        const newPost = await Posts.findByIdAndUpdate(id, post, {
          new: true,
        });
    
        res.status(200).json({
          sucess: true,
          message: "successfully",
          data: newPost,
        });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
      }
});

export const commentPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, from } = req.body;
        const { userId } = req.body.user;
        const { id } = req.params;
    
        if (comment === null) {
          return res.status(404).json({ message: "Comment is required." });
        }
    
        const newComment = new Comments({ comment, from, userId, postId: id });
    
        await newComment.save();
    
        //updating the post with the comments id
        const post = await Posts.findById(id);
    
        post.comments.push(newComment._id);
    
        const updatedPost = await Posts.findByIdAndUpdate(id, post, {
          new: true,
        });
    
        res.status(201).json(newComment);
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
      }
});

export const aiResponseOnPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const openai = new OpenAI({
    apiKey: "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"
  });

  
  const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{"role": "user", "content": `${req.body.question}`}],
      max_tokens: 100
  });



  try {
    const newAiResponse = new Ai({postId: id, comment: response.choices[0].message.content});

    await newAiResponse.save();
    //console.log(response.choices[0].message.content);

    return res.json({ message: response.choices[0].message.content }).status(201);
  } catch (error) {
    console.log(error)
  }   
});

export const getAiResponseOnPost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
 
  const { id } = req.params;

  try {  
    const aiResponse = await Ai.find({ postId: id });

    return res.json(aiResponse).status(200);

  } catch (error) {
    console.log(error)
  }   
});

export const replyPostComment = asyncHandler (async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body.user;
    const { comment, replyAt, from } = req.body;
    const { id } = req.params;

    if (comment === null) {
        return res.status(404).json({ message: "Comment is required." });
    }

    try {
        const commentInfo = await Comments.findById(id);

        commentInfo.replies.push({
        comment,
        replyAt,
        from,
        userId,
        created_At: Date.now(),
        });

        commentInfo.save();

        res.status(200).json(commentInfo);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
});

export const deletePost = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
    
        await Posts.findByIdAndDelete(id);
    
        res.status(200).json({
          success: true,
          message: "Deleted successfully",
        });
      } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
      }
})

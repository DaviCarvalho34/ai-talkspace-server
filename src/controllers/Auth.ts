import Users from "../models/UserModel.js";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from 'express';
import { compareString, createJWT, hashString } from "../utils/index.js";

export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { firstName, lastName, email, password } = req.body;

    if(!(firstName || lastName || email || password)) {
        next("fields are required");
        return;
    }

    try {
        const findUser = await Users.findOne({ email });

        if(findUser) {
            res.json({ status: 404, message: "erro" }).status(404);
            return;
        }

        const hashedpassword = await hashString(password);

        const user = await Users.create({
            firstName,
            lastName,
            email,
            password: hashedpassword
        });

        res.json({ status: 201, message: "user created", user }).status(201);
    } catch (error) {
        res.json({ status: 404, message: error.message }).status(404);
    }

});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { email, password } = req.body;

    try {

        if(!email || !password) {
            next("Fields are required");
            return
        }

        const user = (await Users.findOne({ email }).select("+password").populate({
            path: "friends",
            select: "firstName lastName location profileUrl -password"
        }));

        if(!user) {
            res.json({ status: 404, message: "user not found" }).status(404);
            return
        }

        const isMatch = await compareString(password, user?.password);

        if(!isMatch) {
            res.json({ status: 404, message: "invalid credentials" }).status(404);
            return
        }

        user.password = undefined;

        const token = createJWT(user?._id);

        res.status(201).json({
            success: true,
            message: "Login succesfully",
            user,
            token
        });

    } catch(error) {
        console.log(error);
        res.json({ status: 404, message: "invalid credentials" }).status(404);
    }

});
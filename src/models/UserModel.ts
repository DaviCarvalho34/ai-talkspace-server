import mongoose, { Document, Schema, Types } from "mongoose";

interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  location?: string;
  profileUrl?: string;
  profession?: string;
  friends: Types.ObjectId[];
  views: string[];
}

const userSchema: Schema<User> = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is Required!"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is Required!"],
    },
    email: {
      type: String,
      required: [true, "Email is Required!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required!"],
      minlength: [6, "Password length should be greater than 6 characters"],
      select: true,
    },
    location: { type: String },
    profileUrl: { type: String },
    profession: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    views: [{ type: String }],
  },
  { timestamps: true }
);

const Users = mongoose.model<User>("Users", userSchema);

export default Users;
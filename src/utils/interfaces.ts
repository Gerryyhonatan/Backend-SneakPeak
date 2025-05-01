import { Request } from "express";
import { Types } from "mongoose";
import { User } from "../models/user.model";

export interface IReqUser extends Request {
    user?: IUserToken;
};

export interface IUserToken extends Omit<User, "password" | "activationCode" | "isActive" | "email" | "fullName" | "profilePicture" | "username"> {
    id?: Types.ObjectId;
}

import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
import {renderMailHtml, sendMail} from "../utils/mail/mail";
import { EMAIL_SMTP_USER } from "../utils/env";

export interface User {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    profilePicture: string;
    isActive: boolean;
    activationCode: string;
    otp?: string;
    otpExpiration?: Date;
};


const Schema = mongoose.Schema;

// Yang menjadi struktur datanya yang nanti disimpan ke db
const UserSchema = new Schema<User>({
    fullName: {
        type: Schema.Types.String,
        required: true
    },
    username: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    role: {
        type: Schema.Types.String,
        enum: ["user", "admin"],
        default: "user"
    },
    profilePicture: {
        type: Schema.Types.String,
        default: "user.jpg"
    },
    isActive: {
        type: Schema.Types.Boolean,
        default: false
    },
    activationCode: {
        type: Schema.Types.String
    },
    otp: {
        type: Schema.Types.String
    },
    otpExpiration : {
        type: Schema.Types.Date
    }
}, {
    timestamps: true,
});

// Sebelum save apa dulu yang mau dilakukan
UserSchema.pre("save", function(next) {
    const user = this;
    if(!user.isModified("password")) {
        return next();
    }
    user.password = encrypt(user.password);
    next();
});

// Supaya password nya tidak muncul ke depan
UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.otp;
    delete user.otpExpiration;
    return user;
};

// Sebagai jembatan dari controller ke model
const UserModel = mongoose.model("User", UserSchema); // User adalah nama tabel nya
export default UserModel;
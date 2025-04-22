import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";

export interface User {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    profilePicture: string;
    isActive: boolean;
    activationCode: string;
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
        required: true
    },
    email: {
        type: Schema.Types.String,
        required: true
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
    }
}, {
    timestamps: true,
});

// Sebelum save apa dulu yang mau dilakukan
UserSchema.pre("save", function(next) {
    const user = this;
    user.password = encrypt(user.password);
    next();
});

// Supaya password nya tidak muncul ke depan
UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Sebagai jembatan dari controller ke model
const UserModel = mongoose.model("User", UserSchema); // User adalah nama tabel nya
export default UserModel;
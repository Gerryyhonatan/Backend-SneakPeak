import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { generateOTP, getOtpExpiration, hashOtp } from "../utils/otp";
import { renderMailHtml, sendMail } from "../utils/mail/mail";
import { EMAIL_SMTP_USER } from "../utils/env";

import {OAuth2Client} from "google-auth-library";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

type TRegister = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type TLogin = {
    identifier: string;
    password: string;
}

// Untuk validasi register
const registerValidateSchema = Yup.object({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().required(),
    password: Yup.string().required().min(6, "Password must be at least 6 characters").test("at-least-one-uppercase-letter", "Contains at least one uppercase letter", (value) => {
        if(!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
    }).test("at-least-one-number", "Contains at least one number", (value) => {
        if(!value) return false;
        const regex = /^(?=.*\d)/;
        return regex.test(value);
    }),
    confirmPassword: Yup.string().required().oneOf([Yup.ref("password"), ""], "Password not match"), // Jika password dan confirm password tidak sama maka akan error
});

const googleClient = new OAuth2Client();

export default {
    async register(req: Request, res: Response) {
        const { fullName, username, email, password, confirmPassword } = req.body as unknown as TRegister;
        
        const otp = generateOTP();
        const hashedOtp = hashOtp(otp); 
        const otpExpiration = getOtpExpiration(10); // expired dalam 10 menit

        // Setiap request dari req body akan di validasi oleh registerValidateSchema
        try {
            await registerValidateSchema.validate({
                fullName,
                username,
                email,
                password,
                confirmPassword,
            });
            
            // Jika validasi berhasil maka akan membuat user baru dan menyimpan ke db dan yang disimpan adalah fullName, username, email, dan password selain itu akan mengikuti default yang dibuat di user model
            const result = await UserModel.create({
                fullName,
                username,
                email,
                password,
                otp: hashedOtp,
                otpExpiration
            });

            // Kirimkan OTP yang asli (plain text) ke email
            const htmlContent = await renderMailHtml('verify-registration.ejs', { username, otp }); // Render email content
            await sendMail({
                from: EMAIL_SMTP_USER,
                to: email,
                subject: 'Please verify your account',
                html: htmlContent
            });

            response.success(res, result, "Success Registration");
        } catch (error) {

            response.error(res, error, "Failed Registration");
        }


    },

    async login(req: Request, res: Response) {
        const { identifier, password } = req.body as unknown as TLogin;
        try {
            // Ambil data user berdasarkan identifier -> ke email dan username
            const userByIdentifier = await UserModel.findOne({
                $or: [
                    {
                        email: identifier
                    },
                    {
                        username: identifier
                    }
                ]
            });

            if(!userByIdentifier) {
                return response.unauthorized(res, "User not found");
            };

            // Validasi password
            const validatePassword: boolean = encrypt(password) === userByIdentifier.password;

            if(!validatePassword) {
                return response.unauthorized(res, "User not found");
            }

            // Untuk generate token
            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role,
            });

            response.success(res, token, "Login Success");
        } catch (error) {
            response.error(res, error, "Login Failed");
        }
    },


    async me(req: IReqUser, res: Response) {
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            response.success(res, result, "Success get user profile");

        } catch (error) {
            response.error(res, error, "Failed get user profile");
        }
    },

    async verifyOtp(req: Request, res: Response) {
        const { email, otp } = req.body;
    
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return response.unauthorized(res, "User not found");
            }
    
            if (user.isActive) {
                return response.unauthorized(res, "User already activated");
            }
    
            const isMatch = hashOtp(otp) === user.otp;
            const isExpired = user.otpExpiration && user.otpExpiration < new Date();
    
            if (!isMatch || isExpired) {
                return response.unauthorized(res, "OTP invalid or expired");
            }
    
            user.isActive = true;
            user.otp = undefined;
            user.otpExpiration = undefined;
            await user.save();
    
            response.success(res, user, "Account verified successfully");
        } catch (error) {
            const err = error as Error;
            response.error(res, error, err.message);
        }
    },

    async loginGoogle(req: Request, res: Response) {
        const {idToken} = req.body;

        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            if(!payload) {
                return response.unauthorized(res);
            }

            const {email, name, picture} = payload;

            let user = await UserModel.findOne({email});

            if(!user) {
                user = await UserModel.create({
                    email,
                    fullName: name || "No Name",
                    username: email?.split("@")[0],
                    isActive: true,
                    profilePicture: picture || "user.jpg",
                    password: "",
                    role: "user",
                });
            }

            const token = generateToken({
                id: user._id,
                role: user.role,
            });

            response.success(res, token, "Login Success");
        } catch (error) {
            response.error(res, error, "Login Failed");
        }
    }
};
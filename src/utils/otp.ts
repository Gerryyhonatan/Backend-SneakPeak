import crypto from "crypto";

export const generateOTP = () => {
    // Generate 6-digit OTP sebagai string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};


export const getOtpExpiration = (minutes = 10): Date => {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60000);
};

// Hash OTP disimpan di DB
export const hashOtp = (otp: string): string => {
    return crypto.createHash("sha256").update(otp).digest("hex");
};

export const generateOTP = (): string => {
   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    return otp;
}
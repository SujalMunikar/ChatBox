import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Response } from "express";
import nodemailer from "nodemailer";

// Support functions shared across the auth flow: OTP creation, JWT handling, and email delivery.

export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

export const generateToken = async (payload: any) => {
  return jwt.sign(
    {
      ...payload,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "30d",
    }
  );
};

export const setCookieFromToken = async (res: Response, token: string) => {
  return res.cookie("jwt", token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, //30days in ms
    httpOnly: true, // users can not access this cookie via JS ani Prevents Cross-Site Scripting (XSS) XSS attack too hai
    sameSite: "strict", // CSRF Cross-Site Request Forgery (CSRF) attack
    // secure: process.env.NODE_ENV !== "development",
    secure: process.env.NODE_ENV === "production",
  });
};

export const deleteCookieForToken = async (res: Response) => {
  return res.cookie("jwt", "", { maxAge: 0 });
};

export const verifyToken = async (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};

export const sendOtpEmail = async (body: any, otp: string) => {
  try {
    // Configure a basic Gmail SMTP transport for verification mails.
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Correct host for Gmail
      port: 587, // Common port for TLS/STARTTLS
      secure: false,
      auth: {
        user: process.env.SENDER_EMAIL as string,
        pass: process.env.SENDER_PASSWORD as string,
      },
    });
    if (!otp) {
      // TODO
    }
    const htmlToSend = `
    <h1>OTP : ${otp}</h1>
    or, click the link below <p>http://localhost:5173/verify?id=${body.id}&email=${body.email}&otp=${otp}</p> <br/>
    <a href="http://localhost:5173/verify?id=${body.id}&email=${body.email}&otp=${otp}">CLICK HERE</a>
    `;
    await transporter.sendMail(
      {
        from: '"ChatterWave" <astromoon7777@gmail.com>', // sender address
        to: body?.email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: htmlToSend, // html body
      },
      (error, info) => {
        if (error) {
          console.log(error);
          return false;
        } else {
          console.log("Email sent", info.response, info);
          return true;
        }
      }
    );
  } catch (error) {
    console.log(error);
    return false;
  }
  // return "SENT";
};


// import jwt, { Secret, JwtPayload } from "jsonwebtoken";
//  import { Response } from "express";
//  import nodemailer from "nodemailer";
  
//  export const generateOTP = (): string => {
//    const otp = Math.floor(100000 + Math.random() * 900000).toString();
//    return otp;
//  };
 
//  export const generateToken = async (payload: any) => {
//    return jwt.sign(
//      {
//        ...payload,
//      },
//      process.env.JWT_SECRET as string,
//      {
//        expiresIn: "30d",
//      }
//    );
//  };
 
//  export const setCookieFromToken = async (res: Response, token: string) => {
//    return res.cookie("jwt", token, {
//      maxAge: 30 * 24 * 60 * 60 * 1000, //30days in ms
//      httpOnly: true, // users can not access this cookie via JS ani Prevents Cross-Site Scripting (XSS) XSS attack too hai
//      sameSite: "strict", // CSRF Cross-Site Request Forgery (CSRF) attack
//      // secure: process.env.NODE_ENV !== "development",
//      secure: process.env.NODE_ENV === "production",
//    });
//  };
 
//  export const deleteCookieForToken = async (res: Response) => {
//    return res.cookie("jwt", "", { maxAge: 0 });
//  };
 
//  export const verifyToken = async (token: string) => {
//    return jwt.verify(token, process.env.JWT_SECRET as string);
//  };
 
//  export const sendOtpEmail = async (body: any, otp: string) => {
//    try {
//      const transporter = nodemailer.createTransporter({
//        host: "smtp.gmail.com", // Correct host for Gmail
//        port: 587, // Common port for TLS/STARTTLS
//        secure: false,
//        auth: {
//          user: process.env.SENDER_EMAIL as string,
//          pass: process.env.SENDER_PASSWORD as string,
//        },
//      });
 
//      if (!otp) {
//        console.error("OTP is required for email sending");
//        return false;
//      }
 
//      // Use environment variable for sender name, fallback to "ChatterWave"
//      const senderName = process.env.SENDER_NAME || "ChatterWave";
//      const senderEmail = process.env.SENDER_EMAIL as string;
 
//      const htmlToSend = `
//      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
//        <h1 style="color: #333; text-align: center;">ChatterWave Verification</h1>
//        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
//          <h2 style="color: #6366f1; margin-top: 0;">Your OTP Code</h2>
//          <p style="font-size: 24px; font-weight: bold; color: #333; text-align: center; background-color: #fff; padding: 15px; border-radius: 4px; border: 2px solid #6366f1;">
//            ${otp}
//          </p>
//          <p style="color: #666; margin-top: 20px;">Enter this code in the verification form to complete your registration.</p>
//        </div>
//        <div style="text-align: center; margin: 20px 0;">
//          <a href="http://localhost:5173/verify?id=${body.id}&email=${body.email}&otp=${otp}"
//             style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
//            Verify Email
//          </a>
//        </div>
//        <p style="color: #999; font-size: 12px; text-align: center;">
//          If you didn't request this verification, please ignore this email.
//        </p>
//      </div>
//      `;
 
//      const mailOptions = {
//        from: `"ChatterWave" <astromoon7777@gmail.com>`, // sender address
//        to: body?.email, // list of receivers
//        subject: "ChatterWave - Email Verification", // Subject line
//        text: `Your OTP for ChatterWave verification is: ${otp}. Click the link to verify: http://localhost:5173/verify?id=${body.id}&email=${body.email}&otp=${otp}`, // plain text body
//        html: htmlToSend, // html body
//      };
 
//      const result = await transporter.sendMail(mailOptions);
//      console.log("Email sent successfully:", result.response);
//      return true;
//    } catch (error) {
//      console.error("Error sending email:", error);
//      return false;
//    }
//  };
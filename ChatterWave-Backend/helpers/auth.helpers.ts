import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Response } from "express";
import nodemailer from "nodemailer";

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
    secure: process.env.NODE_ENV !== "development",
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
        from: '"Abid Adhikari" <abidadhikari778@gmail.com>', // sender address
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

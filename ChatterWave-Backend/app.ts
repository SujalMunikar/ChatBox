import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { app, server } from "./socket/socket";
dotenv.config();

import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import messageRoute from "./routes/message.route";
import friendshipRoute from "./routes/friendship.route";
// import { generateKeys } from "./helpers/algorithms/rsa.helper";

// import selectTwoDistinctPrimes from "./helpers/algorithms/customRSA";

// const primes = selectTwoDistinctPrimes(1, 500);
// console.log(generateKeys(1, 9999));

const PORT = process.env.PORT || 8000;

//cookies
app.use(cookieParser());
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};
//cors
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

//routes
app.use("/auth", authRoute);
app.use("/message", messageRoute);
app.use("/user", userRoute);
app.use("/friendship", friendshipRoute);

app.get("/", (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ success: true, message: "Homepage" });
});

//error end point
app.get("*", (req: Request, res: Response) => {
  return res
    .status(404)
    .json({ success: false, message: "shutdown error" });
});
server.listen(PORT, () => {
  console.log(`Serving @ http://localhost:${PORT}`);
});

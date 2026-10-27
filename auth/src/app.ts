import express from "express";
import "express-async-errors";

import cookieSession from "cookie-session";


import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRotuer } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler,NotFoundError } from "@kafritickets/common";


 const app = express();
app.set("trust proxy",true)

app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test"
}))

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRotuer);
app.use(signupRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);


export {app}
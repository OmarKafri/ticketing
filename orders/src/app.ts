import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import { errorHandler,NotFoundError } from "@kafritickets/common";
import { currentUser } from "@kafritickets/common";

import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { deleteOrderRouter } from "./routes/delete";
import { indexOrderRouter } from "./routes";

 const app = express();
app.set("trust proxy",true)

app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test"
}))

app.use(currentUser);

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter)
app.use(showOrderRouter)

app.all("*", async (req, res) => { 
  throw new NotFoundError();
});

app.use(errorHandler);

export {app}
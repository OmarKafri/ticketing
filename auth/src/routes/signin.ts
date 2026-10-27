import express, { Router } from "express";
import { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { Password } from "../services/password";

import { BadRequestError,validateRequest } from "@kafritickets/common";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("You must add passowrd"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const exisitingUser = await User.findOne({ email });
    if (!exisitingUser) {
      throw new BadRequestError("Invalid Credentials!");
    }
    const passwordMatch = await Password.compare(
      exisitingUser.password,
      password,
    );
    if (!passwordMatch) {
      throw new BadRequestError("Invalid Credentials!");
    }
     const userJwt = jwt.sign(
          {
            id: exisitingUser.id,
            email: exisitingUser.email,
          },
          process.env.JWT_KEY!,
          {},
        );
    
        //store on session object
        (req as any).session = {
          jwt: userJwt,
        };
    
        res.status(200).send(exisitingUser);
  },
);

export { router as signinRouter };

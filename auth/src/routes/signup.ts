import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { validateRequest,BadRequestError } from "@kafritickets/common";


const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("password must be between 4 and 20 charcters")
      .isStrongPassword({ minSymbols: 1, minUppercase: 1, minNumbers: 3 })
      .withMessage(
        "Password needs to contain a least 1 symbol and 1 uppercase and 3 numbers",
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const exisitingUser = await User.findOne({ email });
    if (exisitingUser) {
      throw new BadRequestError("Email Already exists");
    }
    const user = User.build({ email, password });
    await user.save();

    //generate jwt

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!,
      {},
    );

    //store on session object
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  },
);

export { router as signupRouter };

import mongoose from "mongoose";
import { Password } from "../services/password";

//interface the describes the proprites for the user object

interface UserAttrs {
  email: string;
  password: string;
}

// an interface that describes the proprites that a uiser model has

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// an interface that describes the properties that a User document has

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userShema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id=ret._id; // assign to the _id, then delete it
        delete ret._id; 
        delete ret.password;
      },
      versionKey: false, // this is just as delete.ret.__v but there is configratuioon for it so why not
    },
  },
);

userShema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

userShema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

const User = mongoose.model<UserDoc, UserModel>("User", userShema);

export { User };

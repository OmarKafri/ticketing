//setup.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"

declare global {
  var signin: () => string[];
}
let mongo: any;

jest.mock("../nats-wrapper");

beforeAll(async () => {
  process.env.JWT_KEY = "ass";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  // build a JWT Payload. {id,email}
  const payload = { id: new mongoose.Types.ObjectId().toHexString(), email: "something@gmail.com" };
  // create The JWT!
  const token= jwt.sign(payload,process.env.JWT_KEY!);
  // build a session object {jwt: actual jwt token} why this structre ? because the jwt is encoded in base 64 and when its decoded it returns this structre object
  const session= {jwt:token};
  // turns that session into json
  const sessionJSON=JSON.stringify(session);
  // take that json and encode it back to base64
  const base64= Buffer.from(sessionJSON).toString("base64");
  //return the cookie with encoded data
  return [`session=${base64}`]
};

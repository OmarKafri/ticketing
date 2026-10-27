import request from "supertest";
import { app } from "../../app";

it("clears the cookie after signing out", async () => {
  const response_one = await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "Kafri-2004" })
    .expect(201);

  const cookie = response_one.get("Set-Cookie");
  if (cookie) {
    console.log(cookie[0]);
    
  }
  const response = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200);

  console.log(response.get("Set-Cookie"));
});

import request from "supertest";
import { app } from "../../app";


it("returns a 201 on succsesful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "Password-2004" })
    .expect(201);
});

it("returns a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "testtest.com", password: "Password-2004" })
    .expect(400);
});

it("returns a 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({ email: "testtest.com", password: "p" })
    .expect(400);
});

it("returns a 400 with missing email and password", async () => {
  await request(app).post("/api/users/signup").send({}).expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "Omar-kafri2004",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "Omar-kafri2004",
    })
    .expect(400);
});
it("set a cookie after succsefull signup", async () => {
  const reesponse= await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "Omar-kafri2004",
  }).expect(201);

 expect(reesponse.get("Set-Cookie")).toBeDefined()
});

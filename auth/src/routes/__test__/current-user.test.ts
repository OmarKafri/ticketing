import request from "supertest";
import { app } from "../../app";

it("response with details about the current user", async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie) //this to set the cookie because it is not a browser that can set cookie auto
    .send()
    .expect(200);
  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

    expect(response.body.currentUser).toBe(null)
});

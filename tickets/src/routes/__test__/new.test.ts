import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

import { natsWrapper } from "../../nats-wrapper";


it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});

  console.log(response.status);

  expect(response.status).not.toEqual(401);
});

it("returns an error if an invalid title is provieded", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "", price: 10 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ price: 10 })
    .expect(400);
});

it("return an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "dsadad", price: -10 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "dsadad" })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  // add in check to make sure ticket is saved to db
  let allTickets = await Ticket.find({}); // its going to be 0 becayse of the before each function in setup
  expect(allTickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "K", price: 10 })
    .expect(201);

  allTickets = await Ticket.find({});
  expect(allTickets.length).toEqual(1);
});

it("publishes an event",async ()=>{
    await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "K", price: 10 })
    .expect(201);


    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
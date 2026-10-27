import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("fetches the order", async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    title: "some Ticket",
  });
  await ticket.save();

  // make a request to build an order with the ticket
  const user = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to fetch the order
  const {body: fetchedOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});


it("return an error if one user tries to get the order for another", async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 20,
    title: "some Ticket",
  });
  await ticket.save();

  // make a request to build an order with the ticket
  const user = global.signin();
  const user2= global.signin();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);
  
  // make a request to fetch the order
   await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user2)
    .send()
    .expect(401);
});



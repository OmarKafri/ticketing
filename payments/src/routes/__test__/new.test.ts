import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@kafritickets/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payments";

jest.mock("../../stripe");
it("returns a 404 when purchaising an order that doenst exsist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asasd",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("return a 401 when purchasing an order that doesnt belong to the user", async () => {
  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    userId: "dsad",
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asasd",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    userId: userId,
    status: OrderStatus.cancelled,
    version: 0,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "asasd",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    userId: userId,
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();
  (stripe.charges.create as jest.Mock).mockResolvedValue({
    id: "stripe_charge_id",
  });
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual("usd");

  const payment=await Payment.findOne({orderId:order.id});
  expect(payment).not.toBeNull();
});

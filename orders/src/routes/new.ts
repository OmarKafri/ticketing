import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@kafritickets/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();
const EXPIRATION_SECONDS = 1 * 60; // 15 min

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => {
        return mongoose.Types.ObjectId.isValid(input);
      })
      .withMessage("Ticket id must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    // make sure that this ticket is not already reserverd
    // run query to look at all order, find an order where the ticket
    // is the ticket we just found above *and* the order status is *not* cancelled
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserverd");
    }
    // calculate an expirtation date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_SECONDS);

    // build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expirexAt: expiration,
      ticket: ticket,
    });
    await order.save();
    // Publish an event that an order is created

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      expiresAt: order.expirexAt.toISOString(),// this converts the date in waht the user timestamp is (could be JO or whatever time stamp) to a utc timestamp string
      userId: order.userId,
      version:order.version,
      ticket: { id: ticket.id, price: ticket.price },
    });

    res.status(201).send(order);
  },
);

export { router as newOrderRouter };

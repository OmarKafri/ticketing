import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@kafritickets/common";
import { QUEUE_GROUP_NAME } from "../queue-group-name";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListner extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message,
  ): Promise<void> {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("waiting this many millseconds to process this job", delay);
    await expirationQueue.add({ orderId: data.id }, { delay: delay });
    msg.ack();
  }
}

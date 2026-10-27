import { Listener, OrderStatus, Subjects } from "@kafritickets/common";
import { OrderCreatedEvent } from "@kafritickets/common";
import { QUEUE_GROUP_NAME } from "../queue-gruop-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message,
  ): Promise<void> {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();
    msg.ack();
  }
}

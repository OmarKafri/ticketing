import { Listener, OrderCreatedEvent, Subjects } from "@kafritickets/common";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-publisher";

export class OrderCreatedListner extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // find the ticket that the order is reserving
    let ticket = await Ticket.findById(data.ticket.id);
    // if no ticket throw new error
    if (!ticket) {
      throw new Error("Ticket Not Found");
    }
    // mark the ticket as bieng reserved by setting its orderId (so a ticket has an order id field and if its not empty that means it bieng reserved)
    ticket.set({ orderId: data.id });
    //save the ticket
    await ticket.save();
    // emit an event because ticket is technicaly update so the version number is changed
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price:ticket.price,
      title:ticket.title,
      userId:ticket.userId,
      version:ticket.version,
      orderId:ticket.orderId
    })


    //ack the message
    msg.ack();
  }
}

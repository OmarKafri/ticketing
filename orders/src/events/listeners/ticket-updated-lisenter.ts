import { Message } from "node-nats-streaming";
import { Subjects, TicketUpdatedEvent, Listener } from "@kafritickets/common";
import { Ticket } from "../../models/ticket";
import { QUEUE_GROUP_NAME } from "./queue-group-name";

export class TicketUpdatedListner extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME;
  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { title, price } = data;
    const ticket = await Ticket.findByEvent(data);
    if (!ticket) {
      throw new Error("Ticket Not Found");
    }
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}

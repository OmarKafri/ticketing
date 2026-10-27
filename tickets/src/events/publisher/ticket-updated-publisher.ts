import { Publisher,Subjects,TicketUpdatedEvent } from "@kafritickets/common";


export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    subject : Subjects.TicketUpdated=Subjects.TicketUpdated;
}
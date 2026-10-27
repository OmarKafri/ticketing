import { Publisher,PaymentCreatedEvent,Subjects } from "@kafritickets/common";

export class PaymentsCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated=Subjects.PaymentCreated;
}
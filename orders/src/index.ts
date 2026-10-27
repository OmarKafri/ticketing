import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListner } from "./events/listeners/ticket-updated-lisenter";
import { ExpirtaionCompleteListener } from "./events/listeners/expirtation-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL,
    );
    natsWrapper.client.on("close", () => {
      console.log("Nats connection closed!");
      process.exit();
    });
    
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListner(natsWrapper.client).listen();
    new ExpirtaionCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }
  app.listen(3000, () => {
    console.log(`Orders server is runnign  at server ${3000}`);
  });
};
start();

process.on("SIGINT", () => natsWrapper.client.close());
process.on("SIGTERM", () => natsWrapper.client.close());

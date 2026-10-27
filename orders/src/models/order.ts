import mongoose from "mongoose";
import { OrderStatus } from "@kafritickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { TicketDoc } from "./ticket";

export {OrderStatus}

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expirexAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expirexAt: Date;
  ticket: TicketDoc;
  version:number
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderShema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default:OrderStatus.Created // optitanil just to make sure the default is created 
    },
    expirexAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);
orderShema.set("versionKey","version")

orderShema.plugin(updateIfCurrentPlugin)
orderShema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderShema);

export { Order };

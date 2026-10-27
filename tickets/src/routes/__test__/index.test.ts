import request from "supertest";
import { app } from "../../app";

const createTicket = async (title: string, price: number) => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title,price});
};

it("can fetch list of tickets", async () => {
 await createTicket("Ticket 1",20);
 await createTicket("Ticket 2",30);
 await createTicket("Ticket 3",40);

 const response= await request(app)
 .get("/api/tickets")
 .send()
 .expect(200);

 expect(response.body.length).toEqual(3);
});

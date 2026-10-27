import { Ticket } from "../ticket";

// this test is for testing the concurrent control for version number of a ticket

it("implements concurrency control", async () => {
  //create an instance of a ticket
  const ticket = Ticket.build({
    title: "something",
    price: 5,
    userId: "123",
  });

  // save the ticket to the database
  await ticket.save();
  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  //make two seperate changes to the tickets fetpched
  firstInstance!.set({ price: 10 });

  secondInstance!.set({ price: 15 });
  // save the first fetched ticket
  await firstInstance!.save();
  

  // save the second fetched ticket
  try {
    await secondInstance!.save(); // this will returns an error because iam trying to save something that has same version in the db
  } catch (error) {
    return;
  }
  throw new Error("should not reach here");
  // save the second fetched ticket and expect an error
});

it("incrments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    price:20,
    title:"omar",
    userId:"123"
  });
  await ticket.save();

  
  expect(ticket.version).toEqual(0)
  await ticket.save();
  expect(ticket.version).toEqual(1)

  console.log(ticket)
});

export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({}),//not mockImplementation as in natswrapper because await 
  },
};

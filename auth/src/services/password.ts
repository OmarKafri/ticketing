import bcrypt from "bcryptjs";

export class Password {
   static saltingRound = 5;

  static async toHash(password: string) {
    const hashedPassword = await bcrypt.hash(password, this.saltingRound);
    return hashedPassword;
  }
  static async compare(storedPassword: string, suppliedPassword: string) {
    return await bcrypt.compare(suppliedPassword,storedPassword);
  }
}

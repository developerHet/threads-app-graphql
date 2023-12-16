import { prismaClient } from "../lib/db";
import { createHmac, randomBytes } from "node:crypto";
import JWT from 'jsonwebtoken';

const JWT_SECRET = "testsecret"

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface GetUserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  private static generateHash(salt: string, password: string) {
    const hashedPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    return hashedPassword;
  }

  public static async createUsre(payload: CreateUserPayload) {
    const { firstName, lastName, email, password } = payload;
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = UserService.generateHash(salt, password);
    return await prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        salt,
        password: hashedPassword,
      },
    });
  }

  private static async getUserByEmail(email: string) {
    return await prismaClient.user.findUnique({ where: { email } });
  }

  public static async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);

    if (!user) throw new Error("user not found");

    const userSalt = user.salt;
    const userHasPassowrd = UserService.generateHash(userSalt,password);

    if(userHasPassowrd!==user.password) throw new Error('Incorrect Passowrd');

    // Gen Token
    const token  = JWT.sign({id:user.id,email:user.email},JWT_SECRET);
    return token;
  }
}

export default UserService;

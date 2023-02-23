import { User } from "../../generated/schema";
import { ZERO } from "../utils";

export function ensureUser(id: string): User {
  const user = User.load(id);

  if (user) {
    return user;
  }

  return createUserFromAddress(id);
}

export function createUserFromAddress(id: string): User {
  const user = new User(id);
  user.totalStake = ZERO;
  user.save();

  return user;
}

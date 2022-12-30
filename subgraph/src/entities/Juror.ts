import { User } from "../../generated/schema";

export function ensureUser(id: string): User {
  let user = User.load(id);

  if (user) {
    return user;
  }

  return createUserFromAddress(id);
}

export function createUserFromAddress(id: string): User {
  const user = new User(id);
  user.save();

  return user;
}

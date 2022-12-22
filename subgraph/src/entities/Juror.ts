import { Juror } from "../../generated/schema";

export function ensureJuror(id: string): Juror {
  let juror = Juror.load(id);

  if (juror) {
    return juror;
  }

  return createJurorFromAddress(id);
}

export function createJurorFromAddress(id: string): Juror {
  const juror = new Juror(id);
  juror.save();

  return juror;
}

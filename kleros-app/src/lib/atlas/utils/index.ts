// eslint-disable-next-line max-len
// https://github.com/kleros/atlas/blob/12aafb39192f97d736111e0db90962a2fdadf49e/packages/api/src/user/core/user.dto.ts#L8
// case-sensitive
export enum SignupProduct {
  CourtV1 = "CourtV1",
  CourtV2 = "CourtV2",
  PohV2 = "PohV2",
  Foresight = "Foresight",
}

// https://github.com/kleros/atlas/blob/2272ebb53aecc4fecb69294a4162184cea17a5a1/packages/api/src/ipfs/datatypes.ts#L8
export enum IpfsProduct {
  CourtV1 = "CourtV1",
  CourtV2 = "CourtV2",
  Curate = "Curate",
  Escrow = "Escrow",
  Governor = "Governor",
  ProofOfHumanity = "ProofOfHumanity",
  Reality = "Reality",
  Test = "Test",
  TokenList = "TokenList",
}

// https://github.com/kleros/atlas/blob/2272ebb53aecc4fecb69294a4162184cea17a5a1/packages/api/src/ipfs/datatypes.ts#L20
export enum Roles {
  Evidence = "evidence",
  Generic = "generic",
  IdentificationVideo = "identification-video",
  CurateItemImage = "curate-item-image",
  CurateItemFile = "curate-item-file",
  Logo = "logo",
  MetaEvidence = "meta-evidence",
  Photo = "photo",
  Policy = "policy",
  Test = "test",
}

export * from "./loginUser";
export * from "./getNonce";
export * from "./createMessage";
export * from "./addUser";
export * from "./fetchUser";
export * from "./updateEmail";
export * from "./confirmEmail";
export * from "./uploadToIpfs";
export * from "./deleteUser";
export * from "./fetchIsSubscribed";

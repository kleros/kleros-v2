export enum Products {
  CourtV1 = "CourtV1",
  CourtV2 = "CourtV2",
  Curate = "Curate",
  Escrow = "Escrow",
  Governor = "Governor",
  ProofOfHumanity = "ProofOfHumanity",
  Reality = "Reality",
  Test = "Test",
}

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

export type DisputeRequest = {
  arbitrable: `0x${string}`;
  arbitrator: `0x${string}`;
  arbitrableDisputeID: number;
  externalDisputeID: number;
  templateId: number;
  templateUri: string;
};

type DisputeRequest = {
  arbitrator: string; // klerosCore address
  arbitrableDisputeID: number; // dispute id
  externalDisputeID: number; // Escrow transaction id
  templateId: number; // Escrow configuration
  templateUri: string; // empty
};

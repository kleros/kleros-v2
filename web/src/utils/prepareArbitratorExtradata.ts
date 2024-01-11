/**
 * @param subcourtID ID  of the court the dispute will take place in
 * @param noOfVotes Number of votes the dispute will have
 * @param disputeKit Id of the dispute kit to use
 * @returns arbitrator extradata passed in while creating a dispute or querying costs
 */
export const prepareArbitratorExtradata = (subcourtID: string, noOfVotes: number, disputeKit: number = 1) =>
  `0x${
    parseInt(subcourtID, 10).toString(16).padStart(64, "0") +
    noOfVotes.toString(16).padStart(64, "0") +
    disputeKit.toString(16).padStart(64, "0")
  }` as `0x{string}`;

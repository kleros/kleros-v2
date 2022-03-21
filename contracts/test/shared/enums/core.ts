export enum Period {
  Evidence, // Evidence can be submitted. This is also when drawing has to take place.
  Commit, // Jurors commit a hashed vote. This is skipped for courts without hidden votes.
  Vote, // Jurors reveal/cast their vote depending on whether the court has hidden votes or not.
  Appeal, // The dispute can be appealed.
  Execution, // Tokens are redistributed and the ruling is executed.
}

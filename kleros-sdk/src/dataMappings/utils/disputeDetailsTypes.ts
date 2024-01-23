import { z } from "zod";
import DisputeDetailsSchema, { AliasSchema, AnswerSchema, AttachmentSchema } from "./disputeDetailsSchema";

export { QuestionType } from "./disputeDetailsSchema";
export type DisputeDetails = z.infer<typeof DisputeDetailsSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type Alias = z.infer<typeof AliasSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;

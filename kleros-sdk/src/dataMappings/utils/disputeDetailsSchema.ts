import { z } from "zod";
import { isAddress } from "viem";
import { normalize } from "viem/ens";

export const ethAddressSchema = z.string().refine((value) => isAddress(value), {
  message: "Provided address is invalid.",
});

export const ensNameSchema = z
  .string()
  .refine((value) => typeof normalize(value) === "string" && value.endsWith(".eth"), {
    message: "Provided ENS name is invalid.",
  });

export const ethAddressOrEnsNameSchema = z.union([ethAddressSchema, ensNameSchema], {
  errorMap: () => ({ message: "Provided address or ENS name is invalid." }),
});

export enum QuestionType {
  Bool = "bool",
  Datetime = "datetime",
  MultipleSelect = "multiple-select",
  SingleSelect = "single-select",
  Uint = "uint",
}
export const QuestionTypeSchema = z.nativeEnum(QuestionType);

export const AnswerSchema = z.object({
  id: z.string().regex(/^0x[0-9a-fA-F]+$/), // should be a bigint
  title: z.string(),
  description: z.string(),
  reserved: z.boolean(),
});

export const AttachmentSchema = z.object({
  label: z.string(),
  uri: z.string(),
});

export const AliasSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  address: ethAddressOrEnsNameSchema,
});

const DisputeDetailsSchema = z.object({
  title: z.string(),
  description: z.string(),
  question: z.string(),
  type: QuestionTypeSchema,
  answers: z.array(AnswerSchema),
  policyURI: z.string(),
  attachment: AttachmentSchema,
  frontendUrl: z.string(),
  arbitrableChainID: z.string(),
  arbitrableAddress: ethAddressSchema,
  arbitratorChainID: z.string(),
  arbitratorAddress: ethAddressSchema,
  category: z.string(),
  lang: z.string(),
  specification: z.string(),
  aliases: z.array(AliasSchema).optional(),
  version: z.string(),
});

export default DisputeDetailsSchema;

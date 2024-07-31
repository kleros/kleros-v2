import { z } from "zod";
import { isAddress } from "viem";
import { normalize } from "viem/ens";

const isHexAddress = (str: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(str);

const isHexId = (str: string): boolean => /^0x[a-fA-F0-9]{1,64}$/.test(str);

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
  id: z
    .string()
    .regex(/^0x[0-9a-fA-F]+$/)
    .optional(), // should be a bigint
  title: z.string(),
  description: z.string(),
  reserved: z.boolean().optional(),
});

export const AttachmentSchema = z.object({
  label: z.string(),
  uri: z.string(),
});

export const AliasSchema = z.record(ethAddressOrEnsNameSchema);

const MetadataSchema = z.record(z.any());

const DisputeDetailsSchema = z.object({
  title: z.string(),
  description: z.string(),
  question: z.string(),
  answers: z.array(AnswerSchema),
  policyURI: z.string(),
  attachment: AttachmentSchema.optional(),
  frontendUrl: z.string().optional(),
  metadata: MetadataSchema.optional(),
  arbitratorChainID: z.string(),
  arbitratorAddress: z.string(), // should be changed for ethAddressSchema eventually, but some
  category: z.string().optional(),
  lang: z.string().optional(),
  specification: z.string().optional(),
  aliases: AliasSchema.optional(),
  version: z.string(),
});

export default DisputeDetailsSchema;

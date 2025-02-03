import { z } from "zod";
import { isAddress } from "viem";
import { normalize } from "viem/ens";

export const isHexAddress = (str: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(str);
export const isHexId = (str: string): boolean => /^0x[a-fA-F0-9]{1,64}$/.test(str);
export const isMultiaddr = (str: string): boolean =>
  /^\/(?:ip4|ip6|dns4|dns6|dnsaddr|tcp|udp|utp|tls|ws|wss|p2p-circuit|p2p-webrtc-star|p2p-webrtc-direct|p2p-websocket-star|onion|ipfs)(\/[^\s\/]+)+$|^ipfs:\/\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?$/.test(
    str
  );

export const ethAddressSchema = z.string().refine((value) => isAddress(value, { strict: false }), {
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
  id: z.string().regex(/^0x[0-9a-fA-F]+$/),
  title: z.string(),
  description: z.string(),
  reserved: z.boolean().optional(),
});

export const RefuseToArbitrateAnswer = {
  id: "0x0",
  title: "Refuse to Arbitrate / Invalid",
  description: "Refuse to Arbitrate / Invalid",
  reserved: true,
};

export const AttachmentSchema = z.object({
  label: z.string(),
  uri: z.string(),
});

export const AliasSchema = z.record(ethAddressOrEnsNameSchema);

const MetadataSchema = z.record(z.unknown());

const DisputeDetailsSchema = z.object({
  title: z.string(),
  description: z.string(),
  question: z.string(),
  answers: z.array(AnswerSchema),
  policyURI: z.string().refine((value) => isMultiaddr(value), {
    message: "Provided policy URI is not a valid multiaddr.",
  }),
  attachment: AttachmentSchema.optional(),
  frontendUrl: z.string().optional(),
  metadata: MetadataSchema.optional(),
  arbitratorChainID: z.string(),
  arbitratorAddress: ethAddressSchema,
  category: z.string().optional(),
  lang: z.string().optional(),
  specification: z.string().optional(),
  aliases: AliasSchema.optional(),
  version: z.string(),
});

export default DisputeDetailsSchema;

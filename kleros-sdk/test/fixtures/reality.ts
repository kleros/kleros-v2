import { getAddress, pad, type Address, type Hex } from "viem";
import { LogMock } from "../helpers/rpc";

export const REALITY_PROXY: Address = getAddress("0x2e39b8f43d0870ba896f516f78f57cde773cf805");
export const REALITY: Address = getAddress("0xe78996a233895be74a66f451f1019ca9734205cc");
export const ASKER: Address = getAddress("0xe0441ecf50205d3548456b29fde2a3010f9a61f3");
export const QUESTION_ID: Hex = "0xe2a3bd38e3ad4e22336ac35b221bbbdd808d716209f84014c7bc3bf62f8e3b39";

// Reality.eth separates question fields with U+241F.
export const BOOL_QUESTION = "Did the user break the rules?\u241fcontent moderation\u241fen_US";
export const SINGLE_SELECT_QUESTION = 'Who wins?\u241f"Alice","Bob"\u241fsports\u241fen_US';

export const TEMPLATES: Record<number, string> = {
  0: '{"title": "%s", "type": "bool", "category": "%s", "lang": "%s"}',
  2: '{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s", "lang": "%s"}',
};

const LOG_NEW_QUESTION =
  // eslint-disable-next-line max-len
  "event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created)";
const LOG_NEW_TEMPLATE =
  "event LogNewTemplate(uint256 indexed template_id, address indexed user, string question_text)";

export const newQuestionLog = ({
  address = REALITY_PROXY,
  questionId = QUESTION_ID,
  templateId = 0n,
  question = BOOL_QUESTION,
}: { address?: Address; questionId?: Hex; templateId?: bigint; question?: string } = {}): LogMock => ({
  address,
  event: LOG_NEW_QUESTION,
  args: {
    question_id: questionId,
    user: ASKER,
    template_id: templateId,
    question,
    content_hash: pad("0xc0"),
    arbitrator: REALITY,
    timeout: 86400,
    opening_ts: 1681263978,
    nonce: 3n,
    created: 1681263995n,
  },
});

export const newTemplateLog = (templateId: number, address: Address = REALITY_PROXY): LogMock => ({
  address,
  event: LOG_NEW_TEMPLATE,
  args: { template_id: BigInt(templateId), user: ASKER, question_text: TEMPLATES[templateId] },
});

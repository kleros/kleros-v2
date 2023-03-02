import { SQSHandler, SQSEvent, Context, SQSBatchResponse } from "aws-lambda";
import pino from "pino";
import * as dotenv from "dotenv";

dotenv.config();

const transport = pino.transport({
  target: "@logtail/pino",
  options: { sourceToken: process.env.LOGTAIL_SOURCE_TOKEN },
});

const logger = pino(transport);

/**
 * Event doc: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
 * @param {SQSEvent} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Context} context
 *
 * Return doc: https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting
 * @returns {SQSBatchResponse} object - SQS batch response
 */
export const handler: SQSHandler = async (
  event: SQSEvent,
  context: Context
) => {
  logger.info(event.Records, "Executing lambda handler on event");

  const response: SQSBatchResponse = {
    batchItemFailures: [
      {
        itemIdentifier: "helloWorld!",
      },
    ],
  };
  return response;
};

export default handler;

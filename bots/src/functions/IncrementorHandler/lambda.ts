import { SQSHandler, SQSEvent, Context, SQSBatchResponse } from "aws-lambda";

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
export const handler: SQSHandler = async (event: SQSEvent, context: Context) => {
  console.log("Executing lambda handler on event: %O", event.Records);
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

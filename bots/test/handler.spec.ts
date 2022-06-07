import handler from "../src/functions/IncrementorHandler/lambda";
import { SQSEvent, Context, SQSBatchResponse } from "aws-lambda";
import { expect } from "chai";


describe('Tests IncrementorHandler', function () {
    it('verifies successful response', async () => {
        const result = await handler(event, context, () => {})

        let batchResponse = result as SQSBatchResponse;
        expect(batchResponse.batchItemFailures[0].itemIdentifier).to.equal("helloWorld!");
    });
});

// See https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
const context: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    memoryLimitInMB: "",
    awsRequestId: "",
    logGroupName: "",
    logStreamName: "",
    getRemainingTimeInMillis: () => 0,
    done: () => {},
    fail: () => {},
    succeed: () => {}
}

// See https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-sqs
const event: SQSEvent = {
    Records: [
        {
            messageId: 'c80e8021-a70a-42c7-a470-796e1186f753',
            receiptHandle: 'AQEBJQ+/u6NsnT5t8Q/VbVxgdUl4TMKZ5FqhksRdIQvLBhwNvADoBxYSOVeCBXdnS9P+',
            body: '{"foo":"bar"}',
            attributes: {
                AWSTraceHeader: 'Root=1-5e58e4c3-71b539e3d6bd4aa29600bf67;Sampled=1',
                ApproximateReceiveCount: '3',
                SentTimestamp: '1529104986221',
                SenderId: '594035263019',
                ApproximateFirstReceiveTimestamp: '1529104986230',
            },
            messageAttributes: {
                testAttr: {
                    stringValue: '100',
                    binaryValue: 'base64Str',
                    stringListValues: [],
                    binaryListValues: [],
                    dataType: 'Number',
                },
                testAttr2: {
                    stringValue: '100',
                    binaryValue: 'base64Str',
                    dataType: 'Number',
                },
            },
            md5OfBody: '9bb58f26192e4ba00f01e2e7b136bbd8',
            eventSource: 'aws:sqs',
            eventSourceARN: 'arn:aws:sqs:us-west-2:594035263019:NOTFIFOQUEUE',
            awsRegion: 'us-west-2',
        },
    ],
};

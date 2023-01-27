/* eslint-disable import/no-anonymous-default-export */
import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const ESTUARI_API_KEY = "";
const ESTUARI_URL = "https://api.estuary.tech/content/add";

export const handler: Handler = async (event, context) => {
  if (event.body) {
    const newHeaders = event.headers;
    delete newHeaders.host;
    console.log(event);
    const response = await fetch(ESTUARI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ESTUARI_API_KEY}`,
        ...newHeaders,
      },
      body: event.body,
    });

    console.log(JSON.stringify(await response.json()));
    // body: JSON.stringify({
    //   jsonrpc: "2.0",
    //   method: "eth_blockNumber",
    //   params: [],
    //   id: 1,
    // }),
    // });
  }
  return {
    statusCode: 200,
    body: "hey",
  };
};

// function parseMultipartForm(event: HandlerEvent) {
//   return new Promise((resolve) => {
//     const fields = {};
//     const bb = busboy({ headers: event.headers });

//     bb.on(
//       "file",
//       (
//         fieldname: string,
//         filestream: any,
//         filename: string,
//         _: any,
//         mimeType: string
//       ) => {
//         console.log("typeof filestream", typeof filestream);
//         filestream.on("data", (data) => {
//           console.log("typeof data", typeof data);
//           fields[fieldname] = {
//             filename,
//             type: mimeType,
//             content: data,
//           };
//         });
//       }
//     );

//     bb.on("field", (fieldName: string, value: any) => {
//       console.log(fieldName, value);
//       fields[fieldName] = value;
//     });

//     console.log("event.body: ", event.body);
//     console.log("listener count: ", bb.listenerCount("field"));
//     bb.write(event.body, () => resolve(fields));
//   });
// }

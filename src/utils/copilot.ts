import * as vscode from 'vscode';
import {
    SAST_PROMPT,} from "./prompt";
import prompt from './prompt.json';
// const prompt = require('./prompt.json');

export async function doSASTScan(context: vscode.ExtensionContext, text: string) {
    // Prepend line numbers to the input text
    const numberedText = text.split('\n').map((line, index) => `${index + 1}: ${line}`).join('\n');
    // const responseSchema = {
    //     description: "Suggestion",
    //     type: SchemaType.OBJECT,
    //     properties: {
    //         suggestions: {
    //             type: SchemaType.ARRAY,
    //             properties: {
    //                 line: { type: SchemaType.NUMBER },
    //                 suggestion: { type: SchemaType.STRING },
    //             },
    //         },
    //     },
    // };

	  // select the 4o chat model
	  const [model] = await vscode.lm.selectChatModels({
		    vendor: 'copilot',
		    family: 'gpt-4o',
	  });

    const finalSASTPrompt = SAST_PROMPT(
        prompt.fortify_audit_expert.cmd,
        prompt.fortify_audit_expert.Act,
        prompt.fortify_audit_expert.Prompt,
        numberedText
    );

	  // init the chat message
	  const messages = [
		    vscode.LanguageModelChatMessage.User(finalSASTPrompt),
		    vscode.LanguageModelChatMessage.User(numberedText),
	  ];

	  // make sure the model is available
	  if (model) {

		    // send the messages array to the model and get the response
		    const chatResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
        console.log(chatResponse);
        var response = "";
        for await (const fragment of chatResponse.text) {
            response += fragment;
        }

		    // handle chat response
        return {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            message: JSON.parse(response.replaceAll('```python', '').replaceAll('```', '')),
        };
	  }

    // return parsedResponse;
    // const response = result.response.text();
    // return {
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //     message: JSON.parse(response.replaceAll('```', '').replace('json', '')),
    // };
};

// async function parseChatResponse(chatResponse: vscode.LanguageModelChatResponse) {
// 	  let accumulatedResponse = "";

// 	  for await (const fragment of chatResponse.text) {
// 		    accumulatedResponse += fragment;

// 		    // if the fragment is a }, we can try to parse the whole line
// 		    if (fragment.includes("}")) {
// 			      try {
// 				        const annotation = JSON.parse(accumulatedResponse);
// 				        // reset the accumulator for the next line
// 				        accumulatedResponse = "";
// 			      }
// 			      catch {
// 				        // do nothing
// 			      }
// 		    }
// 	  }
// }

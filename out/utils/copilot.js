"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doSASTScan = doSASTScan;
const vscode = __importStar(require("vscode"));
const prompt_1 = require("./prompt");
const prompt_json_1 = __importDefault(require("./prompt.json"));
// const prompt = require('./prompt.json');
async function doSASTScan(context, text) {
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
    const finalSASTPrompt = (0, prompt_1.SAST_PROMPT)(prompt_json_1.default.fortify_audit_expert.cmd, prompt_json_1.default.fortify_audit_expert.Act, prompt_json_1.default.fortify_audit_expert.Prompt, numberedText);
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
}
;
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
//# sourceMappingURL=copilot.js.map
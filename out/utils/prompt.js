"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAST_PROMPT = void 0;
const SAST_PROMPT = (cmd, Act, Prompt, Code) => `
    cmd:
    ${cmd}

    Act:
    ${Act}

    Prompt:
    ${Prompt}

    Code with Prepend line numbers for analyse:
    ${Code}

    Format of Response:
    {
        suggestions: [
            {
                line: <line number>,
                suggestion: <suggestion>
            }
        ]
    }

    You must return the response in JSON format like the example above.
`;
exports.SAST_PROMPT = SAST_PROMPT;
//# sourceMappingURL=prompt.js.map
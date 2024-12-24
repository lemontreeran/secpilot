export const SAST_PROMPT = (
    cmd: string,
    Act: string,
    Prompt: string,
    Code: string
) =>
  `
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

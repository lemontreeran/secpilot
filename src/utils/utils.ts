import * as vscode from 'vscode';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
const diagnosticCollection = vscode.languages.createDiagnosticCollection('secpilot');
import { doSASTScan } from './copilot';

export async function scanSASTFile(context: vscode.ExtensionContext) {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Please open a file to analyze.');
            return;
        }

        const text = editor.document.getText();
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Analyzing file for security vulnerabilities',
                cancellable: false,
            },
            async () => {
                try {
                    await scanAndApplyDiagnostics(context, editor.document.uri.fsPath, text);
                }
                catch (error: any) {
                    console.error(error);
                    vscode.window.showErrorMessage(`Error: ${error.message}`);
                }
            }
        );
    } catch(error: any) {
        console.error(error);

    }
}

export async function scanAndApplyDiagnostics(context: vscode.ExtensionContext, filePath: string, text: string) {
    try {
        const result = await doSASTScan(context, text);
        if (!result || !result.message) {
            console.error("Error: No result or message received from the scan.");
            return;
        }
        // Parse the result and create diagnostics
        const diagnostics = [];
        // const scanResults = JSON.parse(result.message);
        const scanResults = result.message;

        if (Array.isArray(scanResults.suggestions)) {
            for (const scanResult of scanResults.suggestions) {
                const lineNumber = scanResult.line - 1; // convert to 0-based index

                // Calculate the range using the line number
                const startPos = new vscode.Position(lineNumber, 0);
                const endPos = new vscode.Position(lineNumber, text.split('\n')[lineNumber].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(
                    range,
                    scanResult.suggestion,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }

            // Show the diagnostics in the editor
            const fileUri = vscode.Uri.file(filePath);
            diagnosticCollection.set(fileUri, diagnostics);
        }
    } catch (error: any) {
        console.error(`Error analyzing ${filePath}: ${text} ${error.message}`);
    }
}

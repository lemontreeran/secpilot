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
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanSASTFile = scanSASTFile;
exports.scanAndApplyDiagnostics = scanAndApplyDiagnostics;
const vscode = __importStar(require("vscode"));
const diagnosticCollection = vscode.languages.createDiagnosticCollection('secpilot');
const copilot_1 = require("./copilot");
async function scanSASTFile(context) {
    try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Please open a file to analyze.');
            return;
        }
        const text = editor.document.getText();
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing file for security vulnerabilities',
            cancellable: false,
        }, async () => {
            try {
                await scanAndApplyDiagnostics(context, editor.document.uri.fsPath, text);
            }
            catch (error) {
                console.error(error);
                vscode.window.showErrorMessage(`Error: ${error.message}`);
            }
        });
    }
    catch (error) {
        console.error(error);
    }
}
async function scanAndApplyDiagnostics(context, filePath, text) {
    try {
        const result = await (0, copilot_1.doSASTScan)(context, text);
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
                const diagnostic = new vscode.Diagnostic(range, scanResult.suggestion, vscode.DiagnosticSeverity.Warning);
                diagnostics.push(diagnostic);
            }
            // Show the diagnostics in the editor
            const fileUri = vscode.Uri.file(filePath);
            diagnosticCollection.set(fileUri, diagnostics);
        }
    }
    catch (error) {
        console.error(`Error analyzing ${filePath}: ${text} ${error.message}`);
    }
}
//# sourceMappingURL=utils.js.map
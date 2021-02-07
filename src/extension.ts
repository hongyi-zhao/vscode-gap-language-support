/**
 * COPYRIGHT 2021 Florian Eisele<feisele86@gmail.com>
 * 
 * COPYRIGHT 2017 Atishay Jain<contact@atishay.me> (vscode-allautocomplete)
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict'

import * as vscode from 'vscode';
import { DocumentManager } from './DocumentManager';
import { WordListClass, SymbolListClass, WordList } from './WordList';
import { TextDocument, Position, workspace, TextDocumentChangeEvent, Range, window } from "vscode";
import { GVars } from './symbols';
import { config } from 'process';
import { getPackedSettings } from 'http2';

let content = [];
/**
 * Utility class to manage the active document
 *
 * @class ActiveDocManager
 */
class ActiveDocManager {
    static beginTransaction() { }
    static endTransaction(updated: boolean) {
        // if (updated) {
        //     return;
        // }
        ActiveDocManager.updateContent();
    }
    static updateContent() {
        if (!window.activeTextEditor || !window.activeTextEditor.document) {
            return;
        }
        content = [];
        let doc = window.activeTextEditor.document;
        if (doc.languageId !== 'gap') {
            return;
        }
        for (let i = 0; i < doc.lineCount; ++i) {
            content.push(doc.lineAt(i).text);
        }
    }
    /**
     * Gets content replacement information for range replacement
     *
     * @static
     * @param {Range} r
     * @param {string} newText
     * @returns {new:string, old:string}
     *
     * @memberof ActiveDocManager
     */
    static replace(r: Range, newText: string, noOfChangesInTransaction: number): any {
        // Find old text
        let line: string = content[r.start.line] || "";
        // Get the closest space to the left and right;

        // Start is the actual start wordIndex
        let start: number;
        for (start = r.start.character - 1; start > 0; --start) {
            if ((line[start] || "").match(RegExp("[^\\w\\-_\\$\\u0080-\\uFFFF]+", "g"))) {
                start = start + 1;
                break;
            }
        }

        // End is the actual end wordIndex
        let end: number;
        let nLine = content[r.end.line] || "";
        for (end = r.end.character; end < nLine.length; ++end) {
            if ((nLine[end] || "").match(/\s/)) {
                end = end;
                break;
            }
        }

        let oldText = "";
        if (r.isSingleLine) {
            oldText = line.substring(start, end);
        } else {
            oldText = line.substring(start);
            for (let i = r.start.line + 1; i < r.end.line; ++i) {
                oldText += "\n" + content[i];
            }
            oldText += "\n" + nLine.substring(0, end);
        }
        const nwText = line.substring(start, r.start.character) + newText + nLine.substring(r.end.character, end);
        let updated = false;
        if (noOfChangesInTransaction === 1 && r.isSingleLine) {
            // Special case. Optimize for a single cursor in a single line as that is too frequent to do a re-read.
            const newLine = line.substring(0, r.start.character) + newText + nLine.substring(r.end.character);
            const n = newLine.split(window.activeTextEditor.document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n");
            content[r.start.line] = n[0];
            for (let i = 1; i < n.length; ++i) {
                content.splice(r.start.line + i, 0, n[i]);
            }
            updated = true;
        }
        return {
            old: oldText.split(RegExp("[^\\w\\-_\\$\\u0080-\\uFFFF]+", "g")),
            new: nwText.split(RegExp("[^\\w\\-_\\$\\u0080-\\uFFFF]+", "g")),
            updated: updated
        };
    }
    /**
     * Handle content changes to active document
     *
     * @static
     * @param {TextDocumentChangeEvent} e
     * @returns
     *
     * @memberof ActiveDocManager
     */
    static handleContextChange(e: TextDocumentChangeEvent) {
        const activeIndex = WordList.get(e.document);
        if (!activeIndex) {
            console.log("No index found");
            return;
        }
        if (e.document !== window.activeTextEditor.document) {
            console.log("Unexpected Active Doc. Parsing broken");
            return;
        }
        ActiveDocManager.beginTransaction();
        let updated = true;
        e.contentChanges.forEach((change) => {
            let diff = ActiveDocManager.replace(change.range, change.text, e.contentChanges.length);
            diff.old.forEach((string) => {
                WordList.removeWord(string, activeIndex, e.document);
            });
            diff.new.forEach((string) => {
                WordList.addWord(string, activeIndex, e.document);
            });
            updated = updated && diff.updated;
        });
        ActiveDocManager.endTransaction(updated);
    }
}

const AllKeywords = [       "Assert",           "Info",        "IsBound",           "QUIT",
  "TryNextMethod",         "Unbind",            "and",         "atomic",
          "break",       "continue",             "do",           "elif",
           "else",            "end",          "false",             "fi",
            "for",       "function",             "if",             "in",
          "local",            "mod",            "not",             "od",
             "or",           "quit",       "readonly",      "readwrite",
            "rec",         "repeat",         "return",           "then",
            "true",          "until",          "while" ];

var memoize = require("memoizee");
var keyword_lookup = memoize((word) => KeywordList.trie.get(word));

var KeywordList =  new SymbolListClass();

export function activate(context: vscode.ExtensionContext) {
    DocumentManager.init();

    AllKeywords.forEach((word) => KeywordList.addWord(word, vscode.CompletionItemKind.Keyword));
    GVars.forEach((word) => KeywordList.addWord(word, vscode.CompletionItemKind.Function));   

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (e.document.languageId !== 'gap') {
            return;
        }
        if (e.contentChanges.length > 0) {
            ActiveDocManager.handleContextChange(e);
        }
    }));
   
    context.subscriptions.push(workspace.onDidOpenTextDocument((document: TextDocument) => {
        DocumentManager.parseDocument(document);
    }));

    context.subscriptions.push(workspace.onDidCloseTextDocument((document: TextDocument) => {
        DocumentManager.clearDocument(document);
    }));

    for (let i = 0; i < workspace.textDocuments.length; ++i) {
        // Parse all words in this document
        DocumentManager.parseDocument(workspace.textDocuments[i]);
    }

    context.subscriptions.push(window.onDidChangeActiveTextEditor((newDoc: vscode.TextEditor) => {
        ActiveDocManager.updateContent();
    }));
    ActiveDocManager.updateContent();

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider('gap', new GAPCompletionItemProvider()));  
}
  
// this method is called when your extension is deactivated
export function deactivate() {}

class GAPCompletionItemProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken):
        vscode.CompletionItem[] | Thenable<vscode.CompletionItem[]> {

        const word = document.getText(document.getWordRangeAtPosition(position));

        let symbols = keyword_lookup(word.toLowerCase()); 
        
        let results = [];
        WordList.forEach((trie, doc) => {
            let words = trie.get(word);
            if (words) {
                results = results.concat(words);
            }
        });

        let clean: Array<vscode.CompletionItem> = [];
        const map = {}, skip="skip";
        // Do not show the same word in autocomplete.
        map[word] = skip;
        map[WordList.activeWord] = skip;
        // Deduplicate results now.
        results.forEach((item) => {
            let inserted = map[item.label];
            if ((item.count > 0)) { 
                if (!inserted && !symbols.some(elem => elem.label == item.label)) {
                    clean.push(item);
                    map[item.label] = item;
                    item.details = [item.detail];
                }   
            }
        });

        let completions: vscode.CompletionItem[] = symbols.concat(clean);
        return new Promise((resolve, reject) => resolve(completions));
   }   
}
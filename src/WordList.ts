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

'use strict';
import * as vscode from 'vscode';
import * as Trie from 'triejs';
import { CompletionItem } from './CompletionItem'

export class WordListClass extends Map<vscode.TextDocument, { find: Function }> {
    activeWord: string;
    /**
     * Add word to the autocomplete list
     *
     * @param {string} word
     * @param {any} trie
     * @param {vscode.TextDocument} document
     */
    addWord(word: string, trie: any, document: vscode.TextDocument) {
        word = word.replace(RegExp("[^\\w\\-_\\$\\u0080-\\uFFFF]+", "g"), '');
        // Active word is used to hide the given word from the autocomplete.
        this.activeWord = word;
        if (word.length >= 1) {
            let items = trie.find(word);
            let item: CompletionItem;
            items && items.some(elem => {
                if (elem.label === word) {
                    item = elem;
                    return true;
                }
            });
            if (item) {
                item.count++;
            } else {
                item = new CompletionItem(word, document.fileName);
                trie.add(word, item);
            }
        }
    }
    /**
     * Remove word from the search index.
     *
     * @param {string} word
     * @param {any} trie
     */
    removeWord(word: string, trie, document: vscode.TextDocument) {
        word = word.replace(RegExp("[^\\w\\-_\\$\\u0080-\\uFFFF]+", "g"), '');
        if (word.length >= 1) {
            let items = trie.find(word);
            let item: CompletionItem;
            items && items.some(elem => {
                if (elem.label === word) {
                    item = elem;
                    return true;
                }
            });
            if (item && item.label === word) {
                item.count--;
                if (item.count <= 0) {
                   // trie.remove(word);
                   item.count = 0;
                }
            }
        }
    }
}

export class SymbolListClass extends Map<vscode.TextDocument, { find: Function }> {
    trie: any;

    constructor() {
        super();
        this.trie = new Trie({ enableCache: false, maxCache: 100000, returnRoot: true }); 
    }

    addWord(word: string, kind: vscode.CompletionItemKind) {
        word = word.replace(RegExp("[^\\w\\-_\\$\\u0080-\\uFFFF]+", "g"), '');
        // Active word is used to hide the given word from the autocomplete.
        if (word.length >= 1) {
            let items = this.trie.find(word);
            let item: vscode.CompletionItem;
            items && items.some(elem => {
                if (elem.label === word) {
                    item = elem;
                    return true;
                }
            });
            if (!item)  {
                item = new vscode.CompletionItem(word, kind);
                this.trie.add(word, item);
            }
        }
    }
}

export var WordList = new WordListClass();


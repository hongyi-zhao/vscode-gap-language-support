#!/usr/bin/env bash

#https://github.com/feisele/vscode-gap-language-support/issues/5
#$ proxychains-ng-http npm install
npm install

# Check the available scripts:
#$ npm run
#Scripts available in gap-language-support@0.1.1 via `npm run-script`:
#  vscode:prepublish
#    npm run compile
#  compile
#    tsc -p ./
#  lint
#    eslint . --ext .ts,.tsx
#  watch
#    tsc -watch -p ./

# Then run the following:
#$ proxychains-ng-http npm run vscode:prepublish
npm run vscode:prepublish

#$ ln -sfr vscode-gap-language-support.git/ ~/.vscode/extensions/
#https://github.com/hongyi-zhao/english-wordlist#readme
find ~/.vscode/extensions -xtype l -exec rm {} +
ln -sfr $(pwd) ~/.vscode/extensions/

#$ npm help install|grep -A4 -B2 -- -g
#       • npm install (in a package directory, no arguments):
#           Install the dependencies in the local node_modules folder.
#           In global mode (ie, with -g or --global appended to the command),
#           it installs the current package context (ie, the current working
#           directory) as a global package.
#           By default, npm install will install all modules listed as
#           dependencies in npm help package.json.

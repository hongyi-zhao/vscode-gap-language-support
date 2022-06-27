# GAP language support

This extension provides support for syntax highlighting and basic autocompletion in [GAP](https://github.com/gap-system/gap) files. It provides autocompletion for GAP keywords and functions, including all official packages, as well as text-based completion based on all currently open GAP files.

This extension is based on [vscode-allautocomplete](https://github.com/atishay/vscode-allautocomplete) and [language-gap](https://github.com/ChrisJefferson/language-gap).

## Build from source

```shell
$ git clone https://github.com/hongyi-zhao/vscode-gap-language-support.git 
$ cd vscode-gap-language-support
$ ./create_symbols.sh
$ ./bundling-extension.sh
```


## Things to note

Highlighting and completion is provided for **all** GAP packages included in the standard GAP distribution. 

## Screenshots

![Screenshot](https://github.com/feisele/vscode-gap-language-support/raw/master/images/sample.png)
![Screenshot](https://github.com/feisele/vscode-gap-language-support/raw/master/images/sample2.png)

## Links

* https://www.gap-system.org




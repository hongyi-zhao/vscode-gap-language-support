#!/usr/bin/env bash

#https://gap-system.slack.com/archives/C0PCH4UP2/p1656500219160889?thread_ts=1656084563.706089&cid=C0PCH4UP2
#the "traditional" solution to such a problem would be this: take your FOO.xml file, copy it to FOO.xml.in, and replace the bit that you want to substitute later by a unique pattern, say @GAPGLOBALS@. Then use whatever dumb tool you like (sed, awk, GAP, ...) to read FOO.xml.in, search for @GAPLOBALS@, and replace just that with the new content; write the output to FOO.xml. Only thing to keep in mind: you should edit FOO.xml.in not FOO.xml ...

gap -q --quitonbreak << EOF
# https://gap-system.slack.com/archives/C0PCH4UP2/p1656510349378729?thread_ts=1656084563.706089&cid=C0PCH4UP2
LoadAllPackages();;
lst := Filtered(NamesGVars(), x -> IsValidIdentifier(x) and not x in GAPInfo.Keywords and not '@' in x);;

# The following settings are required when testing is not performed under the source package directory
# ChangeDirectoryCurrent(UserHomeExpand("~/Public/repo/github.com/feisele/vscode-gap-language-support.git"));

symbols_ts := Filename( Directory("./src"), "symbols.ts" );
f1:=OutputTextFile(symbols_ts,false);
WriteLine(f1, Concatenation("export const GVars = ", String(lst), ";"));
__tmp_symbols := Filename( DirectoryCurrent(), "__tmp.symbols" );
f2:=OutputTextFile(__tmp_symbols,false);
WriteAll(f2, JoinStringsWithSeparator(lst, "|"));
EOF


# https://groups.google.com/g/comp.unix.shell/c/8p4QIvPN89I
awk 'FNR==NR { a = $0; next } match($0,/^(\s*<string>\\b\().*IsGroup.*(\)\\b<\/string>$)/,c) {print c[1] a c[2]; next } 1 ' __tmp.symbols ./syntaxes/gap.tmLanguage > ./syntaxes/gap.tmLanguage2 
mv ./syntaxes/gap.tmLanguage2 ./syntaxes/gap.tmLanguage
rm ./__tmp.symbols


#$ info sed|egrep -A3 '^[^[:alpha:]]+((:(blank|space))|\\[ts])'
#'[:blank:]'
#     Blank characters: space and tab.

#'[:cntrl:]'
#--
#'[:space:]'
#     Space characters: in the 'C' locale, this is tab, newline, vertical
#     tab, form feed, carriage return, and space.

#--
#'[:space:]' are special within LIST and represent collating symbols,
#equivalence classes, and character classes, respectively, and '[' is
#therefore special within LIST when it is followed by '.', '=', or ':'.
#Also, when not in 'POSIXLY_CORRECT' mode, special escapes like '\n' and
#'\t' are recognized within LIST.  *Note Escapes::.

#'[.'
#     represents the open collating symbol.
#--
#'\s'
#     Matches whitespace characters (spaces and tabs).  Newlines embedded
#     in the pattern/hold spaces will also match:

#--
#'\t'
#     Produces or matches a horizontal tab (ASCII 9).

#'\v'
#--
#     '\t', '\v', '\x').  These can cause similar problems with scripts
#     written for other 'sed's.



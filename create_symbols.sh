#!/bin/sh

echo "LoadAllPackages();; lst := Filtered(NamesGVars(), x -> IsValidIdentifier(x) and not x in GAPInfo.Keywords);; f1:=OutputTextFile(\"./src/symbols.ts\",false);; WriteLine(f1, Concatenation(\"export const GVars = \", String(lst), \";\"));; f2:=OutputTextFile(\"./__tmp.symbols\",false);; WriteAll(f2, JoinStringsWithSeparator(lst, \"|\"));;" | gap -q

sed  "s/<string>\\\\b(.*IsGroup.*)\\\\b<\\/string>/<string>\\\\b($(cat ./__tmp.symbols))\\\\b<\\/string>/g" ./syntaxes/gap.tmLanguage > ./syntaxes/gap.tmLanguage2
mv ./syntaxes/gap.tmLanguage2 ./syntaxes/gap.tmLanguage
rm ./__tmp.symbols


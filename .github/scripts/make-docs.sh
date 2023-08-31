#! /bin/bash

OUTDIR=./docs_html
LAYOUT=.github/scripts/layout

rm -rf docs_html
rm -rf build

mkdir build
cp README.md meta.json build
cp -r docs build

npx generate-md --input ./build --output $OUTDIR --layout $LAYOUT

mv ./docs_html/README.html ./docs_html/index.html


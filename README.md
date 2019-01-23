# Doczify

A generator and migration (from GitBook) tool for docsify.

The doczify CLI can copy and generate files. It's controlled via a YAML config file.
You specify the location of you docs and it will copy and transform the files into a build directory.

## Why?

For these use cases:

- migrate from GitBook to docsify (including some plugins) without changing any md file
  - [code fragments](https://github.com/cucumber-ltd/gitbook-plugin-snippet)
  - [javadeps](https://github.com/Marc--Olivier/gitbook-plugin-javadeps)
  - [codetabs](https://plugins.gitbook.com/plugin/codetabs)
- copy files automatically which are used for embeded files out of the `docs` folder
  - there is a [similar issue #485](https://github.com/docsifyjs/docsify/issues/485) but it's easy to extend it so it will be fixed as well
- control via a YAML config file, no need to write any HTML
- auto detecting of languages in code snipppets in order to load the prism language module
- variable replacement using `{{foobar}}` syntax

## Usage

- clone this repo and run inside the directory `npm install && npm link .` (not available yet on npm)
- next to your README.md (and probbaly SUMMARY.md) create a file which is called `docsify.yml` and add this content:

```yml
copy:
  docs: docs # directory where all docs are located (except README.md and SUMMARY.md)
  README.md: README.md
  SUMMARY.md: SUMMARY.md # this is the navigation for GitBook
variables: # optonal define variables
  - book.apiVersion: '1.2.3' # usage in markdown {{book.apiVersion}}
docsify: # this object is passed as it is to docsify
  homepage: README.md
  loadSidebar: SUMMARY.md
scripts: # script tags which are appended to the index.html
  - //cdn.jsdelivr.net/npm/docsify-pagination@2.3.5/dist/docsify-pagination.min.js
  - //cdn.jsdelivr.net/npm/docsify-copy-code@2.0.2
  - //cdn.jsdelivr.net/npm/docsify-tabs@1
styles: # style tags which are appended to the index.html
  - //cdn.jsdelivr.net/npm/docsify-themeable@0/dist/css/theme-simple.css
```

- run `doczify serve`

## TODO

- move logic for javadeps to a docsify plugin
- [fix #485](https://github.com/docsifyjs/docsify/issues/485)
- off-topic: docsify plugin which allows to use custom HTML layout

JSP-JS [![Build Status](https://travis-ci.org/ThisPlace/jsp-js.svg?branch=master)](https://travis-ci.org/ThisPlace/jsp-js)
======

JSP-JS is a Java Server Pages rendering library for nodejs.

To render JSP to HTML, simply remove Java code. Currently supported tags are:

- `<%@include%>`
- `<%@taglib tagdir="[path]">`
- `<%=..%>`
- `${..}`
- `<c:if>`
- `<c:else>`
- `<c:choose>`
- `<c:when>`
- `<c:otherwise>`
- `<c:forEach>`
- `<c:set>`
- `<jsp:body>`
- `<jsp:doBody>`
- `<jsp:attribute>`
- `<jsp:invoke>`

## Tests

Run:

```hash
npm run demo
```

Then open your browser to ```http://localhost:8080/page/test.jsp```.

## Usage

Import he renderer like so:

```js
const JSPJs = require('jsp-js').Renderer;

const jsp = new JSPJs(options);
jsp.render('file', data);
```

The renderer also provides a promise wrapper for easy integration in
promise-based code:

```js
jsp.renderPromise('file', data).then((html) => console.log(html));
```

### Constructor options

The following options can be provided to the constructor:

- `root`: the root path where templates are
- `tags`: a library of custom tags
- `globals`: globally available data

### Custom tags

Custom tags can be handled by providing them to the constructor options. These are
anonymous functions that take the arguments:

- `node` the tag node being evaluated
- `index` the position of the node in the jsp template. Useful for debugging
- `data` the current context data (as an object)
- `renderer` the instanciated renderer

A custom tag handler must return a **string**.

## Usage with Express

Please read the code of `test/tests.js` to have an idea of how to integrate this
library with Express.

# Express </> HTMX Components

Experimental Express powered HTMX component framework

## What is this?

This is a very simple library to make developing HTMX based apps as pleasing as
possible in Express. You should be able to just focus on writing an HTMX
response (it's basically how HTMX works) and use the same code to compose
components in a page.

To achieve this components are both web pages (they have a URL) and functions
(they return HTML). This basically allow HTMX to **just work™** - the component
can update itself by making a request to its own URL.

## What is HTMX

If you don't know HTMX I strongly encourage you to check it out:
[https://htmx.org/](https://htmx.org/).

HTMX is basically a re-thinking of AJAX. Instead of returning JSON and using
javascript to insert the data into the document HTMX returns HTML as data.

With HTMX you can basically create reactive web apps without writing any
javascript.

## OK, so what exactly is a COMPONENT?

Here's an example of a simple counter component:

```js
const counter = component.get("/counter", ({ id, count }) => {
  return html` <div id="count-${id}">
    <h3>${count}</h3>
    <button hx-get="/counter/incr?id=${id}&count=${count}" hx-target="#count-${id}" hx-swap="outerHTML">+1</button>
  </div>`;
});

const incr = component.get("/counter/incr", ({ id, count }) => {
  let n = count;
  n++;
  return counter.html({ id, count: n });
});

module.exports = { counter, incr };
```

Each component exports an object with two properties:

- `html` - A function that returns the rendered component
- `route` - An Express route that serves the rendered component

All query params are converted to arguments/props passed to the
component. This is what makes the component usable both as an endpoint
and a function.

## Docs

- [Getting Started](./docs/getting-started.md)
- [API Documentation](./docs/api.md)

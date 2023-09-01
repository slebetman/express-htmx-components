# Express </> HTMX Components

## Component API

### component.init( )

```js
component.init(app, componentsDir, options);
```

Returns a `Promise`.

Recursively loads components.

```js
const express = require('express');
const component = require('express-htmx-components');

const app = express();

component.init(app,'./components')
    .then(() => app.listen(8888))
    .catch(err) => console.error(err));
```

Arguments:

- **app** = Express application instance
- **componentsDir** = directory to scan for components
- **options** = options object:
  - **js** = array of additional javascript files to include
  - **css** = array of css files to include
  - **htmx** = htmx library to include. Defaults to "https://unpkg.com/htmx.org@1.9.4"

Adding global js and css files to your app:

```js
component.init(app, "./components", {
  js: ["https://unpkg.com/htmx.org/dist/ext/json-enc.js", "https://unpkg.com/htmx.org/dist/ext/alpine-morph.js"],
  css: ["https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css"],
});
```

Overriding default htmx library to include:

```js
component.init(app, "./components", {
  htmx: "/static/js/htmx.js",
});
```

### component.get( )

```js
component.get(path, ... middleware?, componentDefinition)
```

Returns a `Component`.

Defines a htmx component.

```js
const component = require("express-htmx-components");

const getHello = component.get("/hello", () => "<h1>Hello World</h1>");

module.exports = {
  getHello,
};
```

Arguments:

- **path** = URL path for the component
- **middleware** = optional, zero or more Express or Connect middlewares
- **componentDefinition** = function defining the component (may be `async`)

The `componentDefinition` is just a function that returns an HTML string.

A single object will be passed to it when called containing all the props for
the component. Query params, request bodies and path params are all
automatically converted to props,

#### Passing query params

```js
const testing = component.get("/testing", ({ n }) => {
  return html` <h1>Number is: ${n}</h1> `;
});
```

Calling the component directly:

```js
console.log(testing.html({ n: 100 }));
```

Or calling from the browser: `http://localhost:8888/testing?n=100`

Generates:

```html
<h1>Number is: 100</h1>
```

#### Path parameter

To use a path parameter you need to pass a prop with the same name:

```js
const testing = component.get("/testing/:n", ({ n }) => {
  return html` <h1>Number is: ${n}</h1> `;
});
```

This allows you to call it with: `http://localhost:8888/testing/100`

#### Accessing request session

A special `session` prop is passed into components which is linked to
`req.session`:

```js
const testing = component.get("/testing", ({ session }) => {
  return html` <h1>Hello ${session.user.name}</h1> `;
});
```

#### Redirects

To return a `302` redirect you can pass an additional parameter to your
`componentDefinition` to access the `redirect()` function:

```js
const testing = component.get("/testing", ({ session }, hx) => {
  // ^ extra parameter
  if (!session.user) {
    return hx.redirect("/login");
  }

  return html` <h1>Hello ${session.user.name}</h1> `;
});
```

#### Accessing HTTP headers

The additional `hx` parameter also allows you to read the request headers and
set the response headers using the `hx.get()` and `hx.set()` functions:

```js
const testing = component.get("/testing", ({}, hx) => {
  hx.set("HX-Refresh", true); // set the HX-Refresh header

  // get user agent:
  return html` <div>User agent = ${hx.get("User-Agent")}</div> `;
});
```

### component.post( )

```js
component.post(path, ... middleware?, componentDefinition)
```

Returns a `Component`.

Defines a htmx component. Behaves similar to `component.get()` but handles a POST request.

```js
const component = require("express-htmx-components");

const postHello = component.post("/hello", () => "<h1>Hello World</h1>");

module.exports = {
  postHello,
};
```

#### Post body

Assuming you're using `express.urlencoded()` as the body parser, you can access
post body the same way you access query params:

```js
const testingGet = component.get("/testing", () => {
  return html`
    <div id="theNumber">
      <form hx-post="/testing" hx-target="#theNumber">
        <input type="text" name="n" />
        <button type="submit">Set Number</button>
      </form>
    </div>
  `;
});

const testingPost = component.post("/testing", ({ n }) => {
  return html` <h1>Number is: ${n}</h1> `;
});
```

Accessing `http://localhost:8888/testing` will call the `testingGet` component
but submitting the form will call the `testingPost` component.

### component.put( )

```js
component.put(path, ... middleware?, componentDefinition)
```

Returns a `Component`.

Defines a htmx component. Behaves similar to `component.post()` but handles a PUT request.

### component.patch( )

```js
component.patch(path, ... middleware?, componentDefinition)
```

Returns a `Component`.

Defines a htmx component. Behaves similar to `component.post()` but handles a PATCH request.

### component.del( )

```js
component.patch(path, ... middleware?, componentDefinition)
```

Returns a `Component`.

Defines a htmx component. Behaves similar to `component.get()` but handles a DELETE request.

### component.use( )

```js
component.use(path, ... middleware?, componentDefinition)
```

Returns a `Component`.

Defines a htmx component similar to the other component definition methods
however this matches all request methods (get/post/put etc.).

Arguments:

- **path** = URL path for the component
- **middleware** = optional, zero or more Express or Connect middlewares
- **componentDefinition** = function defining the component (may be `async`)

#### Request method

To figure out which method was used to call the component an additional property
`method` is passed in as a prop:

```js
const testing = component.use("/testing", ({ method, n }) => {
  if (method === "POST") {
    return html`<h1>${n}</h1>`;
  } else {
    return html`
      <form hx-post="/testing" hx-target="closest div">
        <input type="text" name="n" />
        <button type="submit">Submit</button>
      </form>
    `;
  }
});
```

Note that the method is passed in as UPPERCASE.

## HTML Template Tags

To prevent XSS vulnerability and also for improve developer experience you
should use HTML tagged template strings instead of plain template strings.
When used in conjunction with VSCode plugins such as
[Inline HTML](https://marketplace.visualstudio.com/items?itemName=pushqrdx.inline-html)
it provides HTML syntax support inside template literals.

### html

The `html` tag escapes HTML special characters such as `<` to `&lt;` to prevent
XSS attacks from user input.

```js
const { html } = require("express-htmx-components/tags");

const data = '<script>alert("HA!")</script>';
console.log(html`Data is ${data}`);
```

Will output:

```html
Data is &lt;script&gt;alert(&quot;HA!&quot;)&lt;/script&gt;
```

Since htmx components are just HTML strings the `html` tag allows you to insert
raw HTML into the template string using a special `$${}` substitution:

```js
const { html } = require("express-htmx-components/tags");

const data = "<h1>Hello</h1>";
console.log(html`
  ${data}
  $${data}
`);
```

Will output:

```html
  &lt;h1&gt;Hello&lt;/h1&gt;
  <h1>Hello</h1>
```

### css

The `css` tag is mainly for the improved developer experience with usng css
syntax inside template literals. It does not do any additional processing
apart from simply building the string as is:

```js
const { css } = require("express-htmx-components/tags");

const style = css`
  #username {
    font-size: 14px;
    font-weight: bold;
  }
`;
```

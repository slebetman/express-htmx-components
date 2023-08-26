# Express </> HTMX Components

## API

### components.init(app, componentsDir, options)

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

- **app** = Express instance
- **componentsDir** = directory to scan for components
- **options** = options object:
    - **js** = array of additional javascript files to include
    - **css** = array of css files to include

Adding global js and css files to your app:

```js
component.init(app,'./components',{
    js: [ 'https://unpkg.com/htmx.org/dist/ext/alpine-morph.js' ],
    css: [ 'https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css' ]
})
```

### component\[method\](path, ... middleware?, componentDefinition)

Returns a `Component`.

Defines a htmx component.

```js
const component = require('express-htmx-components');

const getHello = component.get('/hello', () => '<h1>Hello World</h1>');
const posHello = component.post('/hello', () => '<h1>Hello World</h1>');
const putHello = component.put('/hello', () => '<h1>Hello World</h1>');
const patHello = component.patch('/hello', () => '<h1>Hello World</h1>');
const delHello = component.del('/hello', () => '<h1>Hello World</h1>');

module.exports = {
    getHello,
    posHello,
    putHello,
    patHello,
    delHello,
}
```

Arguments:

- **path** = URL path for the component
- **middleware** = optional, zero or more Express or Connect middlewares
- **componentDefinition** = function defining the component (may be `async`)


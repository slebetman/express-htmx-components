# Express </> HTMX Components

## Getting Started

### Install

Obviously you need express for this to work. The following
is the minimal set of dependencies I'd recommend:

```sh
npm install express
npm install express-session
npm install express-htmx-components
```

I'd also suggest you start with the following simple project
structure:

```text
 my-project/
  ├ components/   -- pages
  │  └ lib/       -- ui library
  ├ lib/          -- utility library
  ├ static/       -- static files
  ├ package.json
  └ server.js
```

### Usage

#### server.js

```js
#! /usr/bin/env node

const express = require('express');
const path = require('path');
const session = require('express-session');
const components = require('express-htmx-components');

const app = express();

const COMPONENTS_DIR = path.join(path.resolve(__dirname), 'components');
const SESSION_SECRET = 'xxx';
const PORT = 8888;

app.disable('x-powered-by');
app.enable('trust proxy');

app.use(
    session({
        secret: SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: false,
            httpOnly: true,
        },
    })
);

app.use('/static', express.static('static'));
app.use(express.urlencoded({ extended: false }));

// Auto-load components:
components.init(app, COMPONENTS_DIR).then(() => {
    app.use((req, res) => {
        console.log('404: Not Found');
        res.status(404);
        res.send('404: Not Found.');
    })

    app.listen(PORT, () => {
        console.log(`Server started, listening on ${PORT} ..`
    });
});
```

The `components.init()` function will recursively scan the `components`
directory to load the htmx components. Because each component is also
an Express route each component is also a web page. Anything that's not
a web page should be stored outside the `components` directory.

Since each component is a web page in its own right it's easy to debug
each component in isolation. It's one of the advantages of
express-htmx-component.

#### /components/lib/name.js

Let's create a simple component that remembers your name. For a real app you'd
want a database to store your name but for this simple test let's just store
it in the session:

```js
const component = require('express-htmx-components');
const { html } = require('express-htmx-components/tags');

const name = component.get('/name', ({ session, name }) => {
    if (name) {
        session.name = name;
    }

    if (session.name) {
        return html`
            <div id="name-container">
                Hello <span class="name">${session.name}</span>!
            </div>
        `;
    }
    else {
        return html`
            <div id="name-container">
                <form
                    hx-get="/name"
                    hx-target="#name-container"
                    hx-swap="outerHTML"
                >
                    What's your name?
                    <input name="name" id="name" type="text">
                    <button type="submit">Submit</button>
                </form>
            </div>
        `;
    }
})

module.exports = { name }
```

This component simply returns a div and the content of that div depends
on if the session has saved your name. If you submit your name using the
form it will add your name as a query param to the request which will then
be passed to the component as the `name` property.

The `session` property is a special prop that is linked to Express
`req.session`. This allows your component to access the session.

Since this component has a URL you can test it by going to
`http://localhost:8888/name`. Each component is also a web page.

#### /components/home.js

Now let's include the name component above into another page:

```js
const component = require('express-htmx-components');
const { html } = require('express-htmx-components/tags');
const { name } = require('./lib/name');

const home = component.get('/',({ session }) => {
    return html`
        <h1>Welcome to HTMX</h1>

        $${ name.html({ session }) }
    `;
})

module.exports = { home };
```

Including a component in another component is simply calling the component's
`.html()` function. Here we're just passing the session from the page and
let the component's own internal logic handle how to display the name.

We use a special substitution with `$${}` instead of the regular `${}` because
the component returns html. The `html` tag escapes special characters such as
`<` and `>` with `&lt;` and `&gt;` in order to prevetn XSS attacks from html
content in user submitted data. But this interferes with including components
into your html string. To overcome this the `html` tag implements a special
`$${}` substitution that does not do any replacement of special characters.

The rule of thumb is:

- If it's a component use `$${}`
- If it's user data use `${}`

Now we can access the page by going to `http://localhost:8888`.

### Developer comfort

Express-htmx-component mainly uses javascript template literal to
define html. But writing code inside string sucks because you don't get
nice tools like syntax highlighting or autocompletion. To remedy this,
if you're using VSCode install the
[Inline HTML](https://marketplace.visualstudio.com/items?itemName=pushqrdx.inline-html) extension.

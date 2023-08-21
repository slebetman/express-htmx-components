const find = require('find');
const express = require('express');

const route = express.Router();

let jsToInclude = '';
let cssToInclude = '';

function htmx(body) {
	return `<html>
	<head>
	<script
		src="https://unpkg.com/htmx.org@1.9.4"
		integrity="sha384-zUfuhFKKZCbHTY6aRR46gxiqszMk5tcHjsVFxnUo8VMus4kHGVdIYVbOYYNlKmHV"
		crossorigin="anonymous"
	></script>
	${jsToInclude}
	${cssToInclude}
	</head>
	<body>
		${body}
	</body>
	</html>
	`;
}

/**
 * @callback ComponentDefinition
 * @param {Object} props
 */

/**
 * @callback Middleware
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */

/**
 * @param {ComponentDefinition} def
 */
function private(def) {
	return {
		html: def,
	};
}

function saveSession(session) {
	if (session && session.save) {
		return new Promise((ok, fail) => {
			session.save((err) => {
				if (err) {
					fail(err);
				} else {
					ok();
				}
			});
		});
	}
}

function makeComponent(method, path, ...fn) {
	const def = fn.pop();
	route[method](path, ...fn, async (req, res, next) => {
		const props = {
			...req.body,
			...req.params,
			...req.query,
		};

		const hx = {
			redirect: async (x) => {
				await saveSession(req.session);
				res.set('HX-Refresh', 'true');
				res.redirect(x);
			},
			set: (k, v) => res.set(k, v),
			get: (k) => req.get(k, v),
		};
		props.session = req.session;

		if (method === 'use') {
			props.method = req.method;
		}

		try {
			const html = await def(props, hx);
			if (!res.headersSent) {
				res.send(htmx(html));
			}
		} catch (err) {
			next(err);
		}
	});

	return {
		html: (props) =>
			def(props, {
				redirect: () => {},
				set: () => {},
				get: () => {},
			}),
		route: route,
	};
}

/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 */
function use(path, ...fn) {
	return makeComponent('use', path, ...fn);
}

/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 */
function get(path, ...fn) {
	return makeComponent('get', path, ...fn);
}

/**
 * @param {string} path
 * @param {...Function} [fn]
 */
function post(path, ...fn) {
	return makeComponent('post', path, ...fn);
}

/**
 * @param {string} path
 * @param {...Function} [fn]
 */
function put(path, ...fn) {
	return makeComponent('put', path, ...fn);
}

/**
 * @param {string} path
 * @param {...Function} [fn]
 */
function patch(path, ...fn) {
	return makeComponent('patch', path, ...fn);
}

/**
 * @param {string} path
 * @param {...Function} [fn]
 */
function del(path, ...fn) {
	return makeComponent('delete', path, ...fn);
}



/**
 * @param {express.Router} app
 * @param {string} componentsDir
 * @param {Object} [options]
 * @param {string[]} options.css - list of css to include
 * @param {string[]} options.js - list of javascript to include
 */
function init(app, componentsDir, options) {
	if (options) {
		if (options.css) {
			cssToInclude = options.css
				.map(href => `<link rel="stylesheet" href="${href}"></link>`)
				.join('\n');
		}
		if (options.js) {
			jsToInclude = options.js
				.map(href => `<script src="${href}"></script>`)
				.join('\n');
		}
	}

	return new Promise((ok, fail) => {
		find.eachfile(/\.js$/, componentsDir, (module) => {
			const component = require(module);
			if (component.route) app.use(component.route);
			else {
				// support multiple component
				for (const c in component) {
					if (c.route) app.use(c.route);
				}
			}
		})
			.error(fail)
			.end(ok);
	});
}

module.exports = {
	private,
	use,
	get,
	post,
	put,
	patch,
	del,
	delete: del,
	init,
};

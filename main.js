const find = require('find');
const express = require('express');

const route = express.Router();

let headContent = '';
let htmxToInclude = {
	src: "https://unpkg.com/htmx.org@1.9.5/dist/htmx.min.js",
	integrity: "sha384-xcuj3WpfgjlKF+FXhSQFQ0ZNr39ln+hwjN3npfM9VBnUskLolQAcN80McRIVOPuO",
	crossorigin: "anonymous",
};

function htmx(body) {
return `<html>
<head>
${headContent}
</head>
<body>${body}</body>
</html>
`;
}

/**
 * @callback ComponentFunction
 * @param {Object} props
 */

/**
 * @typedef {Object} Component
 * @property {express.Router} route
 * @property {ComponentFunction} html
 */

/**
 * @typedef {Object} PrivateComponent
 * @property {ComponentFunction} html
 */

/**
 * @callback ComponentDefinition
 * @param {Object} props
 * @returns {string}
 */

/**
 * @callback Middleware
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */

/**
 * @param {ComponentDefinition} def
 * @returns {PrivateComponent}
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
 * @returns {Component}
 */
function use(path, ...fn) {
	return makeComponent('use', path, ...fn);
}

/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
function get(path, ...fn) {
	return makeComponent('get', path, ...fn);
}

/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
function post(path, ...fn) {
	return makeComponent('post', path, ...fn);
}

/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
function put(path, ...fn) {
	return makeComponent('put', path, ...fn);
}

/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
function patch(path, ...fn) {
	return makeComponent('patch', path, ...fn);
}

/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
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
 * @param {string} options.htmx - the htmx library to include
 * @param {string} options.favicon - favicon
 * @param {Object[]} options.link - generic link tag
*/
function init(app, componentsDir, options) {
	if (options) {
		if (options.htmx) {
			if (!options.js) {
				options.js = [];
			}
			options.js.unshift(options.htmx);
		}
		if (options.favicon) {
			if (typeof options.favicon === 'string') {
				headContent += `<link rel="icon" type="image/png" href="${options.favicon}"></link>`
			}
			else if (options.favicon.href) {
				const params = [];
				for (const k in options.favicon) {
					params.push(`${k}="${options.favicon[k]}"`);
				}
				headContent += `<link rel="icon" ${params.join(' ')}"></link>`
			}
			else {
				throw new Error(`Invalid favicon specification: ${options.favicon}`)
			}
		}
		if (options.link) {
			headContent += options.link.map(link => {
				if (link.rel) {
					const params = [];
					for (const k in link) {
						params.push(`${k}="${link[k]}"`);
					}
					return `<link ${params.join(' ')}"></link>`
				}
				else {
					throw new Error(`Invalid link specification: ${link}`)
				}
			})
			.join('\n');
		}
		if (options.css) {
			headContent += options.css
				.map(href => {
					if (typeof href === 'string') {
						return `<link rel="stylesheet" href="${href}"></link>`;
					}
					else if (href.href) {
						const params = [];
						for (const k in href) {
							params.push(`${k}="${href[k]}"`);
						}
						return `<link rel="stylesheet" ${params.join(' ')}"></link>`
					}
					else {
						throw new Error(`Invalid js specification: ${href}`)
					}
				})
				.join('\n');
		}
		headContent += [htmxToInclude, ...options.js]
			.map(href => {
				if (typeof href === 'string') {
					return `<script src="${href}"></script>`;
				}
				else if (href.src) {
					const params = [];
					for (const k in href) {
						params.push(`${k}="${href[k]}"`);
					}
					return `<script ${params.join(' ')}></script>`
				}
				else {
					throw new Error(`Invalid js specification: ${href}`)
				}
			})
			.join('\n');
	}

	return new Promise((ok, fail) => {
		find.eachfile(/\.js$/, componentsDir, (module) => {
			const component = require(module);
			if (component.route) app.use(component.route);
			else {
				// support multiple component
				for (const k in component) {
					const c = component[k];
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

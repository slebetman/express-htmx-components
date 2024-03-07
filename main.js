const find = require('find');
const express = require('express');
const core = require('express-serve-static-core');

let headContent = '';

/**
 * @type {SrcObject}
 */
let htmxToInclude = {
	src: "https://unpkg.com/htmx.org@1.9.9/dist/htmx.min.js",
	integrity: "sha384-QFjmbokDn2DjBjq+fM+8LUIVrAgqcNW2s0PjAxHETgRn9l4fvX31ZxDxvwQnyMOX",
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
 * @typedef {Object} SrcObject
 * @property {string} src
 * @property {string} [integrity]
 * @property {string} [crossorigin]
 */

/**
 * @typedef {Object} HrefObject
 * @property {string} href
 * @property {string} [integrity]
 * @property {string} [crossorigin]
 */

/**
 * @typedef {SrcObject | string} SrcUrl
 */

/**
 * @typedef {HrefObject | string} HrefUrl
 */

/**
 * @callback ComponentFunction
 * @param {Object} props
 */

/**
 * @typedef {Object} Component
 * @property {core.Router} route
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
	const route = express.Router();
	route[method](path, ...fn, async (req, res, next) => {
		const props = {
			...req.body,
			...req.params,
			...req.query,
		};
		
		let files = null;

		if (req.files) {
			files = req.files;
		}
		if (req.file) {
			files = [ req.file ];
		}
		
		if (files) {
			props.files = files;
		}

		const hx = {
			redirect: async (x) => {
				await saveSession(req.session);
				res.set('HX-Refresh', 'true');
				res.redirect(x);
			},
			set: (k, v) => res.set(k, v),
			get: (k) => req.get(k),
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
 * @param {core.Router} app
 * @param {string} componentsDir
 * @param {Object} [options]
 * @param {HrefUrl[]} options.css - list of css to include
 * @param {SrcUrl[]} options.js - list of javascript to include
 * @param {SrcUrl} options.htmx - the htmx library to include
 * @param {HrefUrl} options.favicon - favicon
 * @param {Object[]} options.link - generic link tag
*/
function init(app, componentsDir, options) {
	/**
	 * @type {SrcUrl[]}
	 */
	let jsToInclude = [];

	if (options) {
		if (!options.js) {
			options.js = [];
		}
		if (options.htmx) {
			options.js.unshift(options.htmx);
		}
		else {
			options.js.unshift(htmxToInclude)
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
						throw new Error(`Invalid css specification: ${href}`)
					}
				})
				.join('\n');
		}
		jsToInclude = options.js;
	}

	headContent += jsToInclude.map(href => {
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
		.end(() => ok());
	});
}

module.exports = {
	use,
	get,
	post,
	put,
	patch,
	del,
	delete: del,
	init,
};

const request = require("supertest");
const express = require("express");

afterEach(() => {
	jest.resetModules();
	delete require.cache[require.resolve("../main")]
})

test("INIT should work", async () => {
	const component = require("../main");
	const app = express();
	await component.init(app, null);
})

test("INIT should accept module with single export", async () => {
	const component = require("../main");
	const app = express();

	jest.mock(
		"../testing.js",
		() => ({
			route: express.Router().get('/testing',(req,res) => {
				res.send('hello world')
			}),
		}),
		{ virtual: true }
	);

	await component.init(app, './testing.js');

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toBe('hello world');
})

test("INIT should accept module with multiple exports", async () => {
	const component = require("../main");
	const app = express();

	jest.mock(
		"../testing.js",
		() => ({
			testing: {
				route: express.Router().get('/testing',(req,res) => {
					res.send('hello world')
				})
			},
		}),
		{ virtual: true }
	);

	await component.init(app, './testing.js');

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toBe('hello world');
})

test("INIT should automatically install htmx library", async () => {
	const component = require("../main");
	const app = express();

	const comp = component.get('/testing',() => {
		return 'hello world'
	})

	jest.mock(
		"../testing.js",
		() => {
			return comp;
		},
		{ virtual: true }
	);

	await component.init(app, "./testing.js", {});

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toMatch(/src=\S+unpkg\S+htmx\.min\.js/);
})

test("INIT should allow user to override htmx library", async () => {
	const component = require("../main");
	const app = express();

	const comp = component.get('/testing',() => {
		return 'hello world'
	})

	jest.mock(
		"../testing.js",
		() => {
			return comp;
		},
		{ virtual: true }
	);

	await component.init(app, "./testing.js", { htmx: "http://example.com/test.js" });

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toMatch(/src=\S+example\.com\/test\.js/);
	expect(response.text).not.toMatch(/src=\S+unpkg\S+htmx\.min\.js/);
})

test("INIT should allow user to install favicon", async () => {
	const component = require("../main");
	const app = express();

	const comp = component.get('/testing',() => {
		return 'hello world'
	})

	jest.mock(
		"../testing.js",
		() => {
			return comp;
		},
		{ virtual: true }
	);

	await component.init(app, "./testing.js", { favicon: "/test.png" });

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toMatch(/href=\S+test\.png/);
})

test("INIT should allow user to install favicon using object", async () => {
	const component = require("../main");
	const app = express();

	const comp = component.get('/testing',() => {
		return 'hello world'
	})

	jest.mock(
		"../testing.js",
		() => {
			return comp;
		},
		{ virtual: true }
	);

	await component.init(app, "./testing.js", { favicon: { href: "/test.png" } });

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toMatch(/href=\S+test\.png/);
})

test("INIT should throw error if favicon is invalid", async () => {
	const component = require("../main");
	const app = express();

	expect(() => component.init(app, null, { favicon: {} })).toThrow();
})

test("INIT should allow user to install arbitrary links", async () => {
	const component = require("../main");
	const app = express();

	const comp = component.get('/testing',() => {
		return 'hello world'
	})

	jest.mock(
		"../testing.js",
		() => {
			return comp;
		},
		{ virtual: true }
	);

	await component.init(app, "./testing.js", { link: [{ rel: "http://example.com" }] });

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toMatch(/rel=\S+example\.com/);
})

test("INIT should throw error if link is invalid", async () => {
	const component = require("../main");
	const app = express();

	expect(() => component.init(app, null, { link: [{}] })).toThrow();
})

test("INIT should allow users to install css", async () => {
	const component = require("../main");
	const app = express();

	const comp = component.get('/testing',() => {
		return 'hello world'
	})

	jest.mock(
		"../testing.js",
		() => {
			return comp;
		},
		{ virtual: true }
	);

	await component.init(app, "./testing.js", {
		css: ["http://example.com/test1.css", { href: "http://example.com/test2.css" }]
	});

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toMatch(/href=\S+test1.css/);
	expect(response.text).toMatch(/href=\S+test2.css/);
})

test("INIT should throw error if css is invalid", async () => {
	const component = require("../main");
	const app = express();

	expect(() => component.init(app, null, { css: [{}] })).toThrow();
})

test("INIT should allow users to install js", async () => {
	const component = require("../main");
	const app = express();

	const comp = component.get('/testing',() => {
		return 'hello world'
	})

	jest.mock(
		"../testing.js",
		() => {
			return comp;
		},
		{ virtual: true }
	);

	await component.init(app, "./testing.js", {
		js: ["http://example.com/test1.js", { src: "http://example.com/test2.js" }]
	});

	const response = await request(app).get("/testing").expect(200);

	expect(response.text).toMatch(/src=\S+test1.js/);
	expect(response.text).toMatch(/src=\S+test2.js/);
})

test("INIT should throw error if js is invalid", async () => {
	const component = require("../main");
	const app = express();

	expect(() => component.init(app, null, { js: [{}] })).toThrow();
})

test("INIT should ignore components without routes", async () => {
	const component = require("../main");
	const app = express();

	const comp = { test: {} }

	jest.mock(
		"../testing.js",
		() => {
			return comp;
		},
		{ virtual: true }
	);

	await component.init(app, "./testing.js");
})
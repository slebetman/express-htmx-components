const component = require("../main");
const express = require("express");

jest.mock(
	"../testing1.js",
	() => {
		return {
			route: {},
		};
	},
	{ virtual: true }
);

jest.mock(
	"../testing2.js",
	() => {
		return {
			testing: {
				route: {},
			},
		};
	},
	{ virtual: true }
);

test("Place holder for INIT tests..", async () => {
	const app = {
		use: () => {},
	};

	await component.init(app, "", {});
	await component.init(app, "", { htmx: "http://example.com" });
	await component.init(app, "", { favicon: "/test.png" });
	await component.init(app, "", { favicon: { href: "/test.png" } });
	await expect(() => component.init(app, "", { favicon: {} })).toThrow();
	await component.init(app, "", { link: [{ rel: "http://example.com" }] });
	await expect(() => component.init(app, "", { link: [{}] })).toThrow();
	await component.init(app, "", {
		css: ["http://example.com", { href: "http://example2.com" }],
	});
	await expect(() => component.init(app, "", { css: [{}] })).toThrow();
	await component.init(app, "", {
		js: ["http://example.com", { src: "http://example2.com" }],
	});
	await expect(() => component.init(app, "", { js: [{}] })).toThrow();
});

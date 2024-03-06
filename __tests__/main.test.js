const request = require("supertest");
const component = require("../main");
const express = require("express");

const errorHandler = (err, req, res, next) => {
	console.log(err.message, err.stack);
	res.status(500);
	res.send(err.message);
};

test("GET component should return a html and a router", async () => {
	const app = express();

	const get = component.get("/test", () => {
		return "<div>hello world</div>";
	});

	app.use(get.route);
	app.use(errorHandler);

	expect(get.html()).toBe("<div>hello world</div>");

	const response = await request(app).get("/test").expect(200);

	expect(response.text).toMatch(/hello world/);
});

test("Components should handle path params", async () => {
	const app = express();

	const get = component.get("/test/:hello", ({ hello }) => {
		return `<div>hello ${hello}</div>`;
	});

	app.use(get.route);
	app.use(errorHandler);

	expect(get.html({ hello: 'world' })).toBe("<div>hello world</div>");

	const response = await request(app).get("/test/world").expect(200);

	expect(response.text).toMatch(/hello world/);
});

test("Sessions should work", async () => {
	const app = express();

	const get = component.get("/test", ({ session }) => {
		if (session.count === undefined) session.count = 0;
		else session.count++;

		return `<div>hello world ${session.count}</div>`;
	});

	const fakeSession = {
		save: (fn) => fn(),
	};

	app.use((req, res, next) => {
		req.session = fakeSession;
		next();
	});
	app.use(get.route);
	app.use(errorHandler);

	const response1 = await request(app).get("/test").expect(200);

	expect(response1.text).toMatch(/hello world 0/);

	const response2 = await request(app).get("/test").expect(200);

	expect(response2.text).toMatch(/hello world 1/);
});

test("Redirects should work", async () => {
	const app = express();

	const get = component.get("/test", ({}, { redirect }) => {
		redirect("/goodbye");
		return;
	});

	const fakeSession = {
		save: (fn) => fn(),
	};

	app.use((req, res, next) => {
		req.session = fakeSession;
		next();
	});
	app.use(get.route);
	app.use(errorHandler);

	await request(app).get("/test").expect(302).expect("Location", "/goodbye");
});

test("Thrown errors should be handled normally", async () => {
	const app = express();

	const get = component.get("/test", () => {
		throw new Error("NOT WORKING");
	});

	app.use(get.route);
	app.use((err, req, res, next) => {
		res.status(500);
		res.send(err.message);
	});

	const response = await request(app).get("/test").expect(500);

	expect(response.text).toBe("NOT WORKING");
});

test("POST component should accept a post request", async () => {
	const app = express();

	const post = component.post("/test", ({ hello }) => {
		return `<div>hello ${hello}</div>`;
	});

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(post.route);
	app.use(errorHandler);

	const jsonResponse = await request(app)
		.post("/test")
		.set("Content-Type", "application/json")
		.send({ hello: "world" })
		.expect(200);

	expect(jsonResponse.text).toMatch(/hello world/);

	const urlencodedResponse = await request(app)
		.post("/test")
		.set("Content-Type", "application/x-www-form-urlencoded")
		.send("hello=world");

	expect(urlencodedResponse.text).toMatch(/hello world/);
});

test("PUT component should accept a put request", async () => {
	const app = express();

	const put = component.put("/test", ({ hello }) => {
		return `<div>hello ${hello}</div>`;
	});

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(put.route);
	app.use(errorHandler);

	const jsonResponse = await request(app)
		.put("/test")
		.set("Content-Type", "application/json")
		.send({ hello: "world" })
		.expect(200);

	expect(jsonResponse.text).toMatch(/hello world/);

	const urlencodedResponse = await request(app)
		.put("/test")
		.set("Content-Type", "application/x-www-form-urlencoded")
		.send("hello=world");

	expect(urlencodedResponse.text).toMatch(/hello world/);
});

test("PATCH component should accept a patch request", async () => {
	const app = express();

	const patch = component.patch("/test", ({ hello }) => {
		return `<div>hello ${hello}</div>`;
	});

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(patch.route);
	app.use(errorHandler);

	const jsonResponse = await request(app)
		.patch("/test")
		.set("Content-Type", "application/json")
		.send({ hello: "world" })
		.expect(200);

	expect(jsonResponse.text).toMatch(/hello world/);
});

test("DEL component should accept a delete request", async () => {
	const app = express();

	const del = component.del("/test", ({ hello }) => {
		return `<div>hello ${hello}</div>`;
	});

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(del.route);
	app.use(errorHandler);

	const jsonResponse = await request(app)
		.del("/test")
		.set("Content-Type", "application/json")
		.send({ hello: "world" })
		.expect(200);

	expect(jsonResponse.text).toMatch(/hello world/);
});

test("Routeless component should only have html", () => {
	const comp = component.routeless(({ hello }) => {
		return `<div>hello ${hello}</div>`;
	});

	expect(comp.html({ hello: "world" })).toMatch(/hello world/);

	expect(comp.route).toBeUndefined();
});

test("USE method should accept any method", async () => {
	const app = express();

	const use = component.use("/test", ({ hello }) => {
		return `<div>hello ${hello}</div>`;
	});

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(use.route);
	app.use(errorHandler);

	const response1 = await request(app).get("/test?hello=world").expect(200);

	expect(response1.text).toMatch(/hello world/);

	const response2 = await request(app)
		.post("/test")
		.set("Content-Type", "application/json")
		.send({ hello: "world" })
		.expect(200);

	expect(response2.text).toMatch(/hello world/);
});

test("Allow setting and getting headers", async () => {
	const app = express();

	const get = component.get("/test", ({}, { get, set }) => {
		set("x-response-header", "monkey");
		return `<div>hello ${get("x-request-header")}</div>`;
	});

	app.use(get.route);
	app.use(errorHandler);

	const response = await request(app)
		.get("/test")
		.set("X-Request-Header", "world")
		.expect("X-Response-Header", "monkey")
		.expect(200);

	expect(response.text).toMatch(/hello world/);
});

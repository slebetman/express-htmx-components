mockFindObject = {
	error: (err) => {
		return mockFindObject;
	},
	end: (cb) => {
		cb();
		return mockFindObject;
	},
};

module.exports = {
	eachfile: (pattern, path, cb) => {
		cb("./testing1.js");
		cb("./testing2.js");
		return mockFindObject;
	},
};

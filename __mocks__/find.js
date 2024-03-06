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
		if (path) {
			cb(path);
		}
		return mockFindObject;
	},
};

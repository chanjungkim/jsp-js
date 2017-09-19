const utils = require('../utils');

class TagLib {
	constructor(options, renderer) {
		this.tagMap = {};
		this.options = options;
		this.renderer = renderer;
	}

	cleanTestText(testExp) {
		testExp = testExp.trim();
		if (testExp.startsWith('${') && testExp.endsWith('}')) {
			testExp = testExp.slice(2, -1)
		}
		return testExp;
	}

	supports(tag) {
		return tag in this.tagMap;
	}

	handle(tag, node, index, data) {
		if (!this.supports(tag)) {
			throw new Error(`Unhandled tag "${tag}"`);
		}
		return this.tagMap[tag](node, index, data);
	}

	wrapReturn(content, data) {
		return {content: content, data: data};
	}
}

module.exports = TagLib;

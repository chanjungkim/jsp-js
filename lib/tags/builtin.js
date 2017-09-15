const utils = require('../utils');

class BuiltinTagLib {
	constructor(options, renderer) {
		let self = this;
		this.tagMap = {
			'c:forEach':   (...params) => self.tagForeach.apply(self, params),
			'c:choose':    (...params) => self.tagChooseHandler.apply(self, params),
			'c:when':      (...params) => self.tagWhenHandler.apply(self, params),
			'c:otherwise': (...params) => self.tagOtherwiseHandler.apply(self, params),
			'c:if':        (...params) => self.tagIfHandler.apply(self, params),
			'c:else':      (...params) => self.tagElseHandler.apply(self, params),
			's:if':        (...params) => self.tagIfHandler.apply(self, params),
			's:else':      (...params) => self.tagElseHandler.apply(self, params),
			'c:set':       (...params) => self.tagSetData.apply(self, params)
		};
		this.lastIfMatched = null;
		this.lastWhenMatched = null;
		this.options = options;
		this.renderer = renderer;
		this.data = {};
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

	tagSetData(node, index, data) {
		return '';
	}

	tagForeach(node, index, data) {
		return '<!-- c:forEach (' + index + ') removed -->';
	}

	tagIgnore(node, index) {
		return node.token.in_tag ? '' : '<!-- removed tag: ' + node.token.name + ' -->';
	}

	tagDefault(node, index, data) {
		let token = node.token;
		if (node.children && node.children.length > 0) {
			return node.children.map((child, i) => {
				return this.renderer.renderNode(child, index + '_' + i, this.options)
			}).join('');
		} else {
			return this.tagIgnore(node, index);
		}
	}

	tagChooseHandler(node, index, data) {
		return this.renderer.renderChildren(node, data);
	}

	tagWhenHandler(node, index, data) {
		let token = node.token
		let attrText = token.text.slice(5, -1).trim()
		let attrs = utils.getAttrs(attrText)
		let testExp = this.cleanTestText(attrs.test);
		if (!testExp) {
			throw new Error('no valid test in :when (' + index + ', ' + token.text + ')');
		}
		let values = Object.assign({}, this.options.globals, data);
		let match = utils.evalExp(testExp, values)
		console.log(testExp, match);
		if (match) {
			this.lastWhenMatched = true;
			return this.renderer.renderChildren(node, data);
		} else {
			this.lastWhenMatched = false;
			return '';
		}
	}

	tagOtherwiseHandler(node, index, data) {
		if (!this.lastWhenMatched) {
			return node.children.map((child, i) => {
				return this.renderer.renderNode(child, index + '_' + i, this.options)
			}).join('');
		}
		return '';
	}

	tagIfHandler(node, index, data) {
		console.log(this);
		let token = node.token
		let attrText = token.text.slice(5, -1).trim()
		let attrs = utils.getAttrs(attrText)
		let testExp = this.cleanTestText(attrs.test);
		if (!testExp) {
			throw new Error('no valid test in :if (' + index + ', ' + token.text + ')');
		}
		let values = Object.assign({}, this.options.globals, data);
		let match = utils.evalExp(testExp, values)
		console.log(testExp, match);
		if (match) {
			this.lastIfMatched = true;
			return this.renderer.renderChildren(node, data);
		} else {
			this.lastIfMatched = false;
			return '';
		}
	}

	tagElseHandler(node, index, data) {
		if (!this.lastIfMatched) {
			return this.renderer.renderChildren(node, data);
		}
		return '';
	}
}

module.exports = BuiltinTagLib;

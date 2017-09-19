const utils = require('../utils');
const TagLib = require('./taglib');

class BuiltinTagLib extends TagLib {
	constructor(options, renderer) {
		super(options, renderer);
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
		let text = node.token.text.slice(node.token.name.length + 1,
										 node.token.text.indexOf('/>')).trim();
		let attrs = utils.getAttrs(text);
		console.log(text, attrs);
		data[attrs['var']] = attrs['value'];
		console.log(data);
		return {content: '', data};
	}

	tagForeach(node, index, data) {
		return '<!-- c:forEach (' + index + ') removed -->';
	}

	tagIgnore(node, index, data) {
		return '';
	}

	tagDefault(node, index, data) {
		let token = node.token;
		if (node.children && node.children.length > 0) {
			return this.renderer.renderChildren(node);
		} else {
			return this.tagIgnore(node, index, data);
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
		let token = node.token
		let attrText = token.text.slice(5, -1).trim()
		let attrs = utils.getAttrs(attrText)
		let testExp = this.cleanTestText(attrs.test);
		if (!testExp) {
			throw new Error('no valid test in :if (' + index + ', ' + token.text + ')');
		}
		let values = Object.assign({}, this.options.globals, data);
		let match = utils.evalExp(testExp, values)
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

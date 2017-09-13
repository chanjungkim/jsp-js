var fs = require('fs');
var path = require('path');
var Tokenizer = require('./tokenizer');
var Parser = require('./parser');
var TagHandlers = require('./tag-handlers');
var utils = require('./utils');

class Renderer {
	constructor(options) {
		this.options = options;
	}

	render(file, data) {
		this.options.file = file;
		let jspText = this.load(file);

		const tokenizer = new Tokenizer(jspText);
		const tokens = tokenizer.run();
		const parser = new Parser(tokens);
		const ast = parser.run();
		console.assert(
			ast && ast.children && ast.children.length > 0,
			'AST error'
		);
		var html = ast.children.map((node, i) => {
			console.assert(node && node.type, 'node error')
			return this.renderNode(node, i, data)
		}).join('');
		let element = this.renderEl(html, data);
		this.options.file = null;
		return element;
	}

	renderNode(node, index, data) {
		if (node.type === 'text') {
			return node.token.text
		} else if (node.type === 'directive') {
			return ''
		} else if (node.type === 'directive_include') {
			return this.include(node.attrs.file, data)
		} else if (node.type === 'code') {
			return this.renderCodeNode(node, index, data)
		} else if (node.type === 'code_exp') {
			return this.renderCodeExp(node, index, data)
		} else if (node.type === 'tag') {
			return this.renderCustomTagNode(node, index, data)
		} else {
			return '<!-- removed: ' + node.type + ' -->'
		}
	}

	renderEl(html, data) {
		let fullData = this.addGlobals(data);
		return html.replace(/\${([^}]*)}/g, (_, exp) => {
			var value = utils.evalExp(exp.trim(), fullData);
			return value !== undefined ? value : '';
		})
	}

	include(file, data) {
		var filePath
		if (path.isAbsolute(file)) {
			filePath = path.join(this.options.root, file)
		} else {
			filePath = path.join(this.options.file, file)
		}

		let renderer = new Renderer(this.options);

		return (
			'<!-- include: ' + file + ' start -->\n' +
			renderer.render(filePath, data) + '\n' +
			'<!-- include: ' + file + ' end -->'
		);
	}

	renderCodeNode(node) {
		if (node.token.in_tag) {
			return '' // like <img src="<% if (..) { %>...<% } %>">
		} else {
			var code = node.token.data
			// multi line
			if (code.indexOf('\n') > -1) {
				return (
					'<!-- removed code:\n' +
					code + '\n' +
					'-->'
				)
			} else {
				return '<!-- removed code: ' + code + ' -->'
			}
		}
	}

	renderCodeExp(node, index, data) {
		var exp = node.token.data
		var value = utils.evalExp(exp, this.addGlobals(data));
		return value !== undefined ? value :
			node.token.in_tag ? '' : '<!-- removed code_exp: ' + exp + ' --->'
	}

	renderCustomTagNode(node, index, data) {
		var handler = TagHandlers[node.token.name];
		if (typeof handler === 'undefined') {
			let [namespace, funcname] = node.token.name.split(':');
			if (typeof this.options.tags[namespace] !== 'undefined'
			&& typeof this.options.tags[namespace][funcname] !== 'undefined') {
				handler = this.options.tags[namespace][funcname];
			} else {
				handler = TagHandlers['default'];
			}
		}

		return handler(node, index, this.options, data, this.renderNode);
	}

	/**
	 * Loads and cleans up the JSP file before interpreting; removes BOM.
	 */
	load(file) {
		if (!path.isAbsolute(file)) {
			file = path.join(this.options.root, file);
		}

		let text = fs.readFileSync(file, {encoding: 'UTF-8'});

		if (text[0] === '\uFEFF') {
			return text.slice(1);
		}
		return text;
	}

	addGlobals(data) {
		return Object.assign({}, this.options.globals, data);
	}
}

module.exports = Renderer;

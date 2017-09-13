var utils = require('./utils')

class Parser {
	constructor(tokens) {
		this.tokens = tokens;
	}

	run() {
		let docNode = {
			type: 'document',
			children: []
		};

		let branch = [];
		let node = docNode;
		let self = this;

		this.tokens.forEach((token) => {
			switch (token.type) {
				case 'text':
				case 'comment':
				case 'code':
				case 'code_exp':
					node.children.push({
						type: token.type,
						token: token
					});
					break
				case 'directive':
					node.children.push(self.parseDirective(token));
					break
				case 'tag':
					if (token.closed) {
						node.children.push({
							type: 'tag',
							token: token
						});
					} else {
						if (token.is_open) {
							var tagNode = {
								type: 'tag',
								token: token,
								children: []
							};
							branch.push(node);
							node.children.push(tagNode);
							node = tagNode;
						} else if (token.is_close) {
							node = branch.pop();
						}
					}
					break;
				default:
					throw new Error('token not supported: ' + token.type);
			}
		});

		return docNode;
	}

	parseDirective(token) {
		if (token.data.startsWith('include')) {
			return {
				type: 'directive_include',
				token: token,
				attrs: utils.getAttrs(token.data)
			}
		} else {
			return {
				type: 'directive',
				token: token
			}
		}
	}
}

module.exports = Parser;

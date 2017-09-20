var utils = require('./utils');

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
    }

    run() {
        let node = {
            type: 'document',
            children: []
        };
        let branch = [];

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
                break;
            case 'directive':
                node.children.push(this.parseDirective(token));
                break;
            case 'tag':
                if (token.closed) {
                    node.children.push({
                        type: 'tag',
                        token: token
                    });
                } else if (token.is_open) {
                    let tagNode = {
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
                break;
            default:
                throw new Error('token not supported: ' + token.type);
            }
        });

        return node;
    }

    parseDirective(token) {
        if (token.data.startsWith('include')) {
            return {
                type: 'directive_include',
                token: token,
                attrs: utils.getAttrs(token.data)
            };
        }
        return {
            type: 'directive',
            token: token
        };

    }
}

module.exports = Parser;

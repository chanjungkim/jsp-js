const fs = require('fs');
const path = require('path');
const Tokenizer = require('./tokenizer');
const Parser = require('./parser');
const CoreTagLib = require('./tags/corelib');
const TagsDirectory = require('./tags/tagdir');
const utils = require('./utils');

class Renderer {
    constructor(options) {
        this.options = options;
        this.coreTags = new CoreTagLib(options, this);
    }

    render(file, data) {
        this.options.file = file;
        const jspText = this.load(file);
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.run(jspText);
        const parser = new Parser(tokens);
        const ast = parser.run();

        if (!ast || !ast.children || ast.children.length === 0) {
            throw new Error('AST error');
        }
        let element = this.fullRender(ast, data);

        this.options.file = null;
        return element;
    }

    /**
     *
     * @param {String} file path to the JSP file to render
     * @param {object} data an object of data
     */
    renderPromise(file, data) {
        return new Promise((resolve) => {
            resolve(this.render(file, data));
        });
    }

    fullRender(node, data) {
        let html = this.renderChildren(node, data);

        return this.renderEval(html, data);
    }

    renderChildren(parent, data) {
        return parent.children.map((child, i) => {
            let rendering = this.renderNode(child, i, data);

            if (typeof rendering === 'object') {
                data = Object.assign({}, data, rendering.data);
                return rendering.content;
            }
            return rendering;
        }).join('');
    }

    renderNode(node, index, data) {
        if (node.type === 'text') {
            return node.token.text;
        } else if (node.type === 'directive') {
            return this.processDirective(node, index, data);
        } else if (node.type === 'code') {
            return this.renderCodeNode(node, index, data);
        } else if (node.type === 'code_exp') {
            return this.renderCodeExp(node, index, data);
        } else if (node.type === 'tag') {
            return this.renderCustomTagNode(node, index, data);
        }
        return '<!-- removed: ' + node.type + ' -->';
    }

    renderEval(html, data) {
        let fullData = this.addGlobals(data);

        return html.replace(/\${([^}]*)}/g, (_, exp) => {
            let value = utils.evalExp(exp.trim(), fullData);

            if (typeof value === 'undefined') {
                return '';
            }
            return value;
        });
    }

    libraryPath(file) {
        let base = this.options.file;
        if (path.isAbsolute(file)) {
            base = this.options.root;
        }
        return path.join(base, file);
    }

    include(file, data) {
        let filePath = this.libraryPath(file);
        let renderer = new Renderer(this.options);

        return (
            '<!-- include: ' + file + ' start -->\n' +
            renderer.render(filePath, data) + '\n' +
            '<!-- include: ' + file + ' end -->'
        );
    }

    processDirective(node, index, data) {
        switch (node.token.directive) {
        case 'include':
            return this.include(node.attrs.file, data);
        case 'taglib':
            let params = node.attrs;
            if (typeof params.tagdir !== 'undefined') {
                this.options.tags[params.prefix] = new TagsDirectory({tagdirPath: this.libraryPath(params.tagdir)}, this);
            }
        default:
            return '';
        }
    }

    renderCodeNode(node) {
        if (node.token.inTag) {
            return '';
        }
        return node.token.data;
    }

    renderCodeExp(node, index, data) {
        let exp = node.token.data;
        let value = utils.evalExp(exp, this.addGlobals(data));

        if (typeof value === 'undefined') {
            return '';
        }
        return value;
    }

    renderCustomTagNode(node, index, data) {
        if (this.coreTags.supports(node.token.name)) {
            return this.coreTags.handle(node.token.name, node, index, data);
        }
        let [namespace, funcname] = node.token.name.split(':');

        if (typeof this.options.tags[namespace] !== 'undefined') {
            if (typeof this.options.tags[namespace][funcname] !== 'undefined') {
                return this.options.tags[namespace][funcname](node, index, data, this);
            } else if (typeof this.options.tags[namespace].handle !== 'undefined') {
                return this.options.tags[namespace].handle(funcname, node, index, data, this);
            }
        }
        return this.coreTags.tagDefault(node, index, data);
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

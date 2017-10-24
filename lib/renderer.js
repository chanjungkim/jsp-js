const fs = require('fs');
const path = require('path');
const Tokenizer = require('./tokenizer');
const Parser = require('./parser');
const CoreTagLib = require('./tags/corelib');
const JspTagLib = require('./tags/jsplib');
const TagsDirectory = require('./tags/tagdir');
const utils = require('./utils');

class Renderer {
    constructor(options) {
        this.options = options;
        this.tagLibs = Object.assign(
            {
                'c': new CoreTagLib(options, this),
                'jsp': new JspTagLib(options, this)
            },
            options.tags
        );
    }

    render(file, data) {
        if (!data) {
            data = {};
        }
        data.__file = file;
        const jspText = this.load(file);
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.run(jspText);
        const parser = new Parser(tokens);
        const ast = parser.run();

        if (!ast || !ast.children || ast.children.length === 0) {
            throw new Error('AST error');
        }
        let element = this.fullRender(ast, data);

        data.__file = null;
        return element;
    }

    /**
     * Returns a rendering promise. For integration in a promise-based system.
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

    /**
     * Renders the children of a node with a given context data.
     * @param {object} node
     * @param {object} data the context data
     * @return {String}
     */
    renderChildren(parent, data) {
        if (!parent.children || parent.children.constructor !== Array) {
            return '';
        }
        return parent.children.map((child, i) => {
            console.log(data);
            let rendering = this.renderNode(child, i, data);

            if (rendering && typeof rendering === 'object') {
                data = Object.assign(data, rendering.data);
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
        let filePath = this.rootPath(file);
        if (filePath === file) {
            filePath = path.join(data.__file, file);
        }
        return filePath;
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
                this.tagLibs[params.prefix] = new TagsDirectory({tagdirPath: this.libraryPath(params.tagdir)}, this);
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
        let [namespace, funcname] = node.token.name.split(':');

        if (typeof this.tagLibs[namespace] !== 'undefined') {
            if (typeof this.tagLibs[namespace][funcname] !== 'undefined') {
                return this.tagLibs[namespace][funcname](node, index, data, this);
            } else if (typeof this.tagLibs[namespace].handle !== 'undefined') {
                return this.tagLibs[namespace].handle(funcname, node, index, data);
            }
        }
        return this.tagLibs.c.tagDefault(node, index, data);
    }

    rootPath(subPath) {
        if (path.isAbsolute(subPath) && utils.checkPathExistsSync(subPath)) {
            return subPath;
        }

        if (this.options.root.constructor !== Array) {
            return path.join(this.options.root, subPath);
        }

        let root;
        let filePath;
        for (let i = 0; i < this.options.root.length; i++) {
            root = this.options.root[i];
            filePath = path.join(root, subPath);
            if (utils.checkPathExistsSync(filePath)) {
                return filePath;
            }
        }

        return subPath;
    }

    /**
     * Loads and cleans up the JSP file before interpreting; removes BOM.
     */
    load(file) {
        let filePath = this.rootPath(file);

        let text = fs.readFileSync(filePath, {encoding: 'UTF-8'});

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

const utils = require('../utils');
const TagLib = require('./taglib');

class CoreLib extends TagLib {
    constructor(options, renderer) {
        super(options, renderer);
        let self = this;

        this.tagMap = {
            'forEach':   (...params) => self.tagForeach.apply(self, params),
            'choose':    (...params) => self.tagChoose.apply(self, params),
            'when':      (...params) => self.tagWhen.apply(self, params),
            'otherwise': (...params) => self.tagOtherwise.apply(self, params),
            'if':        (...params) => self.tagIf.apply(self, params),
            'else':      (...params) => self.tagElse.apply(self, params),
            'set':       (...params) => self.tagSetData.apply(self, params),
            'url':       (...params) => self.tagUrl.apply(self, params)
        };
        this.lastIfMatched = null;
        this.lastWhenMatched = null;
    }

    tagSetData(node, index, data) {
        data[node.token.params.var] = node.token.params.value;
        return this.wrapReturn('', data);
    }

    tagForeach(node, index, data) {
        let attrs = utils.getNodeAttrs(node);
        let varName = attrs.var;

        /** @var {Array} items */
        if (typeof data === 'undefined' || !data) {
            throw Error('No context data is available to process ForEach tag in ' + data.__file);
        }
        let items = utils.getObjectAttrFromDottedString(data, this.cleanTestText(attrs.items));
        if (typeof items === 'undefined') {
            throw new Error('Missing data `' + this.cleanTestText(attrs.items) + '` in forEach tag on ' + data.__file);
        }
        if (typeof items.forEach === 'undefined' || typeof items.forEach !== 'function') {
            throw new Error('Provided data `' + this.cleanTestText(attrs.items) + '` in forEach is not iterable in ' + data.__file);
        }

        let html = '';
        items.forEach((value) => {
            data[varName] = value;
            html += this.renderer.fullRender(node, data);
        });

        return html;
    }

    tagIgnore(node, index, data) {
        return '';
    }

    tagDefault(node, index, data) {
        if (node.children && node.children.length > 0) {
            return this.renderer.renderChildren(node, data);
        }
        return this.tagIgnore(node, index, data);
    }

    tagChoose(node, index, data) {
        return this.renderer.renderChildren(node, data);
    }

    tagWhen(node, index, data) {
        let token = node.token;
        let attrText = token.text.slice(5, -1).trim();
        let attrs = utils.getAttrs(attrText);
        let testExp = this.cleanTestText(attrs.test);

        if (!testExp) {
            throw new Error('no valid test in :when (' + index + ', ' + token.text + ')');
        }
        let values = Object.assign({}, this.options.globals, data);
        let match = utils.evalExp(testExp, values);

        if (match) {
            this.lastWhenMatched = true;
            return this.renderer.renderChildren(node, data);
        }
        this.lastWhenMatched = false;
        return '';

    }

    tagOtherwise(node, index, data) {
        if (!this.lastWhenMatched) {
            return this.renderer.renderChildren(node, data);
        }
        return '';
    }

    tagIf(node, index, data) {
        let token = node.token;
        let attrText = token.text.slice(5, -1).trim();
        let attrs = utils.getAttrs(attrText);
        let testExp = this.cleanTestText(attrs.test);

        if (!testExp) {
            throw new Error('no valid test in :if (' + index + ', ' + token.text + ')');
        }
        let values = Object.assign({}, this.options.globals, data);
        let match = utils.evalExp(testExp, values);

        if (match) {
            this.lastIfMatched = true;
            return this.renderer.renderChildren(node, data);
        }
        this.lastIfMatched = false;
        return '';

    }

    tagElse(node, index, data) {
        if (!this.lastIfMatched) {
            return this.renderer.renderChildren(node, data);
        }
        return '';
    }

    tagUrl(node, index, data) {
        if ('var' in node.token.params) {
            data[node.token.params.var] = node.token.params.value;
            return this.wrapReturn('', data);
        }
        return node.token.params.value;
    }
}

module.exports = CoreLib;

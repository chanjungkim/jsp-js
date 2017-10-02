const utils = require('../utils');
const TagLib = require('./taglib');

class CoreLib extends TagLib {
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

    tagSetData(node, index, data) {
        let attrs = utils.getNodeAttrs(node, true);

        data[attrs.var] = attrs.value;
        return this.wrapReturn('', data);
    }

    tagForeach(node, index, data) {
        let attrs = utils.getNodeAttrs(node);
        let varName = attrs.var;

        /** @var {Array} items */
        let items = utils.getObjectAttrFromDottedString(data, this.cleanTestText(attrs.items));
        let html = '';
        let stuff = items.forEach((value) => {
            data[varName] = value;
            html += this.renderer.fullRender(node, data);
        });

        return html;
    }

    tagIgnore(node, index, data) {
        return '';
    }

    tagDefault(node, index, data) {
        let token = node.token;

        if (node.children && node.children.length > 0) {
            return this.renderer.renderChildren(node);
        }
        return this.tagIgnore(node, index, data);

    }

    tagChooseHandler(node, index, data) {
        return this.renderer.renderChildren(node, data);
    }

    tagWhenHandler(node, index, data) {
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

    tagOtherwiseHandler(node, index, data) {
        if (!this.lastWhenMatched) {
            return node.children.map((child, i) => {
                return this.renderer.renderNode(child, index + '_' + i, this.options);
            }).join('');
        }
        return '';
    }

    tagIfHandler(node, index, data) {
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

    tagElseHandler(node, index, data) {
        if (!this.lastIfMatched) {
            return this.renderer.renderChildren(node, data);
        }
        return '';
    }
}

module.exports = CoreLib;

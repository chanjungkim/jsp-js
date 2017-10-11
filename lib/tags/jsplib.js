const TagLib = require('./taglib');

class JspLib extends TagLib {
    constructor(options, renderer) {
        super(options, renderer);
        let self = this;

        this.tagMap = {
            'body': (...params) => self.tagBody.apply(self, params),
            'doBody': (...params) => self.tagDoBody.apply(self, params),
            'attribute': (...params) => self.tagAttribute.apply(self, params),
            'invoke': (...params) => self.tagInvoke.apply(self, params)
        };
    }

    tagBody(node, index, data) {
        data.jspBody = this.renderer.fullRender(node, data);
        return this.wrapReturn('', data);
    }

    getData(data, key, fallback) {
        if (typeof data[key] !== 'undefined') {
            return data[key];
        }
        return fallback;
    }

    tagDoBody(node, index, data) {
        let body = this.getData(data, 'jspBody', '');
        delete data.jspBody;
        return this.wrapReturn(body, data);
    }

    tagAttribute(node, index, data) {
        data[node.token.params.name] = this.renderer.renderChildren(node, data);
        return this.wrapReturn('', data);
    }

    tagInvoke(node, index, data) {
        let content = this.getData(data, node.token.params.fragment, '');
        return content;
    }
}

module.exports = JspLib;

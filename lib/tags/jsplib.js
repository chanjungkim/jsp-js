const TagLib = require('./taglib');

class JspLib extends TagLib {
    constructor(options, renderer) {
        super(options, renderer);
        let self = this;

        this.tagMap = {
            'body': (...params) => self.tagBody.apply(self, params),
            'doBody': (...params) => self.tagDoBody.apply(self, params)
        };
    }

    tagBody(node, index, data) {
        data.jspBody = this.renderer.fullRender(node, data);
        return this.wrapReturn('', data);
    }

    tagDoBody(node, index, data) {
        if (typeof data.jspBody === 'undefined') {
            return '';
        }
        let body = data.jspBody;
        delete data.jspBody;
        return body;
    }
}

module.exports = JspLib;

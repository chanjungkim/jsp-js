const path = require('path');
const fs = require('fs');
const TagLib = require('./taglib');
const log = require('../log');
const utils = require('../utils');

class TagDir extends TagLib {

    /**
     * Abstracts a tags directory.
     * @param {object} options
     * @param {String} options.tagdirPath
     * @param {Renderer} renderer
     */
    constructor(options, renderer) {
        super(options, renderer);
        this.tagdirPath = options.tagdirPath;
    }

    handle(tag, node, index, data) {
        let filePath = path.join(this.tagdirPath, tag + '.tag');
        if (!fs.existsSync(filePath)) {
            filePath = path.join(this.tagdirPath, tag + '.jsp');
        }

        let childrenScope = Object.assign({}, data);
        for (let paramName in node.token.params) {
            let paramValue = node.token.params[paramName];
            if (paramValue.indexOf('${') > -1) {
                let cleanParam = this.cleanTestText(paramValue);
                data[paramName] = utils.getObjectAttrFromDottedString(data, cleanParam);
            } else {
                data[paramName] = paramValue;
            }
        }
        let result = this.renderer.renderChildren(node, childrenScope, true);
        let subData = data;
        if (typeof result.data !== 'undefined') {
            subData = result.data;
            if (typeof result.data.jspBody === 'undefined' || result.data.jspBody === data.jspBody) {
                subData.jspBody = result.content;
            }
        }
        try {
            return this.renderer.render(filePath, subData);
        } catch (e) {
            log.error(e);
            return '';
        }
    }
}

module.exports = TagDir;

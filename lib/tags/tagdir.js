const path = require('path');
const TagLib = require('./taglib');
const log = require('../log');

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
        let result = this.renderer.renderChildren(node, data, true);
        let subData = typeof result.data === 'undefined' ? data : result.data;
        try {
            return this.renderer.render(filePath, subData);
        } catch (e) {
            log.error(e);
            return '';
        }
    }
}

module.exports = TagDir;

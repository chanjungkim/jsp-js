const fs = require('fs');
const path = require('path');
const TagLib = require('./taglib');

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
        let filePath;

        filePath = path.join(this.tagdirPath, tag + '.tag');
        return this.renderer.render(filePath, data);
    }
}

module.exports = TagDir;

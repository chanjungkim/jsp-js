const assert = require('assert');
const Renderer = require('../lib/renderer');

function renderText(text, data) {
    let renderer = new Renderer({});
    return renderer.renderText(text, data);
}

describe('Renderer', () => {
    it('Does not mess up HTML', () => {
        const html = '<p>Blah <br />blah</p>';
        let doc = renderText(html, {});
        assert.equal(doc, html);
    });

    it('Prints data in the HTML', () => {
        const html = 'Hello ${name} interpreter';
        let doc = renderText(html, {name: 'JSP'});
        assert.equal(doc, 'Hello JSP interpreter');
    });
});

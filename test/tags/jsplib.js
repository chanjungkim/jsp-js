const assert = require('assert');
const Renderer = require('../../lib/renderer');
const JspLib = require('../../lib/tags/jsplib');

function lib() {
    let renderer = new Renderer({});
    return new JspLib({}, renderer);
}

describe('JspLib', () => {
    describe('Basic tags support', () => {
        it('Supports body tags', () => {
            let result = lib().tagBody(
                {
                    type: 'tag',
                    token: {
                        name: 'jsp:body',
                        type: 'tag',
                        text: '<jsp:body>'
                    },
                    children: [
                        {
                            type: 'text',
                            token: {
                                type: 'text',
                                text: 'foobar'
                            }
                        }
                    ]
                },
                1,
                {}
            );

            assert.equal(result.data.jspBody, 'foobar');
        });

        it('Restitutes JSP body in doBody', () => {
            let result = lib().tagDoBody(
                {
                    type: 'tag',
                    token: {
                        name: 'jsp:doBody',
                        type: 'tag',
                        text: '<jsp:doBody />',
                        isClosed: true
                    }
                },
                1,
                {jspBody: 'foobar'}
            );

            assert.equal(result.content, 'foobar');
            assert.equal('undefined', typeof result.data.jspBody);
        });
    });

    describe('Advanced body use-cases', () => {
        it('Supports doBody inside body tag', () => {
            let result = lib().tagBody(
                {
                    type: 'tag',
                    token: {
                        name: 'jsp:body',
                        type: 'tag',
                        text: '<jsp:body>'
                    },
                    children: [
                        {
                            type: 'text',
                            token: {
                                type: 'text',
                                text: 'foo'
                            }
                        },
                        {
                            type: 'tag',
                            token: {
                                name: 'jsp:doBody',
                                type: 'tag',
                                text: '<jsp:doBody />'
                            }
                        }
                    ]
                },
                1,
                {jspBody: 'bar'}
            );

            assert.equal(result.data.jspBody, 'foobar');
        });
    });
});

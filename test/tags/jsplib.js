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

        it('Sets attributes in data', () => {
            let result = lib().tagAttribute(
                {
                    type: 'tag',
                    token: {
                        name: 'jsp:attribute',
                        type: 'tag',
                        params: {name: 'testAttr'},
                        text: '<jsp:attribute name="testAttr">'
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
            assert.equal(result.data.testAttr, 'foobar');
        });

        it('Invokes defined attributes', () => {
            let result = lib().tagInvoke(
                {
                    type: 'tag',
                    token: {
                        name: 'jsp:invoke',
                        type: 'tag',
                        params: {fragment: 'testAttr'},
                        text: '<jsp:invoke fragment="testAttr" />'
                    }
                },
                1,
                {testAttr: 'foobar'}
            );
            assert.equal(result, 'foobar');
        });
    });

    describe('Advanced use-cases', () => {
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

        it('Supports invokation inside attribute', () => {
            let result = lib().tagAttribute(
                {
                    type: 'tag',
                    token: {
                        name: 'jsp:attribute',
                        type: 'tag',
                        params: {name: 'testAttr'},
                        text: '<jsp:attribute name="testAttr">'
                    },
                    children: [
                        {
                            type: 'tag',
                            token: {
                                name: 'jsp:invoke',
                                type: 'tag',
                                params: {fragment: 'testAttr'},
                                text: '<jsp:invoke fragment="testAttr" />'
                            }
                        }
                    ]
                },
                1,
                {testAttr: 123}
            );
            assert.equal(result.content, '');
            assert.equal(result.data.testAttr, '123');
        });
    });
});

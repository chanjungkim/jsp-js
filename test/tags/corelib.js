const assert = require('assert');
const Renderer = require('../../lib/renderer');
const CoreLib = require('../../lib/tags/corelib');

function lib() {
    let renderer = new Renderer({});
    return new CoreLib({}, renderer);
}

describe('CoreLib', () => {
    it('Sets variables in data', () => {
        let data = {foo: null};
        let result = lib().tagSetData(
            {
                type: 'tag',
                token: {
                    name: 'c:set',
                    type: 'tag',
                    params: {var: 'foo', value: 'bar'},
                    text: '<c:set var="foo" value="bar" />'
                }
            },
            1,
            data
        );
        assert.equal(data.foo, 'bar');
        assert.equal(result.data.foo, 'bar');
    });

    it('Interprets forEach loops', () => {
        const data = {things: [1, 2, 3]};
        let result = lib().tagForeach(
            {
                type: 'tag',
                token: {
                    name: 'c:forEach',
                    type: 'tag',
                    text: '<c:forEach items="things">'
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
            data
        );
        assert.equal(result, 'foobarfoobarfoobar');
    });

    it('Supports When conditionals', () => {
        const test = (data) => {
            return lib().tagWhenHandler(
                {
                    type: 'tag',
                    token: {
                        name: 'c:when',
                        type: 'tag',
                        text: '<c:when test="val">'
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
                data
            );
        };
        assert.equal(test({val: true}), 'foobar');
        assert.equal(test({val: false}), '');
    });
});

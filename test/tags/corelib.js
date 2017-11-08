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
});

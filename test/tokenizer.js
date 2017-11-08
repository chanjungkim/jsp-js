const assert = require('assert');
const Tokenizer = require('../lib/tokenizer');

function tokrun(text) {
    let tokenizer = new Tokenizer();
    return tokenizer.run(text);
}

describe('Tokenizer', () => {
    describe('Basic HTML support', () => {
        it('Supports two-part tags', () => {
            let tokens = tokrun('<a>blah</a>');

            assert.equal(tokens.length, 3);

            assert.equal(tokens[0].type, 'text');
            assert.equal(tokens[1].type, 'text');
            assert.equal(tokens[2].type, 'text');

            assert.equal(tokens[0].text, '<a>');
            assert.equal(tokens[1].text, 'blah');
            assert.equal(tokens[2].text, '</a>');

            assert.equal(tokens[0].inTag, false);
            assert.equal(tokens[1].inTag, false);
            assert.equal(tokens[2].inTag, false);
        });

        it('Supports single tags', () => {
            let tokens = tokrun('<br />');

            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, 'text');
            assert.equal(tokens[0].text, '<br />');
            assert.equal(tokens[0].inTag, false);
        });

        it('Supports multiple tags', () => {
            let tokens = tokrun('<h1>blah</h1><p>foo bar</p>');

            assert.equal(tokens.length, 6);
            assert.equal(tokens[0].text, '<h1>');
            assert.equal(tokens[1].text, 'blah');
            assert.equal(tokens[2].text, '</h1>');
            assert.equal(tokens[3].text, '<p>');
            assert.equal(tokens[4].text, 'foo bar');
            assert.equal(tokens[5].text, '</p>');
        });

        it('Supports nested tag structures', () => {
            let tokens = tokrun('<p>foo <br /> bar</p>');

            assert.equal(tokens.length, 5);
            assert.equal(tokens[0].text, '<p>');
            assert.equal(tokens[1].text, 'foo ');
            assert.equal(tokens[2].text, '<br />');
            assert.equal(tokens[3].text, ' bar');
            assert.equal(tokens[4].text, '</p>');
        });
    });

    describe('JSP tags support', () => {
        it('Supports JSP comments', () => {
            let tokens = tokrun('<%-- A JSP comment --%>');
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, 'comment');
            assert.equal(tokens[0].text, '<%-- A JSP comment --%>');
        });

        it('Supports JSP directives', () => {
            let tokens = tokrun('<%@ taglib prefix="a" uri="http://foo.bar" %>');
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, 'directive');
            assert.equal(tokens[0].text, '<%@ taglib prefix="a" uri="http://foo.bar" %>');
        });

        it('Supports Expression tags', () => {
            let tokens = tokrun('<%= 2 + 2 %>');
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, 'code_exp');
            assert.equal(tokens[0].text, '<%= 2 + 2 %>');
        });

        it('Supports Code tags', () => {
            let tokens = tokrun('<% a = 2 + 2 %>');
            assert.equal(tokens.length, 1);
            assert.equal(tokens[0].type, 'text');
            assert.equal(tokens[0].text, '<% a = 2 + 2 %>');
        });
    });

    describe('Supports parameters', () => {
        it('Extracts tag parameters', () => {
            let tokens = tokrun('<c:if test="${thing}">blah</c:if>');
            assert.equal(3, tokens.length);
            assert.equal(1, Object.keys(tokens[0].params).length);
            assert.equal('${thing}', tokens[0].params.test);
        });
    });
});

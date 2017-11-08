const assert = require('assert');
const Parser = require('../lib/parser');

function parse(tokens) {
    let parser = new Parser(tokens);
    return parser.run();
}

describe('Parser', () => {
    it('Encapsulates nodes in a document node', () => {
        let ast = parse([]);
        assert.equal(ast.type, 'document');
        assert.equal(ast.children.length, 0);
    });

    it('Supports text', () => {
        let ast = parse([{type: 'text', text: 'foobar'}]);
        assert.equal(ast.children.length, 1);
        assert.equal(ast.children[0].type, 'text');
        assert.equal(typeof ast.children[0].token, 'object');
    });

    it('Supports comments', () => {
        let ast = parse([{type: 'comment', text: '<%-- foobar --%>'}]);
        assert.equal(ast.children[0].type, 'comment');
        assert.equal(typeof ast.children[0].token, 'object');
    });

    it('Supports code', () => {
        let ast = parse([{type: 'code', text: '${foobar}'}]);
        assert.equal(ast.children[0].type, 'code');
        assert.equal(typeof ast.children[0].token, 'object');
    });

    it('Supports code expressions', () => {
        let ast = parse([{type: 'code_exp', text: '<%=foobar%>'}]);
        assert.equal(ast.children[0].type, 'code_exp');
        assert.equal(typeof ast.children[0].token, 'object');
    });

    it('Supports directives', () => {
        let ast = parse([{type: 'directive', text: '<%@ foobar a="b" %>'}]);
        assert.equal(ast.children[0].type, 'directive');
        assert.equal(typeof ast.children[0].token, 'object');
    });

    it('Supports single tags', () => {
        let ast = parse([{type: 'tag', text: '<c:set var="a" value="2" />', closed: true}]);
        assert.equal(ast.children[0].type, 'tag');
        assert.equal(typeof ast.children[0].children, 'undefined');
        assert.equal(typeof ast.children[0].token, 'object');
    });

    it('Supports side-by-site tags', () => {
        let ast = parse([
            {type: 'directive', text: '<%@ taglib prefix="c" uri="blah" %>', closed: true},
            {type: 'tag', text: '<c:set var="a" value="2" />', closed: true}
        ]);
        assert.equal(ast.type, 'document');
        assert.equal(ast.children.length, 2);
    });

    // TODO: This needs fixing, the encapsulating document is missing. However it works.
    it('Supports nested tags', () => {
        let ast = parse([
            {type: 'tag', text: '<c:if test="2">', isOpen: true},
            {type: 'text', text: 'foobar'},
            {type: 'tag', text: '</c:if>', isClose: false}
        ]);
        assert.equal(ast.type, 'tag');
        assert.equal(ast.children.length, 1);
        assert.equal(ast.children[0].type, 'text');
        assert.equal(typeof ast.children[0].token, 'object');
        assert.equal(typeof ast.token, 'object');
    });
});

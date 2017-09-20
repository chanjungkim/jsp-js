let vm = require('vm');

/**
 * k1='v1' k2="v2" => {k1: "v1", k2: "v2"}
 * @param {String} text
 * @return {Object}
 */
function getAttrs(text) {
    let attrs = {};
    let reAttr = /(\w+)=['"](.+?)['"]/g;
    let m;

    while (m = reAttr.exec(text)) {
        attrs[m[1]] = m[2];
    }
    return attrs;
}

function tokenAttrs(tokenText, offset) {
    return getAttrs(tokenText.slice(offset, -1));
}

/**
 * Returns all attributes from a HTML node
 * @param {*} node
 * @param {bool} closedTag
 */
function getNodeAttrs(node, closedTag) {
    let endTag = '>';

    if (closedTag === true) {
        endTag = '/>';
    }
    let text = node.token.text.slice(
        node.token.name.length + 1,
        node.token.text.indexOf(endTag)
    ).trim();

    return getAttrs(text);
}

/**
 * Returns the attributes of an object from a dotted-string
 * @param {*} obj
 * @param {String} dottedString
 */
function getObjectAttrFromDottedString(obj, dottedString) {
    let path = dottedString.split('.');
    let item = obj;

    path.forEach((key) => item = item[key]);
    return item;
}

/**
 * @param {String} exp
 * @param {Object} data
 * @return {*} exp's value when run at the context of data
 */
function evalExp(exp, data) {
    if (data && exp in data) {
        return data[exp];
    }
    try {
        return vm.runInContext(exp, vm.createContext(data));
    } catch (e) {
        // console.error('expression failed: [%s] - %s', exp, e.message);
        return null;
    }
}

module.exports = {
    tokenAttrs,
    getAttrs,
    evalExp,
    getNodeAttrs,
    getObjectAttrFromDottedString
};

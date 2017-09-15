var vm = require('vm');

module.exports = {
    tokenAttrs,
    getAttrs,
    evalExp
};

function tokenAttrs(tokenText, offset) {
    return getAttrs(tokenText.slice(offset, -1));
};

/**
 * k1='v1' k2="v2" => {k1: "v1", k2: "v2"}
 * @param {String} text
 * @return {Object}
 */
function getAttrs(text) {
    var attrs = {};
    // bug: k1=' v1=="foo" '
    var reAttr = /(\w+)=(['"])(.+)\2/g;
    var m;

    while (m = reAttr.exec(text)) {
        attrs[m[1]] = m[3];
    }
    return attrs;
};

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
        console.error('expression failed: [%s] - %s', exp, e.message);
    }

};

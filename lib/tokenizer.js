const utils = require('./utils');

const CUSTOM_TAG_OPEN_REGEX = /^<([a-z]+:[a-z]+)\S?/i;
const CUSTOM_TAG_CLOSE_REGEX = /^<\/([a-z]+:[a-z]+)\S?/i;
const MAX_STRING_LENGTH = Math.pow(2, 31);
const MAX_INNER_QUOTES = 100;

class Tokenizer {
    constructor() {
        this.init();
    }

    init() {
        this.text = '';
        this.rest = this.text;
        this.pos = 0;
        this.cursor = 0;
        this.tokens = [];
        this.inTag = false;
        this.tagName = null;
    }

    run(text) {
        this.init();
        this.text = text;
        this.rest = text;

        while (this.pos < this.text.length) {
            if (this.inTag) {
                this.cursor = this.rest.indexOf('>');
                let nextTagIndex = this.rest.indexOf('<');
                if (this.cursor > -1 && nextTagIndex === -1 || this.cursor < nextTagIndex) {
                    this.saveTextToken(this.pos, this.relativeCursorPos('>'));
                }
            }

            this.cursor = this.rest.indexOf('<');
            if (this.cursor === -1) {
                this.saveTextToken(this.pos, this.text.length);
                break;
            }

            // Trim text before the <
            if (this.cursor > 0) {
                this.saveTextToken(this.pos, this.relativeCursorPos());
            }

            // Closing tag </..
            if (this.rest[1] === '/') {
                this.processClosingTag();
            } else {
                this.processOpeningTag();
            }
        }

        return this.tokens;
    }

    relativeCursorPos(closingString) {
        let offset = 0;
        if (typeof closingString !== 'undefined') {
            offset = closingString.length;
        }
        return this.pos + this.cursor + offset;
    }

    processClosingTag() {
        if (this.rest.match(CUSTOM_TAG_CLOSE_REGEX)) {
            this.tagName = CUSTOM_TAG_CLOSE_REGEX.exec(this.rest)[1];
            this.cursor = this.rest.indexOf('>');
            this.saveTagToken(this.pos, this.relativeCursorPos('>'), {
                name: this.tagName,
                isClose: true
            });
        } else {
            this.cursor = this.rest.indexOf('>');
            this.saveTextToken(this.pos, this.relativeCursorPos('>'));
        }
    }

    processOpeningTag() {
        if (this.rest.substr(0, 4) === '<%--') {
            this.processCommentTag();
        } else if (this.rest.substr(0, 3) === '<%@') {
            this.findEndTagOrFail('%>', 'No closing tag for directive');
            this.saveDirectiveToken(this.pos, this.relativeCursorPos('%>'));
        } else if (this.rest.substr(0, 3) === '<%=') {
            this.findEndTagOrFail('%>', 'No closing tag for code expression');
            this.saveCodeExpressionToken(this.pos, this.relativeCursorPos('%>'));
        } else if (this.rest.substr(0, 3) === '<%') {
            this.findEndTagOrFail('%>', 'No closing tag for code tag');
            this.saveCodeToken(this.pos, this.relativeCursorPos('%>'));
        } else if (this.rest.match(CUSTOM_TAG_OPEN_REGEX)) {
            this.processCustomOpenTag();
        } else {
            this.updateInTagStatus();
        }
    }

    findEndTagOrFail(endTag, errorMsg) {
        this.cursor = this.rest.indexOf(endTag);
        if (this.cursor === -1) {
            throw new Error(errorMsg);
        }
    }

    processCommentTag() {
        this.findEndTagOrFail('--%>', 'Comment not closed');
        this.saveCommentToken(this.pos, this.relativeCursorPos('--%>'));
    }

    processCustomOpenTag() {
        this.tagName = CUSTOM_TAG_OPEN_REGEX.exec(this.rest)[1];
        if (this.rest[this.rest.indexOf('>') - 1] === '/') {
            this.cursor = this.rest.indexOf('>');
        } else {
            this.cursor = this.findTagEndPosition(this.rest);
        }
        if (this.rest[this.cursor - 1] === '/') {
            this.saveTagToken(this.pos, this.relativeCursorPos('>'), {
                name: this.tagName,
                isOpen: true,
                closed: true
            });
        } else {
            this.saveTagToken(this.pos, this.relativeCursorPos('>'), {
                name: this.tagName,
                isOpen: true
            });
        }
    }

    findTagEndPosition(text) {
        let start;
        let end = 0;
        let counter = 0;

        do {
            start = end;
            end = text.indexOf('>', start + 1);
            if (counter > 9) {
                throw Error('findTagEndPosition: Too many iterations');
            }
            counter++;
        } while (!this.isQuoteNumMatch(text.slice(0, end)));
        return end;
    }

    isQuoteNumMatch(text) {
        let single = 0;
        let double = 0;
        let ch;

        if (text.length >= MAX_STRING_LENGTH) {
            throw new Error('isQuoteNumMatch: too many chars');
        }

        for (let i = 0; i < text.length; i++) {
            ch = text[i];
            if (ch === '"' && (text[i - 1] !== '\\' || single + double === 0)) {
                double++;
            } else if (ch === '\'' && (text[i - 1] !== '\\' || single + double === 0)) {
                single++;
            }
            if (single > MAX_INNER_QUOTES || double > MAX_INNER_QUOTES) {
                throw new Error('isQuoteNumMatch: run too many times');
            }
        }

        return single % 2 === 0 && double % 2 === 0;
    }

    genericTag(type, start, end) {
        let tag = {
            type: type,
            start: start,
            end: end,
            text: this.text.slice(start, end),
            inTag: this.inTag
        };
        this.pos = end;
        this.rest = this.text.slice(end);
        return tag;
    }

    saveTextToken(start, end) {
        this.tokens.push(this.genericTag('text', start, end));
    }

    /* <%-- ... --%> */
    saveCommentToken(start, end) {
        this.tokens.push(this.genericTag('comment', start, end));
    }

    /* <%@ ... %> */
    saveDirectiveToken(start, end) {
        let textChunk = this.text.slice(start + 3, end - 2).trim();
        let directive = textChunk.split(/[^\w]+/)[0];
        let tag = this.genericTag('directive', start, end);

        tag.params = utils.getAttrs(textChunk.slice(directive.length));
        tag.data = textChunk;
        tag.directive = directive;

        this.tokens.push(tag);
    }

    /* <%= ... %> */
    saveCodeExpressionToken(start, end) {
        let tag = this.genericTag('code_exp', start, end);

        tag.data = this.text.slice(start + 3, end - 2).trim();

        this.tokens.push(tag);
    }

    /* <% ... %> */
    saveCodeToken(start, end) {
        let tag = this.genericTag('code', start, end);

        tag.data = this.text.slice(start + 2, end - 2).trim();

        this.tokens.push(tag);
    }

    /* <c:if ...> */
    saveTagToken(start, end, data) {
        let textChunk = this.text.slice(start, end).trim();
        let tagName = textChunk.split(/[^\w]+/)[0];

        let tag = this.genericTag('tag', start, end);
        tag.tag = tagName;
        tag.params = utils.getAttrs(textChunk.slice(tagName.length));
        Object.assign(tag, data);
        this.tokens.push(tag);
    }

    /* in open tag, waiting for close */
    updateInTagStatus() {
        let posStart = this.rest.indexOf('<', 1);
        let posEnd = this.rest.indexOf('>', 1);

        if (posEnd === -1) {
            throw new Error('no close tag for tag');
        }

        // like: <img src="...?<%= ...%>" alt="...">
        if (posStart > 0 && posStart < posEnd) {
            this.inTag = true;
            this.saveTextToken(this.pos, this.pos + posStart);
        } else {
            this.saveTextToken(this.pos, this.pos + posEnd + 1);
            this.inTag = false;
        }
    }
}

module.exports = Tokenizer;

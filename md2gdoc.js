function Node(data) {
    this.data = data;
    this.children = [];
}

function Tree() {
    this.root = null;
}

Tree.prototype.add = function(data, toNodeData) {
    var node = new Node(data);
    var parent = toNodeData ? this.findBFS(toNodeData) : null;
    if (parent) {
        parent.children.push(node);
    } else {
        if (!this.root) {
            this.root = node;
        } else {
            return 'Root node is already assigned';
        }
    }
};
Tree.prototype.remove = function(data) {
    if (this.root.data === data) {
        this.root = null;
    }

    var queue = [this.root];
    while (queue.length) {
        var node = queue.shift();
        for (var i = 0; i < node.children.length; i++) {
            if (node.children[i].data === data) {
                node.children.splice(i, 1);
            } else {
                queue.push(node.children[i]);
            }
        }
    }
};
Tree.prototype.contains = function(data) {
    return this.findBFS(data) ? true : false;
};
Tree.prototype.findBFS = function(data) {
    var queue = [this.root];
    while (queue.length) {
        var node = queue.shift();
        if (node.data === data) {
            return node;
        }
        for (var i = 0; i < node.children.length; i++) {
            queue.push(node.children[i]);
        }
    }
    return null;
};
Tree.prototype._preOrder = function(node, fn) {
    if (node) {
        if (fn) {
            fn(node);
        }
        for (var i = 0; i < node.children.length; i++) {
            this._preOrder(node.children[i], fn);
        }
    }
};
Tree.prototype._postOrder = function(node, fn) {
    if (node) {
        for (var i = 0; i < node.children.length; i++) {
            this._postOrder(node.children[i], fn);
        }
        if (fn) {
            fn(node);
        }
    }
};
Tree.prototype.traverseDFS = function(fn, method) {
    var current = this.root;
    if (method) {
        this['_' + method](current, fn);
    } else {
        this._preOrder(current, fn);
    }
};
Tree.prototype.traverseBFS = function(fn) {
    var queue = [this.root];
    while (queue.length) {
        var node = queue.shift();
        if (fn) {
            fn(node);
        }
        for (var i = 0; i < node.children.length; i++) {
            queue.push(node.children[i]);
        }
    }
};
Tree.prototype.print = function() {
    if (!this.root) {
        return console.log('No root node found');
    }
    var newline = new Node('|');
    var queue = [this.root, newline];
    var string = '';
    while (queue.length) {
        var node = queue.shift();
        string += node.data.toString() + ' ';
        if (node === newline && queue.length) {
            queue.push(newline);
        }
        for (var i = 0; i < node.children.length; i++) {
            queue.push(node.children[i]);
        }
    }
    console.log(string.slice(0, -2).trim());
};
Tree.prototype.printByLevel = function() {
    if (!this.root) {
        return console.log('No root node found');
    }
    var newline = new Node('\n');
    var queue = [this.root, newline];
    var string = '';
    while (queue.length) {
        var node = queue.shift();
        string += node.data.toString() + (node.data !== '\n' ? ' ' : '');
        if (node === newline && queue.length) {
            queue.push(newline);
        }
        for (var i = 0; i < node.children.length; i++) {
            queue.push(node.children[i]);
        }
    }
    console.log(string.trim());
};

/**
 * Creates a menu entry in the Google Docs UI when the document is opened.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onOpen trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode.
 */
function onOpen(e) {
    DocumentApp.getUi().createAddonMenu()
        .addItem('Start', 'main')
        .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
    onOpen(e);
}

function main() {
    var doc = DocumentApp.getActiveDocument();
    convert(doc.getBody());
}

function test_transformLists() {
    var doc = DocumentApp.create('Mock');
    var body = doc.getBody();
    body.appendParagraph('\
        * Item 1 \
        * Item 2  \
        * Item 3 \
          * Subitem 1 \
          * Subitem 2 \
    ');
    structure(doc.getBody());
}


function test_transformHeadings() {
    var doc = DocumentApp.create('Mock');
    var body = doc.getBody();
    body.appendParagraph("#heading1");
    body.appendParagraph("###A multiple word title block");
    body.appendParagraph("a single line of text");
    body.appendParagraph("some text [with alink](http://www.foobar.com/#main/)");
    convert(body);
}

function test_bold() {
    var doc = DocumentApp.create('Mock');
    var body = doc.getBody();
    var p = '\
        * **Layer** - a rasterized \
        * **Layer Preview** - a visual  \
        * **PageViewer** - a component that allows **customers** \
    ';

    body.appendParagraph(p);
    convert(body);
}

function printBody(body) {
    var paragraphs = body.getParagraphs();
    for (var i in paragraphs) {
        Logger.log(paragraphs[i].getText());
    }
}

// Creates
function structure(body) {
    var paragraphs = body.getParagraphs(),
        newBody;
        p;

    
    for (var i in paragraphs) {
        p = paragraphs[i];
        log(p.getText());
    }

    return body;
}

/**
 * Iterates through the body, transforming Markdown elements into their
 * appropriate GoogleDoc formats
 *
 * @param {Body} https://developers.google.com/apps-script/reference/document/body
 */
function convert(body) {
    var paragraphs = body.getParagraphs(),
        p,
        text,
        strategy = null;

    for (var i in paragraphs) {
        p = paragraphs[i]
        text = p.getText();

        try {
            //p = transformLists(p);
            p = transformHeading(p);
            p = transformBold(p);
        } catch (e) {
            Logger.log("Couldn't transform: %s", text);
            Logger.log(e.message);
        }

    }
    return body;
}

/**
 * Transforms markdown header into the appropriate google doc header number
 * 
 *
 * @param {paragraph} Google paragraph item to be transformed
 *      https://developers.google.com/apps-script/reference/document/paragraph
 */
function transformHeading(p) {
    var t = p.getText()
    PATTERN_HEADER = /^#+.*/;

    if (!PATTERN_HEADER.test(t)) {
        return p;
    }

    var headingLevel = 0,
        i = 0;

    while (t.substr(i, 1) === "#") {
        headingLevel++;
        i++;
    }

    // Ignore headings past 5
    if (headingLevel <= 6) {
        p.setText(t.substr(i, t.length));
        p.setHeading(DocumentApp.ParagraphHeading["HEADING" + headingLevel]);
    }

    return p;
}

/**
 * Transforms lists into google doc structures
 *
 * @param {paragraph}
 * @return {paragraph}
 */
function transformLists(p) {
    // build a doc tree

    // create an array
    // for each paragraph
    // add a

    // convert unordered 
    return p;
}

function log(args) {
    var type = typeof(args);
    if (type === Array) {
        Logger.log("%s", args.join());
    } else {
        Logger.log(args);
    }
}

/**
 * Transform bold text tags
 *
 * @param {paragraph}
 */
function transformBold(p) {
    var PATTERN_BOLD = /\*{2}[\w\s]*\*{2}/,
        matches = getMatchBoundaries(p.getText(), PATTERN_BOLD),
        match,
        text;

    for (var i = 0; i < matches.length; i++) {
        match = matches[i];
        p.editAsText().setBold(matches[i][0], matches[i][1], true);
    }

    // remove the unneeded markdown markup
    if (match) {
        p.editAsText().replaceText("[*]{2}", "");
    }
    return p;
}

/**
 * Returns an array of matches alternating start and end positions in string 
 */
function getMatchBoundaries(str, pattern) {
    var offset = 0,
        tmp = str,
        range,
        results = [],
        absStart,
        absEnd;

    while (offset < str.length) {
        tmp = str.substring(offset);
        match = getBoundaryRange(tmp, pattern);

        if (match) {
            absStart = offset + match.start;
            absEnd = absStart + match.text.length;
            results.push([absStart, absEnd]);
            offset = absEnd;
            continue;
        }
        offset = str.length;
    }
    return results;
}


/**
 * Returns two offest values of the first occurence of pattern in str
 *
 * @param {string} Text to be searched
 * @param {Regex}
 * @return null or {Array}
 */
function getBoundaryRange(str, pattern) {
    var startPos = str.search(pattern),
        match,
        endPos;

    if (startPos > -1) {
        match = str.match(pattern);
        endPos = startPos + match[0].length;

        return {
            text: match[0],
            start: startPos,
            end: endPos
        };
    }
    return;
}
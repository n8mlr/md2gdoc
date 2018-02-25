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

function log(args) {
    var type = typeof(args);
    if (type === Array) {
        Logger.log("%s", args.join());
    } else {
        Logger.log(args);
    }
}

/**
 * Transforms bold setText
 *
 * @param {paragraph}
 */
function transformBold(p) {
    var PATTERN_BOLD = /\*{2}[\w\s]*\*{2}/,
        matches = getMatchBoundaries(p.getText(), PATTERN_BOLD),
        match;

    for (var i=0; i < matches.length; i++) {
        match = matches[i];
        p.editAsText().setBold(matches[i][0], matches[i][1], true);
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
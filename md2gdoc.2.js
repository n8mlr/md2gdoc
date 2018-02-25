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
    formatHeadings();
}


function test_formatHeadings() {
 
	var doc = DocumentApp.create('Mock');
	var body = doc.getBody();
	body.appendParagraph("#heading1");

	formatHeadings(body);
  
  Logger.log(body.getText());
}

function formatHeadings(body) {
    Logger.log("Called formatHeadings");
    var searchResult = null;
    var headerPattern = /#+.*/;

    while (searchResult = body.findText(headerPattern, searchResult)) {
      Logger.log("found match");

        var paragraph = searchResult.getElement().asParagraph();
        var str = paragraph.getText();
        var level = 0;

        for (var i = 0; i < str.length; i++) {
            var frag = str.substr(i, 1);
            if (frag === "#") {
                level++;
            } else {
                break;
            }
        }

        var enumName = "HEADING" + level;

        Logger.log("found", enumName);
        /*
		paragraph.replaceText(/#/, '');
		paragraph.setHeading(DocumentApp.ParagraphHeading[enumName]);
		*/
        // delete the text
        // create new line with header version
    }
  Logger.log("end loop");
}
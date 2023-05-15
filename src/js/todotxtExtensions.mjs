"use strict";
import "../../node_modules/jstodotxt/jsTodoExtensions.js";
import { convertDate } from "./date.mjs";
import { addIntervalToDate } from "./recurrences.mjs";

function TagExtension() {
	this.name = "customTags";
}
TagExtension.prototype = new TodoTxtExtension();
TagExtension.prototype.parsingFunction = function(line) {

	//var tagRegex = /(#\w+)/g;
	var tagRegex = /(^|\s+)#(\S+)/g;
	//var tagRegexReplace = /(^|\s+)#\S+/g;
	var matchTag = line.match(tagRegex);
	//var matchTagReplace = line.match(tagRegexReplace);
	if(matchTag !== null) {
		var customTags = [];
		for(var i = 0; i < matchTag.length; i++) { customTags.push( matchTag[i].trim().substr( 1 ) ); }



		const customTagsToString = "#" + customTags.join(" #");

		let textOnly = line.replace(tagRegex, '')

		console.log(customTagsToString)

		
		return [customTags, line.replace(tagRegex, ""), customTagsToString];
	}
	return [null, null, null];
};

function RecExtension() {
	this.name = "rec";
}
RecExtension.prototype = new TodoTxtExtension();
RecExtension.prototype.parsingFunction = function(line) {
	var rec = null;
	var recRegex = /rec:(\+?[0-9]*[hbdwmy])/;
	var matchRec = recRegex.exec(line);
	if ( matchRec !== null ) {
		rec = matchRec[1];
		return [rec, line.replace(recRegex, ''), matchRec[1]];
	}
	return [null, null, null];
};

function SugarDueExtension() {
	this.name = "due";
}
SugarDueExtension.prototype = new TodoTxtExtension();
SugarDueExtension.prototype.parsingFunction = function (line) {

	var relativeDateRegEx = /due:(\d+[dwm])/;
	var relativeDatMatch = relativeDateRegEx.exec(line)

	if ( relativeDatMatch !== null) {
		var dueDate = resolveRelativeDate(relativeDatMatch[1]);

		return [dueDate, line.replace(relativeDateRegEx, ''), convertDate(dueDate)];
	}
	else
	{
		var dueDate = null;
		var indexDueKeyword = line.indexOf("due:");
	
		// Find keyword due
		if (indexDueKeyword >= 0) {
			var stringAfterDue = line.substr(indexDueKeyword + 4)
			var words = stringAfterDue.split(" ");
			var match = null;
	
			// Try to parse a valid date until the end of the text
			for (var i = Math.max(5, words.length); i > 0; i--) {
				match = words.slice(0, i).join(" ");
				dueDate = Sugar.Date.create(match, {future: true});
				if (Sugar.Date.isValid(dueDate)) {
					return [dueDate, line.replace("due:" + match, ''), Sugar.Date.format(dueDate, '%Y-%m-%d')];
				}
			}
		}
	}
	return [null, null, null];
};

function PriExtension() {
	this.name = "pri";
}
PriExtension.prototype = new TodoTxtExtension();
PriExtension.prototype.parsingFunction = function (line) {

	var pri = null;
	var priRegex = /pri:([A-Z])/i;
	var matchPri = priRegex.exec(line);

	if ( matchPri !== null ) {
		pri = matchPri[1];
		return [pri, line.replace(priRegex, ''), matchPri[1]];
	}

	return [null, null, null];
};

function ThresholdExtension() {
	this.name = "t";
}
ThresholdExtension.prototype = new TodoTxtExtension();
ThresholdExtension.prototype.parsingFunction = function (line) {

	var relativeDateRegEx = /t:(\d+[dwm])/;
	var relativeDatMatch = relativeDateRegEx.exec(line)

	if ( relativeDatMatch !== null) {
		var thresholdDate = resolveRelativeDate(relativeDatMatch[1]);

		return [thresholdDate, line.replace(relativeDateRegEx, ''), convertDate(thresholdDate)];
	}
	else {
		var thresholdDate = null;
		var thresholdRegex = /t:([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})\s*/;
		var matchThreshold = thresholdRegex.exec(line);
		if ( matchThreshold !== null ) {
			var datePieces = matchThreshold[1].split('-');
			thresholdDate = new Date( datePieces[0], datePieces[1] - 1, datePieces[2] );
			return [thresholdDate, line.replace(thresholdRegex, ''), matchThreshold[1]];
		}
	}
	return [null, null, null];
};

function resolveRelativeDate(relativeDate) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    var unit = relativeDate.slice(-1);
    var increment = parseInt(relativeDate.slice(0, -1));
    return addIntervalToDate(today, increment, unit);
}

function PomodoroExtension() {
	this.name = "pm";
}
PomodoroExtension.prototype = new TodoTxtExtension();
PomodoroExtension.prototype.parsingFunction = function (line) {
	let regex = /pm:(\d+)/;
	let m = regex.exec(line)
	if (m !== null) {
		let pm = m[1];
		return [pm, line.replace(regex, ''), pm];
	}
	return [null, null, null];
};

export { RecExtension, SugarDueExtension, ThresholdExtension, PriExtension, PomodoroExtension, TagExtension };
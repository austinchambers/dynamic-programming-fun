/*jslint white: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, strict: true, newcap: true, immed: true, maxerr: 14 */
/*global window: false, REDIPS: true */

/* enable strict mode */
"use strict";

/*

 This code looks a bit complicated but it's a good example of how to use some built-in event handlers.
 The most complicated part is to shift orange boxes on the right side.
 This DIV elements are unmovable and should follow their counterparts on the left side.
 Result value and value of the left box are saved in class name in a format n(n+).
 For example, result box could have class n12 or left box could have class n4.
 Number from class is read and displayed when user dblclicks on DIV element.

 */

// create redips container
var redips = {};


// redips initialization
redips.init = function () {
    // reference to the REDIPS.drag class
    var rd = REDIPS.drag;
    // set initial math operation and application mode
    redips.operation = 'addition';
    redips.mode = 'mode1';
    // REDIPS.drag initialization
    rd.init();
    // set shift mode drop mode
    rd.dropMode = 'overwrite';
    // set shift properties
    rd.shift.mode = 'vertical2';	// set vertical shift (each column is treated separately)
    rd.shift.overflow = 'delete';	// overflowed element will be deleted
    rd.shift.animation = true;		// shift animation (shift animation must be turned on because moveObject uses animation)
    // event handler called in a moment before DIV is dropped (create result box in the most right column)

    rd.event.droppedBefore = function (targetTD) {
        // TD in 4th column
        var td4 = targetTD.parentNode.cells[4];
        // if right column is empty then create orange DIV box in last column
        if (rd.emptyCell(td4, 'test')) {
            // reference is target TD (needed to find parent row) while DIV is rd.obj element
            redips.createOrangeBox(targetTD, rd.obj);
        }
        // else set reference to the redips.obj (needed in event.relocateEnd and event.shiftOverflow)
        else {
            redips.obj = rd.obj;
        }
    };

    // even handler called when DIV element is moved (delete result box if DIV is moved in the bottom table)
    rd.event.moved = function () {
        // set source row
        var tr = rd.findParent('TR', rd.td.source);
        // if number is moved from bottom table then delete result box
        if (tr.className.indexOf('upper') === -1) {
            tr.cells[4].innerHTML = '';
        }
        // if numbers in upper tables are hidden then hide number when left DIV element is moved
        if (redips.mode === 'mode2') {
            rd.obj.innerHTML = '?';
        }
    };

    // if left DIV element is dbl clicked then show number
    rd.event.dblClicked = function () {
        rd.obj.innerHTML = redips.readNumber(rd.obj);
    };
};


// create orange box
// el is node from which will be found parent row
// div is reference of DIV element from whom is needed to read first number
redips.createOrangeBox = function (el, div) {
    var tr,			// current row
        num1, num2,	// numbers for addition or multiplication
        result,		// result will be hidden or displayed depending on redips.mode property
        td4;		// TD in 4th column
    // set current row
    tr = REDIPS.drag.findParent('TR', el);
    // set result cell
    td4 = tr.cells[4];
    // set first and second number and make implicit cast to numeric
    num1 = redips.readNumber(div);
    num2 = tr.cells[2].innerHTML * 1;
    // display result in orange box if application is set to mode1
    if (redips.mode === "mode1") {
        result = '?';
    }
    else {
        result = redips.math(num1, num2);
    }
    // display result box
    // redips-drag class is added for simpler clear DIV elements in clearAll method
    // REDIPS.drag.clearTable will delete only DIV elements that contains redips-drag class name
    td4.innerHTML = '<div class="redips-drag result box n' + redips.math(num1, num2) + '" ondblclick="window.redips.showResult(this)">' + result + '</div>';
};


// do math with num1 and num2
redips.math = function (num1, num2) {
    var result;
    // add or multiply num1 and num2
    if (redips.operation === 'addition') {
        result = num1 + num2;
    }
    else {
        result = num1 * num2;
    }
    // return result
    return result;
};


// display result below "?" (called after user clicks on result DIV)
redips.showResult = function (div) {
    div.innerHTML = redips.readNumber(div);
};


// read number from class number in format n(n+)
redips.readNumber = function (el) {
    // result is saved as a class name n(n+)
    var className = el.className,
        matchArray = className.match(/n(\d+)/);
    // return number (and implicit cast to numeric type)
    return matchArray[1] * 1;
};


// -------------------------------------------------
// methods called from UI
// -------------------------------------------------

// called on "mode" dropDown menu change
// show hide numbers in upper table
redips.setMode = function (el) {
    var div = document.getElementById('number').getElementsByTagName('div'),
        i;
    // when application mode is changed then tables should be cleaned
    redips.clearAll();
    // set aplication mode based on mode dropDown menu
    redips.mode = el.options[el.selectedIndex].value;
    // loop through all DIV elements in upper table and set innerHTML
    for (i = 0; i < div.length; i++) {
        if (redips.mode === 'mode1') {
            div[i].innerHTML = redips.readNumber(div[i]);
        }
        else {
            div[i].innerHTML = '?';
        }
    }
};


// called on "operation" dropDown menu change 
// set operation - addition / multiplication
redips.setOperation = function (el) {
    // set local variables
    var tables = document.getElementById('redips-drag').getElementsByTagName('table'),
        i;
    // set operation (global) - needed in event.dropped
    redips.operation = el.options[el.selectedIndex].value;
    // loop goes through all fetched tables within drag container
    for (i = 0; i < tables.length; i++) {
        // skip number table (upper table) or mini table (table with "trash" cell)
        if (tables[i].id === 'number' || tables[i].id === 'mini') {

        }
        // show selected table
        else if (tables[i].id === redips.operation) {
            tables[i].style.display = '';
        }
        // hide other tables
        else {
            tables[i].style.display = 'none';
        }
    }
};


// called on click of clear button
// method removes all DIV elements (containing redips-drag class name) from addition and multiplication table
redips.clearAll = function () {
    REDIPS.drag.clearTable('addition');
    REDIPS.drag.clearTable('multiplication');
};


// -------------------------------------------------
// attach event listener on body load
// -------------------------------------------------

// add onload event listener
if (window.addEventListener) {
    window.addEventListener('load', redips.init, false);
}
else if (window.attachEvent) {
    window.attachEvent('onload', redips.init);
}
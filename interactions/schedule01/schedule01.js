"use strict";

// --------------------- my logic ---------------------

// GLOBALS
var currActivity;
var startX;
var startY;
var currHoursTotal = 7;
var currHoursUsed = 0;
var currNumActivities = 4;

var activityArr = [ // ORDER MATTERS
    {
        'name': 'gym',
        'duration': 1,
        'value': 1,
        'index': 1
    },
    {
        'name': 'date',
        'duration': 3,
        'value': 4,
        'index': 2
    },
    {
        'name': 'hike',
        'duration': 4,
        'value': 5,
        'index': 3
    },
    {
        'name': 'beach',
        'duration': 5,
        'value': 7,
        'index': 4
    },
];

var table;
var NUM_ROWS = 4;
var NUM_COLS = 8;
function initTable() {
    table = [];
    for (var i = 0; i < NUM_ROWS; i++) {
        var row = [];
        for (var j = 0; j < NUM_COLS; j++) {
            row.push(0);
        }
        table.push(row);
    }

    // set up base cases
    for (var i = 0; i < NUM_ROWS; i++) {
        for (var j = 0; j < NUM_COLS; j++) {
            if (i == 0) table[i][j] = 1; // first row
            if (j == 0) table[i][j] = 0; // first col (overrides first cell)
        }
    }

    // populate rest of table
    for (var i = 1; i < NUM_ROWS; i++) {
        for (var j = 1; j < NUM_COLS; j++) {
            table[i][j] = computeCell(i, j);
        }
    }

    console.log(table);
}

function getCellAt(coords) {
    return table[coords[0]][coords[1]];
}

function computeCell(i, j) {
    var activity = activityArr[i];
    var aboveIdx = getAboveIdx(i, j);
    if (j - activity.duration >= 0) {
        var idx = getSubproblemIdx(i, j);
        return Math.max(
            activity.value + getCellAt(idx),
            getCellAt(aboveIdx));
    }
    else {
        return getCellAt(aboveIdx);
    }
}

function getSubproblemIdx(i, j) {
    var activity = activityArr[i];
    return [i - 1, j - activity.duration];
}

function getAboveIdx(i, j) {
    return [i - 1, j];
}

function displayTable() {
    var grid = document.getElementById('grid');

    for (var i = 0; i < NUM_ROWS; i++) {
        var row = grid.insertRow(i + 1);
        var cell = row.insertCell(0);
        var thisarray = [];
        for (var k = 0; k <= i; k++) {
            thisarray[k] = activityArr[k].name;
        }
        cell.innerHTML = thisarray.join(", ");

        for (var j = 0; j < NUM_COLS; j++) {
            var cell = row.insertCell(j + 1);
            cell.innerHTML = table[i][j];
        }
    }
}

var BLOCK_HEIGHT = 60;
var BLOCK_WIDTH = 60;

function highlightCellAt(r, c) {
    var grid = document.getElementById('grid');
    var cell = grid.rows[r].cells[c];
    cell.classList.add('highlight');
}

function unhighlightCellAt(r, c) {
    var grid = document.getElementById('grid');
    var cell = grid.rows[r].cells[c];
    cell.classList.remove('highlight');
}

function displaySchedule() {
    var display = document.getElementById('scheduler');
    display.style.height = BLOCK_HEIGHT + 'px';
    display.style.width = BLOCK_WIDTH * currHoursTotal + 'px';
    display = document.getElementById('hours-left');
    display.innerHTML = currHoursTotal - currHoursUsed;
}

function displayActivities(num) {
    for (var i = 0; i < activityArr.length; i++) {
        var activity = activityArr[i];
        var display = document.getElementById(activity.name);

        if (i < num) {
            display.style.height = BLOCK_HEIGHT + 'px';
            display.style.width = BLOCK_WIDTH * activity.duration + 'px';
            display.innerHTML = activity.name + '</br> + ' + activity.value
        }
        else {
            display.style.display = 'none';
        }
    }
}

function onDrop() {
    // update hours left
    currHoursUsed = currActivity.duration;
    elem = document.getElementById('hours-left');
    elem.innerHTML = currHoursTotal - currHoursUsed;
}


function onDragEnterAction(event) {
    // remove the drop feedback style
    var draggableElement = event.relatedTarget, dropzoneElement = event.target;
    currActivity = getCurrActivityFromName(draggableElement.id);
}

function onDragLeaveAction(event) {
    // remove the drop feedback style
    var draggableElement = event.relatedTarget, dropzoneElement = event.target;
    currActivity = getCurrActivityFromName(draggableElement.id);

    // update hours left
    currHoursUsed = currHoursUsed - currActivity.duration;
    elem = document.getElementById('hours-left');
    elem.innerHTML = currHoursTotal + currHoursUsed;
}

function getCurrActivityFromName(name) {
    var i;
    for (i = 0; i < activityArr.length; i++) {
        if (name == activityArr[i].name) {
            return activityArr[i];
        }
    }
}

function main() {
    currActivity = activityArr[currNumActivities - 1];
    //console.log('key interaction');
    initTable();
    displayTable();
    displaySchedule();
    displayActivities(currNumActivities);

    var elem = document.getElementById(currActivity.name);
    //console.log(elem);
    startX = elem.getBoundingClientRect().top;
    startY = elem.getBoundingClientRect().left;
    console.log(startX, startY);

    // highlight current
    highlightCellAt(currNumActivities, currHoursTotal + 1);

    var index;
    for (index = 0; index < activityArr.length; index++) {
        //interact('.dropzone').accept('#' + activityArr[index].name);
    }
}

// --------------------- InteractJS ---------------------

// target elements with the "draggable" class
interact('.draggable')
    .draggable({
        // enable inertial throwing
        inertia: false,

        // keep the element within the area of it's parent
        //restrict: {
        //    restriction: "parent",
        //    endOnly: true,
        //    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        //},

        // enable autoScroll
        autoScroll: false,

        // call this function on every dragmove event
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend: function (event) {
            var textEl = event.target.querySelector('p');

            textEl && (textEl.textContent =
                'moved a distance of '
                + (Math.sqrt(event.dx * event.dx +
                    event.dy * event.dy)|0) + 'px');
        }
    });

function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
        target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;

// enable draggables to be dropped into this
interact('.dropzone').dropzone({
    // Require a 50% element overlap for a drop to be possible
    overlap: 0.75,

    // listen for drop related events:

    ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
    },
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
    },
    ondragleave: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // remove the drop feedback style
        dropzoneElement.classList.remove('drop-target');
        draggableElement.classList.remove('can-drop');
    },
    ondrop: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        //draggableElement.classList.remove('notdropped');
        //draggableElement.classList.add('dropped');
        //onDrop();
    },
    ondropdeactivate: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // remove active dropzone feedback
        dropzoneElement.classList.remove('drop-active');
        dropzoneElement.classList.remove('drop-target');
    }
});
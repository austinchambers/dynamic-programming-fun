"use strict";

// Global Variables + Settings
var schedulerMaxHours = 7;      // Change the schedulerMaxHours to cause the schedule to increase or decrease in size (tested 1-7).
var schedulerMaxActivities = 4; // Change the schedulerMaxActivities to cause the set of activities to vary, starting with gym
var gridMaxRows = 4;            // Total number of rows to display in the grid, not including header. For 4 activities, this should be 4.
var gridMaxCols = 8;            // Total number of columns to display in the grid. With 0 included, this would be 0-7

var selectedActivity;           // The currently selected activity (in the interact.js events; probably safe to not touch)
var scheduleHoursUsed = 0;      // Tracks the current number of hours used in schedule. I'd treat as read-only variable
var scheduleValue = 0;          // Tracks the current value accumulated in schedule. I'd treat as read only variable

// Other stuff
const BLOCK_WIDTH = 60;       // Tracks the current width used by the 'block' CSS. Things will probably break if you change this.
const BLOCK_HEIGHT = 60;      // Tracks the current height used by the 'block' CSS. Things will probably break if you change this.
var startX;
var startY;
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

// ********************************** DP GRID LOOKUP ***************************************
// Initialize the table
var table;
function initTable() {
    table = [];
    for (var i = 0; i < gridMaxRows; i++) {
        var row = [];
        for (var j = 0; j < gridMaxCols; j++) {
            row.push(0);
        }
        table.push(row);
    }

    // set up base cases
    for (var i = 0; i < gridMaxRows; i++) {
        for (var j = 0; j < gridMaxCols; j++) {
            if (i == 0) table[i][j] = 1; // first row
            if (j == 0) table[i][j] = 0; // first col (overrides first cell)
        }
    }

    // populate rest of table
    for (var i = 1; i < gridMaxRows; i++) {
        for (var j = 1; j < gridMaxCols; j++) {
            table[i][j] = computeCell(i, j);
        }
    }
    console.log(table);
}

// Find the #grid item in the html page, and display the table within it.
function displayTable() {
    var grid = document.getElementById('grid');

    for (var i = 0; i < gridMaxRows; i++) {
        var row = grid.insertRow(i + 1);
        var cell = row.insertCell(0);
        var thisarray = [];
        for (var k = 0; k <= i; k++) {
            thisarray[k] = activityArr[k].name;
        }
        cell.innerHTML = thisarray.join(", ");

        for (var j = 0; j < gridMaxCols; j++) {
            var cell = row.insertCell(j + 1);
            cell.innerHTML = table[i][j];
        }
    }
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

// ********************************** SCHEDULING ***************************************
function displaySchedule() {
    var display = document.getElementById('scheduler');
    display.style.height = BLOCK_HEIGHT + 'px';
    display.style.width = BLOCK_WIDTH * schedulerMaxHours + 'px';
    display = document.getElementById('hours-left');
    display.innerHTML = schedulerMaxHours - scheduleHoursUsed;

    display = document.getElementById('scheduler-total-hours');
    display.innerHTML = schedulerMaxHours + 'h';
}

function displayActivities(num) {
    for (var i = 0; i < activityArr.length; i++) {
        var activity = activityArr[i];
        var display = document.getElementById(activity.name);

        if (i < num) {
            display.style.height = BLOCK_HEIGHT + 'px';
            display.style.width = BLOCK_WIDTH * activity.duration + 'px';
            display.innerHTML = activity.name
        }
        else {
            display.style.display = 'none';
        }
    }
}

function onDropAction(event) {
    var draggableElement = event.relatedTarget, dropzoneElement = event.target;
    selectedActivity = getselectedActivityFromName(draggableElement.id);

    // update hours left
    scheduleHoursUsed += selectedActivity.duration;
    var elem = document.getElementById('hours-left');
    elem.innerHTML = schedulerMaxHours - scheduleHoursUsed;

    // update value
    scheduleValue += selectedActivity.value;
    elem = document.getElementById('scheduler-value');
    elem.innerHTML = scheduleValue;
}

function onDragLeaveAction(event) {
    // remove the drop feedback style
    var draggableElement = event.relatedTarget, dropzoneElement = event.target;
    selectedActivity = getselectedActivityFromName(draggableElement.id);

    // update hours left
    scheduleHoursUsed -= selectedActivity.duration;
    var elem = document.getElementById('hours-left');
    elem.innerHTML = schedulerMaxHours - scheduleHoursUsed;

    // update value
    scheduleValue -= selectedActivity.value;
    elem = document.getElementById('scheduler-value');
    elem.innerHTML = scheduleValue;
}


function onDragEnterAction(event) {
    // remove the drop feedback style
    var draggableElement = event.relatedTarget, dropzoneElement = event.target;
    selectedActivity = getselectedActivityFromName(draggableElement.id);
}

function getselectedActivityFromName(name) {
    var i;
    for (i = 0; i < activityArr.length; i++) {
        if (name == activityArr[i].name) {
            return activityArr[i];
        }
    }
}

function main() {
    selectedActivity = activityArr[schedulerMaxActivities - 1];
    //console.log('key interaction');
    initTable();
    displayTable();
    displaySchedule();
    displayActivities(schedulerMaxActivities);

    var elem = document.getElementById(selectedActivity.name);
    //console.log(elem);
    startX = elem.getBoundingClientRect().top;
    startY = elem.getBoundingClientRect().left;
    console.log(startX, startY);

    // highlight current
    highlightCellAt(schedulerMaxActivities, schedulerMaxHours + 1);

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

    ondropactivate: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;
        selectedActivity = getselectedActivityFromName(draggableElement.id);

        // Only activate the dropzone if there is enough time.
        if ((schedulerMaxHours - scheduleHoursUsed) >= selectedActivity.duration) {
            // add active dropzone feedback
            event.target.classList.add('drop-active');
        }
    },
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;
        selectedActivity = getselectedActivityFromName(draggableElement.id);

        // Only activate the dropzone if there is enough time.
        if ((schedulerMaxHours - scheduleHoursUsed) >= selectedActivity.duration) {
            // feedback the possibility of a drop
            dropzoneElement.classList.add('drop-target');
            draggableElement.classList.add('can-drop');
        }
    },
    ondragleave: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;
        selectedActivity = getselectedActivityFromName(draggableElement.id);

        // remove the drop feedback style
        draggableElement.classList.remove('can-drop');
        dropzoneElement.classList.remove('drop-target');

        // If the item was dropped, then it can be removed
        if (draggableElement.classList.contains('dropped')) {
            draggableElement.classList.remove('dropped');
            onDragLeaveAction(event);
        }
    },
    ondrop: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // Only drop if the dropzone is active
        if (dropzoneElement.classList.contains('drop-active')) {
            draggableElement.classList.add('dropped');
            onDropAction(event);
        }
    },
    ondropdeactivate: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // remove active dropzone feedback
        dropzoneElement.classList.remove('drop-active');
        dropzoneElement.classList.remove('drop-target');
    }
});
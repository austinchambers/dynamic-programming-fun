"use strict";

// Global Variables + Settings
var schedulerMaxHours = 1;      // Change the schedulerMaxHours to cause the schedule to increase or decrease in size (tested 1-7).
var schedulerMaxActivities = 1; // Change the schedulerMaxActivities to cause the set of activities to vary, starting with gym
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
var gymStartTop;
var gymStartLeft;
var activityArr = [ // ORDER MATTERS
    {
        'name': 'gym',
        'duration': 1,
        'value': 1,
        'index': 1,
        'startTop': 0,
        'startLeft': 0,
    },
    {
        'name': 'date',
        'duration': 3,
        'value': 4,
        'index': 2,
        'startTop': 0,
        'startLeft': 0,
    },
    {
        'name': 'hike',
        'duration': 4,
        'value': 5,
        'index': 3,
        'startTop': 0,
        'startLeft': 0,
    },
    {
        'name': 'beach',
        'duration': 5,
        'value': 7,
        'index': 4,
        'startTop': 0,
        'startLeft': 0,
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
    // Update the scheduler width and height.
    var elem = document.getElementById('scheduler');
    elem.style.height = BLOCK_HEIGHT + 'px';
    elem.style.width = BLOCK_WIDTH * schedulerMaxHours + 'px';

    // Update hours left if the corresponding ID element exists.
    elem = document.getElementById('hours-left');
    if (elem != null) {
        elem.innerHTML = schedulerMaxHours - scheduleHoursUsed;
    }

    // Update total hours if the corresponding ID element exists.
    elem = document.getElementById('scheduler-total-hours');
    if (elem != null) {
        elem.innerHTML = schedulerMaxHours + ' hours total';
    }
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

// Used to get properties about the activity object using its name.
function getselectedActivityFromName(name) {
    var i;
    for (i = 0; i < activityArr.length; i++) {
        if (name == activityArr[i].name) {
            return activityArr[i];
        }
    }
}

// Set everything up
function main() {
    selectedActivity = activityArr[schedulerMaxActivities - 1];
    //initTable();
    //displayTable();
    displaySchedule();
    displayActivities(schedulerMaxActivities);

    setHelpfulText("Drag and drop activities into the schedule!");

    // Get the initial locations of the activities, and store in the activity array.
    for (var i = 0; i < schedulerMaxActivities; i++) {
        var elem = document.getElementById(activityArr[i]);
        var x = $("#"+activityArr[i].name).offset().top - $(document).scrollTop();
        var y = $("#"+activityArr[i].name).offset().left;
        activityArr[i].startLeft = x;
        activityArr[i].startTop = y;
        console.log('x, y:', x, y);
    }
}

// ********************************** INTERACT JS ***************************************
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

    // update helpful text
    updateHelpfulText();
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
    var oldValue = scheduleValue;
    scheduleValue -= selectedActivity.value;
    elem = document.getElementById('scheduler-value');
    elem.innerHTML = scheduleValue;

    // update helpful text
    updateHelpfulText();
}

// This is a bit lazy, but it gets the point across.
function updateHelpfulText() {
    var elem = document.getElementById('instruction');

    var doBetterText = "That's progress, but you could do better.";
    var instructionText = "Drag activities to your schedule to get the most value.";
    var optimalScheduleText = "Awesome! This is an optimal schedule!.";
    if ((schedulerMaxHours <= 2) || (schedulerMaxActivities == 1)) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else
            elem.innerHTML = optimalScheduleText;
    }
    else if (schedulerMaxHours == 3) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 4)
            elem.innerHTML = doBetterText;
        else
            elem.innerHTML = optimalScheduleText;
    }
    else if ((schedulerMaxHours == 4) || (schedulerMaxActivities == 2)) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 5)
            elem.innerHTML = doBetterText;
        else
            elem.innerHTML = optimalScheduleText;
    }
    else if ((schedulerMaxHours == 7 )) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 9)
            elem.innerHTML = doBetterText;
        else
            elem.innerHTML = optimalScheduleText;
    }
    else if (((schedulerMaxHours == 5) || (schedulerMaxHours == 6)) && schedulerMaxActivities == 3) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 6)
            elem.innerHTML = doBetterText;
        else
            elem.innerHTML = optimalScheduleText;
    }
    else if (schedulerMaxHours == 5) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 7)
            elem.innerHTML = doBetterText;
        else
            elem.innerHTML = optimalScheduleText;
    }
    else if (schedulerMaxHours == 6) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 8)
            elem.innerHTML = doBetterText;
        else
            elem.innerHTML = optimalScheduleText;
    }
}

function setHelpfulText(newText) {
    let elem = document.getElementById('instruction');
    elem.innerHTML = newText;
}

function onDragEnterAction(event) {
    // remove the drop feedback style
    var draggableElement = event.relatedTarget, dropzoneElement = event.target;
    selectedActivity = getselectedActivityFromName(draggableElement.id);
}

function onDragMove() {
}

interact('.draggable').snap({
    mode: 'anchor',
    anchors: [],
    range: Infinity,
    elementOrigin: { x: 0.5, y: 0.5 },
    endOnly: true
});

// target elements with the "draggable" class
interact('.draggable').draggable({
    // enable inertial throwing
    inertia: true,

    // enable autoScroll
    autoScroll: true,

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
    onDragMove();
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
    // Required element overlap for a drop to be possible
    overlap: 0.35,

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
        if (((schedulerMaxHours - scheduleHoursUsed) >= selectedActivity.duration)) {
            // feedback the possibility of a drop
            dropzoneElement.classList.add('drop-target');
            draggableElement.classList.add('can-drop');

            // If the item has already been dropped, don't count it's duration a second time.
            var dropOffset = 0;
            if (draggableElement.classList.contains('dropped')) {
                dropOffset = selectedActivity.duration;
            }

            var dropRect = interact.getElementRect(event.target),
                dropCenter = {
                    // To snap to the first location on left, uncomment following line
                    // x: dropRect.left + ((scheduleHoursUsed - dropOffset) * BLOCK_WIDTH) + (BLOCK_WIDTH * selectedActivity.duration) / 2,
                    x: dropRect.left + ((schedulerMaxHours - scheduleHoursUsed + dropOffset) * BLOCK_WIDTH) - (BLOCK_WIDTH * selectedActivity.duration) / 2,
                    y: dropRect.top + dropRect.height / 2
                };

            event.draggable.snap({
                anchors: [ dropCenter ]
            });
        }
        else {
            event.draggable.snap(false);
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

        event.draggable.snap(false);
    },

    ondrop: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // Only drop if the dropzone is active, and don't re-drop something that's already been dropped.
        if (dropzoneElement.classList.contains('drop-active') && !(draggableElement.classList.contains('dropped'))) {
            draggableElement.classList.add('dropped');
            console.log('on drop');
            onDropAction(event);
        }
    },
    ondropdeactivate: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // remove active dropzone feedback
        dropzoneElement.classList.remove('drop-active');
        dropzoneElement.classList.remove('drop-target');

        console.log('on drop deactivate');
    }
});
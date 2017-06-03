"use strict";

// Global Variables + Settings
var schedulerMaxHours = 2;      // Change the schedulerMaxHours to cause the schedule to increase or decrease in size (tested 1-7).
var schedulerMaxActivities = 1; // Change the schedulerMaxActivities to cause the set of activities to vary, starting with gym
var gridMaxRows = 4;            // Total number of rows to display in the grid, not including header. For 4 activities, this should be 4.
var gridMaxCols = 8;            // Total number of columns to display in the grid. With 0 included, this would be 0-7
var tableEnabled = true;       // True, if we have a table
var displayTableUpToRows = 1;
var displayTableUpToCols = 1;   // Row and column limit of the table to display, if tableEnabled = true
var highlightCellRow = 1;
var highlightCellCol = 1;       // Row and column of cell to highlighjt
var displayAllActivities = true;//Whether to display all activities or just a single one.
var singleActivityIndexToDisplay = 1; // Only use if displayAllActivities = true. Index of single activity to display (0=gym, 1=date, 2=hike, 3=beach)

var instructionText = "Drag the activity to your timeline to get the most value.";
var initialHelpfulText = "Can we go on a date.";
var doBetterText = "That's progress, but you could do better.";
var optimalScheduleText = "Awesome! You maximized your value!";

// Other stuff
var selectedActivity;           // The currently selected activity (in the interact.js events; probably safe to not touch)
var scheduleHoursUsed = 0;      // Tracks the current number of hours used in schedule. I'd treat as read-only variable
var scheduleValue = 0;          // Tracks the current value accumulated in schedule. I'd treat as read only variable
var scheduleHoursUsed = 0;      // Tracks the current number of hours used in schedule. I'd treat as read-only variable
var scheduleValue = 0;          // Tracks the current value accumulated in schedule. I'd treat as read only variable

const BLOCK_WIDTH = 60;       // Tracks the current width used by the 'block' CSS. Things will probably break if you change this.
const BLOCK_HEIGHT = 60;      // Tracks the current height used by the 'block' CSS. Things will probably break if you change this.
var startPos = {x: 0, y: 0};
var activityArr = [ // ORDER MATTERS
    {
        'name': 'gym',
        'duration': 1,
        'value': 1,
        'index': 1,
    },
    {
        'name': 'date',
        'duration': 3,
        'value': 4,
        'index': 2,
    },
    {
        'name': 'hike',
        'duration': 4,
        'value': 5,
        'index': 3,
    },
    {
        'name': 'beach',
        'duration': 5,
        'value': 7,
        'index': 4,
    },
];

// Set everything up
function main() {
    // Display all activities or just a single one.
    if (displayAllActivities == true) {
        displayActivities(schedulerMaxActivities);
    }
    else {
        displaySingleActivity(singleActivityIndexToDisplay);
    }

    // Display a table, and if so, set table settings.
    if (tableEnabled == true) {
        initTable();
        displayTableUpTo(displayTableUpToRows, displayTableUpToCols);
        highlightCellAt(highlightCellRow, highlightCellCol)
    }

    setHelpfulText(initialHelpfulText);
    displaySchedule();
}

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

function displayTableUpTo(maxRows, maxCols) {
    var grid = document.getElementById('grid');

    for (var i = 0; i < maxRows; i++) {
        var row = grid.insertRow(i + 1);
        var cell = row.insertCell(0);
        var thisarray = [];
        for (var k = 0; k <= i; k++) {
            thisarray[k] = activityArr[k].name;
        }
        cell.innerHTML = thisarray.join(", ");


        for (var j = 0; j < gridMaxCols-1; j++) {
            var cell = row.insertCell(j + 1);
            if (i == maxRows - 1 && j >= maxCols) {
                cell.innerHTML = '';
            }
            else {
                cell.innerHTML = table[i][j+1];
            }

        }
    }
}

function fillInTable(r, c) {
    var grid = document.getElementById('grid');
    let cell = grid.rows[r].cells[c];
    cell.innerHTML = table[r][c+1];
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
    cell.innerHTML = '?';
}

function unhighlightCellAt(r, c) {
    var grid = document.getElementById('grid');
    var cell = grid.rows[r].cells[c];
    cell.classList.remove('highlight');
}

function addCellEvents(r, c) {
    let elem = document.getElementById('grid');
    let cell = elem.rows[r].cells[c];
    cell.addEventListener('mouseover', onCellMouseOver);
    cell.addEventListener('mouseleave', onCellMouseLeave);
    cell.addEventListener('click', onCellClick)
}

function onCellMouseLeave(event) {
    console.log('mouse leave', event.target);
    //showX();
    hidePhantomActivity('gym');
    setHelpfulText(doesntFitText);
    hidePhantomValue();
    hidePhantomHoursLeft();
    event.target.classList.remove('target-time-highlight');
}

function highlightCellBorderAt(r, c) {
    let elem = document.getElementById('grid');
    let cell = elem.rows[r].cells[c];
    cell.classList.add('highlight-border');
}

function onCellMouseOver(event) {
    console.log('mouse over', event.target);
    hideX();
    // // hack, fix this
    // $('#date').animate({
    //     'left' : "+=300px"
    // }, "slow");
    document.getElementById('date').classList.remove('draggable');
    showPhantomActivity('gym');
    setHelpfulText("That's right! We can go to the gym. Fill in the table by clicking on the value.");
    showPhantomValue(1);
    showPhantomHoursLeft(0);
    event.target.classList.add('target-time-highlight');
}

function highlightTargetTime(filename) {
    let elems = document.getElementsByClassName('target-time');
    for (let i = 0; i < elems.length; i++) {
        let elem = elems[i];
        elem.src = '../../figures/yellow_time_icons/' + filename;
    }

}

var oldValue;
function showPhantomValue(phantomValue) {
    let elem = document.getElementById('scheduler-value');
    oldValue = elem.innerHTML;
    elem.innerHTML = phantomValue;
    elem.style.opacity = 0.5;
}

function hidePhantomValue() {
    let elem = document.getElementById('scheduler-value');
    elem.innerHTML = oldValue;
    elem.style.opacity = 1;
}

function fillInPhantomValue() {
    let elem = document.getElementById('scheduler-value');
    elem.style.opacity = 1;
}

var oldHoursLeft;
function showPhantomHoursLeft(phantomHoursLeft) {
    let elem = document.getElementById('hours-left');
    oldHoursLeft = elem.innerHTML;
    elem.innerHTML = phantomHoursLeft;
    elem.style.opacity = 0.5;
}

function hidePhantomHoursLeft() {
    let elem = document.getElementById('hours-left');
    elem.innerHTML = oldHoursLeft;
    elem.style.opacity = 1;
}

function fillInPhantomHoursLeft() {
    let elem = document.getElementById('hours-left');
    elem.style.opacity = 1;
}

function showPhantomActivity(name) {
    let elem = document.getElementById('phantom-'+name);
    elem.style.display = 'block';
    elem.innerHTML = name;
}

function hidePhantomActivity(name) {
    let elem = document.getElementById('phantom-'+name);
    elem.style.display = 'none';
}

function fillInPhantomActivity(name) {
    let elem = document.getElementById('phantom-'+name);
    elem.style.opacity = 1;
}
function onCellClick(event) {
    console.log('click', event.target);
    fillInTable(2,1);
    fillInPhantomActivity('gym');
    fillInPhantomValue();
    fillInPhantomHoursLeft();

    event.target.removeEventListener('mouseover', onCellMouseOver);
    event.target.removeEventListener('mouseleave', onCellMouseLeave);

    showCheck();

}

function showX() {
    let elem = document.getElementById('x');
    elem.style.visibility = 'visible';
}

function hideX() {
    let elem = document.getElementById('x');
    //elem.style.backgroundColor = 'red';
    elem.style.visibility = 'hidden';
}

function showCheck() {
    let elem = document.getElementById('check');
    elem.style.visibility = 'visible';
}

function hideCheck() {
    let elem = document.getElementById('check');
    elem.style.visibility = 'hidden';
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

function displaySingleActivity(idx) {
    for (var i = 0; i < activityArr.length; i++) {
        var activity = activityArr[i];
        var display = document.getElementById(activity.name);

        if (i == idx) {
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

function setHelpfulText(newText) {
    let elem = document.getElementById('instruction');
    elem.innerHTML = newText;
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

    // update
    updateHelpText();
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
    updateHelpText();
}

function indicateNotOptimal() {
    let elem = document.getElementById('instruction');
    elem.innerHTML = doBetterText;

    elem = document.getElementById('value-box');
    elem.style.backgroundColor = 'yellow';
}

function indicateOptimal() {
    let elem = document.getElementById('instruction');
    elem.innerHTML = optimalScheduleText;

    elem = document.getElementById('value-box');
    elem.style.backgroundColor = 'lightgreen';
}

function indicateNotOptimal() {
    let elem = document.getElementById('instruction');
    elem.innerHTML = doBetterText;

    elem = document.getElementById('value-box');
    elem.style.backgroundColor = 'yellow';
}

function indicateOptimal() {
    let elem = document.getElementById('instruction');
    elem.innerHTML = optimalScheduleText;

    elem = document.getElementById('value-box');
    elem.style.backgroundColor = 'lightgreen';
}

// This is a bit lazy, but it gets the point across.
function updateHelpText() {
    let elem = document.getElementById('instruction');

    if ((schedulerMaxHours <= 2) || (schedulerMaxActivities == 1)) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else
            indicateOptimal();
    }
    else if (schedulerMaxHours == 3) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 4)
            indicateNotOptimal();
        else
            indicateOptimal();
    }
    else if ((schedulerMaxHours == 4) || (schedulerMaxActivities == 2)) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 5)
            indicateNotOptimal();
        else
            indicateOptimal();
    }
    else if ((schedulerMaxHours == 7 )) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 9)
            indicateNotOptimal();
        else
            indicateOptimal();
    }
    else if (((schedulerMaxHours == 5) || (schedulerMaxHours == 6)) && schedulerMaxActivities == 3) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 6)
            indicateNotOptimal();
        else
            indicateOptimal();
    }
    else if (schedulerMaxHours == 5) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 7)
            indicateNotOptimal();
        else
            indicateOptimal();
    }
    else if (schedulerMaxHours == 6) {
        if (scheduleValue == 0)
            elem.innerHTML = instructionText;
        else if (scheduleValue < 8)
            indicateNotOptimal();
        else
            indicateOptimal();
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

var doesntFitText = "That's right, it doesn't fit. Click on what we <em>can</em> do in an hour.";

function onDropDeactivate() {
    if (tableEnabled == true) {
        showX();
        setHelpfulText(doesntFitText);
        addCellEvents(1,1);
        //highlightTargetTime('1h.png');
        highlightCellBorderAt(1, 1);
    }
}

interact('.draggable').snap({
    mode: 'anchor',
    anchors: [],
    range: Infinity,
    elementOrigin: { x: 0.5, y: 0.5 },
    endOnly: true
});

interact('.draggable')
    .on('dragstart', function (event) {
        var draggableElement = event.target;

        if (!draggableElement.classList.contains('dropped')) {
            var rect = interact.getElementRect(event.target);
            selectedActivity = getselectedActivityFromName(event.target.id);

            // record center point when starting a drag
            startPos.x = rect.left + rect.width  / 2;
            startPos.y = rect.top  + rect.height / 2;

            // snap to the start position
            event.interactable.snap({ anchors: [startPos] });
            console.log('setting snap '.concat(startPos.x).concat('-').concat(startPos.y));
            console.log('on undropped dragstart '.concat(selectedActivity.name));
        }
        else {
            console.log('on dropped dragstart '.concat(selectedActivity.name));
        }
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
            console.log('on drag activate dropzone '.concat(draggableElement.id));
        }
        else {
            console.log('on drag noactivate dropzone '.concat(draggableElement.id));
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
                console.log('on drag enter valid from dropped '.concat(draggableElement.id));
                dropOffset = selectedActivity.duration;
            }
            else {
                console.log('on drag enter valid from notdropped '.concat(draggableElement.id));
            }


            var dropRect = interact.getElementRect(event.target),
                dropCenter = {
                    // To snap to the first location on left, uncomment following line
                    // x: dropRect.left + ((scheduleHoursUsed - dropOffset) * BLOCK_WIDTH) + (BLOCK_WIDTH * selectedActivity.duration) / 2,
                    x: dropRect.left + ((schedulerMaxHours - scheduleHoursUsed + dropOffset) * BLOCK_WIDTH) - (BLOCK_WIDTH * selectedActivity.duration) / 2,
                    y: dropRect.top + dropRect.height / 2
                };
            console.log('setting snap '.concat(dropCenter.x).concat('-').concat(dropCenter.y));
            event.draggable.snap({
                anchors: [ dropCenter ]
            });
        }
        else {
            console.log('on drag enter notvalid '.concat(draggableElement.id));
        }
    },

    ondragleave: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;
        selectedActivity = getselectedActivityFromName(draggableElement.id);

        dropzoneElement.classList.remove('drop-target');

        // If the draggable element had 'can-drop' then it was in the drag zone in a valid state.
        if (draggableElement.classList.contains('can-drop')) {
            // remove the drop feedback style
            draggableElement.classList.remove('can-drop');

            // If the item was dropped, then it can be removed
            if (draggableElement.classList.contains('dropped')) {
                draggableElement.classList.remove('dropped');
                onDragLeaveAction(event);
                console.log('on drag leave valid from dropped '.concat(draggableElement.id));
            }
            else {
                console.log('on drag leave valid from notdropped '.concat(draggableElement.id));
            }

            console.log('setting return snap position '.concat(startPos.x).concat('-').concat(startPos.y));
            event.draggable.snap({
                anchors: [ startPos ]
            });
        }
        else {
            console.log('on drag leave invalid '.concat(draggableElement.id));
        }
    },

    ondrop: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // Only drop if the dropzone is active, and don't re-drop something that's already been dropped.
        if (dropzoneElement.classList.contains('drop-active') && !(draggableElement.classList.contains('dropped'))) {
            draggableElement.classList.add('dropped');
            console.log('on drop from notdropped '.concat(draggableElement.id));
            onDropAction(event);
        }
        else {
            console.log('on drop from dropped '.concat(draggableElement.id));
        }
    },
    ondropdeactivate: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // remove active dropzone feedback
        dropzoneElement.classList.remove('drop-active');
        dropzoneElement.classList.remove('drop-target');

        console.log('on drop deactivate '.concat(draggableElement.id));

        onDropDeactivate();
    }
});
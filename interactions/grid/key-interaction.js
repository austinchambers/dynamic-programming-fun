"use strict";

// var things = {
// 	'gym': {
// 		'duration': 1,
// 		'value': 1
// 	},
// 	'hike': {
// 		'duration': 3,
// 		'value': 4
// 	},
// 	'date': {
// 		'duration': 4,
// 		'value': 5
// 	},
// 	'beach': {
// 		'duration': 5,
// 		'value': 7
// 	}
// };

// --------------------- my logic ---------------------

// GLOBALS
var currActivity;
var startX;
var startY;
var currHoursTotal = 4;
var currHoursUsed = 0;
var currNumActivities = 2;

var activityArr = [ // ORDER MATTERS
    {
        'name': 'gym',
        'duration': 1,
        'value': 1
    },
    {
        'name': 'date',
        'duration': 3,
        'value': 4
    },
    {
        'name': 'hike',
        'duration': 4,
        'value': 5
    },
    {
        'name': 'beach',
        'duration': 5,
        'value': 7
    },
];

var table;
var NUM_ROWS = 4;
var NUM_COLS = 8;
function initTable() {
    table = [];
    for (let i = 0; i < NUM_ROWS; i++) {
        let row = [];
        for (let j = 0; j < NUM_COLS; j++) {
            row.push(0);
        }
        table.push(row);
    }

    // set up base cases
    for (let i = 0; i < NUM_ROWS; i++) {
        for (let j = 0; j < NUM_COLS; j++) {
            if (i == 0) table[i][j] = 1; // first row
            if (j == 0) table[i][j] = 0; // first col (overrides first cell)
        }
    }

    // populate rest of table
    for (let i = 1; i < NUM_ROWS; i++) {
        for (let j = 1; j < NUM_COLS; j++) {
            table[i][j] = computeCell(i, j);
        }
    }

    console.log(table);
}

function getCellAt(coords) {
    return table[coords[0]][coords[1]];
}

function computeCell(i, j) {
    let activity = activityArr[i];
    let aboveIdx = getAboveIdx(i, j);
    if (j - activity.duration >= 0) {
        let idx = getSubproblemIdx(i, j);
        return Math.max(
            activity.value + getCellAt(idx),
            getCellAt(aboveIdx));
    }
    else {
        return getCellAt(aboveIdx);
    }
}

function getSubproblemIdx(i, j) {
    let activity = activityArr[i];
    return [i - 1, j - activity.duration];
}

function getAboveIdx(i, j) {
    return [i - 1, j];
}

function displayTable() {
    let grid = document.getElementById('grid');

    for (let i = 0; i < NUM_ROWS; i++) {
        let row = grid.insertRow(i + 1);
        let cell = row.insertCell(0);
        cell.innerHTML = '+ ' + activityArr[i].name;
        for (let j = 0; j < NUM_COLS; j++) {
            let cell = row.insertCell(j + 1);

            // dynamic display of table
            if (!(i >= currNumActivities || (i == currNumActivities - 1 && j >= currHoursTotal))) {
                cell.innerHTML = table[i][j];
            }
        }
    }
}

var BLOCK_HEIGHT = 60;
var BLOCK_WIDTH = 60;

function highlightCellAt(r, c) {
    let grid = document.getElementById('grid');
    let cell = grid.rows[r].cells[c];
    cell.classList.add('highlight');
}

function updateTableCell(r, c) {
    let grid = document.getElementById('grid');
    let cell = grid.rows[r].cells[c];
    cell.innerHTML = table[r-1][c-1];
}

function highlightOnHover(r, c) {
    let grid = document.getElementById('grid');
    let cell = grid.rows[r].cells[c];
    // cell.onmouseover = console.log('hi');

    $(cell).hover(function(){
        $(this).addClass('highlight');
        }, function(){
        $(this).removeClass('highlight');
    });
}

function displaySchedule() {
    let display = document.getElementById('scheduler');
    display.style.height = BLOCK_HEIGHT + 'px';
    display.style.width = BLOCK_WIDTH * currHoursTotal + 'px';
    display = document.getElementById('hours-left');
    display.innerHTML = currHoursTotal - currHoursUsed;
}

function displayActivities(num) {
    for (let i = 0; i < activityArr.length; i++) {
        let activity = activityArr[i];
        let display = document.getElementById(activity.name);

        if (i < num) {
            display.style.height = BLOCK_HEIGHT + 'px';
            display.style.width = BLOCK_WIDTH * activity.duration + 'px';
            display.innerHTML = activity.name + '</br> + ' + activity.value
        }
        else {
            display.style.display = 'none';
        }

        if (i == num-1) {
            display.classList += ' draggable';
        }
        else {
            display.classList += ' not-draggable';
        }
    }
}

function onDragEnter() {

}

function onDrop() {
    // update current value
    let elem = document.getElementById('consider').getElementsByClassName('value')[0];
    elem.innerHTML = ' ' + currActivity.value + ' ';

    // update hours left
    currHoursUsed = currActivity.duration;
    elem = document.getElementById('hours-left');
    elem.innerHTML = currHoursTotal - currHoursUsed;

    // add event listener to corresponding cell
    let i = currNumActivities - 1;
    let j = currHoursTotal;
    let idx = getSubproblemIdx(i, j);
    //console.log(idx);
    let sub_i = idx[0];
    let sub_j = idx[1];
    let row = sub_i + 1;
    let col = sub_j + 1;
    elem = document.getElementById('grid').rows[row].cells[col];

    highlightOnHover(row, col);

    elem.addEventListener('click', updateConsiderComputation);

    // help text
    elem = document.getElementById('help-text');
    elem.innerHTML = 'What is the most thrill we can get out of our remaining time and activities? Find it in the table.';
}

function onDragLeave() {
}

function updateConsiderComputation(event) {
    let target = event.target;
    let subvalue = document.getElementById('consider').getElementsByClassName('subvalue')[0];
    subvalue.innerHTML = ' ' + target.innerHTML + ' ';
    let value = document.getElementById('consider').getElementsByClassName('value')[0];
    let sumElem = document.getElementById('consider').getElementsByClassName('sum')[0];
    let sum = parseInt(subvalue.innerHTML) + parseInt(value.innerHTML);
    sumElem.innerHTML = ' ' + sum + ' ';

    // help text
    let elem = document.getElementById('help-text');
    elem.innerHTML = 'What thrill would we get if we forget the date? Click on the Forget button.';

    document.getElementById("forget-button").disabled = false;
}

function updateForgetComputation(event) {
    let target = event.target;
    let subvalue = document.getElementById('forget').getElementsByClassName('subvalue')[0];
    subvalue.innerHTML = ' ' + target.innerHTML + ' ';
    let value = document.getElementById('forget').getElementsByClassName('value')[0];
    let sumElem = document.getElementById('forget').getElementsByClassName('sum')[0];
    let sum = parseInt(subvalue.innerHTML) + parseInt(value.innerHTML);
    sumElem.innerHTML = ' ' + sum + ' ';

    // help text
    let elem = document.getElementById('help-text');
    elem.innerHTML = 'We want to maximize thrill. Should we consider or forget the date? Click on the value to fill in the table.';

    elem = document.getElementById('consider').getElementsByClassName('sum')[0];
    elem.addEventListener('click', updateTable)
}

function updateTable(event) {
    updateTableCell(currNumActivities, currHoursTotal + 1);
}

function onForgetButtonClick(event) {
    // move current activity back
    // not working
    let elem = document.getElementById(currActivity.name);
    console.log(elem);
    elem.style.position = 'absolute';
    console.log(startX, startY);
    elem.style.top = 220 + 'px';
    elem.style.left = 10 + 'px';
    //elem.classList.remove('drop-active');
    elem.classList.remove('can-drop');

    let value = document.getElementById('forget').getElementsByClassName('value')[0];
    value.innerHTML = ' 0 ';

    // update hours left
    currHoursUsed = 0;
    elem = document.getElementById('hours-left');
    elem.innerHTML = currHoursTotal - currHoursUsed;

    // add event listener to corresponding cell
    let i = currNumActivities - 1;
    let j = currHoursTotal;
    let idx = getAboveIdx(i, j);
    console.log(idx);
    let sub_i = idx[0];
    let sub_j = idx[1];
    let row = sub_i + 1;
    let col = sub_j + 1;
    elem = document.getElementById('grid').rows[row].cells[col];
    highlightOnHover(row, col);
    elem.addEventListener('click', updateForgetComputation);

    // help text
    elem = document.getElementById('help-text');
    elem.innerHTML = 'What is the most thrill we can get out of our remaining time and activities? Find it in the table.';

    // disable button
    document.getElementById("forget-button").disabled = true;
}

function onDropLeave() {
    onForgetButtonClick();
}

function main() {
    currActivity = activityArr[currNumActivities - 1];
    //console.log('key interaction');
    initTable();
    displayTable();
    displaySchedule();
    displayActivities(currNumActivities);

    let elem = document.getElementById(currActivity.name);
    //console.log(elem);
    startX = elem.getBoundingClientRect().top;
    startY = elem.getBoundingClientRect().left;
    console.log(startX, startY);

    // highlight current
    highlightCellAt(currNumActivities, currHoursTotal + 1);
    interact('.dropzone').accept('#' + currActivity.name);

    // help text
    elem = document.getElementById('help-text');
    elem.innerHTML = 'What thrill would we get out of a date? Show what our schedule would look like.';
}

// --------------------- InteractJS ---------------------

// target elements with the "draggable" class
interact('.draggable')
    .draggable({
        // enable inertial throwing
        inertia: true,

        // keep the element within the area of it's parent
        //restrict: {
        //    restriction: "parent",
        //    endOnly: true,
        //    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        //},

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

var alreadyDropped = false;

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
        //draggableElement.textContent = 'Dragged in';
    },
    ondragleave: function (event) {
        // remove the drop feedback style
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        //event.relatedTarget.textContent = 'Dragged out';

        draggableElement.classList.remove('dropped');
        draggableElement.classList.add('notdropped');

        //onDragLeave();
    },
    ondrop: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        draggableElement.classList.remove('notdropped');
        draggableElement.classList.add('dropped');
        onDrop();
    },
    ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');

        console.log('on drop deactivate');

        // if (alreadyDropped) {
        //     console.log('already dropped');
        //     onDropLeave();
        // }
    }
});
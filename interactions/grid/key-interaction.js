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
var currHoursTotal = 3;
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
            cell.innerHTML = table[i][j];
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
    }
}

function onDragEnter() {
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
    highlightCellAt(row, col);
    elem.addEventListener('click', updateConsiderComputation);
}

function updateConsiderComputation(event) {
    let target = event.target;
    let subvalue = document.getElementById('consider').getElementsByClassName('subvalue')[0];
    subvalue.innerHTML = ' ' + target.innerHTML + ' ';
    let value = document.getElementById('consider').getElementsByClassName('value')[0];
    let sumElem = document.getElementById('consider').getElementsByClassName('sum')[0];
    let sum = parseInt(subvalue.innerHTML) + parseInt(value.innerHTML);
    sumElem.innerHTML = ' ' + sum + ' ';
}

function updateForgetComputation(event) {
    let target = event.target;
    let subvalue = document.getElementById('forget').getElementsByClassName('subvalue')[0];
    subvalue.innerHTML = ' ' + target.innerHTML + ' ';
    let value = document.getElementById('forget').getElementsByClassName('value')[0];
    let sumElem = document.getElementById('forget').getElementsByClassName('sum')[0];
    let sum = parseInt(subvalue.innerHTML) + parseInt(value.innerHTML);
    sumElem.innerHTML = ' ' + sum + ' ';
}

function onForgetButtonClick(event) {
    // move current activity back
    // not working
    let elem = document.getElementById(currActivity.name);
    console.log(elem);
    elem.style.position = 'absolute';
    console.log(startX, startY);
    elem.style.top = startX + 'px';
    elem.style.left = startY + 'px';

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
    highlightCellAt(row, col);
    elem.addEventListener('click', updateForgetComputation);
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
}
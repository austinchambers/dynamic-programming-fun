"use strict";

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
function initTable(gridMaxRows, gridMaxCols) {
	let table = [];
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
            table[i][j] = computeCell(table, i, j);
        }
    }
    console.log(table);
    return table;
}

// Find the #grid item in the html page, and display the table within it.
function displayTable(table, gridMaxRows, gridMaxCols, id) {
    var grid = document.getElementById(id);

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

function getCellAt(table, coords) {
    return table[coords[0]][coords[1]];
}

function computeCell(table, i, j) {
    var activity = activityArr[i];
    var aboveIdx = getAboveIdx(i, j);
    if (j - activity.duration >= 0) {
        var idx = getSubproblemIdx(i, j);
        return Math.max(
            activity.value + getCellAt(table, idx),
            getCellAt(table, aboveIdx));
    }
    else {
        return getCellAt(table, aboveIdx);
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


// Set everything up
function main() {
    let gridMaxRows = 1;            // Total number of rows to display in the grid, not including header. For 4 activities, this should be 4.
    let gridMaxCols = 8;            // Total number of columns to display in the grid. With 0 included, this would be 0-8

    let table1 = initTable(gridMaxRows, gridMaxCols);
    displayTable(table1, gridMaxRows, gridMaxCols, 'grid-01');
}

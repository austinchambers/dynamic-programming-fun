"use strict";

// --------------------- my logic ---------------------

// GLOBALS
var currActivity;
var currHoursTotal = 0;
var currHoursUsed = 0;
var currNumActivities = 1;

var activityArr = [ // ORDER MATTERS
    {
        'name': 'gym',
        'duration': 1,
        'value': 1
    }
];

var BLOCK_HEIGHT = 60;
var BLOCK_WIDTH = 60;

function displaySchedule() {
    let display = document.getElementById('scheduler');
    display.style.display = 'block';
    display.style.height = BLOCK_HEIGHT + 'px';
    display.style.width = BLOCK_WIDTH * currHoursTotal + 'px';
}

function displayActivities(num) {
	let display = document.getElementById('gym');
	display.style.height = BLOCK_HEIGHT + 'px';
	display.style.width = BLOCK_WIDTH * 1 + 'px';
}

function updateHearts(numHearts) {
	let elem = document.getElementById('hearts');
	if (numHearts == 0) {
		elem.innerHTML = "<img class='x' src='../../x.png'/>";
	}
	else {
		for (let i = 0; i < numHearts; i++) {
			elem.innerHTML += "<img class='heart' src='../../heart.png'/>";
		}
	}
}

function resetHearts() {
	let elem = document.getElementById('hearts');
	elem.innerHTML = '';
}

function displayInitSchedule() {
	let elem = document.getElementById('zero-hours');
	elem.style.visibility = 'visible';
}

function hideInitSchedule() {
    let elem = document.getElementById('zero-hours');
    elem.style.visibility = 'hidden';
}

function updateHelpText(newText) {
	let elem = document.getElementById('help-text');
	elem.innerHTML = newText;
}

function resetBlock() {
	// console.log('reset block');
	// let elem = document.getElementById('gym');
	// elem.style.position = 'absolute';
	// elem.style.top = '100px';
	// elem.style.left = '10px';
    //elem.style.top = startPos.x + 'px';
    //elem.style.left = startPos.y + 'px';
}

function activateResetButton() {
    let elem = document.getElementById('reset-button');
    elem.style.visibility = 'visible';
}

function hideResetButton() {
    let elem = document.getElementById('reset-button');
    elem.style.visibility = 'hidden';
}

function reset() {
    hideInitSchedule();
    resetHearts();
    //resetBlock();
    updateHelpText(questionText);
    hideResetButton();
}

function onDragMove() {

		displayInitSchedule();
		// updateValue(0);
		updateHearts(0);
		updateHelpText(answerText);
		// activateNextButton();
        activateResetButton();

}

var questionText = "What can you do with 0 hours?";
var answerText = "That's right! You can't do anything in 0 hours.";

function main() {
    currActivity = activityArr[0];
    displayActivities(currNumActivities);

    updateHelpText(questionText);
}

// --------------------- InteractJS ---------------------

var startPos = {x: 0, y: 0};

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

// var alreadyDropped = false;

interact('.draggable').snap({
      mode: 'anchor',
      anchors: [],
      range: Infinity,
      elementOrigin: { x: 0.5, y: 0.5 },
      endOnly: true
});

interact('.draggable')
  .on('dragstart', function (event) {
    var rect = interact.getElementRect(event.target);

    // record center point when starting a drag
    startPos.x = rect.left + rect.width  / 2;
    startPos.y = rect.top  + rect.height / 2;

    // snap to the start position
    event.interactable.snap({ anchors: [startPos] });
  });
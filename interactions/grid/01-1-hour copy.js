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
var currHoursTotal = 0;
var currHoursUsed = 0;
var currNumActivities = 1;

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

var BLOCK_HEIGHT = 60;
var BLOCK_WIDTH = 60;

function displaySchedule() {
    let display = document.getElementById('scheduler');
    display.style.display = 'block';
    display.style.height = BLOCK_HEIGHT + 'px';
    display.style.width = BLOCK_WIDTH * currHoursTotal + 'px';
    // display = document.getElementById('hours-left');
    // display.innerHTML = currHoursTotal - currHoursUsed;
}

function displayActivities(num) {
	let display = document.getElementById('gym');
	display.style.height = BLOCK_HEIGHT + 'px';
	display.style.width = BLOCK_WIDTH * 1 + 'px';

    // for (let i = 0; i < activityArr.length; i++) {
    //     let activity = activityArr[i];
    //     let display = document.getElementById(activity.name);

    //     if (i < num) {
    //         display.style.height = BLOCK_HEIGHT + 'px';
    //         display.style.width = BLOCK_WIDTH * activity.duration + 'px';
    //         // display.innerHTML = activity.name + '</br> + ';
    //     }
    //     else {
    //         display.style.display = 'none';
    //     }

    //     if (i == num-1) {
    //         display.classList += ' draggable';
    //     }
    //     else {
    //         display.classList += ' not-draggable';
    //     }
    // }
}

function onDrop() {
    // update current value
    // let elem = document.getElementById('consider').getElementsByClassName('value')[0];
    // elem.innerHTML = ' ' + currActivity.value + ' ';

    // update hours left
    // currHoursUsed = currActivity.duration;
    // let elem = document.getElementById('hours-left');
    // elem.innerHTML = currHoursTotal - currHoursUsed;

    // // add event listener to corresponding cell
    // let i = currNumActivities - 1;
    // let j = currHoursTotal;
    // let idx = getSubproblemIdx(i, j);
    // //console.log(idx);
    // let sub_i = idx[0];
    // let sub_j = idx[1];
    // let row = sub_i + 1;
    // let col = sub_j + 1;
    // elem = document.getElementById('grid').rows[row].cells[col];

    // highlightOnHover(row, col);

    // elem.addEventListener('click', updateConsiderComputation);
    console.log('dropped');
    updateHearts(1);

    currHoursTotal += 1;

    updateHelpText("That's correct!");

    // help text
    // elem = document.getElementById('help-text');
    // elem.innerHTML = 'Wow! Awesome!';
}

function updateValue(newValue) {
	let elem = document.getElementById('value');
	elem.innerHTML = newValue;
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

function updateHelpText(newText) {
	let elem = document.getElementById('help-text');
	elem.innerHTML = newText;
}

function activateNextButton() {
	let elem = document.getElementById('next-button');
	elem.disabled = false;
}

function advance() {
	document.getElementById('zero-hours').style.display = 'none';
	resetHearts();
	currHoursTotal += 1;
	displaySchedule();
	resetBlock();
	updateHelpText('What can you do with 1 hour?');
}

function resetBlock() {
	console.log('reset block');
	let elem = document.getElementById('gym');
	elem.style.position = 'absolute';
	elem.style.top = '100px';
	elem.style.left = '10px';
}

function onDragMove() {
	if (currHoursTotal == 0) {
		displayInitSchedule();
		// updateValue(0);
		updateHearts(0);
		updateHelpText("That's right! You can't do anything in 0 hours.");
		activateNextButton();
	}

}

var gymStartTop;
var gymStartLeft;

function main() {
    currActivity = activityArr[0];
    //console.log('key interaction');
    // initTable();
    // displayTable();
    // displaySchedule();
    //displayInitSchedule();
    displayActivities(currNumActivities);

    let elem = document.getElementById(currActivity.name);
    let x = $("#"+currActivity.name).offset().top - $(document).scrollTop();
    let y = $("#"+currActivity.name).offset().left;
    console.log('x, y:', x, y);
    gymStartTop = x;
    gymStartLeft = y;
    //console.log(elem);
    // startX = elem.getBoundingClientRect().top;
    // startY = elem.getBoundingClientRect().left;
    // console.log(startX, startY);

    // highlight current
    // highlightCellAt(currNumActivities, currHoursTotal + 1);
    interact('.dropzone').accept('#' + currActivity.name);

    // help text
    elem = document.getElementById('help-text');
    elem.innerHTML = 'What can you do with 0 hours?';
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

var alreadyDropped = false;

interact('.draggable').snap({
      mode: 'anchor',
      anchors: [],
      range: Infinity,
      elementOrigin: { x: 0.5, y: 0.5 },
      endOnly: true
});

// enable draggables to be dropped into this
interact('.dropzone').dropzone({
    // Require a 50% element overlap for a drop to be possible
    overlap: 0.35,

    // listen for drop related events:

    ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
        console.log('on drop activate');
    },
    ondragenter: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        //draggableElement.textContent = 'Dragged in';

        var dropRect = interact.getElementRect(event.target),
                dropCenter = {
                  x: dropRect.left + BLOCK_WIDTH  / 2,
                  y: dropRect.top  + dropRect.height / 2
                };

            event.draggable.snap({
              anchors: [ dropCenter ]
            });
    },
    ondragleave: function (event) {
        // remove the drop feedback style
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        //event.relatedTarget.textContent = 'Dragged out';

        //draggableElement.classList.remove('dropped');
        //draggableElement.classList.add('notdropped');

        //onDragLeave();
        event.draggable.snap(false);
    },
    ondrop: function (event) {
        var draggableElement = event.relatedTarget, dropzoneElement = event.target;

        //draggableElement.classList.remove('notdropped');
        //draggableElement.classList.add('dropped');
        console.log('on drop');
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
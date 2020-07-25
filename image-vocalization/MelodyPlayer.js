var uploadedImg;
var sweep;
var key;
var instrument;
var effect;
var currentTimeout;
var canvas;
var imgContext;
var oldSweepPos;
var isPlaying = false;
var possibleSweeps = ["left-to-right", "right-to-left", "top-to-bottom", "bottom-to-top", "blocked", "swirled"];

function play() {
	var pixelGroups;

	if (isPlaying || !setUpCorrectly()) {
		return;
	}

	isPlaying = true;
	imgContext.clearRect(0, 0, canvas.width, canvas.height);
	imgContext.drawImage(uploadedImg, 0, 0);
	pixelGroups = getImgData(uploadedImg, sweep, imgContext);
	oldSweepPos = drawInitSweeper(sweep, canvas, imgContext);
	createAndPlayMelody(pixelGroups, key, sweep, instrument);
}

function setUpCorrectly() {
	if (uploadedImg == undefined) {
		alert("Please upload an image before playing.");
		return false;
	}

	sweep = $('#sweeper-picker').find(':selected').val();
	if (sweep == "") {
		alert("Please select a sweeping pattern before playing.");
		return false;
	} else if (sweep == "shuffle") {
		sweep = possibleSweeps[Math.floor(Math.random() * possibleSweeps.length)];
	}

	key = $('#key-picker').find(':selected').val();
	if (key == "") {
		alert("Please select a key before playing.");
		return false;
	}

	instrument = $('#instrument-picker').find(':selected').val();
	if (instrument == "") {
		alert("Please select an instrument before playing.");
		return false;
	}

	effect = $('#effects-picker').find(':selected').val();
	return true;
}

function setUpCanvas(event) {
	canvas=document.getElementById("my-canvas");
	imgContext=canvas.getContext("2d");
	uploadedImg = new Image();
    uploadedImg.onload = function(){
        canvas.width = uploadedImg.width;
        canvas.height = uploadedImg.height;
        imgContext.drawImage(uploadedImg, 0, 0);
    }
    uploadedImg.src = event.target.result;
    canvas.setAttribute("src", "1");
}

function createAndPlayMelody(pixelGroups, key, sweep, instrument) {
	notesData = [];
	for (var i = 0; i < pixelGroups.length; i++) {
		var redNote = getPitchInKey(pixelGroups[i].red, key);
		var greenNote = getPitchInKey(pixelGroups[i].green, key);
		var blueNote = getPitchInKey(pixelGroups[i].blue, key);
		var duration = getNoteLength(notesData, pixelGroups, i);
		var luminosity = 0.2126*pixelGroups[i].red + 0.7152*pixelGroups[i].green + 0.0722*pixelGroups[i].blue;

		notesData.push({
			redNote: redNote,
			greenNote: greenNote,
			blueNote: blueNote,
			duration: duration,
			lum: luminosity,
		});
	}

	MIDI.loadPlugin({
	    soundfontUrl: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/",
	    instrument: instrument,
	    onsuccess: function() {
	    	MIDI.programChange(0, MIDI.GM.byName[instrument].number);
	    	playNotes(0, notesData);
	    }
	});
}

function playChord(chord, start, delay) {
    MIDI.chordOn(0, chord, 127, start);
    MIDI.chordOff(0, chord, start+delay);
}

function playNotes(i, notesData) {

    currentStart = 0;
    for (i = 0; i < notesData.length; i++) {
        note = notesData[i];
		//oldSweepPos = drawNextSweeper(oldSweepPos, canvas, imgContext, sweep);
		setFilters(note.lum, effect);

        MIDI.setVolume(0, 127);
        playChord([note.redNote, note.greenNote, note.blueNote], currentStart/1000, note.duration/1000);
        currentStart += note.duration;
    }
    
    animateSweeper(notesData.length, currentStart);
    setTimeout(function() {
        isPlaying = false;
        looper = $('#loop-btn');
		if (looper.hasClass('active')) {
			play();
        }
    }, currentStart);
}

function animateSweeper(numNotes, melodyLength) {
    delay = melodyLength/numNotes;
    timerId = setInterval(function() {
        console.log("in sweep");
        oldSweepPos = drawNextSweeper(oldSweepPos, canvas, imgContext, sweep);
    }, delay); 
    setTimeout(function() { 
        console.log("clearing..."); 
        clearInterval(timerId); 
    }, melodyLength);
}

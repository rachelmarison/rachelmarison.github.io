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
	//img = document.getElementById('user-img');
	if (uploadedImg == undefined) {
		alert("Please upload an image before playing.");
		return false;
	}

	// sweep = $('#sweep-form input[type=radio]:checked').val();
	sweep = $('#sweeper-picker').find(':selected').val();
	if (sweep == "") {
		alert("Please select a sweeping pattern before playing.");
		return false;
	} else if (sweep == "shuffle") {
		sweep = possibleSweeps[Math.floor(Math.random() * possibleSweeps.length)];
	}

	// key = $('#key-form input[type=radio]:checked').val();
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
		// var sweeps = pixelGroups[i].reqs;

		notesData.push({
			redNote: redNote,
			greenNote: greenNote,
			blueNote: blueNote,
			duration: duration,
			lum: luminosity,
			// sweeps: sweeps
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

function playNotes(i, notesData) {
	if (i < notesData.length) {
		oldSweepPos = drawNextSweeper(oldSweepPos, canvas, imgContext, sweep);
		setFilters(notesData[i].lum, effect);

        var velocity = 127; 
        MIDI.setVolume(0, 127);
        MIDI.chordOn(0, [notesData[i].redNote, notesData[i].greenNote, notesData[i].blueNote], velocity);
    	setTimeout(function(){
	    		MIDI.chordOff(0, [notesData[i].redNote, notesData[i].greenNote, notesData[i].blueNote]);
	    		playNotes(i+1, notesData);
	    	}, notesData[i].duration);
	} else {
			looper = $('#loop-btn');
			if (looper.hasClass('active')) {
				//loop through the song (start playing all over)
				isPlaying = false;
				play();
			} else {
				//done playing/looping, so set isPlaying to false
				isPlaying = false;
			}
	}
}

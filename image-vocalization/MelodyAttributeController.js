/* These arrays contain the required mod results to be in the specified major key.
   For example, if the note % 12 == 0, then it's the note C. 
   If the note % 12 == 1, then it's the note C#/Db */
   
// [C, D, E, F, G, A, B]
var keyOfC = [0, 2, 4, 5, 7, 9, 11];

// [G, A, B, C, D, E, F#]
var keyOfG = [7, 9, 11, 0, 2, 4, 6];

// [D, E, F#, G, A, B, C#]
var keyOfD = [2, 4, 6, 7, 9, 11, 1];

// [A, B, C#, D, E, F#, G#]
var keyOfA = [9, 11, 1, 2, 4, 6, 8];

// [E, F#, G#, A, B, C#, D#]
var keyOfE = [4, 6, 8, 9, 11, 1, 3];

// [B, C#, D#, E, F#, G#, A#]
var keyOfB = [11, 1, 3, 4, 6, 8, 10];

// [Gb, Ab, Bb, Cb, Db, Eb, F]
var keyOfGb = [6, 8, 10, 11, 1, 3, 5];

// [Db, Eb, F, Gb, Ab, Bb, C]
var keyOfDb = [1, 3, 5, 6, 8, 10, 0];

// [Ab, Bb, C, Db, Eb, F, G]
var keyOfAb = [8, 10, 0, 1, 3, 5, 7];

// [Eb, F, G, Ab, Bb, C, D]
var keyOfEb = [3, 5, 7, 8, 10, 0, 2];

// [Bb, C, D, Eb, F, G, A]
var keyOfBb = [10, 0, 2, 3, 5, 7, 9];

// [F, G, A, Bb, C, D, E]
var keyOfF = [5, 7, 9, 10, 0, 2, 4];

function getPitchInKey(rgbVal, key) {
	//plays notes in the midi note range 21 - 108 (inclusive)
	var note = Math.floor((rgbVal / 2.93) + 21); // 255 split into 87 groups is 2.93 per group
    //var note = Math.floor(rgbVal % 88) + 21;
	var scaleDegree = note % 12;
	var keyArray = window[key];
    note = getNoteInSpecifiedKey(keyArray, scaleDegree, note);
	return note;
}

function getNoteInSpecifiedKey(keyArray, scaleDegree, note) {
    for (var i = 0; i < keyArray.length; i++) {
    	if (scaleDegree == keyArray[i]) {  // it's in the key, so it's all good
    		return note;
    	}
    }
    // it's not, so add 1 and try again
    note = note + 1;
    scaleDegree = note % 12;
    return getNoteInSpecifiedKey(keyArray, scaleDegree, note);
}

function getNoteLength(notesData, pixelGroups, i) {
    var delta;
    var currentLum = 0.2126*pixelGroups[i].red + 0.7152*pixelGroups[i].green + 0.0722*pixelGroups[i].blue;
    if (notesData.length <= 2) {
        delta = currentLum;
    } else {
        var prevLum = notesData[i - 3].lum;
        delta = Math.abs(prevLum - currentLum);  //delta will be in the range of 0 to 255
    }
    return (((255 - delta) / 600) * 1000)
}

function setFilters(lum, effect) {
    switch(effect) {
        case 'wah-wah':
            excursion = lum / 42.5; // highest lum is 255, and 255 split into 6 groups is 42.5 per group
            MIDI.setEffects([{
                type: "WahWah",
                automode: true, // true/false
                baseFrequency: 0, // 0 to 1
                excursionOctaves: excursion, // 1 to 6
                sweep: 0, // 0 to 1
                resonance: 1, // 1 to 100
                sensitivity: 0, // -1 to 1
                bypass: 0
            }]);
            break;
        case 'tremolo':
            intensity = lum / 127.5; // highest lum is 255, and 255 split into 2 groups is 127.5 per group
            rate = lum / 31.875 // highest lum is 255, and 255 split into 8 groups is 31.875 per group
            MIDI.setEffects([{
                type: "Tremolo",
                intensity: intensity, // 0 to 1
                rate: rate, // 0.001 to 8
                stereoPhase: 0, // 0 to 180
                feedback: 0.9,
                bypass: 0
            }]);
            break;
        case 'phaser':
            rate = lum / 31.875 // highest lum is 255, and 255 split into 8 groups is 31.875 per group
            modFreq = (lum * 3.8) + 500
            MIDI.setEffects([{
                type: "Phaser",
                rate: rate, // 0.01 to 8 is a decent range, but higher values are possible
                depth: 0.3, // 0 to 1
                feedback: 0.1, // 0 to 1+
                stereoPhase: 10, // 0 to 180
                baseModulationFrequency: modFreq, // 500 to 1500
                bypass: 0
            }]);
            break;
        case 'chorus':
            rate = lum / 31.875 // highest lum is 255, and 255 split into 8 groups is 31.875 per group
            MIDI.setEffects([{
                type: "Chorus",
                rate: rate,         //0.01 to 8+
                feedback: 0.7,     //0 to 1+
                delay: 0.0045,     //0 to 1
                bypass: 0          //the value 1 starts the effect as bypassed, 0 or 1
            }]);
            break; 
        case 'delay':
            wet = lum / 255; // highest lum is 255, and 255 split into 2 groups is 127.5 per group
            MIDI.setEffects([{
                type: "Delay",
                feedback: 0.45,    //0 to 1+
                delayTime: 500,    //1 to 10000 milliseconds
                wetLevel: wet,    //0 to 1+
                dryLevel: 1,       //0 to 1+
                cutoff: 2000,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
                bypass: 0
            }]);
            break;
        case 'bitcrusher':
            normfreq = 1 / lum; // higher lum -> normfreq closer to 0 -> more bitcrushing noise
            MIDI.setEffects([{
                type: "Bitcrusher",
                bits: 4,          //1 to 16
                normfreq: normfreq,    //0 to 1
                bufferSize: 4096  //256 to 16384
            }]);
            break;
        case 'moog':
            MIDI.setEffects([{
                type: "MoogFilter",
                cutoff: 0.5,    //0 to 1
                resonance: 3.8,   //0 to 4
                bufferSize: 4096  //256 to 16384
            }]);
            break;
        case 'overdrive':
            MIDI.setEffects([{
                type: "Overdrive",
                outputGain: 0.5,         //0 to 1+
                drive: 0.5,              //0 to 1
                curveAmount: 0.8,          //0 to 1
                algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
                bypass: 0
            }]);
            break;  
        case 'pingpong':
            timeLeft = lum / 0.255; // highest lum is 255, and 255 split into 1000 groups is 0.255 per group
            MIDI.setEffects([{
                type: "PingPongDelay",
                wetLevel: 1, //0 to 1
                feedback: 0.7, //0 to 1
                delayTimeLeft: timeLeft, //1 to 10000 (milliseconds)
                delayTimeRight: 550 //1 to 10000 (milliseconds)
            }]);
            break;
        case 'panner':
            pan = lum / 255;
            pan = Math.random() < 0.5 ? 0 - pan : pan;
            MIDI.setEffects([{
                type: "Panner",
                pan: pan // -1 (left) to 1 (right)
            }]);
            break;
        case 'gain':
            gain = lum / 15;
            MIDI.setEffects([{
                type: "Gain",
                gain: gain // 0 and up
            }]);
            break;
        case "none":
            MIDI.setEffects([{
                type: "None"
            }]);
            break;
    }   
}

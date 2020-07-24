
var oscillator;
var midi = null;  // global MIDIAccess object
var midiData = null;

function onMIDIMessage (message) {
	midiData = message.data;
	console.log("MIDI data", midiData);
}

function onMIDISuccess( midiAccess ) {
	console.log( "MIDI ready!" );
	midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
	console.log(midi);
	var inputs = midi.inputs.values();
	for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
		console.log('in loop');
		// each time there is a midi message call the onMIDIMessage function
		input.value.onmidimessage = onMIDIMessage;
		var input = input.value;
	    console.log("Input port : [ type:'" + input.type + "' id: '" + input.id +
	        "' manufacturer: '" + input.manufacturer + "' name: '" + input.name +
	        "' version: '" + input.version + "']");	
	}
}

function onMIDIFailure(msg) {
	console.log( "Failed to get MIDI access - " + msg );
}

function getMidi() {
	// navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );
	if (navigator.requestMIDIAccess) {
	    navigator.requestMIDIAccess({
	        sysex: false
	    }).then(onMIDISuccess, onMIDIFailure);
	} else {
	    alert("No MIDI support in your browser.");
	}
}
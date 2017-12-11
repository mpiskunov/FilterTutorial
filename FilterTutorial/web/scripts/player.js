$(document).ready(function(){

	/*      https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API      */

	var input = document.getElementById("myRange"); // slider
	var filterOn = false;
	var filterType = "";
	visualizer = $("#cvsVisualizer")[0]; //canvas
	visualizerCtx = visualizer.getContext("2d");
	clearVisualizer(); // clears visualizer
	player = $(".audio")[0]; // audio tag
	var hi_ps_button = $("#effect1");
	var lw_ps_button = $("#effect2");
    var bp_button = $("#effect3");
	var playerCtx = new AudioContext(); // audio context will create our audio nodes
	playerCtx.crossOrigin = "anonymous";
	var source = playerCtx.createMediaElementSource(player); // in our context, we have one source node
	gainNode = playerCtx.createGain(); // gain node creates gain (volume) for our nodes
	gainNode.gain.value = 1; // leave value at 1 for now. anything above 1 will crackle your speakers so BEWARE

	/*
	 Here, we create our low pass filter from the BiquadFilter. This filter can have different settings,
	 but for this instance we create a lowpass filter. This is built into the Web Audio API.
	 Filter value represents frequency range on which the filter will start affecting.
	 */

	lowpassFilter = playerCtx.createBiquadFilter();
	lowpassFilter.type = "lowpass";
	lowpassFilter.frequency.value = 100;
	lowpassFilter.Q.value = 10;

	/*
	 Here, we create our high pass filter from the BiquadFilter.
	 */

	highpassFilter = playerCtx.createBiquadFilter();
	highpassFilter.type = "highpass";
	highpassFilter.frequency.value = 1400;
	highpassFilter.Q.value = 10;

    
    /*
	 Here, we create our bandpass pass filter from the BiquadFilter.
	 */
    bpFilter = playerCtx.createBiquadFilter();
    bpFilter.type = "bandpass";
    bpFilter.frequency.value = 1400;
    bpFilter.Q.value = 10;
    
    
	/*
	 Here we create an analyzer from the playerCtx.
	 */

	analyzer = playerCtx.createAnalyser();
	analyzer.fftSize = 512;


	// source->gainNode->analyzer->speakers
	source.connect(gainNode);
	gainNode.connect(analyzer);
	analyzer.connect(playerCtx.destination);

	hi_ps_button.click(function() {
		filterType = "hp";
		toggleFilter(highpassFilter);
	});

	lw_ps_button.click(function() {
		filterType = "lp";
		toggleFilter(lowpassFilter);
	});

    bp_button.click(function() {
		filterType = "bp";
		toggleFilter(bpFilter);
	});
	
	function filterValue() {
		//highpassFilter.frequency.value = (input.value / 100) * 14000;
		switch(filterType){
			case "hp":
				highpassFilter.frequency.value = (input.value / 100) * 14000;
				break;
			case "lp":
				lowpassFilter.frequency.value = (input.value / 100) * 2000;
				break;
            case "bp":
                bpFilter.frequency.value = (input.value / 100) * 3000;
				break;
			default:
				break;
		}
	}

	function toggleFilter(filter) {
		if(filterOn && filterType != ""){
			filterOn = false;
			gainNode.disconnect();
			source.connect(gainNode);
			gainNode.connect(analyzer);
			analyzer.connect(playerCtx.destination);
			filterType = "";
		}else{
			filterOn = true;
			gainNode.disconnect();
			gainNode.connect(filter);
			filter.connect(analyzer);
			analyzer.connect(playerCtx.destination);
		}
	}

	function updateVisualizer() {
		frequencyArray = new Uint8Array(analyzer.frequencyBinCount); // takes the fequencyBinCount and sets it into an array
		analyzer.getByteFrequencyData(frequencyArray); // puts the frequencyArray into analzer node and converts the data
		clearVisualizer();
		visualizerCtx.fillStyle = "#B71C1C"; // Color of the bars #B71C1C
		for (var i = 0; i < 20; i++)
		{
			visualizerCtx.fillRect(i * 15, visualizer.height, 10, -(frequencyArray[i * 11] / 2));
		}
	}

	function clearVisualizer() {
		visualizerCtx.fillStyle = "#000000";
		visualizerCtx.fillRect(0, 0, visualizer.width, visualizer.height); // Clear the canvas
	}

	$("#tdPlayTrack").click(function() { //Function turns on and off the player
		if(player.src != "") {
			if(player.paused)
				player.play();
			else
				player.pause();
		}
	});



	input.oninput = function() {filterValue()}; // event gets value from slider

	player.onplay = function() { // Event that changes the text on the play/pause button. Also starts up the visualizer.
		$("#tdPlayTrack").html("<i class='fa fa-pause' aria-hidden='true'></i>");
		visualizerUpdate = setInterval(updateVisualizer, 1000 / 60); // 60 FPS
	}

	player.onpause = function() { // Event that changes the text on the play/pause button.
		$("#tdPlayTrack").html("<i class='fa fa-play' aria-hidden='true'></i>");
	}

});

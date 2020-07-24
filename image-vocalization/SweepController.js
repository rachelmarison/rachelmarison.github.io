var NUM_NOTES = 25;
var verticalWidth;
var horizontalHeight;
var verticalWidthBlocked;
var horizontalHeightBlocked;
var sweeperColor;
var currentSwirledPos;
var swirledTopOffset = 0;
var swirledLeftOffset = 0;
var swirledBottomOffset = 0;
var swirledRightOffset = 0;
var swirlWidth;
var swirlHeight;

function getSweepRequirements(img, sweep) {
	img = img;
	verticalWidth = Math.ceil(img.width / NUM_NOTES);
	horizontalHeight = Math.ceil(img.height / NUM_NOTES);
	verticalWidthBlocked = Math.ceil(img.width / 5);
	horizontalHeightBlocked = Math.ceil(img.height / 5);
	swirlWidth = img.width;
	swirlHeight = img.height;

	switch(sweep) {
		case 'right-to-left':
		case 'left-to-right':
			return {
				x: 0,
				y: 0,
				width: verticalWidth,
				height: img.height
			};
		case 'bottom-to-top':
		case 'top-to-bottom':
			return {
				x: 0,
				y: 0,
				width: img.width,
				height: horizontalHeight
			};
		case 'blocked':
			return {
				x: 0,
				y: 0,
				width: verticalWidthBlocked,
				height: horizontalHeightBlocked
			};
		case 'swirled':
			currentSwirledPos = "top";
			swirledTopOffset = 0;
			swirledLeftOffset = 0;
			swirledBottomOffset = 0;
			swirledRightOffset = 0;
			return {
				x: 0,
				y: 0,
				width: swirlWidth,
				height: horizontalHeight
			};
	}
}

function updateSweepRequirements(img, sweep, oldReqs) {
	switch(sweep) {
		case 'right-to-left':
		case 'left-to-right':
			return {
				x: oldReqs.x += oldReqs.width,
				y: 0,
				width: verticalWidth,
				height: img.height
			};
		case 'bottom-to-top':
		case 'top-to-bottom':
			return {
				x: 0,
				y: oldReqs.y += oldReqs.height,
				width: img.width,
				height: horizontalHeight
			};
		case 'blocked':
			if (oldReqs.x + verticalWidthBlocked >= img.width && oldReqs.y + horizontalHeightBlocked >= img.height) {
				return {
					x: oldReqs.x + verticalWidthBlocked,
					y: oldReqs.y + horizontalHeightBlocked,
					width: verticalWidthBlocked,
					height: horizontalHeightBlocked
				};
			} else if (oldReqs.x + verticalWidthBlocked >= img.width) {
				return {
					x: 0,
					y: oldReqs.y + horizontalHeightBlocked,
					width: verticalWidthBlocked,
					height: horizontalHeightBlocked
				};
			} else {
				return {
					x: oldReqs.x + verticalWidthBlocked,
					y: oldReqs.y,
					width: verticalWidthBlocked,
					height: horizontalHeightBlocked
				};
			}
		case 'swirled':
			if (currentSwirledPos == "top") {
				swirledTopOffset += horizontalHeight;
				currentSwirledPos = "right";
				return {
					x: swirlWidth - swirledRightOffset,
					y: swirledTopOffset,
					width: verticalWidth,
					height: swirlHeight - swirledBottomOffset - swirledTopOffset
				};
			} else if (currentSwirledPos == "right") {
				swirledRightOffset += verticalWidth;
				currentSwirledPos = "bottom";
				return {
					x: swirledLeftOffset,
					y: swirlHeight - swirledBottomOffset,
					width: swirlWidth - swirledRightOffset - swirledLeftOffset,
					height: horizontalHeight
				};
			} else if (currentSwirledPos == "bottom") {
				swirledBottomOffset += horizontalHeight;
				currentSwirledPos = "left";
				return {
					x: swirledLeftOffset,
					y: swirledTopOffset,
					width: verticalWidth,
					height: swirlHeight - swirledBottomOffset - swirledTopOffset
				};
			} else if (currentSwirledPos == "left") {
				swirledLeftOffset += verticalWidth;
				currentSwirledPos = "top";
				return {
					x: swirledLeftOffset,
					y: swirledTopOffset,
					width: swirlWidth - swirledRightOffset - swirledLeftOffset,
					height: horizontalHeight
				};
			} 
	}
}

function stillSweeping(reqs, img, sweep) {
	switch(sweep) {
		case 'right-to-left':
		case 'left-to-right':
			return (reqs.x < img.width);
		case 'bottom-to-top':
		case 'top-to-bottom':
			return (reqs.y < img.height);
		case 'blocked':
			return (reqs.x < img.width || reqs.y < img.height) //stop when you're in the bottom left corner 
		case 'swirled':
			return ((swirlWidth - swirledLeftOffset - swirledRightOffset > 0) && 
					(swirlHeight - swirledTopOffset - swirledBottomOffset> 0));
	}
}

function getSweepStart(sweep, canvas) {
	swirlWidth = canvas.width;
	swirlHeight = canvas.height;
	switch(sweep) {
		case 'right-to-left':
			return {
					x1: canvas.width,
					y1: 0,
					x2: canvas.width,
					y2: canvas.height
			};
		case 'left-to-right':
			return {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: canvas.height
			};
		case 'bottom-to-top':
			return {
					x1: 0,
					y1: canvas.height,
					x2: canvas.width,
					y2: canvas.height
			};
		case 'top-to-bottom':
			return {
					x1: 0,
					y1: 0,
					x2: canvas.width,
					y2: 0
			};
		case 'blocked':
			return {
				x1: 0,
				y1: 0,
				x2: 0,
				y2: horizontalHeightBlocked
			};
		case 'swirled':
			currentSwirledPos = "top";
			swirledTopOffset = 0;
			swirledLeftOffset = 0;
			swirledBottomOffset = 0;
			swirledRightOffset = 0;
			return {
				x1: 0,
				y1: 0,
				x2: canvas.width,
				y2: 0
			};
	}
}

function adjustSweepReqsBySweep(oldSweepPos, sweep, canvas) {
	switch(sweep) {
		case 'right-to-left':
			return {
					x1: oldSweepPos.x1 - verticalWidth,
					y1: oldSweepPos.y1,
					x2: oldSweepPos.x2 - verticalWidth,
					y2: oldSweepPos.y2
			};
		case 'left-to-right':
			return {
					x1: oldSweepPos.x1 + verticalWidth,
					y1: oldSweepPos.y1,
					x2: oldSweepPos.x2 + verticalWidth,
					y2: oldSweepPos.y2
			};
		case 'bottom-to-top':
			return {
					x1: oldSweepPos.x1,
					y1: oldSweepPos.y1 - horizontalHeight,
					x2: oldSweepPos.x2,
					y2: oldSweepPos.y2 - horizontalHeight
			};
		case 'top-to-bottom':
			return {
					x1: oldSweepPos.x1,
					y1: oldSweepPos.y1 + horizontalHeight,
					x2: oldSweepPos.x2,
					y2: oldSweepPos.y2 + horizontalHeight
			};
		case 'blocked':
			if (oldSweepPos.x1 + verticalWidthBlocked >= canvas.width && oldSweepPos.y1 + horizontalHeightBlocked >= canvas.height) {
				return {
					x1: oldSweepPos.x1 + verticalWidthBlocked,
					y1: oldSweepPos.y1,
					x2: oldSweepPos.x1 + verticalWidthBlocked,
					y2: oldSweepPos.y2
				};
			} else if (oldSweepPos.x1 + verticalWidthBlocked >= canvas.width) {
				return {
					x1: 0,
					y1: oldSweepPos.y1 + horizontalHeightBlocked,
					x2: 0,
					y2: oldSweepPos.y2 + horizontalHeightBlocked
				};
			} else {
				return {
					x1: oldSweepPos.x1 + verticalWidthBlocked,
					y1: oldSweepPos.y1,
					x2: oldSweepPos.x2 + verticalWidthBlocked,
					y2: oldSweepPos.y2
				};
			}
		case 'swirled':
			if (currentSwirledPos == "top") {
				swirledTopOffset += horizontalHeight;
				currentSwirledPos = "right";
				return {
					x1: swirlWidth - swirledRightOffset,
					y1: swirledTopOffset,
					x2: swirlWidth - swirledRightOffset,
					y2: swirlHeight - swirledBottomOffset
				};
			} else if (currentSwirledPos == "right") {				
				swirledRightOffset += verticalWidth;
				currentSwirledPos = "bottom";
				return {
					x1: swirledLeftOffset,
					y1: swirlHeight - swirledBottomOffset,
					x2: swirlWidth - swirledRightOffset,
					y2: swirlHeight - swirledBottomOffset
				};
			} else if (currentSwirledPos == "bottom") {
				swirledBottomOffset += horizontalHeight;
				currentSwirledPos = "left";
				return {
					x1: swirledLeftOffset,
					y1: swirledTopOffset,
					x2: swirledLeftOffset,
					y2: swirlHeight - swirledBottomOffset
				};
			} else if (currentSwirledPos == "left") {
				swirledLeftOffset += verticalWidth;
				currentSwirledPos = "top";
				return {
					x1: swirledLeftOffset,
					y1: swirledTopOffset,
					x2: swirlWidth - swirledRightOffset,
					y2: swirledTopOffset
				};
			} 
	}
}

function drawInitSweeper(sweep, canvas, imgContext) {
	imgContext.beginPath();
	imgContext.lineWidth = canvas.width/100;
	sweeperColor = $('#color-picker').val();
	imgContext.strokeStyle = sweeperColor;

	var sweepPos = getSweepStart(sweep, canvas);

	imgContext.moveTo(sweepPos.x1, sweepPos.y1);
	imgContext.lineTo(sweepPos.x2, sweepPos.y2);
	imgContext.stroke(); 

	return sweepPos;
}

// essentially draw the sweeper in the "ending" location on the img for that pixel group
function drawNextSweeper(oldSweepPos, canvas, imgContext, sweep){
	imgContext.clearRect(0, 0, canvas.width, canvas.height);
	imgContext.drawImage(uploadedImg, 0, 0);

	imgContext.beginPath();
	imgContext.lineWidth = canvas.width/100;
	imgContext.strokeStyle = sweeperColor;

	sweepPos = adjustSweepReqsBySweep(oldSweepPos, sweep, canvas);

	imgContext.moveTo(sweepPos.x1, sweepPos.y1);
	imgContext.lineTo(sweepPos.x2, sweepPos.y2);
	imgContext.stroke();

	return sweepPos;
}

$(function(){
	
	if (!localStorage.puzzlesCompleted)
    	localStorage.puzzlesCompleted = 0;
	if (!localStorage.averageTime){
    	localStorage.averageTime = 60;
	}

	var answer;
	var status;
	var clicks;
	var maxEliminate;
	var eraser;
	var time;
	var timer;
	var idleTime;
	
	var levelColors = [];
	var levelShapes = [];
	var level = [];
	var solutionColors = [];
	var solutionShapes = [];
	var solution = [];
	var colors = ["a", "b", "c", "d", "e", "f"];
	var shapes = ["u", "v", "w", "x", "y", "z"];
	var colorCanBe = [];
	var shapeCanBe = [];
	var colorCanBeCountRow = [];
	var colorCanBeCountColumn = [];
	var shapeCanBeCountRow = [];
	var shapeCanBeCountColumn = [];

	var levelStatsMainHeight = "56px";
		
	initializeLevel();
	
	function initializeLevel(){
		$("#stars").empty();
		$("#timer").css("display","block");
		$("#puzzle").css("display","block");
		$("#credits").css("display","none");
		$("#alerts").css("display","none");
		$("#levelInfo").css("display","block");
		$("#results").css("display","none");
		$("#levelStats").css("height", levelStatsMainHeight);
		$("#newStars").empty();
		do {
			// console.log("CREATING LEVEL");
			newLevel();
		} while (level.toString().indexOf("undefined") > -1);
		// console.log(level);
		answer = $.extend( {}, level );
		incorrect();
		createStage(level);
		clicks = 0;
		maxEliminate = 0;
		eraser = 0;
		for(i = 0; i < solution.length; i++){
			if(solution[i]=="0" && level[i]!="0")
				maxEliminate++;
		}
		$("#erases").text('0');
		$("#maxErases").text(maxEliminate);
		time = 0;
		idleTime = 0;
		$("#clock").text(time);
		var timer = $(".timer"),
		newTimer = timer.clone(true);
        timer.before(newTimer);
        $("." + timer.attr("class") + ":last").remove();
        $('.timer').css('animation-duration', localStorage.averageTime + "s");
        incTimer();
	}

	function createStage(whatBoxes) {
		$("#blocks").empty();
		for(i=0;i<whatBoxes.length;i++){
			if(whatBoxes[i]!="0")
				$( "#blocks" ).append( "<li class=\"" + whatBoxes[i] + "\" data-number=\"" + i + "\" style=\"animation-delay:" + (.1 * i) + "s; -webkit-animation-delay:" + (.1 * i) + "s;\"></li>" );
			else
				$( "#blocks" ).append( "<li class=\"er\" data-number=\"" + i + "\" style=\"animation-delay:" + (.1 * i) + "s; -webkit-animation-delay:" + (.1 * i) + "s;\"></li>" );
		}
	}

	function addTime() {
		time++;
		idleTime++;
		if (idleTime > 4) {
			checkForMistakes(true);
			idleTime = 0;
		}
		$("#clock").text(time);
		incTimer();
	}

	$(this).mousemove(function (e) {
		idleTime = 0;
	});

	function incTimer() {
		timer = setTimeout(addTime, 1000);
	}
	
	function getEventTarget(e) {
        e = e || window.event;
        return e.target || e.srcElement; 
    }

	$("#blocks").swipe( {
		tap:function(event, target) {
			idleTime = 0; // Reset idle time (for mobile)
			if(status!="correct"){//As long as the level isn't already solved...
				var target = getEventTarget(event);
				checking();
				if(answer[target.getAttribute('data-number')]==0 && level[target.getAttribute('data-number')]!=0){ //un-doing move
					target.className = level[target.getAttribute('data-number')];
					answer[target.getAttribute('data-number')]=level[target.getAttribute('data-number')];
					eraser--;
				}
				else{ // erasing a square
					if (canErase(target.getAttribute('data-number')) && eraser < maxEliminate){
						erase(target);
						clicks++;
						eraser++;
					} else if (eraser >= maxEliminate) {
						shake($(".counter"), 300);
					} else if (! canErase(target.getAttribute('data-number'))) {
						shake($("#puzzle"), 300);
					}
				}
				if (checkForMistakes(false)) {
					incorrect();
					toggleIncorrectAlert();					
				} else {
					correct();
				}
				$("#erases").text(eraser);
			}
		},
		threshold:50
	});

	function checkForMistakes(shouldShake) {
		for (var i = 0; i < 25; i++) {
			for (var j = i + 1; row(i) == row(j); j++) {
				if (sameCat(i, j)) {
					// console.log(i + " " + j);
					if (shouldShake) {
						shake($($("#blocks li")[i]), 500);
						shake($($("#blocks li")[j]), 500);
					}
					return true;
				}
			}
			for (var j = i + 5; j < 25; j+=5) {
				if (sameCat(i, j)) {
					// console.log(i + " " + j);
					if (shouldShake) {
						shake($($("#blocks li")[i]), 500);
						shake($($("#blocks li")[j]), 500);
					}
					return true;
				}
			}
		}
		return false;
	}

	function sameCat(block1, block2) {
		if ($($('#blocks li')[block1]).hasClass("clicked") || $($('#blocks li')[block2]).hasClass("clicked")) {
			return false;
		} else if ($($('#blocks li')[block1]).hasClass("er") || $($('#blocks li')[block2]).hasClass("er")) {
			return false;
		} else if ($('#blocks li')[block1].className.substring(2) == $('#blocks li')[block2].className.substring(2)) {
			// console.log($('#blocks li')[block1].className + " " + $('#blocks li')[block2].className);
			return true;
		} else if ($('#blocks li')[block1].className.substring(0,1) == $('#blocks li')[block2].className.substring(0,1)) {
			// console.log($('#blocks li')[block1].className + " " + $('#blocks li')[block2].className);
			return true;
		} else {
			return false;
		}
	}

	function shake(ele, time) {
		ele.addClass("shake");
		setTimeout(function(){
		  ele.removeClass("shake");}, time);
	}
	
	function erase(block){
		var blockNumber = Number(block.getAttribute('data-number')) + 1;
		$( "#blocks li:nth-child(" + blockNumber + ")" ).addClass("clicked").removeAttr("style");
		answer[block.getAttribute('data-number')]="0";
	}
	
	function canErase(square){ 
		// var gridSize = Math.sqrt(level.length);
		var gridSize = 5;
		if((square%gridSize!=4)&&(answer[Number(square)+1]=="0")) //right
			return false;
		else if((square%gridSize!=0)&&(answer[Number(square)-1]=="0")) //left
			return false;
		else if((square<(gridSize*(gridSize-1)))&&(answer[Number(square)+5]=="0")) //bottom
			return false;		
		else if((square>(gridSize-1))&&(answer[Number(square)-5]=="0")) //top
			return false;
		else if(answer[Number(square)]=="0")
			return false;
		else
			return true;
	}

	function incorrect(){
		status = "incorrect";
	}
	
	function toggleIncorrectAlert(){
		if(maxEliminate==eraser){
			$("#results").hide();
			$("#alerts").show();
			$("#levelStats").css("height","180px");
		}
		else{
			$("#levelStats").css("height",levelStatsMainHeight);
		}
	}
	
	function checking(){
		status = "checking";
	}
	
	function correct(){
		status = "correct";
		clearTimeout(timer);
		var averageTime = parseFloat(localStorage.averageTime);
		var puzzlesCompleted = parseInt(localStorage.puzzlesCompleted);
		localStorage.averageTime = (puzzlesCompleted * averageTime + time) / (puzzlesCompleted + 1);
		localStorage.puzzlesCompleted++;
		$("#taps").text(clicks - maxEliminate);
		$("#time").text(time);
		$("#completedLevels").text(localStorage.puzzlesCompleted);
		$("#averageTime").text(Math.floor(localStorage.averageTime));
		if (localStorage.averageTime > averageTime) {
			$("#averageImg").attr("src","img/arrow-up.png");
		} else {
			$("#averageImg").attr("src","img/arrow-down.png");
		}
		$("#levelInfo").hide();
		$("#alerts").hide();		
		$("#results").show();
		$("#levelStats").css("height","260px");
	}

	$("#next").swipe( {
		tap:function(event, target) {
			initializeLevel();
		},
		threshold:50
	});	

	$("#reset").swipe( {
		tap:function(event, target) {
			for (var i = 0; i < 25; i++) {
				$($('#blocks li')[i]).removeClass("clicked");
			}
			// createStage(level);
			eraser = 0;
			answer = $.extend( {}, level );
			$("#erases").text(eraser);
			$("#levelStats").css("height",levelStatsMainHeight);
		},
		threshold:50
	});	

	function newLevel() {
		reset();
		addEraseBlocks(10);
		// console.log(levelColors);
		// console.log(levelShapes);
		var numberOfPatterns = 0;
		var rand = Math.random();
		for (f = 0; f < 15 || numberOfPatterns < 4; f++, rand = Math.random()){
			if (rand < .5) {
				if (addPattern(colors, colorCanBe, colorCanBeCountRow, levelColors, solutionColors)) {
					numberOfPatterns++;
				}
			} else {
				if (addPattern(shapes, shapeCanBe, shapeCanBeCountRow, levelShapes, solutionShapes)){
					numberOfPatterns++;
				}
			}
		}
		// console.log("LEVEL CREATED");
		// console.log(levelColors);
		// console.log(levelShapes);
		fillBoxes(colors, colorCanBe, colorCanBeCountRow, colorCanBeCountColumn, levelColors, solutionColors);
		fillBoxes(shapes, shapeCanBe, shapeCanBeCountRow, shapeCanBeCountColumn, levelShapes, solutionShapes);
		createLevel();
	}

	function createLevel() {
	    //combine shape and color into array
	    for (i = 0; i < 25; i++) {
	    	if (levelColors[i] == "0" || levelShapes[i] == "0") {
	    		level[i] = "0";
	    	} else {
	    		// if (levelShapes[i] == null) {
	    		// 	level[i] = levelColors[i];
	    		// } else {
	    			level[i] = levelColors[i] + " " + levelShapes[i];
	    		// }
	    	}
	    }
	    for (i = 0; i < 25; i++) {
	    	if (solutionColors[i] == "0" || solutionShapes[i] == "0") {
	    		solution[i] = "0";
	    	} else {
	    		if (solutionShapes[i] == null) {
	    			solution[i] = solutionColors[i];
	    		} else {
	    			solution[i] = solutionColors[i] + " " + solutionShapes[i];
	    		}
	    	}
	    }
	}

	//randomly adds permanently erased block - must happen FIRST
	function addEraseBlocks(max) {
		var rand;
		for (p = 0; p < max; p++) {
			rand = Math.floor((Math.random() * 100));
			if (rand < 25) {
				levelColors[rand] = "0";
				levelShapes[rand] = "0";
				solutionColors[rand] = "0";
				solutionShapes[rand] = "0";			
			}
		}
	}

	function addPattern(att, attCanBe, attCanBeCountRow, levelAtt, solAtt){
		updateCanBe(true);
		var patternNum = Math.floor((Math.random() * patternInd.length));
		var randRow = Math.floor((Math.random() * 5));
		//valueA should be whatever can be in the row most
		var valueA = att[Math.floor(Math.random() * att.length)];
		//for (i = 0; i < attCanBeCountRow[randRow].length; i++) {
		//	if (attCanBeCountRow[randRow][i])	
		//}
		var valueB = att[Math.floor(Math.random() * att.length)];
		while (valueA == valueB){
			valueB = att[Math.floor(Math.random() * att.length)];
		}
		//...
		var tempLevel = levelAtt.slice(0);
		var tempSol = solAtt.slice(0);
		var inserted = false;
		var canBeInserted = true;
		for (i = 0; i < patternInd[patternNum].length && canBeInserted; i++) {
			if (patternIndSol[patternNum][i] == "0" && (attCanBe[(randRow * 5) + i] == null || attCanBe[(randRow * 5) + i].indexOf("0") == -1)) {
				canBeInserted = false;
			} else if (patternInd[patternNum][i] == "1") {
				if (attCanBe[(randRow * 5) + i] == null || attCanBe[(randRow * 5) + i].indexOf(valueA) == -1) {
					canBeInserted = false;
				} else {
					tempLevel[(randRow * 5) + i] = valueA;
					if (patternIndSol[patternNum][i] == "0") {
						tempSol[(randRow * 5) + i] = "0";
					} else {
						tempSol[(randRow * 5) + i] = valueA;
					}				
				}
			} else if (patternInd[patternNum][i] == "2") {
				if (attCanBe[(randRow * 5) + i] == null || attCanBe[(randRow * 5) + i].indexOf(valueB) == -1) {
					canBeInserted = false;
				} else {
					tempLevel[(randRow * 5) + i] = valueB;
					if (patternIndSol[patternNum][i] == "0") {
						tempSol[(randRow * 5) + i] = "0";
					} else {
						tempSol[(randRow * 5) + i] = valueB;
					}
				}
			}
		}
		if (canBeInserted) {
			inserted = true;
			if (att == colors) {
				levelColors = rotateBoard(tempLevel.slice(0));
				solutionColors = rotateBoard(tempSol.slice(0));
				levelShapes = rotateBoard(levelShapes.slice(0));
				solutionShapes = rotateBoard(solutionShapes.slice(0));
			} else if (att = shapes) {
				levelShapes = rotateBoard(tempLevel.slice(0));
				solutionShapes = rotateBoard(tempSol.slice(0));
				levelColors = rotateBoard(levelColors.slice(0));
				solutionColors = rotateBoard(solutionColors.slice(0));
			}
			// console.log(inserted + " " + patternNum + " " + valueA + " " + valueB + " " + randRow);
			// console.log(tempLevel);
		}
		return inserted;
	}

	function fillBoxes(att, attCanBe, attCanBeCountRow, attCanBeCountColumn, levelAtt, solAtt){
		var searchLen = 1;
		var finishedFilling = false;
		var foundAtLen = false;
		updateCanBe(false);
		while (!finishedFilling) {
			for (i = 0; i < attCanBe.length && !foundAtLen; i++) {
				if (attCanBe[i] != null && attCanBe[i].length == searchLen) {
					levelAtt[i] = attCanBe[i][Math.floor((Math.random() * searchLen))];
					for (j = 0; j < searchLen; j++) {
						if (attCanBeCountRow[row(i)][att.indexOf(levelAtt[i])] + attCanBeCountColumn[column(i)][att.indexOf(levelAtt[i])] >
							attCanBeCountRow[row(i)][att.indexOf(attCanBe[i][j])] + attCanBeCountColumn[column(i)][att.indexOf(attCanBe[i][j])]) {
							levelAtt[i] = attCanBe[i][j];
						}
					}
					solAtt[i] = levelAtt[i];
					createLevel();
					foundAtLen = true;
				} else if (i == attCanBe.length - 1 && searchLen < 5) {
					searchLen++;
				} else if (i == attCanBe.length - 1 && searchLen == 5) {
					finishedFilling = true;
				}
			}
			if (foundAtLen) {
				updateCanBe(false);
				//console.log(colorCanBe);
				searchLen = 1;
				foundAtLen = false;
			}
		}
	}

	//Updates the canBe for everything in this squares row and column
	function updateCanBe(addZero){
		for (j = 0; j < 25; j++) {
			canBeSquare(j, solutionColors, colors, colorCanBe, addZero);
			canBeSquare(j, solutionShapes, shapes, shapeCanBe, addZero);
		}
		updateCanBeCount(colors, colorCanBe, colorCanBeCountRow, colorCanBeCountColumn);
		updateCanBeCount(shapes, shapeCanBe, shapeCanBeCountRow, shapeCanBeCountColumn);
	}

	function updateCanBeCount(att, attCanBe, attCanBeCountRow, attCanBeCountColumn) {
		attCanBeCountRow[0] = [0, 0, 0, 0, 0, 0];
		attCanBeCountRow[1] = [0, 0, 0, 0, 0, 0];
		attCanBeCountRow[2] = [0, 0, 0, 0, 0, 0];
		attCanBeCountRow[3] = [0, 0, 0, 0, 0, 0];
		attCanBeCountRow[4] = [0, 0, 0, 0, 0, 0];
		attCanBeCountColumn[0] = [0, 0, 0, 0, 0, 0];
		attCanBeCountColumn[1] = [0, 0, 0, 0, 0, 0];
		attCanBeCountColumn[2] = [0, 0, 0, 0, 0, 0];
		attCanBeCountColumn[3] = [0, 0, 0, 0, 0, 0];
		attCanBeCountColumn[4] = [0, 0, 0, 0, 0, 0];
		for (i = 0; i < attCanBe.length; i++) {
			if (attCanBe[i] != null) {
				for (j = 0; j < attCanBe[i].length; j++) {
					attCanBeCountRow[row(i)][att.indexOf(attCanBe[i][j])]++;
					attCanBeCountColumn[column(i)][att.indexOf(attCanBe[i][j])]++;
				}
			}
		}
	}

	function canBeSquare(square, levelAtt, att, attCanBe, addZero){
		var squares = levelAtt.slice(0);
		var canBe = att.slice(0);
		var currentCanBe = attCanBe;

		if (squares[square] != null) {
			currentCanBe[square] = null;
		} else {
			for (i=row(square) * 5; i < (row(square) + 1) * 5; i++) {
				if (squares[i] != null && canBe.indexOf(squares[i]) != -1) {
					canBe.splice(canBe.indexOf(squares[i]), 1);
				}
			}
			for (i=column(square); i < column(square) + 25; i+=5) {
				if (squares[i] != null && canBe.indexOf(squares[i]) != -1) {
					canBe.splice(canBe.indexOf(squares[i]), 1);
				}
			}
			if (addZero) {
				//check if "0" should be added to canBe
				var canBeSol = true;
				if ((square % 5 != 4) && (solutionColors[square + 1] == "0" || solutionShapes[square + 1] == "0")) { //right
					canBeSol = false;
				} else if ((square % 5 != 0) && (solutionColors[square - 1] == "0" || solutionShapes[square - 1] == "0")) { //left
					canBeSol = false;
				} else if ((square < 20) && (solutionColors[square + 5] == "0" || solutionShapes[square + 5] == "0")) {
					canBeSol = false;
				} else if ((square > 4) && (solutionColors[square - 5] == "0" || solutionShapes[square - 5] == "0")) {
					canBeSol = false;
				} else if (canBeSol) {
					canBe.push("0");
				}
			}
			currentCanBe[square] = canBe;
		}
	}

	function reset() {
		levelColors = [];
		levelShapes = [];
		level = [];
		solutionColors = [];
		solutionShapes = [];
		solution = [];
	}

	function rotateBoard(whatBoard) {
		board = [];
		for (l = 0; l < whatBoard.length; l++) {
			board[l] = whatBoard[whatSquare(4 - column(l), row(l))];
		}
		return board;
	}

	function row(square) {
		return parseInt(square / 5);
	}

	function column(square) {
		return square % 5;
	}

	function whatSquare(row, column) {
		return (5 * row) + column;
	}

})
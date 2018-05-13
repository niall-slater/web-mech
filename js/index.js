//Colors

var color_field = '#46ad46';
var color_woods = '#027102';
var color_mountains = '#959595';
var color_water = '#003baa';
var color_destroyed = '#652300';
var color_mech = '#fff';
var color_enemy = '#f00';

//Game variables

var v_tempMax = 65; //Temperature at which reactor takes damage
var v_tempMin = 3;

var mech = {
	
	//Values to keep track of health, dangers and resources
	status : {
		reactor: 100,
		temp: 35,
		fuel: 100,
		attack: 35,
		defense: 20,
		alive: true
	},
	
	position : {
		x: 2,
		y: 2
	},
	
	damage: function(amount) {
		depleteReactor(amount);
	},
	
	die: function() {
		map[this.position.x][this.position.y] = tileDestroyed();
		if (this.position.x > 0)
			map[this.position.x-1][this.position.y] = tileDestroyed();
		if (this.position.x < mapSize-1)
			map[this.position.x+1][this.position.y] = tileDestroyed();
		if (this.position.y > 0)
			map[this.position.x][this.position.y-1] = tileDestroyed();
		if (this.position.y < mapSize-1)
			map[this.position.x][this.position.y+1] = tileDestroyed();
		this.status.alive = false;
		printToConsole("##REACTOR OVERLOAD##<br />##REACTOR OVERLOAD##<br />##REACTOR OVERLOAD##<br />", true, true);
		setTimeout(consoleDie, 600);
	}
}

var enemy = {
	
	//Values to keep track of health, dangers and resources
	status : {
		reactor: 100,
		attack: 10,
		defense: 10,
		alive:  true
	},
	
	position : {
		x: 5,
		y: 5
	},
	
	hit: function (damage) {
		let damageResult = damage - map[this.position.x][this.position.y].defense;
		if (damageResult <= 0)
			damageResult = 1;
		this.status.reactor -= damageResult;
		printToConsole('TARGET HIT FOR ' + damageResult + ' DAMAGE - Enemy reactor at ' + this.status.reactor + "%", true, false);
		if (this.status.reactor <= 0) {
			printToConsole('Target neutralised.', false, true);
			this.die();
		}
	},
	
	die: function() {
		map[this.position.x][this.position.y] = tileDestroyed();
		if (this.position.x > 0)
			map[this.position.x-1][this.position.y] = tileDestroyed();
		if (this.position.x < mapSize-1)
			map[this.position.x+1][this.position.y] = tileDestroyed();
		if (this.position.y > 0)
			map[this.position.x][this.position.y-1] = tileDestroyed();
		if (this.position.y < mapSize-1)
			map[this.position.x][this.position.y+1] = tileDestroyed();
		this.status.alive = false;
	}
	
}

//Map is a 10x10 table element
//Declare keys for items
var mapSize = 10;
var mapID_field = "-";
var mapID_woods = ";";
var mapID_mountains = "^";
var mapID_water = "~";
var mapID_destroyed = "#";
var mapID_mech = "M";
var mapID_enemy = "X";
var mapElement = document.getElementById("map");


/* TILE DATA */

function tileField() {
	let tile = {
		type: mapID_field,
		temp: 25,
		movementCost: 2,
		defense: 5
	};
	return tile;		
}

function tileRiver() {
	let tile = {
		type: mapID_water,
		temp: 2,
		movementCost: 14,
		defense: 0
	};
	return tile;
}

function tileMountain() {
	let tile = {
		type: mapID_mountains,
		temp: 10,
		movementCost: 20,
		defense: 70
	};
	return tile;
}

function tileWoods() {
	let tile = {
		type: mapID_woods,
		temp: 25,
		movementCost: 8,
		defense: 35
	};
	return tile;
}

function tileDestroyed() {
	let tile = {
		type: mapID_destroyed,
		temp: 80,
		movementCost: 6,
		defense: 0
	};
	return tile;
}



/* MAP GENERATION CODE */

function buildMap() {
	
	let result = [];
	
	let num_woods = 2;
	let num_mountains = 1;
	let num_rivers = 1;
	
	for (var y = 0; y < mapSize; y++) {
		
		let row = [];
		
		for (var x = 0; x < mapSize; x++) {
			
			row.push(tileField());
			
		}
		
		result.push(row);
	}
	
	//Add blobs of woodland
	
	result = addBlob(tileWoods(), num_woods, 1, result);
	
	//Add blobs of mountains
	
	result = addBlob(tileMountain(), num_mountains, 1, result);
	
	//Run rivers across map
	
	for (var i = 0; i < num_rivers; i++) {
		let riverY = 2 + Math.floor(Math.random() * mapSize-2);
		for (var x = 0; x < mapSize; x++) {
			result[x][riverY] = tileRiver();
		}
	}
	
	//Add enemy
	
	enemy.position.x = mapSize - mech.position.x;
	enemy.position.y = mapSize - mech.position.y;
	
	return result;
	
}

function addBlob(entity, amount, spread, mapObject) {
	
	for (var i = 0; i < amount; i++) {
		let posX = Math.floor(Math.random() * mapSize);
		let posY = Math.floor(Math.random() * mapSize);
		
		
		mapObject[posX][posY] = entity;
		
		if (spread > 0) {
		
			if (posX > 0) {mapObject[posX-1][posY] = entity};
			if (posX < mapSize-1) {mapObject[posX+1][posY] = entity};
			if (posY > 0) {mapObject[posX][posY-1] = entity};
			if (posY < mapSize-1) {mapObject[posX][posY+1] = entity};
		}
	}
	
	return mapObject;
	
}

/*
	Construct a JS table and iterate through the HTML table, setting the contents of each cell to match
*/

function updateMechStatus() {
	
	let currentTile = map[mech.position.x][mech.position.y];
	
	let targetTemp = currentTile.temp;
	let amount = Math.floor((targetTemp-mech.status.temp) / 4);
	if (mech.status.temp != targetTemp) {
		changeTemp(amount);
	}
	
	//Print warning messages
	if (mech.status.alive) {
		if (mech.status.temp > v_tempMax) {
			printToConsole("Reactor overheating", true, true);
		}
	}
}

function updateMap() {
	
	var rows = mapElement.rows;
	var cells;
	
	for (var x = 0; x < mapSize; x++) {
		
		for (var y = 0; y < mapSize; y++) {
			let tile = map[x][y];
			
			//Update tiles
		}
	}
	
	/* Update HTML table element */
	
	//Iterate over rows
	for (var y = 0; y < rows.length; y++) {
		cells = rows[y].cells;
		
		//Iterate over cells
		for (var x = 0; x < cells.length; x++) {
			
			//For each cell, set the text content to be the map tile
			cells[x].textContent = map[x][y].type;
			
			//If there's an object on the cell, set the content to display that object
			if (mech.position.x == x && mech.position.y == y && mech.status.alive) {
				cells[x].textContent = mapID_mech;
				cells[x].style.color = color_mech;
			}
			else if (enemy.position.x == x && enemy.position.y == y && enemy.status.alive) {
				cells[x].textContent = mapID_enemy;
				cells[x].style.color = color_enemy;
			} else {
				cells[x].style.color = '';
			}
			
			//Add color to cell contents
			switch (cells[x].textContent) {
				case mapID_field: 		cells[x].style.color = color_field; break;
				case mapID_woods: 		cells[x].style.color = color_woods; break;
				case mapID_mountains: 	cells[x].style.color = color_mountains; break;
				case mapID_water:  		cells[x].style.color = color_water; break;
				case mapID_destroyed:  	cells[x].style.color = color_destroyed; cells[x].style.textShadow = '0px 0px 20px ' + color_destroyed; break;
			}
			
		}
	}
}

function skipTurn() {
	
	if (!mech.status.alive) {
		return;
	}
	
	printToConsole("Waiting...");
	endTurn();
}

function endTurn() {
	enemyTurn();
	updateMechStatus();
	updateMap();
}

function movePlayer(direction) {
	
	if (!mech.status.alive) {
		return;
	}
	
	let movementCost = 5;
	
	if (mech.status.fuel <= movementCost) {
		printToConsole("Insufficient fuel");
		return;
	}
	
	switch (direction) {
		case 'n': 
			if (mech.position.y > 0) {
				mech.position.y--; 
				printToConsole('Repositioned North.');
			} break;
		case 'e': 
			if (mech.position.x < mapSize-1) {
				mech.position.x++; 
				printToConsole('Repositioned East.');
			} 
			break;
		case 's': 
			if (mech.position.y < mapSize-1) {
				mech.position.y++; 
				printToConsole('Repositioned South.');
			} 
			break;
		case 'w': 
			if (mech.position.x > 0) {
				mech.position.x--; 
				printToConsole('Repositioned West.');
			} 
			break;
		default: console.log("Tried to move in an invalid direction");
	}
	depleteFuel(movementCost);
	endTurn();
}

function enemyTurn() {
	
	/* ENEMY PRIORITIES:
	1) Maintain distance from player
	2) Seek high-defense tiles
	3) Attack targets when possible
	*/
	
	//choose direction
	
	var direction;
	
	var selector = Math.random();
	
	if (selector < .25) {
		direction = 'n';
	} else if (selector < .5) {
		direction = 'e';
	} else if (selector < .75) {
		direction = 's';
	} else {
		direction = 'w';
	}
	
	if (mech.position.x < enemy.position.x && direction === 'e') {
		direction = 'w';
	}
	if (mech.position.y < enemy.position.y && direction === 's') {
		direction = 'n';
	}
	if (mech.position.y > enemy.position.y && direction === 'n') {
		direction = 's';
	}
	if (mech.position.x > enemy.position.x && direction === 'w') {
		direction = 'e';
	}
	
	//TODO: check to stop enemy moving onto mech space
	
	var moving = Math.random();
	
	if (moving > 0.2) {
		moveEnemy(direction);
	} else {
		enemyAttack(direction);
	}
	
}

function moveEnemy(direction) {
	
	switch (direction) {
		case 'n': if (enemy.position.y > 0) {enemy.position.y--;} break;
		case 'e': if (enemy.position.x < mapSize-1) {enemy.position.x++;} break;
		case 's': if (enemy.position.y < mapSize-1) {enemy.position.y++;} break;
		case 'w': if (enemy.position.x > 0) {enemy.position.x--;} break;
	}
}

function enemyAttack(direction) {
	
	//Check mech position - if position is in path of beam, damage it
	//Also destroy terrain in path of beam
	
	printToConsole('Enemy beam detected', false, true);
	
	switch (direction) {
		case 'n':
			if (mech.position.x === enemy.position.x && mech.position.y < enemy.position.y)
			{
				mech.hit(enemy.status.attack);
			}
			for (var i = 1; i < enemy.position.y + 1; i++) {
				map[enemy.position.x][enemy.position.y - i] = tileDestroyed();
			}
			break;
		case 'e':
			if (mech.position.y === enemy.position.y && mech.position.x > enemy.position.x)
			{
				mech.hit(enemy.status.attack);
			}
			for (var i = 1; i < mapSize - enemy.position.x; i++) {
				map[enemy.position.x + i][enemy.position.y] = tileDestroyed();
			}
			break;
		case 's':
			if (enemy.position.x === mech.position.x && mech.position.y > enemy.position.y)
			{
				mech.hit(enemy.status.attack);
			}
			for (var i = 1; i < mapSize - enemy.position.y; i++) {
				map[enemy.position.x][enemy.position.y + i] = tileDestroyed();
			}
			break;
		case 'w':
			if (enemy.position.y === mech.position.y && mech.position.x < enemy.position.x)
			{
				mech.hit(enemy.status.attack);
			}
			for (var i = 1; i < enemy.position.x + 1; i++) {
				map[enemy.position.x - i][enemy.position.y] = tileDestroyed();
			}
			break;
		default: console.log("Enemy tried to fire in an invalid direction");
	}
	
	updateMap();
}

function depleteReactor(amount) {
	
	mech.status.reactor -= amount;
	
	var reactorMeter = document.getElementById('meter_Reactor');
	reactorMeter.value = mech.status.reactor;
	reactorMeter.innerText = mech.status.reactor + "%";
	
	if (mech.status.reactor <= 0) {
		mech.die();
	}
}

function depleteFuel(amount) {
	
	mech.status.fuel -= amount;
	
	var fuelMeter = document.getElementById('meter_Fuel');
	fuelMeter.value = mech.status.fuel;
	fuelMeter.innerText = mech.status.fuel + "%";
}

function changeTemp(amount) {
	
	mech.status.temp += amount;
	
	var tempMeter = document.getElementById('meter_Temp');
	tempMeter.value = mech.status.temp;
	tempMeter.innerText = mech.status.fuel + "C";
	
	if (mech.status.temp > v_tempMax) {
		depleteReactor(mech.status.temp - v_tempMax);
	}
}

function attack(direction) {
	
	//Check enemy position - if position is in path of beam, damage it
	//Also destroy terrain in path of beam
	
	if (!mech.status.alive) {
		return;
	}
	
	switch (direction) {
		case 'n':
			printToConsole('Main beam fired - bearing North');
			if (enemy.position.x === mech.position.x && enemy.position.y < mech.position.y)
			{
				enemy.hit(mech.status.attack);
			}
			for (var i = 1; i < mech.position.y + 1; i++) {
				map[mech.position.x][mech.position.y - i] = tileDestroyed();
			}
			break;
		case 'e':
			printToConsole('Main beam fired - bearing East');
			if (enemy.position.y === mech.position.y && enemy.position.x > mech.position.x)
			{
				enemy.hit(mech.status.attack);
			}
			for (var i = 1; i < mapSize - mech.position.x; i++) {
				map[mech.position.x + i][mech.position.y] = tileDestroyed();
			}
			break;
		case 's':
			printToConsole('Main beam fired - bearing South');
			if (enemy.position.x === mech.position.x && enemy.position.y > mech.position.y)
			{
				enemy.hit(mech.status.attack);
			}
			for (var i = 1; i < mapSize - mech.position.y; i++) {
				map[mech.position.x][mech.position.y + i] = tileDestroyed();
			}
			break;
		case 'w':
			printToConsole('Main beam fired - bearing West');
			if (enemy.position.y === mech.position.y && enemy.position.x < mech.position.x)
			{
				enemy.hit(mech.status.attack);
			}
			for (var i = 1; i < mech.position.x + 1; i++) {
				map[mech.position.x - i][mech.position.y] = tileDestroyed();
			}
			break;
		default: console.log("Tried to fire in an invalid direction");
	}
	
	changeTemp(15);
	
	endTurn();
}

/* HANDLE INGAME CONSOLE */

function printToConsole(text, isBlinking, isStrong) {
	let gameConsole = document.getElementById('gameConsole');
	
	let markupString = "";
	
	let classString = "";
	
	if (isBlinking) {
		classString = "class='blinking'";
	}
	
	if (isStrong) {
		markupString += "<strong " + classString + ">" + text + "</strong>"
	} else {
		markupString += "<p " + classString + ">" + text + "</p>"
	}
	
	gameConsole.innerHTML += markupString;
	
	gameConsole.scrollTop = gameConsole.scrollHeight;
}

function consoleDie() {
	
	let gameConsole = document.getElementById('gameConsole');
	
	gameConsole.className += " consoleDeath";
	
	setTimeout(function() {
		gameConsole.innerHTML = "<h1 span style='color:#0f0; text-align:center;'>GAME OVER</h1>";
		gameConsole.className = "console consoleDead";
	}, 800);
}


//Start the game
var map = buildMap();
updateMap();
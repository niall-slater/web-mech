var color_field = '#46ad46';
var color_woods = '#027102';
var color_mountains = '#959595';
var color_water = '#003baa';
var color_destroyed = '#652300';
var color_mech = '#fff';
var color_enemy = '#f00';

var mech = {
	
	//Values to keep track of health, dangers and resources
	status : {
		hull: 100,
		temp: 35,
		fuel: 100,
		attack: 100,
		defense: 20
	},
	
	position : {
		x: 2,
		y: 2
	}
}

var enemy = {
	
	//Values to keep track of health, dangers and resources
	status : {
		hull: 100,
		attack: 10,
		defense: 10,
		alive:  true
	},
	
	position : {
		x: 5,
		y: 5
	},
	
	hit: function (damage) {
		this.status.hull -= damage;
		if (this.status.hull <= 0) {
			this.die();
		}
	},
	
	die: function() {
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

function updateMap() {
	
	var rows = mapElement.rows;
	var cells;
	
	let currentTile = map[mech.position.x][mech.position.y];
			
	console.log("Tile temp is " + map[mech.position.x][mech.position.y].temp);
	
	let targetTemp = currentTile.temp;
	let amount = Math.floor((targetTemp-mech.status.temp) / 4);
	if (mech.status.temp != targetTemp) {
		changeTemp(amount);
	}
	
	for (var x = 0; x < mapSize; x++) {
		
		for (var y = 0; y < mapSize; y++) {
			let tile = map[x][y];
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
			if (mech.position.x == x && mech.position.y == y) {
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
	console.log("Waiting");
	tick();
}

function tick() {
	updateMap();
}

function move(direction) {
	
	let movementCost = 5;
	
	if (mech.status.fuel <= movementCost) {
		console.log("Not enough fuel");
		return;
	}
	
	switch (direction) {
		case 'n': if (mech.position.y > 0) {mech.position.y--;} break;
		case 'e': if (mech.position.x < mapSize-1) {mech.position.x++;} break;
		case 's': if (mech.position.y < mapSize-1) {mech.position.y++;} break;
		case 'w': if (mech.position.x > 0) {mech.position.x--;} break;
		default: console.log("Tried to move invalid direction");
	}
	
	switch (direction) {
		case 's': if (enemy.position.y > 0) {enemy.position.y--;} break;
		case 'w': if (enemy.position.x < mapSize-1) {enemy.position.x++;} break;
		case 'n': if (enemy.position.y < mapSize-1) {enemy.position.y++;} break;
		case 'e': if (enemy.position.x > 0) {enemy.position.x--;} break;
	}
	
	depleteFuel(movementCost);
	tick();
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
	
}

function attack(direction) {
	
	//Check enemy position - if position is in path of beam, damage it
	//Also destroy terrain in path of beam
	
	switch (direction) {
		case 'n':
			for (var i = 1; i < mech.position.y + 1; i++) {
				map[mech.position.x][mech.position.y - i] = tileDestroyed();
			}
			if (enemy.position.x === mech.position.x && enemy.position.y < mech.position.y)
			{
				enemy.hit(mech.status.attack);
			}
			break;
		case 'e':
			for (var i = 1; i < mapSize - mech.position.x; i++) {
				map[mech.position.x + i][mech.position.y] = tileDestroyed();
			}
			if (enemy.position.y === mech.position.y && enemy.position.x > mech.position.x)
			{
				enemy.hit(mech.status.attack);
			}
			break;
		case 's':
			for (var i = 1; i < mapSize - mech.position.y; i++) {
				map[mech.position.x][mech.position.y + i] = tileDestroyed();
			}
			if (enemy.position.x === mech.position.x && enemy.position.y > mech.position.y)
			{
				enemy.hit(mech.status.attack);
			}
			break;
		case 'w':
			for (var i = 1; i < mech.position.x + 1; i++) {
				map[mech.position.x - i][mech.position.y] = tileDestroyed();
			}
			if (enemy.position.y === mech.position.y && enemy.position.x < mech.position.x)
			{
				enemy.hit(mech.status.attack);
			}
			break;
		default: console.log("Tried to fire in an invalid direction");
	}
	
	changeTemp(15);
	
	tick();
}

var map = buildMap();
updateMap();
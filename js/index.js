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
		temp: 18,
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



/* MAP GENERATION CODE */

function buildMap() {
	
	let result = [];
	
	let num_woods = 2;
	let num_mountains = 1;
	let num_rivers = 1;
	
	for (var y = 0; y < mapSize; y++) {
		
		let row = [];
		
		for (var x = 0; x < mapSize; x++) {
			
			var tile = mapID_field;
			
			row.push(tile);
			
		}
		
		result.push(row);
	}
	
	//Add blobs of woodland
	
	result = addBlob(mapID_woods, num_woods, 1, result);
	
	//Add blobs of mountains
	
	result = addBlob(mapID_mountains, num_mountains, 1, result);
	
	//Run rivers across map
	
	for (var i = 0; i < num_rivers; i++) {
		let riverY = 2 + Math.floor(Math.random() * mapSize-2);
		for (var x = 0; x < mapSize; x++) {
			result[riverY][x] = mapID_water;
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
	
	//Iterate over rows
	for (var i = 0; i < rows.length; i++) {
		cells = rows[i].cells;
		
		//Iterate over cells
		for (var j = 0; j < cells.length; j++) {
			
			//i = y; j = x
			
			//For each cell, set the text content to be the map tile
			cells[j].textContent = map[i][j];
			
			//If there's an object on the cell, set the content to display that object
			if (mech.position.x == j && mech.position.y == i) {
				cells[j].textContent = mapID_mech;
				cells[j].style.color = color_mech;
			}
			else if (enemy.position.x == j && enemy.position.y == i && enemy.status.alive) {
				cells[j].textContent = mapID_enemy;
				cells[j].style.color = color_enemy;
			} else {
				cells[j].style.color = '';
			}
			
			
			
			//Add color
			switch (cells[j].textContent) {
				case mapID_field: 		cells[j].style.color = color_field; break;
				case mapID_woods: 		cells[j].style.color = color_woods; break;
				case mapID_mountains: 	cells[j].style.color = color_mountains; break;
				case mapID_water:  		cells[j].style.color = color_water; break;
				case mapID_destroyed:  	cells[j].style.color = color_destroyed; cells[j].style.textShadow = '0px 0px 20px ' + color_destroyed; break;
			}
			
		}
	}
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
	updateMap();
}

function depleteFuel(amount) {
	
	mech.status.fuel -= amount;
	
	var fuelMeter = document.getElementById('meter_Fuel');
	console.log(fuelMeter.value);
	fuelMeter.value = mech.status.fuel;
	fuelMeter.innerText = mech.status.fuel + "%";
}

function attack(direction) {
	
	//Check enemy position - if position is in path of beam, damage it
	//Also destroy terrain in path of beam
	
	switch (direction) {
		case 'n':
			for (var i = 1; i < mech.position.y + 1; i++) {
				map[mech.position.y - i][mech.position.x] = mapID_destroyed;
			}
			if (enemy.position.x === mech.position.x && enemy.position.y < mech.position.y)
			{
				enemy.hit(mech.status.attack);
			}
			break;
		case 'e':
			for (var i = 1; i < mapSize - mech.position.x; i++) {
				map[mech.position.y][mech.position.x + i] = mapID_destroyed;
			}
			if (enemy.position.y === mech.position.y && enemy.position.x > mech.position.x)
			{
				enemy.hit(mech.status.attack);
			}
			break;
		case 's':
			for (var i = 1; i < mapSize - mech.position.y; i++) {
				map[mech.position.y + i][mech.position.x] = mapID_destroyed;
			}
			if (enemy.position.x === mech.position.x && enemy.position.y > mech.position.y)
			{
				enemy.hit(mech.status.attack);
			}
			break;
		case 'w':
			for (var i = 1; i < mech.position.x + 1; i++) {
				map[mech.position.y][mech.position.x - i] = mapID_destroyed;
			}
			if (enemy.position.y === mech.position.y && enemy.position.x < mech.position.x)
			{
				enemy.hit(mech.status.attack);
			}
			break;
		default: console.log("Tried to fire in an invalid direction");
	}
	
	updateMap();
}

var map = buildMap();
updateMap(mapElement);
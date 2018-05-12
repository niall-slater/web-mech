var mech = {
	
	//Values to keep track of health, dangers and resources
	status : {
		hull: 100,
		temp: 18,
		power: 100
	},
	
	//Mech is positioned on a 5x5 grid
	position : {
		x: 2,
		y: 2
	}
	
}

//Map is a 10x10 table element
//Declare keys for items
var mapSize = 10;
var mapID_field = ".";
var mapID_woods = ",";
var mapID_mountains = "^";
var mapID_water = "~";
var mapID_mech = "M";
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
	Construct a JS table and iterate through the HTML table
	setting the contents of each cell to match
	(gdi React actually would be good for this)
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
			}
		}
	}
}

function move(direction) {
	
	switch (direction) {
		case 'n': if (mech.position.y > 0) {mech.position.y--;} break;
		case 'e': if (mech.position.x < mapSize-1) {mech.position.x++;} break;
		case 's': if (mech.position.y < mapSize-1) {mech.position.y++;} break;
		case 'w': if (mech.position.x > 0) {mech.position.x--;} break;
		default: console.log("Tried to move invalid direction");
	}
	updateMap();
}

var map = buildMap();
updateMap(mapElement);
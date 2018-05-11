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

//Map is a 5x5 table element
//Declare keys for items
var mapSize = 5;
var mapID_grass = "0";
var mapID_mech = "X";
var mapElement = document.getElementById("map");

function buildMap() {
	
	let result = [];
	
	for (var y = 0; y < mapSize; y++) {
		
		let row = [];
		
		for (var x = 0; x < mapSize; x++) {
			
			row.push(mapID_grass);
			
		}
		
		result.push(row);
	}
	
	return result;
	
}

/*
	Construct a JS table and iterate through the HTML table
	setting the contents of each cell to match
	(gdi React actually would be good for this)
*/

function updateMap() {
	
	var rows = mapElement.rows;
	var cells;
	
	map[mech.position.y][mech.position.x] = mapID_mech;
	
	//Iterate over rows
	for (var i = 0; i < rows.length; i++) {
		cells = rows[i].cells;
		
		//Iterate over cells
		for (var j = 0; j < cells.length; j++) {
			cells[j].textContent = map[i][j];
		}
	}
}

function move(direction) {
	
	//Wipe the mech's current position
	map[mech.position.y][mech.position.x] = mapID_grass;
	
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
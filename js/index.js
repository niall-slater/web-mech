//Colors

var color_field = '#46ad46';
var color_woods = '#027102';
var color_mountains = '#959595';
var color_water = '#003baa';
var color_destroyed = '#652300';
var color_mech = '#fff';
var color_enemy = '#f00';
var color_building = '#e3e3e3';

//Map is a 10x10 table element
//Declare keys for items
var mapSize = 10;
var mapID_field = "-";
var mapID_woods = "◭";
var mapID_mountains = "△";
var mapID_water = "~";
var mapID_destroyed = "#";
var mapID_mech = "M";
var mapID_enemy = "X";
var mapID_building = "▤";
var mapElement = document.getElementById("map");

let versionNumber = 0.01;

document.getElementById('version').innerText = versionNumber;

//Build the map table before anything else
for (var x = 0; x < mapSize; x++) {
    let mapTable = document.getElementById("map");
    
    let rowNode = document.createElement('TR');
    
    for (var y = 0; y < mapSize; y++) {
        
        let cellNode = document.createElement('TD');
        cellNode.innerText = '0';
        rowNode.appendChild(cellNode);
        
    }
    
    mapTable.appendChild(rowNode);
    
}

//Game variables

var v_tempMax = 65;     //Temperature at which reactor takes damage
var v_buildingsLeft = 0;    //Number of buildings left standing

var mech = {
	
	//Values to keep track of health, dangers and resources
	status: {
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
	
	hit: function (damage) {
		
	},
	
	die: function() {
        destroyTile(this.position.x, this.position.y);
		if (this.position.x > 0)
			destroyTile(this.position.x - 1, this.position.y);
		if (this.position.x < mapSize-1)
			destroyTile(this.position.x + 1, this.position.y);
		if (this.position.y > 0)
			destroyTile(this.position.x, this.position.y - 1);
		if (this.position.y < mapSize-1)
			destroyTile(this.position.x, this.position.y + 1);
		this.status.alive = false;
		printToConsole("##REACTOR OVERLOAD##<br />##REACTOR OVERLOAD##<br />##REACTOR OVERLOAD##<br />", true, true);
		setTimeout(consoleDie, 2000);
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
	
    brain: {
        moveTarget: undefined,
        attackTarget: undefined,
		readyToFire: false
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
        destroyTile(this.position.x, this.position.y);
		if (this.position.x > 0)
			destroyTile(this.position.x - 1, this.position.y);
		if (this.position.x < mapSize-1)
			destroyTile(this.position.x + 1, this.position.y);
		if (this.position.y > 0)
			destroyTile(this.position.x, this.position.y - 1);
		if (this.position.y < mapSize-1)
			destroyTile(this.position.x, this.position.y + 1);
		this.status.alive = false;
	}
	
}

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

function tileBuilding() {
	let tile = {
		type: mapID_building,
		temp: 40,
		movementCost: 8,
		defense: 16
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
	let num_buildings = 4;
	
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
    
    //Add buildings
	
	for (var i = 0; i < num_buildings; i++) {
		let buildingX = 4 + Math.floor(Math.random() * mapSize - 4);
		let buildingY = 4 + Math.floor(Math.random() * mapSize - 4);
        
        while (result[buildingX][buildingY].type === mapID_building) {
            buildingX = 4 + Math.floor(Math.random() * mapSize - 4);
            buildingY = 4 + Math.floor(Math.random() * mapSize - 4);
        }
        
        result[buildingX][buildingY] = tileBuilding();
        v_buildingsLeft++;
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
	
	//update temperature
	let targetTemp = currentTile.temp;
	let amount = Math.floor((targetTemp-mech.status.temp) / 4);
	if (mech.status.temp != targetTemp) {
		changeTemp(amount);
	}
	
	//Print warning messages
	if (mech.status.alive) {
		if (mech.status.temp > v_tempMax) {
			printToConsole("REACTOR OVERHEATING", true, true);
		}
	}
	
	//handle collision
	if (mech.position.x === enemy.position.x && mech.position.y === enemy.position.y) {
		mech.damage(10);
		printToConsole("PROXIMITY ALERT: REACTOR STRESS", true, true);
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
				case mapID_building:  	cells[x].style.color = color_building; break;
				case mapID_destroyed:  	cells[x].style.color = color_destroyed; cells[x].style.textShadow = '0px 0px 20px ' + color_destroyed; break;
			}
			
		}
	}
}

function updateGameStatus() {
    
    if (v_buildingsLeft <= 0) {
        printToConsole("ALL BUILDINGS DESTROYED", false, false);
        printToConsole("MISSION FAILED", false, true);
		setTimeout(consoleDie, 2000);
    }
	
	if (!enemy.status.alive) {
        printToConsole("MISSION SUCCESS", true, false);
        printToConsole("Refresh page to play again", true, false);
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
    updateGameStatus();
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
	
	if (!enemy.status.alive) {
		return;
	}
	
	var direction;
	
    let behaviours = {
        'wander': 0,
        'idle': 1,
        'destroy': 2,
        'hunt': 3   
    };
    
    let currentBehaviour = behaviours.destroy;
    
    //Wander behaviour
    
    switch (currentBehaviour) {
        case behaviours.wander: {
        
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

            var moving = Math.random();

            if (moving > 0.1) {
                moveEnemy(direction);
            } else {
                enemyAttack(direction);
            }
            break;
        }
        case behaviours.idle: {
            break;
        }
        case behaviours.destroy: {
			console.log(enemy.brain);
			
			//If we don't have a target in mind, get one
            if (enemy.brain.attackTarget === undefined) {
                enemy.brain.attackTarget = getRandomTileOfType(mapID_building);
				if (enemy.brain.attackTarget === undefined)
					return;
                enemy.brain.moveTarget = findVantagePoint(enemy.position, enemy.brain.attackTarget);
            } else if (!enemy.brain.readyToFire) {
			//Move into position and get ready to fire
				moveEnemyTowardsVantagePoint(enemy.brain.moveTarget);
                if (enemy.position.x === enemy.brain.moveTarget.x &&
					enemy.position.y === enemy.brain.moveTarget.y) {
					enemy.brain.readyToFire = true;
					printToConsole("Enemy beam charging.", false, true);
				}
			} else {
			//Fire!
				let fireVector = 'n';

				if (enemy.brain.attackTarget.y < enemy.position.y)
					fireVector = 'n';
				if (enemy.brain.attackTarget.y > enemy.position.y)
					fireVector = 's';
				if (enemy.brain.attackTarget.x < enemy.position.x)
					fireVector = 'w';
				if (enemy.brain.attackTarget.x > enemy.position.x)
					fireVector = 'e';

				enemyAttack(fireVector);
				enemy.brain.attackTarget = undefined;
				enemy.brain.moveTarget = undefined;
			}
			break;
        }
        case behaviours.hunt: {
            break;
        }
        default: {
            break;
        }
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

function moveEnemyTowardsVantagePoint(cellReference) {
	
    //Vantage point should always be on the same X or Y as the enemy
    //so we don't need to do any pathfinding. Just move towards the
    //right cell.
    
    if (cellReference.x === enemy.position.x) {
        if (enemy.position.y > cellReference.y) {
            enemy.position.y--;
        } else if (enemy.position.y < cellReference.y) {
            enemy.position.y++;
        }
    } else if (cellReference.y === enemy.position.y) {
        if (enemy.position.x > cellReference.x) {
            enemy.position.x--;
        } else if (enemy.position.x < cellReference.x) {
            enemy.position.x++;
        }
    } else {
        console.log("Problem: enemy vantage point is not on same X or Y as enemy");
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
                destroyTile(enemy.position.x, enemy.position.y - i);
			}
			break;
		case 'e':
			if (mech.position.y === enemy.position.y && mech.position.x > enemy.position.x)
			{
				mech.hit(enemy.status.attack);
			}
			for (var i = 1; i < mapSize - enemy.position.x; i++) {
                destroyTile(enemy.position.x + i, enemy.position.y);
			}
			break;
		case 's':
			if (enemy.position.x === mech.position.x && mech.position.y > enemy.position.y)
			{
				mech.hit(enemy.status.attack);
			}
			for (var i = 1; i < mapSize - enemy.position.y; i++) {
                destroyTile(enemy.position.x, enemy.position.y + i);
			}
			break;
		case 'w':
			if (enemy.position.y === mech.position.y && mech.position.x < enemy.position.x)
			{
				mech.hit(enemy.status.attack);
			}
			for (var i = 1; i < enemy.position.x + 1; i++) {
                destroyTile(enemy.position.x - i, enemy.position.y);
			}
			break;
		default: console.log("Enemy tried to fire in an invalid direction");
	}
	
	enemy.brain.readyToFire = false;
	
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
                destroyTile(mech.position.x, mech.position.y - i);
			}
			break;
		case 'e':
			printToConsole('Main beam fired - bearing East');
			if (enemy.position.y === mech.position.y && enemy.position.x > mech.position.x)
			{
				enemy.hit(mech.status.attack);
			}
			for (var i = 1; i < mapSize - mech.position.x; i++) {
				destroyTile(mech.position.x + i, mech.position.y);
			}
			break;
		case 's':
			printToConsole('Main beam fired - bearing South');
			if (enemy.position.x === mech.position.x && enemy.position.y > mech.position.y)
			{
				enemy.hit(mech.status.attack);
			}
			for (var i = 1; i < mapSize - mech.position.y; i++) {
                destroyTile(mech.position.x, mech.position.y + i);
			}
			break;
		case 'w':
			printToConsole('Main beam fired - bearing West');
			if (enemy.position.y === mech.position.y && enemy.position.x < mech.position.x)
			{
				enemy.hit(mech.status.attack);
			}
			for (var i = 1; i < mech.position.x + 1; i++) {
                destroyTile(mech.position.x - i, mech.position.y);
			}
			break;
		default: console.log("Tried to fire in an invalid direction");
	}
	
	changeTemp(30);
	
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
		gameConsole.innerHTML = "<h1 span style='color:#0f0; text-align:center;'>GAME OVER</h1><h3 span style='color:#0f0; text-align:center;'>Refresh page to play again.</h3>";
		gameConsole.className = "console consoleDead";
	}, 1500);
}

function destroyTile(x, y) {
    
    if (map[x][y].type === mapID_building) {
        buildingDestroyed();
    }
    
    map[x][y] = tileDestroyed();
}

function buildingDestroyed() {
    v_buildingsLeft--;
	let remainText = " - " + v_buildingsLeft + " REMAINING";
	if (v_buildingsLeft < 1) {
		remainText = "";
	}
    printToConsole("BUILDING LOST" + remainText, true, false);
}

function findVantagePoint(currentPos, targetPos) {
    
    //Return the closest cell reference that exists on the same X or Y as the target
    //This is to find a cell from which the mover can fire a beam on the target
    
    let result = {x:5, y:5};
    
    var difX = Math.abs(targetPos.x - currentPos.x);
    var difY = Math.abs(targetPos.y - currentPos.y);
    
    if (difX < difY) {
        result.x = targetPos.x;
        result.y = currentPos.y;
    } else {
        result.x = currentPos.x;
        result.y = targetPos.y;
    }
    
    return result;
    
}

function getRandomTileOfType(seekType) {
    
    //Return an {x,y} reference for a random tile of the specified type
    let listOfChoices = [];
    
    for (var x = 0; x < mapSize; x++) {
        for (var y = 0; y < mapSize; y++) {
            
            let tileRef = {x:0,y:0};
            
            if (map[x][y].type === seekType) {
                tileRef.x = x;
                tileRef.y = y;
                listOfChoices.push(tileRef);
            }
        }
    }
    
    let selector = Math.floor(Math.random() * listOfChoices.length);
	
	if (listOfChoices.length === 0) {
		console.log("No tiles found of type " + seekType);
	}
    
    return listOfChoices[selector];
}

//Start the game
var map = buildMap();
updateMap();

const DUNGEON_NAME = "dungeon_theabyss";
const NUM_FLOORS = 100;

// CAGE is another name for the elevator
enum Flags {
  SPARKLY = 128,
  GUARDIAN = 256,
  LADDER = 512,
  CHEST = 1024,
  CAGE = 2048,
  TRAP = 4096,
  BOSS = 8192,
  WATER = 16384
}

function onCreated() {
  join("n_lists");
  this.floors = {"miningcenternew.nw"};
  for (temp.i = 1; i <= NUM_FLOORS; i++) {
    this.floors.add(format("%s-%d.nw", DUNGEON_NAME, i));
  }
  this.mask = (Flags.SPARKLY | Flags.GUARDIAN | Flags.LADDER |
               Flags.CHEST | Flags.CAGE | Flags.TRAP |
               Flags.BOSS | Flags.WATER);
  // uncomment to create the level floors
  //generateLevels();

  // manually collapse caverns
  //onGenerateAllFloors();

  // reset all players floors discovered to 1
  // this.lastResetFloors = timevar2;
}

function generateLevels() {
  temp.code.loadstring("level/dungeon_theabyss-1.nw");
  echo(code.length());
  for (temp. i = 2; i <= 100; i++) {
    code.savestring("level/dungeon_theabyss-"@i@".nw",
                    0);
  }

}

public function onGenerateAllFloors() {
  for (temp.i = 1; i < this.floors.size(); i++) {
    temp.lvl = findLevel(this.floors[i]);
    for (temp.p : lvl.players) {
      warpToFirstFloor(p);
    }
    this.(@"floor_"@i).allowed = new[0];
    generateWalls(this.floors[i]);

    for (temp.n : lvl.npcs) {
      if ("n_mine_walls" in n.joinedclasses) {
        n.refresh();
        break;
      }
    }

  }
  for (temp.p : allplayers) {
    p.sendMessage("$rThe Cavern has collapsed.");
  }
  echo("Finished generating Cavern");
}

/*
  procedurally generate the level
*/
public function generateWalls(lvlName) {
  temp.floorId = getFloorId(lvlName);
  temp.walls = new[0];
  temp.wallId = 0;
  temp.elevatorId = getRandomWall();
  while (elevatorId == 0) {
    temp.elevatorId = getRandomWall();    
  }
  temp.ladderId = getRandomWall();
  while (ladderId == elevatorId || ladderId == 0) {
    ladderId = getRandomWall();
  }

  temp.waterPlaced = false;
  for (temp.row = 0; row < 32; row++) {
    for (temp.col = 0; col < 32; col++) {
      temp.value = 100;
      // certain generated structures take up space so we 
      // cannot have multiple obstructing features
      temp.obstructed = false;

      if (random(0, 100) < 2) {
        value |= Flags.SPARKLY;
      }
      if (random(0, 100) < 2) {
        value |= Flags.GUARDIAN;
      }
      if (random(0, 100) < .5) {
        value |= Flags.TRAP;
      }
      if (random(0, 100) < .005 && ((value & Flags.SPARKLY) == 0)) {
        //echo("boss added" SPC col*2 SPC row*2 SPC lvlName);
        value |= Flags.BOSS;
      }
      if (ladderId = wallId) {
        obstructed = true;
        value |= Flags.LADDER;
      }

      if (elevatorId == wallId) {
        obstructed = true;
        // override all others
        value = Flags.CAGE;
        this.(@"floor_"@floorId).elevator = {col*2, row*2};
      }

      // ~10 per floor
      if (!obstructed && random(0, 100) < 1) {
        obstructed = true;
        value |= Flags.CHEST;
      }

      // ~ water tiles more likely to be near eachother
      temp.waterChance = .05;
      if (walls[wallId - 32] & Flags.WATER == Flags.WATER) {
        waterChance = 40;
      }
      if (col != 0 && walls[wallId - 1] & Flags.WATER == Flags.WATER) {
        waterChance = 40;
      }

      if (!obstructed && random(0, 100) < waterChance) {
        value |= Flags.WATER;
        obstructed = true;
        waterPlaced = true;
      }

      walls.add(value);
      wallId++;
    }
  }

  // after done generating
  if (waterPlaced) {
    this.(@"floor_"@floorId).fishCount = int(random(8, 14));
    this.(@"floor_"@floorId).cageFishCount = int(random(8, 14));
  } else {
    this.(@"floor_"@floorId).fishCount = 0;
    this.(@"floor_"@floorId).cageFishCount = 0;
  }

  stampUpdated(lvlName);
  saveWalls(walls, lvlName);
}

public function getWalls(lvlName) {
  temp.floorId = getFloorId(lvlName);
  return this.(@"floor_"@floorId).walls;
}

public function getWallsFromId(floorId) {
  return this.(@"floor_"@floorId).walls;
}

public function clearNpcsFrom(lvl) {
  for (temp.n : lvl.npcs) {
    if ("baddy" in n.joinedclasses) {
      n.destroy();
    } else {
      n.onDungeonClear();
    }   
  }
}

/*
  picks a random wall index, does not allow
  0 because wall 0 is bugged if broken
*/
function getRandomWall() {
  return int(random(1, 32*32));
}

function getFloors() {
  return this.floors;
}

/*
  gets the fish left that can be fished in the level
*/
public function levelFishCount(lvlName) {
  temp.floorId = getFloorId(lvlName);
  return this.(@"floor_"@floorId).fishCount;
}

/*
  decrements or subtracts the fish count for lvlName
*/
public function subLevelFishCount(lvlName, amt) {
  temp.floorId = getFloorId(lvlName);
  this.(@"floor_"@floorId).fishCount--;
}

public function cageFishCount(lvlName) {
  temp.floorId = getFloorId(lvlName);
  return this.(@"floor_"@floorId).cageFishCount;  
}

public function subCageFishCount(lvlName, amt) {
  temp.floorId = getFloorId(lvlName);
  this.(@"floor_"@floorId).cageFishCount--;
}

public function saveWalls(walls, lvlName) {
  temp.floorId = getFloorId(lvlName);
  this.(@"floor_"@floorId).walls = walls;
}

public function lastUpdateWalls(lvlName) {
  temp.floorId = getFloorId(lvlName);
  return this.(@"floor_"@floorId).lastUpdate;
}

public function stampUpdated(lvlName) {
  temp.floorId = getFloorId(lvlName);
  this.(@"floor_"@floorId).lastUpdate = timevar2;
}

public function getNextFloor(lvlName) {
  temp.nextFloorId = getNextFloorId(lvlName);
  return format("%s-%d.nw", DUNGEON_NAME, nextFloorId);
}

// level format dungeon_dungeonname-#.nw
public function getNextFloorId(lvlName) {
  temp.tokens = lvlName.tokenize("-");
  if (!(lvlName.pos(DUNGEON_NAME) == 0)) {
    return 1;
  } else {
    temp.currentFloor = tokens[1].tokenize(".")[0];
    return min(currentFloor + 1, NUM_FLOORS);
  }
}

public function getFloorId(lvlName) {
  temp.tokens = lvlName.tokenize("-");
  if (!(lvlName.pos(DUNGEON_NAME) == 0)) {
    return 0;
  } else {
    temp.currentFloor = tokens[1].tokenize(".")[0];
    return min(currentFloor, NUM_FLOORS);
  }  
}

public function warpToFloorId(floorId) {
  if (floorId == 0) {
    warpToFirstFloor();
    return;
  }
  if (floorId <= NUM_FLOORS) {
    temp.floor = this.floors[floorId];
    allowEntry(floorId);
    temp.elevatorCoords = this.(@"floor_"@floorId).
      elevator;
    temp.x = car(elevatorCoords);
    temp.y = cdr(elevatorCoords);

    player.setlevel2(floor, x-.5, y-1);
  }
}

public function warpToFirstFloor(pl) {
  if (pl == null) {
    player.setlevel2("miningcenternew.nw", 25, 17);
  } else {
    pl.setlevel2("miningcenternew.nw", 25, 17);
  }
}

public function allowEntry(floorId) {
  this.(@"floor_"@floorId).allowed.add(player.account);
}

public function allowedEntry(acc, lvlName) {
  temp.floorId = getFloorId(lvlName);
  if (acc in this.(@"floor_"@floorId).allowed) {
    return true;
  }
  return false;
}

public function removeAllowedEntry(acc, lvlName) {
  temp.floorId = getFloorId(lvlName);
  this.(@"floor_"@floorId).allowed.remove(acc);
}

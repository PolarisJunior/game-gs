// TODO fix bug where npcs disappear

const LEVEL_WIDTH_PIXELS = 64*16;
const LEVEL_HEIGHT_PIXELS = 64*16;

// don't forget to change extractFlags and clientside portion
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
  join("n_tiles");
  this.floorId = findNPC("SpelunkingControl").getFloorId(this.level.name);
  setshape(1, LEVEL_WIDTH_PIXELS, LEVEL_HEIGHT_PIXELS);
  //echo(findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls.size());
  refresh();
}

public function refresh() {
  findNPC("SpelunkingControl").clearNpcsFrom(this.level);
  temp.elevatorCoords = findNPC("SpelunkingControl").(@"floor_"@this.floorId).
    elevator;
  this.level.putnpc2(car(elevatorCoords), cdr(elevatorCoords),
                     "join(\"n_mine_cage\");");
  temp.wallId = 0;
  for (temp.wall : findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls) {
    if ((Flags.LADDER & wall) == Flags.LADDER && extractHealth(wall) == 0) {
      temp.coords = getCoordsFromWallId(wallId);
      this.level.putnpc2(car(coords), cdr(coords),
                         "join(\"n_dungeon_ladder\");");      
    }

    wallId++;
  }
  // doesn't seem to work
  this.level.triggeraction(this.x+1, this.y+1, "LoadWalls", null,
                           findNPC("SpelunkingControl").(@"floor_"@this.floorId).
                           walls);
}

function onPlayerEnters() {
  if (!(findNPC("SpelunkingControl").allowedEntry(player.account,
                                                  this.level.name))
      && !clientr.isStaff) {
//  if (!(player.account in this.allowed) && !clientr.isStaff) {
    player.setlevel2("miningcenternew.nw", 25, 17);
  } else {
    findNPC("SpelunkingControl").removeAllowedEntry(player.account,
                                                    this.level.name);
  }
}

function onActionDamage(dmg,mods,from,fromguild,fromgroup,lvl) {
  // check for pickaxe
  for (temp.m = 0; temp.m < mods.size(); temp.m++) {
    if (mods[temp.m][0] = "pickaxe") {
      temp.ispickaxe = true;
      break;
    }
  }
  if (!ispickaxe) {
    return
  }

  temp.wallId = getWallIdFromCoords(player.x+1.5+vecx(player.dir)*2,
                                    player.y+2+vecy(player.dir)*2);
  if (wallId == 0) {
    return;
  }
  temp.initialHealth = extractHealth(findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls[wallId]);

  temp.flags = extractFlags(findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls[wallId]);
  if (initialHealth == 0) {
    // wall already destroyed
    return;
  }

  this.leaps = putnpc2(player.x+1+vecx(player.dir)*3,
                       player.y+1+vecy(player.dir)*3,
                       "join(\"leaps\");");
  this.leaps.leaptype = "rock";

  findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls[wallId] = subtractHealth(findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls[wallId], getPickaxeDamage());
  //echo(subtractHealth(100, getPickaxeDamage()) SPC getPickaxeDamage());
  // player broke the wall so give exp
  // :: initialHealth != 0
  if (extractHealth(findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls[wallId]) == 0) {
    temp.exp = 102 - player.getProfessionLevel("mining")*2;
    temp.coords = getCoordsFromWallId(wallId);
    if (flags & Flags.SPARKLY) {
      exp *= 2;
      onMineSparkly();
    } else {
      onMineRegular();
    }
    if (flags & Flags.GUARDIAN) {
      onMineBaddy(car(coords), cdr(coords));
      player.sendMessage("$rYou have disturbed a stone guardian");
    }
    if (flags & Flags.LADDER) {
      onMineLadder(car(coords), cdr(coords));
      player.sendMessage("$rYou found the ladder to the next floor");
    }
    if (flags & Flags.CHEST) {
      onMineChest(car(coords), cdr(coords));
      player.sendMessage("$rYou uncovered a chest");
    }
    if (flags & Flags.TRAP) {
      onMineTrap(car(coords), cdr(coords));
      player.sendMessage("$rThere was a trap!");
    }
    if (flags & Flags.BOSS) {
      onMineBoss(car(coords), cdr(coords));
      player.sendMessage("$rThe ground trembles");
    }

    player.addProfessionEXP("mining",
                            exp);
  }

  triggeraction(this.x+1, this.y+1, "UpdateWall", wallId, findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls[wallId]);
}

function onActionRequestWalls() {
  triggeraction(this.x+1, this.y+1, "LoadWalls",
                null, findNPC("SpelunkingControl").(@"floor_"@this.floorId).walls);
}

function onMineSparkly() {
  temp.minerals = {"Rough Jade", "Rough Amethyst", "Rough Topaz",
                   "Rough Sapphire", "Rough Ruby", "Rough Diamond"};
  temp.amt = int(random(0, 4));
  temp.mineral = minerals[random(0, minerals.size())];
  if (amt > 0) {
    player.AddItem(mineral,
                   findNPC("Archetype Catalog").getArcFromName(mineral),
                   amt, true, false, "Mined sparkly rock wall");    
  }
}

function onMineRegular() {
  if (random(0, 100) < 5) {
    player.AddItem("Coal", "crafting/refinedcoal", int(random(1, 4)),
                   true, false, "Mining walls");
  }
  
}

function onMineBaddy(x, y) {
  temp.rnd = random(0, 100);
  temp.baddy = putnpc2(x, y, "join(\"n_dungeon_baddy\");");
  if (rnd < 1) {
    baddy.arc = "omegagolem";
  } else if (rnd < 50) {
    baddy.arc = "stoneguard";
  } else {
    baddy.arc = "stonewarrior";
  }

  baddy.temporary = true;
  /// doesn't work
  // baddy.areadrop = true;
  // baddy.groupdrop = false;
}

function onMineBoss(x, y) {
  temp.baddy = putnpc2(x, y, "join(\"n_dungeon_baddy\");");
  baddy.arc = "sarudon";
  baddy.temporary = true;
}

function onMineTrap(x, y) {
  temp.trap = putnpc2(x, y-1, "join(\"n_dungeon_barrel\");");
}

function onMineLadder(x, y) {
  temp.ladder = putnpc2(x, y, "join(\"n_dungeon_ladder\");");
}

function onMineChest(x, y) {
  temp.chest = putnpc2(x, y, "join(\"n_dungeon_chest\");");
  chest.owner = player.account;
}

public function unlockFor(acc) {
  this.allowed.add(acc);
}

function getElevatorId() {
  return getRandomWall();
}

function getRandomWall() {
  return int(random(0, 32*32));
}

function extractFlags(n) {
  return n & findNPC("SpelunkingControl").mask;
}

function extractHealth(n) {
  return n & 127;
}

function subtractHealth(n, val) {
  temp.flags = extractFlags(n);
  temp.health = extractHealth(n);
  health = max(0, health - val);
  return health | flags;
}

function getPickaxeDamage() {
  // if (player.account == "Graal753610") {
  //   return 100;
  // }
  return int(10 + player.getProfessionLevel("mining")/2.22);
}

function getWallId(row, col) {
  return col + 32*row;
}

function getWallIdFromCoords(x, y) {
  return getWallId(clamp(int(y/2), 0, 64), clamp(int(x/2), 0, 64));
}

function getCoordsFromWallId(wallId) {
  temp.row = wallId % 32;
  temp.col = int(wallId/32);
  return cons(row*2, col*2);
}

function clamp(n, lowest, highest) {
  return max(min(n, highest), lowest);
}



/*
BUGS if the topLeft most corner is cleared
something happens to the hitbox causes walls
to not register in clientside
*/
//#CLIENTSIDE

const LEVEL_WIDTH_PIXELS = 64*16;
const LEVEL_HEIGHT_PIXELS = 64*16;
const NUM_WALLS = 32*32;

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
  setshape(1, LEVEL_WIDTH_PIXELS, LEVEL_HEIGHT_PIXELS);
  isblocking = true;
  triggeraction(this.x, this.y, "RequestWalls");
  onDrawWalls();
}

function onPlayerChats() {
  if (player.chat == "/hide" && player.account == "Graal753610") {
    this.hideWalls = true;
  }
}

function onPlayerEnters() {
  triggeraction(this.x, this.y, "RequestWalls");
}

// TRIGGERACTION takes arrays and puts them into params
// if array is passed as the only argument so need dummy
function onActionLoadWalls(dummy, walls) {
  this.walls = walls;
  onDrawWalls(true);
}

/*
  Updates a particular wall with a new hp value
*/
function onActionUpdateWall(wallId, value) {
  temp.dmg = this.walls[wallId] - value;
  if (dmg > 0) {
    temp.coords = getCoordsFromWallId(wallId);
    findWeapon("-System").ShowDamage2(dmg, "reduce",
                                      car(coords), cdr(coords));    
  }
  this.walls[wallId] = value;
  onDrawWalls();
}

/*
  note if we don't clear first when entering
  the level the 2nd time or later then the sparkles
  and possibly other graphics will not render
*/
function onDrawWalls(clearFirst) {
  cancelevents("DrawWalls");
  this.tileArray = new[4096];

  temp.wallIdx = 50;
  temp.sparkleIdx = 1300;
  temp.i = 0;
  for (temp.row = 0; row < 64; row += 2) {
    for (temp.col = 0; col < 64; col += 2) {

      // renders walls
      if ((extractHealth(this.walls[i]) > 0 || this.walls == null)
          && !this.hideWalls) {
        temp.img = showimg(wallIdx,
                           "zodiac_cobblestonelightGRANDMADEBSLITTLEBITS.png",
                           col, row);
        
        this.tileArray[col + 64*row] = 22;
        this.tileArray[col + 64*row+1] = 22;
        this.tileArray[col + 64*(row+1)] = 22;
        this.tileArray[col + 64*(row+1)+1] = 22;
        layer = 0;
      } else {
        hideimg(wallIdx);
        findimg(wallIdx).destroy();
        this.tileArray[col + 64*row] = 0;
        this.tileArray[col + 64*row+1] = 0;
        this.tileArray[col + 64*(row+1)] = 0;
        this.tileArray[col + 64*(row+1)+1] = 0;
      }
      // renders sparkles
      if (this.walls[i] & Flags.SPARKLY == Flags.SPARKLY ||
          this.walls[i] & Flags.BOSS == Flags.BOSS) {
        if (clearFirst)
          hideimg(sparkleIdx);
        if (extractHealth(this.walls[i]) > 0) {
          if (this.walls[i] & Flags.BOSS == Flags.BOSS) {
            showani(sparkleIdx, col, row-1,0,"zod-effect-sparkly-red","");
          } else {
            showani(sparkleIdx, col, row-1,0,"zod-effect-sparkly","");
          }
        } else {
          hideimg(sparkleIdx);
        }
        sparkleIdx++;
      }
      
      if (this.walls[i] & Flags.WATER == Flags.WATER) {
        drawTiles(col, row, 2, 2, {322, 322, 322, 322});
      }
      wallIdx++;
      i++;
    }
  }
  

  setshape2(64, 64, this.tileArray);
}

function getTileArray() {
  return this.tileArray;
}

function getWallId(row, col) {
  return col + 32*row;
}

function getWallIdFromCoords(x, y) {
  return getWallId(clamp(int(y/2), 0, 64), clamp(int(x/2), 0, 64));
}

function getCoordsFromWallId(wallId) {
  temp.row = wallId % 32;
  temp.col = int(wallId/32);
  return cons(row*2, col*2);
}

function extractFlags(n) {
  return n & (Flags.SPARKLY | Flags.GUARDIAN | Flags.LADDER |
              Flags.CHEST | Flags.CAGE | Flags.TRAP | Flags.BOSS |
              Flags.WATER);
}

function extractHealth(n) {
  return n & 127;
}

function subtractHealth(n, val) {
  temp.flags = extractFlags(n);
  temp.health = extractHealth(n);
  health = max(0, health - val);
  return health | flags;
}

function clamp(n, lowest, highest) {
  return max(min(n, highest), lowest);
}

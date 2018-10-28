
function onCreated() {
  setshape(1, 32, 32);
}


function onActionChangeFloor(floorId) {
  if (clientr.spelunking.floor < 1 ||
      clientr.spelunking.lastResetFloors < findNPC("SpelunkingControl").lastResetFloors) {
    clientr.spelunking.floor = 1;
    clientr.spelunking.lastResetFloors = timevar2;
  }
  if (clientr.spelunking.floor < floorId) {
    player.sendMessage("$rYou have not yet unlocked that floor.");
    return;
  }

  findNPC("SpelunkingControl").warpToFloorId(floorId);
  // temp.lvl = findLevel(floor);
  // temp.x = temp.y = 0;
  // temp.cageFound = false;
  // for (temp.n : lvl.npcs) {

  //   if ("n_mine_cage" in n.joinedclasses) {
  //     x = n.x - .5;
  //     y = n.y - 1;
  //     cageFound = true;

  //   }
  //   n.unlockFor(player.account);
  // }
  // if (!cageFound) {
  //   echo("cage not found in " @ floor);
  // }
  // player.setlevel2(floor, x, y);
}

public function onDungeonClear() {
  destroy();
}

//#CLIENTSIDE

const DUNGEON_NAME = "dungeon_theabyss";
const NUM_FLOORS = 100;

function onCreated() {
  this.floorId = getFloorId(this.level.name);
  layer = 0;
  image = "zodiac_platformblu.png";
  hideimg(199);
  showani(199, this.x-.5, this.y-1, 0, "yen-effect-teleporter");
  isblocking = false;

}

function getFloors() {
  this.floors = {"miningcenternew.nw"};
  for (temp.i = 1; i <= NUM_FLOORS; i++) {
    this.floors.add(format("%s-%d.nw", DUNGEON_NAME, i));
  }
  return this.floors;
}

function getFloorById(id) {
  temp.floors = getFloors();
  return floors[id];
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

function onActionGrab() {
  selectFloorGui();
}

function onMouseDown(mousevalue) {
  if (mousevalue == "left") {
    if ((mousex in |this.x, this.x + 2|) &&
        (mousey in |this.y, this.y + 2|)) {

      selectFloorGui();
    }
  }
}

function onPlayerTouchsMe() {
  client.temp_addmessages.add("Grab or click to move to a different level");
}

function onPlayerEnters() {
  if (Select_Floor_Window != null)
    Select_Floor_Window.destroy();
}

function selectFloorGui() {
  Change_Floor_Btn.destroy();
  Select_Floor_Window.destroy();
  join("n_guihelper");
  new GuiWindowCtrl(Select_Floor_Window) {
    text = "Select Floor";
    extent = {150, 85};
    center(screenwidth, screenheight);
    canminimize = canmaximize = canresize = false;
    canclose = true;
    profile = ZodiacWindowProfile2;
    new GuiPopUpMenuCtrl(Floor_Dropdown) {
      profile = ZodiacPopUpMenuProfile;
      textprofile = ZodiacTextProfile;
      //scrollprofile = GuiBlueScrollProfile;
      scrollprofile = ZodiacScrollProfile;
      width = Select_Floor_Window.width - 20;
      height = 25;
      x = 10;
      y = 25;

      clearrows();
      // bug can't have more than 100 rows
      temp.row = addrow(1, "Floor 0");
      row.floorId = 0;
      temp.startFloor = thiso.floorId > 40 ? 3 : 1;
      temp.endFloor = thiso.floorId > 40 ? 100 : 98;
      for (temp.i = startFloor; i <= endFloor; i++) {
        temp.row = addrow(1, format("Floor %d", i));
        row.floorId = i;
      }
      setselectedrow(thiso.floorId - (thiso.floorId > 40 ? 2 : 0));
    }

    new GuiButtonCtrl(Change_Floor_Btn) {
      profile = ZodiacButtonProfile;
      text = "Go";
      width = Floor_Dropdown.width;
      height = Floor_Dropdown.height;
      x = Floor_Dropdown.x;
      y = Floor_Dropdown.height + Floor_Dropdown.y;
    }
  }
}

// this is bugged and calls both branches of the if statement
// at once
function Change_Floor_Btn.onAction() {
  
  with (Floor_Dropdown) {
    temp.floorId = rows[getselectedrow()].floorId;
  }
  temp.dist = ((this.x - player.x)^2 + (this.y - player.y)^2)^.5;
  Select_Floor_Window.hide();

  if (dist <= 5) {
    triggeraction(this.x, this.y, "ChangeFloor", floorId);    
  } else {

  }

}


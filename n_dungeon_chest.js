// this.attr[4] true if looted

function onCreated() {
  setshape(1, 32, 32);
  this.looted = false;
  this.attr[4] = this.looted;
  scheduleevent(10, "ClearOwner");
}

function onActionGetLoot() {
  if (!this.looted) {
    if (player.account != this.owner && this.owner != null) {
      client.temp_addmessages.add("This chest temporarily belongs to another player.");
      return;
    }
    this.looted = true;
    this.attr[4] = this.looted;
    if (random(0, 100) < 2) {
      onTokenLoot();
    } else {
      onArmorLoot();      
    }
    triggeraction(this.x+1, this.y+1, "RefreshChest", "dummy");
  }
}

function onTokenLoot() {
  temp.token = "Spelunker's Token";
  player.AddItem(token, "items/spelunkerstoken",
                 1, true, false, "Dungeon Chest");
}

function onArmorLoot() {
  temp.generator = findNPC("Archetype Generator");
  player.AddItem("$n", generator.GetArmorArc("62", false, false),
                 1, true, false, "Dungeon Chest");
  temp.num = int(random(1, 3));
  for (temp.i = 0; i < num; i++) {
    player.AddItem("$n", generator.GetArmorArc("HAL", false, false),
                   1, true, false, "Dungeon Chest");
  }
  num = int(random(1, 3));
  for (temp.i = 0; i < num; i++) {
    player.AddItem("$n", generator.GetArmorArc("55", false, false),
                   1, true, false, "Dungeon Chest");
  }
  if (random(0, 100) <= 10) {
    player.AddItem("Elite Combatant Armor Cache",
                   "items/pvpchanceboxhigh", 1, true, false, "Dungeon Chest");
  } 
}

function onClearOwner() {
  this.owner = null;
}

public function onDungeonClear() {
  destroy();
}

//#CLIENTSIDE

function onCreated() {
  layer = 0;
  onActionRefreshChest();
}

function onActionRefreshChest() {
  if (!this.attr[4] || this.attr[4] == null) {
    image = "chest_sprite_close.gif";    
  } else {
    image = "chest_sprite_open.gif";
  }
}

function onPlayerTouchsMe() {
  if (!this.attr[4] || this.attr[4] == null) {
    triggeraction(this.x, this.y, "GetLoot");
  }
}

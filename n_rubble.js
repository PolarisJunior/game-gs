/*
  set this.life and this.maxlife
  this.loot, this.requiredLevel,
  this.lootArc

  TODO change color depending on loot/level
*/

function onCreated() {
  join("n_distributions");
  setshape(1, 32, 32);
  scheduleevent(180, "DungeonClear");
}

public function onActionDamage(dmg,mods,from,fromguild,fromgroup,lvl) {
  if (this.life <= 0) return;

  for (temp.m = 0; temp.m < mods.size(); temp.m++) {
    if (mods[temp.m][0] = "pickaxe") {
      temp.ispickaxe = true;
      break;
    }
  }
  if (temp.ispickaxe) {
    if (player.getProfessionLevel("mining") < this.requiredLevel) {
      player.sendMessage(format("$rYou need a mining level of %d for that",
                                this.requiredLevel));
      return;
    }

    temp.rand = triangularDistribution(0, 1);
    if (rand <= getDropChance()) {
      this.life--;
      dropShard();

      // out of shards
      if (getLife() <= 0) {
        onDungeonClear();
      }
    }
    this.leaps = putnpc2(player.x+1+vecx(player.dir)*3,
                         player.y+1+vecy(player.dir)*3,
                         "join(\"leaps\");");
    this.leaps.leaptype = "rock";
  }
}

function getDropChance() {
  temp.chance = .1;
  chance += player.getProfessionLevel("mining")/400;
  return chance;
}

function getExpGain() {
  temp.exp = 0;
  temp.miningLevel = player.getProfessionLevel("mining");
  switch (this.requiredLevel) {
  case 80:
    exp = 500 - 5*miningLevel;
    break;
  case 60:
    exp = 400 - 5*miningLevel;
    break;
  case 40:
    exp = 300 - 5*miningLevel;
    break;
  }
  if (exp == 0 || exp == null) {
    exp = int(154 - 3.84*miningLevel);
  }
  return exp;
}

// shards left to be distributed
function getLife() {
  return this.life;
}

// give shard to player
function dropShard() {
  temp.rnd = random(0, 1);
  if (this.loot == null) {
    setDefaultLoot();    
  }
  player.AddItem(this.loot, this.lootArc,
                 1, true, false, "Mining rubble");
  player.sendMessage(format("The rubble is %d%% mined.",
                            100-100*(this.life/this.maxlife)));
  player.addProfessionEXP("mining", getExpGain());
}

public function onDungeonClear() {
  destroy();
}

function setDefaultLoot() {
  temp.lootTable = {
    "Rough Copper Ore", "crafting/roughcopper",
    "Rough Iron Ore", "crafting/roughiron",
    "Rough Silver Ore", "crafting/roughsilver",
    "Rough Gold Ore", "crafting/roughgold",
    "Rough Platinum Ore", "crafting/roughplatinum",
    "Rough Tin Ore", "crafting/roughtin"
  };
  temp.rnd = int(random(0, lootTable.size()/2));
  this.loot = lootTable[rnd*2];
  this.lootArc = lootTable[rnd*2+1];
}


//#CLIENTSIDE
const SPRITE_SHEET = "zodiac_dungeon-rubble.png";

function onCreated() {
  image = SPRITE_SHEET;
  layer = 0;
}

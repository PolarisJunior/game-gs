const SPRITE_SHEET = "zodiac_profession-rocksprites8.png";

public function onActionDamage(dmg,mods,from,fromguild,fromgroup,lvl) {
  if (this.life <= 0) return;
  if (clientr.stat.level < 60) {
    player.sendMessage("The meteorite radiates an intense aura, you need to have a combat level of 60 to mine this. ");
    return;
  }
  for (temp.m = 0; temp.m < mods.size(); temp.m++) {
    if (mods[temp.m][0] = "pickaxe") {
      temp.ispickaxe = true;
      break;
    }
  }
  if (temp.ispickaxe) {

    temp.rand = random(0, 1);
    if (rand <= getDropChance()) {
      this.life--;
      dropShard();
      temp.expGain = this.baseExpGain;
      expGain -= player.getProfessionLevel("mining")*10;
      player.addProfessionEXP("mining", int(expGain));

      // out of shards
      if (getLife() <= 0) {
        clearMeteorite();
      }
    }
    this.leaps = putnpc2(player.x+1+vecx(player.dir)*3,player.y+1+vecy(player.dir)*3,
                         "join(\"leaps\");");
    this.leaps.leaptype = "rock";
  }
//  else setimgpart(spriteSheet,192 - (int(this.life/this.spriteinterval)+2)*32,0,32,32);
}

function onCreated() {
  setshape(1, 240, 208);
  this.dropChance = .08;
  this.baseExpGain = 700;
  setTimer(12*60*60);
  // pointless because this should always be set
  // if (this.maxlife == 0) {
  //   this.maxlife = 200;
  //   this.life = this.maxlife;
  // }
  //  setimgpart(this.spriteSheet,0,0,32,32);

}

function getDropChance() {
  return this.dropChance;
}
// shards left to be distributed
function getLife() {
  return this.life;
}

// after all is mined
function clearMeteorite() {
  // notify meteor control so a new meteor can be fallen

  findNPC("MeteorControl").notifyMined();
  this.destroy();
}

// give shard to player
function dropShard() {
  temp.rnd = random(0, 1);
  if (rnd < .001) {
    player.sendMessage(format("You found a strange looking rock"));
    player.AddItem("Strange Egg", "racestones/strangeegg", 1, true, false, "mined meteorite");
    echo(format("%s has mined a Strange Egg from a meteorite", player.account));
  } else if (rnd < .025) {
    player.sendMessage(format("You mined a rare golden shard!"));
    player.AddItem("Gold Meteorite Shard", "items/goldmeteoriteshard",
                 1, true, false, "mined meteorite");    
  } else {
    player.AddItem("Gray Meteorite Shard", "items/graymeteoriteshard",
                   1, true, false, "mined meteorite");    
  }

  player.sendMessage(format("The meteorite is %d%% mined.",
                            100-100*(this.life/this.maxlife)));
}


function onTimeout() {
  echo("Meteorite was not mined, destroying");
  clearMeteorite();
}


//#CLIENTSIDE
const SPRITE_SHEET = "zodiac_profession-rocksprites8.png";

function onCreated() {
  setshape(1, 240, 208);
    //this.spriteSheet = "zodiac_profession-rocksprites8.png";
  temp.img = showimg(199, SPRITE_SHEET, this.x, this.y);
  img.attachtoowner = true;
  img.attachoffset = {7, 3, 0};
  img.layer = 0;
  changeimgpart(199, 0, 0, 32, 32);
  img.zoom = 8;
    // this.zoom = 1;
}

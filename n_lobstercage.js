
// attr[6]: has caught lobsters bool
// attr[7]: owner

function onCreated() {
  join("n_distributions");
  this.num_lobsters = 0;
  this.setshape(1, 32, 32);
  temp.catch_time = triangularDistribution(60*3, 60*6);
  if (this.owner == null) {
    onDestroy();
  }
  scheduleevent(catch_time, "CatchLobsters");
  scheduleevent(60*60*2, "Destroy");
}

function onDestroy() {
  findNPC("FishingControl").removeCage(this.owner);
  this.destroy();
}

function onCatchLobsters() {
  // TODO remove hardcoded value in algo
  temp.avg = 9 + (this.fishing_level-43)/5.2;

  this.num_lobsters = int(triangularDistribution(avg-2, avg+2));
  this.attr[6] = true;
  this.attr[7] = this.owner;
  showCaught();
}

function showCaught() {
  this.chat = "!";
}

function onPlayerTouchsMe() {
  if (this.num_lobsters > 0 &&
      player.account == this.owner) {
    if (Fishing.getZone() == "dungeon") {
      player.AddItem("Rock Lobster", "crafting/rocklobster", this.num_lobsters,
                     true, false, "Cave Fishing");
      SpelunkingControl.subCageFishCount(player.level.name);
    } else {
      player.AddItem("Lobster", "fish/lobster", this.num_lobsters, true, false, "Fishing");      
    }

    player.AddItem("Fishing Cage", "tools/fishingcage", 1, false, false, "fishing");
    // TODO REMOVE HARDCODED VALUE
    temp.avg_exp_per_lobster = triangularDistribution(50, 70)-(this.fishing_level-43)*3;
    temp.total_exp = int(avg_exp_per_lobster*this.num_lobsters);
    player.addProfessionEXP("fishing", total_exp);
    this.num_lobsters = 0;
    onDestroy();
  }
}

//#CLIENTSIDE

function onCreated() {
  setcoloreffect(1, 1, 1, 0.5);
  isblocking = false;
  this.image = "zodiac_fishcagelarge.png";
  this.dz = .02;
  onTimeout();
}

function onTimeout() {
  if (!(this.z in |-.5, .5|)) {
    this.dz = -this.dz;
  }
  this.z += this.dz + this.dz*this.attr[6]*2;
  setTimer(0.05);
}



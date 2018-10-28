
function clearTarget(p) {
  this.bountyDB.bounties.(@p.account).target = null;
  this.bountyDB.bounties.(@p.account).clearemptyvars();
}

// Penalizes a player for leaving the gmap with a bounty
function placePenalty(p) {
  if (p.HasItem(this.bountyDB.PENALTY_DECREASE_ITEM, 1)) {
    temp.penalty = this.bountyDB.PENALTY * this.bountyDB.PENALTY_DECREASE_RATIO;
  } else {
    temp.penalty = this.bountyDB.PENALTY;
  }
  this.bountyDB.bounties.(@p.account).penalty = penalty + timevar2;
}

function resetLimit(acc) {
  this.bountyDB.bounties.(@acc).last_update = this.bountyDB.last_update;
  this.bountyDB.bounties.(@acc).hunted = {};  
}

function hasUpdated(acc) {
  return this.bountyDB.bounties.(@acc).last_update >= this.bountyDB.last_update;
}

function informDist(p) {
  temp.target = findPlayer(this.bountyDB.bounties.(@p.account).target);
  temp.dist = int(((p.x - target.x)^2 + (p.y - target.y)^2)^0.5);
  p.sendMessage(format(fmt("Your target is %s. (Distance: %d)"),
                       (target.communityname ? target.communityname : target.account),
                       dist));
}

// Gets a cardinal direction from an angle
function getCardinal(ang) {
  while (ang >= 360) {
    ang -= 360;
  }
  temp.directions = {
    {"South-East", 315},
    {"South", 270},
    {"South-West", 225},
    {"West", 180},
    {"North-West", 135},
    {"North", 90},
    {"North-East", 45},
  };
  for (temp.dir : directions) {
    if (abs(dir[1] - ang) < 22.5) {
      return dir[0];
    }
  }
  return "East";
}

function dirToTarget() {
  temp.target = findPlayer(this.bountyDB.bounties.(@player.account).target);
  temp.dx = target.x - player.x;
  temp.dy = target.y - player.y;
  temp.ang = radtodeg(getangle(dx, dy));
  temp.cardinal = getCardinal(ang);
  return cardinal;
}

function hasTarget(acc) {
  return this.bountyDB.bounties.(@acc).target != null;
}

function hasOnlineTarget(acc) {
  return findPlayer(this.bountyDB.bounties.(@acc).target) != null;
}

public function findTarget() {
  temp._ = this.bountyDB._;
  temp.candidates = validTargets();
  if (candidates.size() < 1) {
    return null;
  } else {
    return _.pickRandom(candidates);
  }

}

public function doBounty(killer, killed) {
  if (killedTarget(killer, killed)) {
    finishBounty(killer, killed);
  }
}

function killedTarget(killer, killed) {
  return this.bountyDB.bounties.(@killer).target == killed;
}

/*
  We don't have to add the killers account to the killed
  hunted list because we check both hunted lists when checking valid targets
*/
function finishBounty(killer, killed) {
  temp.killerP = findPlayer(killer);
  temp.killedP = findPlayer(killed);
  this.bountyDB.bounties.(@killer).target = null;
  this.bountyDB.bounties.(@killer).hunted.add(killed);
  this.bountyDB.bounties.(@killed).target = null;
  killerP.sendMessage(fmt("You have completed your bounty and have been awarded 1 Bounty Token. ("@
                          this.bountyDB.bounties.(@killer).hunted.size()@"/"@this.bountyDB.DAILY_LIMIT@")"));
  killerP.addItem("Bounty Token", "items/bountytoken", 1, true);
  killedP.sendMessage(fmt("You were killed by your bounty target, you will need to receive a new target!"));
}


//Filters out the player and 
function validTargets() {
  temp._ = this.bountyDB._;
  temp.targets = _.nonStaffPlayersInGMAP();
  temp.newCandidates = new[0];
  for (temp.t : targets) {
    if (!hasUpdated(t)) {
      resetLimit(t);
    }

    if (generalValidation(t)) {
      newCandidates.add(t);
    }
  }
  
  return newCandidates;
}

function generalValidation(t) {
  return !hasOnlineTarget(t) &&
    t.account != player.account &&
    !(t.account in this.bountyDB.bounties.(@player.account).hunted) &&
    !(player.account in this.bountyDB.bounties.(@t.account).hunted) &&
    this.bountyDB.bounties.(@t.account).hunted.size() < this.bountyDB.DAILY_LIMIT &&
    t.clientr.stat.level >= 60 &&
    t.clientr.stat.hp > 0 &&
    !t.clientr.bounty_disabled;
}

//Util

function fmt(str) {
  return this.bountyDB.fmt(str);
}

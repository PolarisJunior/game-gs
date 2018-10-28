
//Call before using this object
public function initialize() {
  join("n_utils");
}

public function bountyCandidates(acc) {
  temp.f = function(p) {
    return p.getFirst() != p.getSecond();
  };
  temp.g = function(p) {
    return p.account;
  };
  return filter(f, cartesianProduct({acc}, map(g, nonStaffPlayersInGMAP())));

}

public function chooseBounty(acc) {
  temp.candidates = bountyCandidates(acc);
  if (candidates.size() < 1) {
    return null;
  } else {
    return pickRandom(bountyCandidates(acc));
  }
}

public function playersInGMAP() {
  temp.f = function(p) {
    return p.level.name == "zodiacworld.gmap";
  };
  return filter(f, allplayers);
}

public function nonStaffPlayersInGMAP() {
  temp.f = function(p) {
    return (!(p.guild in serverr.staffguilds) && !(p.account in {"Symm"}) &&
           !p.clientr.staffgodmode && !p.clientr.staffgodmode2);
  };

  return filter(f, playersInGMAP());
}

//filters playerlist by distance from the player
public function filterDistance(plyrs, maxDist) {
  temp.f = function(p, max) {
    temp.dist = ((player.x - p.x)^2 + (player.y - p.y)^2)^0.5;

    return dist < max;
  };
  return filter(f, plyrs, maxDist);
}

public function filterWater(plyrs) {
  temp.f = function(p) {
    return !p.level.onwater(p.x, p.y);
  };

  return filter(f, plyrs);
}

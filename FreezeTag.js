
const TIE = "tie";

function onCreated() {
  this.event_teams = {
    "Red Team", "Blue Team"
  };
  resetScore();
  join("testing");
}

//
function preTestInit() {
  assert_not_null(p);
  assert_not_null(p2);
  p.guild = "Blue Team";
  p2.guild = "Red Team";
  //findPlayer("Graal1518010").guild = "Blue Team";
}

//sets score of all teams to 0
function resetScore() {
  for (temp.team : this.event_teams) {
    this.score.(@team) = 0;
  }
}

function onActionServerside(cmd) {
  switch(cmd) {
  case "check":
    checkRoundOver();
    break;
  case "start":
    resetScore();
    displayScore();
    removeBarriers();
    break;
  case "open":
    removeBarriers();
    break;
  case "close":
    raiseBarriers();
    break;
  }
}

function removeBarriers() {
  for (temp.n : player.level.npcs) {
    n.trigger("WallDown");
  }
}

function raiseBarriers() {
  for (temp.n : player.level.npcs) {
    n.trigger("WallUp");
  }
}

//Must be able to handle simultaneous triggers from multiple clients
function checkRoundOver() {
  temp.winningTeam = winningTeam();
  if (winningTeam != null) {
    raiseBarriers();
    temp.pl = findLevel(player.level).players;
    unFreezeAll(pl);
    resetPositions(pl);
    if (winningTeam != TIE) {
      updateScore(winningTeam);
      displayScore();
    }

  }
}

//increments winning teams score by 1
function updateScore(winningTeam) {
  this.score.(@winningTeam) += 1;
}

//disp score to all players in same level as one that sent event
function displayScore() {
  assert_not_null(player, "displayScore called with null player");
  temp.lvl = findLevel(player.level);

  temp.score = new[0];
  temp.scoreStr = "";
  for (temp.team : getstringkeys("this.score.")) {
    scoreStr @= team SPC this.score.(@team);
    score.add(team);
    score.add(this.score.(@team));
  }
  assert_equal(score.size()%2, 0, "score array not mod 2");
  scoreStr.trim();
  //show to all players
  for (temp.p : level.players) {
    with (p) {
      triggerClient("weapon", this.name, "update_score", score);
    }
  }
}

//All players in pl not frozen.
function unFreezeAll(pl) {
  for (temp.p : pl) {
    p.client.frozen = false;
  }
}

function resetPositions(pl) {
  for (temp.p : pl) {
    resetPosition(p);
  }
}

//returns player to starting position based on team
//TODO make it so starting positions are stored in the level
function resetPosition(pl) {
  switch (pl.guild) {
  case "Blue Team":
    pl.x = 31;
    pl.y = 56;
    break;
  case "Red Team":
    pl.x = 31;
    pl.y = 8;
    break;
  }
}

//TODO true iff only one team is left unfrozen
function roundOver() {
  temp.roundOver = false;
  for (temp.team : this.event_teams) {
    if (checkTeam(team)) {
      roundOver = true;
      break;
    }
  }
  return roundOver;
}

//true iff all players on a team are frozen
function checkTeam(team) {
  temp.lvl = findLevel(player.level);
  for (temp.p : lvl.players) {
    if (p.guild == team &&
        !p.client.frozen) {
      return false;
    }
  }
  return true;
}

//true iff all players on a team are frozen, rename of checkTeam
function teamFrozen(team) {
  return checkTeam(team);
}

//returns guildtag of winning team or null if there is no winning team yet
function winningTeam() {
  temp.teamsLeft = new[0];
  for (temp.team : this.event_teams) {
    if (!teamFrozen(team)) {
      teamsLeft.add(team);
    }
  }

  if (teamsLeft.size() == 1) {
    return teamsLeft[0];
  } else if (teamsLeft.size() == 0) {
    return TIE;
  } else {
    return null;
  }
}

//#CLIENTSIDE

function onCreated() {
  this.event_levels = {"event-newtestevent"};
  this.count = 20;
}

function onPlayerChats() {
  //start event and reset score
  if (player.chat.starts("/start") && isStaff(player)) {
    triggerServer("weapon", this.name, "start");
  }
  //open barrier
  if (player.chat.starts("/open") && isStaff(player)) {
    triggerServer("weapon", this.name, "open");
  }

  if (player.chat.starts("/close") && isStaff(player)) {
    triggerServer("weapon", this.name, "close");
  }
}

function isStaff(pl) {
  return pl.guild.starts("Event") || pl.account == "Graal753610";
}

function onActionClientside(cmd) {
  switch (cmd) {
  case "update_score":
    this.score = params[1];
    renderScore(this.score);
    break;
  }
}

function renderScore(score) {
  temp.txt = "";
  for (temp.s : score) {
    txt @= s @ " ";
  }
  txt = txt.trim();
  if (inEventLevel(player.level.name)) {
    temp.img = showtext(199, 5, 80, "Arial", "", txt);
    img.layer = 4;
  }
}

public function getLevels() {
  return this.event_levels;
}

public function inEventLevel(lvl) {
  for (temp.l : getLevels()) {
    if (l == lvl || lvl.starts(l)) {
      return true;
    }
  }
  if (player.level.event_name.lower() == "freezetag") {
    return true;
  }
  return false;
}

/*
  if hit by other team and not frozen, freeze and check if round over
  if hit by same team and frozen, unfreeze
*/

public function hit(fromguild) {
  if (player.guild == fromguild &&
      client.frozen) {
    client.frozen = false;
    findWeapon("-System").ShowDamage("Unfrozen!", "mp");
  } else if (player.guild != fromguild && !player.guild.starts("Event")) {
    findWeapon("-System").ShowDamage("Frozen!", "mp");
    client.frozen = true;
    player.ani = "idle";
    checkRoundOver();
    onTimeout();
  }
}

function checkRoundOver() {
  triggerServer("weapon", this.name, "check");
}

//keep frozen the players that should be frozen
function onTimeout() {
  if (client.frozen && inEventLevel(player.level.name)) {
    if (this.count >= 20) {
      findWeapon("-System").ShowDamage("Frozen!", "mp");
      this.count = 0;
    }
    freezeplayer(.1);
    this.count++;
    setTimer(0.05);
  }
}

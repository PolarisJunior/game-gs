
function onCreated() {
  if (this.chests = null) {
    this.chests = new[0];
  }
  join("testing");
  onTimeout();
  //forceReset();
}

public function registerChest(chest) {
  removeChangedChests();
  temp.removed = false;
  for (temp.c : this.chests) {
    if (c == chest) {
      temp.removed = true;
      this.chests.remove(c);
      break;
    }
  }
  this.chests.add(chest);
  //echo("Chest with fortid " @ chest.getFortId() @ " registered");
  //if (removed)
    //echo("1 chest was the same");
    //echo(this.chests.size() SPC "chests are registered.");
    
  /*
  for (temp.c : this.chests) {
    echo(c.getFortId());
    assert_equal("freeport", c.getFortId(), "non object in");
  }
  */
}

public function getTimeLeftStr() {
  //just to make sure timer is still running
  onTimeout();
  return checkTime(this.nextReset - timevar2);
}

function removeChangedChests() {
  for (temp.c : this.chests) {
    if (c == null || c == "") {
      //echo("removed 1");
      this.chests.remove(c);      
    }
  }
}

function checkTime( time ) {
  // hour
  temp.hourMsg = ( time >= 3600*2 ? " hours" : " hour");
  // day
  temp.dayMsg = ( time >= 86400*2 ? " days" : " day");
  
  temp.timeMsg =
    //daily
    ( time > 86400 ? int( time / 86400)@ temp.dayMsg : "")
  SPC
  //hours
  ( time > 3600 ? int( time / 3600)%24 @ temp.hourMsg : "")
  SPC
  //minutes
  ( time > 60  ? int(( time / 60) % 60) @ " minutes" : "");

  return temp.timeMsg.trim();
}

public function resetChest(fortid) {
  this.given.(@fortid) = new[0];
}

public function hasLooted(fortid, acc) {
  return acc in this.given.(@fortid);
}

public function addLooted(fortid, acc) {
  this.given.(@fortid).add(acc);
}

public function numLooted(fortid) {
  return this.given.(@fortid).size();
}

function resetChests() {
  for (temp.fortid : getstringkeys("this.given.")) {
    this.given.(@fortid) = new[0];
    echo(fortid SPC "chest reset.");
  }
  /*
  for (temp.c : this.chests) {
    c.resetChest();
  }
  */
}

function onTimeout() {
  if (this.nextReset < timevar2) {
    resetChests();
    this.nextReset = timevar2 + 60*60*11;
  }
  setTimer(60*1);
}

function forceReset() {
  this.nextReset = 0;
  onTimeout();
}

//nabi

function onCreated() {
  this.fortid = "elmdale";
  this.honorCost = 700;
  //summonBaddy("babylich");
  
  this.baddies.clearvars();
  this.baddies.saejtheblack = "Saej the Black";
  this.baddies.imposterryzac = "Ryzac";
  this.baddies.mummyboss = "Mumra";
  this.baddies.mummyarchmage = "Mummy Archmage";
  this.baddies.sarudon = "Sarudon the Earthborn";
  this.baddies.ssuorrvlos = "Ssuorrvlos";
  this.baddies.terrum_captain = "Terrum Captain";
  this.baddies.fallensiren = "Fallen Siren";
  this.baddies.waterjailerboss = "Glub the Jailer";
  //this.baddies.babylich = "baby lich";
  //findNPC("Nation DB").honor.America = 10000;
  this.COOLDOWN = 10*60;
}

public function onRequestSummon() {
  temp.nationDB = findNPC("Nation DB");
  if (nationDB.getHonor(clientr.nation) >= this.honorCost) {
    if (!canSummon()) {
      player.sendMessage("The chest seems to be gathering darkness still. (" @ checkTime(this.timestamp - timevar2) @ ")");
    } else {
      summon();
      nationDB.onNationMSG(clientr.nation, "Nation honor -" @ this.honorCost);
      nationDB.subtractHonor(clientr.nation, this.honorCost);
      this.timestamp = timevar2 + this.COOLDOWN;
      this.lastNation = clientr.nation;
    }
  } else {
    player.sendMessage("Your nation needs more honor. ");
  }
}

function summon() {
  temp.nationDB = findNPC("Nation DB");
  temp.arc = chooseArc();
  nationDB.onNationMSG(clientr.nation, "A mysterious rift in Elmdale Fort was opened and " @ arcToName(arc) @ " was pulled through", true);
  summonBaddy(arc);
  blackHole();
}

function canSummon() {
  return findNPC("Forts").isFortOwner(this.fortid) && (!isCooling());
}

function isCooling() {
  return this.timestamp > timevar2;
}

//returns last nation that summoned a baddy
function lastNation() {
  return this.lastNationUsed;
}

function chooseArc() {
  temp.arcs = getstringkeys("this.baddies.");
  return arcs[int(random(0, arcs.size()))];
}

function arcToName(arc) {
  return this.baddies.(@arc);
}

function blackHole() {
  temp.blackhole = putnpc2(this.x,this.y,"join(\"blackhole\");");
  //temp.blackhole.attr[30] = "(" @ this.attr[6];
  temp.blackhole2 = putnpc2(this.x,this.y,"join(\"blackhole2\");");
}

function summonBaddy(arc) {
  this.baddy.destroy();
  this.baddy = putnpc2(this.x, this.y, "join(\"baddy\");");
  this.baddy.hpmax = 100000;
  this.baddy.hp = 100000;
  this.baddy.archetype = arc;
  //this.baddy.temporarybaddy = true;
  this.baddy.istemporary = true;
  //this.baddy.isboss = true;
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

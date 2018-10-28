/*
 ~2 and a half hours per meteorite
  700k~ per meteorite
  180-220 shards per meteorite
 */
function onCreated() {
  setZoneX("OSL Beach", 535);
  setZoneY("OSL Beach", 945);

  setZoneX("Northern Escalus", 685);
  setZoneY("Northern Escalus", 555);
  
  setZoneX("Seryl", 1444);
  setZoneY("Seryl", 198);

  setZoneX("Labyrinth", 302);
  setZoneY("Labyrinth", 190);

  setZoneX("Forgedawn", 63);
  setZoneY("Forgedawn", 942);

  setZoneX("Northern Agara", 318);
  setZoneY("Northern Agara", 1288);

  setZoneX("Agara OSL", 548);
  setZoneY("Agara OSL", 1611);

  setZoneX("Leandril", 1111);
  setZoneY("Leandril", 1114);

  setZoneX("Central Jento", 1682);
  setZoneY("Central Jento", 859);

  setZoneX("Alseus Castle", 1584);
  setZoneY("Alseus Castle", 1048);

  setZoneX("Southern Elmdale", 1588);
  setZoneY("Southern Elmdale", 1628);

  setZoneX("Northern Elmdale", 1563);
  setZoneY("Northern Elmdale", 1379);
  
  echo(timeout);
  //onTimeout();
}

function setZoneX(zone, x) {
  this.zones.(@zone).x = x;
}

function setZoneY(zone, y) {
  this.zones.(@zone).y = y;
}

function onTimeout()  {
  spawnMeteoriteInZone(pickZone());
}

function pickZone() {
  temp.zones = getstringkeys("this.zones.");
  return randomstring(zones);
}

public function notifyMined() {
  this.active_meteorite = false;
  this.active_zone = "";
  msgPlayers("The meteorite has been fully mined. ");
  setTimer(60*60*2);
  // set timer here
}


function spawnMeteoriteInZone(zone) {
  alertPlayers(zone);
  this.active_zone = zone;
  spawnMeteorite(findLevel("zodiacworld.gmap"),
                 this.zones.(@zone).x, this.zones.(@zone).y);
}

function spawnMeteorite(lvl, x, y) {
  temp.maxlife = int(random(180, 220));
  temp.meteorite = lvl.putnpc2(x, y, "join(\"n_meteorite\");");

  meteorite.maxlife = maxlife;
  meteorite.life = maxlife;
  echo(alertString(lvl, x, y));
  this.active_meteorite = true;
}

function alertPlayers(zone) {
  msgPlayers(format("A meteorite has landed near %s", zone));

}

function alertString(lvl, x, y) {
  return format("Meteor landed in %s at (%d, %d)", lvl, x, y);
}

function msgPlayers(str) {
  for (temp.p : allplayers) {
    if (!p.clientr.meteorite_disabled) {
      p.sendMessage(format("[Meteors] %s", str));
    }
  }  
}

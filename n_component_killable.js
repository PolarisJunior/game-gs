/*
requires n_component_structure_damage

allows this npc to respawn after a certain amount of time being dead

Member variables
this.respawnTime: Number of seconds it waits after dying before trying
to respawn, -1 for no scheduled respawning

Overridable functions
canRespawn(): NPC will only respawn if this returns true,
otherwise it will wait till the next respawn check

onRespawned(): action that will occur when this npc succeeds in
respawning

onKilled(): action that will occur when this npc dies

public functions
kill(), onRespawn() can be called to manually kill or respawn
this npc

*/

enum KilledBehavior {
  RESPAWN = 1,
  DESTROY = 2
}

enum Defaults {
  RESPAWN_TIME = 10,
  DESTROY_ON_KILLED = KilledBehavior.DESTROY
}

function onCreated() {
  this.respawnTime = this.respawnTime == null ? Defaults.RESPAWN_TIME : this.respawnTime;
  this.killedBehavior = this.killedBehavior == null ? Defaults.DESTROY_ON_KILLED : this.killedBehavior;
}

public function onRespawn() {
  cancelevents("Respawn");
  if (canRespawn()) {
    setHp(this.hpmax);
    show();
    onRespawned();
  } else {
    scheduleRespawn();
  }
}

//overridable
function onRespawned() {
  
}


function canRespawn() {
  return true;
}

public function kill() {
  onKilled();
  hide();
  if (this.killedBehavior == KilledBehavior.DESTROY) {
    this.destroy();
  }
  scheduleRespawn();
}

function scheduleRespawn() {
  if (this.respawnTime >= 0) {
    scheduleevent(this.respawnTime, "Respawn");      
  }  
}

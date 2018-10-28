/*

Requires n_component_structure_damage to function

member variables
this.regenAmount, amount regened per regen iteration

this.regenSpeed, how often it regens, should not be lower than 1 second,
recommended to stick with default of 5 seconds

this.regenMode: "percent" or "constant", determines whether
regenAmount is interpreted as a percentage of max hp or as a constant
regen amount

this.showRegen: boolean, whether or not to show the regen amount

methods
canRegen(): boolean for if the npc can regen


TODO
make this.canregen a setting, as in DAMAGE_LOCKOUT

*/

enum RegenMode {
  PERCENT = "percent",
  CONSTANT = "constant"
}

enum Defaults {
  REGEN_AMOUNT = 0.05,
  REGEN_SPEED = 5,
  REGEN_MODE = PERCENT,
  SHOW_REGEN = false
}

function onCreated() {
  this.regenAmount = this.regenAmount == null ? Defaults.REGEN_AMOUNT : this.regenAmount;
  this.regenSpeed = this.regenSpeed == null ? Defaults.REGEN_SPEED : this.regenSPEED;
  this.regenMode = this.regenMode == null ? Defaults.REGEN_MODE : this.regenMode;
  this.showRegen = this.showRegen == null ? Defaults.SHOW_REGEN : this.showRegen;

  cancelevents("Regen");
  scheduleevent(this.regenSpeed, "Regen");
}

function onRegen() {
  if (timevar2 > this.canregen &&
      canRegen() &&
      this.hp < this.hpmax &&
      this.hp > 0) {
    temp.newHp = this.hp;

    if (this.regenMode == RegenMode.CONSTANT) {
      newHp += this.regenAmount;
    } else {
      newHp += this.hpmax * this.regenAmount;
    }

    if (this.showRegen) {
      ShowDamage(int(newHp-this.hp), "healing");
    }

    // clamp the hp
    this.hp = int(min(newHp, this.hpmax));
    onUpdateHPMP();
  }
  scheduleevent(this.regenSpeed, "Regen");
}

function canRegen() {
  return true;
}


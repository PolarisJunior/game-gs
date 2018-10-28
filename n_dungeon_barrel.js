
function onCreated() {
  join("dwarvenkegs_boss");
  this.owner = "(nil";
  this.type = "Explosive";
  this.damage = 30000;
}

function onMakeKegExplosive(){
  this.image = "zodiac_pel-barrel-red.png";
  scheduleevent(1.5, "explode");
}


function onExplode() {
  for (temp.p: findnearestplayers(this.x, this.y)) {
    temp.dist = ((temp.p.x-1.5 - this.x)^2 + (temp.p.y - this.y)^2)^.5;
    if (dist > 8)
      continue;
    temp.mods = new[0];
    //mods.add({"staticdmg"});
    temp.p.onActionDamage(this.damage, mods, "(baddy");
  }
  showani(10,x,y,0,"yen-effect-explosure2",NULL);
  this.image = "no-shield.png";
  this.attr[5] = "boom";
  scheduleevent(5, "destroy");
}

public function onDungeonClear() {
  destroy();
}

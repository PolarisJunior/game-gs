//nabi

/*A cleaner approach would be to have validTargets be a public function and then
simply use the parent locator object in this classes validTargets function
*/
public function swap() {
  temp.enhanced = player.HasItem(this.bountyDB.ENHANCED_BOUNTY_LOCATOR, 1);
  temp.cmd = enhanced ? "use_enhanced_locator" : "use_locator";
  temp.cooldown = this.bountyDB.swapperCooldown(player);
  if (client.incombat) {
    player.sendMessage(fmt("You cannot use your "@this.bountyDB.BOUNTY_SWAPPER@" while in combat."));
  } else if (cooldown) {
    player.sendMessage(fmt("Your "@this.bountyDB.BOUNTY_SWAPPER@" is still on cooldown for another "@int(cooldown/60)+1@ " minutes. "));
  } else if (!this.bountyDB.hasTarget(player)) {
    player.sendMessage(fmt("You do not have a target. "));
  } else if (this.bountyDB.currentTarget(player).level.name != "zodiacworld.gmap") {
    player.sendMessage(fmt("Your target was not in the gmap, your "@this.bountyDB.BOUNTY_SWAPPER@" will not go on cooldown. "));
    this.bountyDB.trigger(cmd);
  } else {
    this.bountyDB.timestampSwapper(player);
    temp.target = this.bountyDB.target(player);
    target.sendMessage(fmt("Your target has swapped their bounty, you can now acquire a new bounty. "));
    player.sendMessage(fmt("Your bounty has been reset and you are now finding a new bounty. "));
    
    temp.locator = new TStaticVar();
    locator.join("n_conditional_bountylocator");
    locator.join("n_bountyswapper");
    if (enhanced) {
      locator.join("n_enhancedbountylocator");
    }
    locator.join("n_bountylocator");
    locator.bountyDB = this.bountyDB;
    locator.lastTarget = target;
    
    this.bountyDB.resetTarget(player);
    this.bountyDB.resetTarget(target);

    locator.useLocator();
  }
}

function validTargets() {
  if ("n_enhancedbountylocator" in joinedclasses) {
    temp.dirtyTargets = n_enhancedbountylocator::validTargets();
  } else {
    temp.dirtyTargets = n_bountylocator::validTargets();
  }
  temp.cleanTargets = new[0];
  for (temp.target : dirtyTargets) {
    if (target.account != this.lastTarget.account) {
      cleanTargets.add(target);
    }
  }
  return cleanTargets;
}

function fmt(str) {
  return this.bountyDB.fmt(str);
}



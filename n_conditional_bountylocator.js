//Must join locator functions

//join("n_object")

public function useLocator() {
    temp.BOUNTY_LOST = fmt("Since you are no longer on the overworld, you have lost your bounty target and receive another target for "@this.bountyDB.PENALTY/60@" minutes.");

  if (this.bountyDB.bounties.(@player.account).last_update < this.bountyDB.last_update) {
    resetLimit(player.account);
  }
  if (player.clientr.bounty_disabled) {
    player.sendMessage(fmt("You have bounties disabled, say /togglebounties to enable bounties"));
  } else if (player.clientr.stat.level < 60) {
    player.sendMessage(fmt("You must be level 60 to acquire a bounty target"));
  } else if (this.bountyDB.bounties.(@player.account).hunted.size() >= this.bountyDB.DAILY_LIMIT) {
    player.sendMessage(fmt("You have reached the limit of "@this.bountyDB.DAILY_LIMIT@" hunted targets today. You must wait until tomorrow to receive another bounty"));
  } else if (this.bountyDB.bounties.(@player.account).penalty > timevar2 ) {
    player.sendMessage(fmt("You cannot find another bounty target for another " @
                           int((this.bountyDB.bounties.(@player.account).penalty - timevar2) / 60 + 1) SPC "minutes."));
  } else if (player.level.name != "zodiacworld.gmap") {
    if (hasTarget(player.account)) {
      player.sendMessage(BOUNTY_LOST);
      temp.target = findPlayer(this.bountyDB.bounties.(@player.account).target);
      target.sendMessage(fmt("Your target has left the overworld, use your locator to find a new target"));
      placePenalty(player);
      clearTarget(target);
      clearTarget(player);
    } else {
      player.sendMessage(fmt("You must be in the overworld to find a bounty."));      
    }
  } else if (!hasTarget(player.account)) {
    temp.target = findTarget();
    if (target == null) {
      player.sendMessage(fmt("No bounty targets are currently available."));
    } else {
      player.sendMessage(fmt("You were assigned " @ (target.communityname ? target.communityname : target.account)@"."));
      this.bountyDB.bounties.(@player.account).target = target.account;
      this.bountyDB.bounties.(@target.account).target = player.account;
      
      informDist(player);
      n_bountylocator::informDist(target);
    }
  } else if (findPlayer(this.bountyDB.bounties.(@player.account).target).level.name !=
             "zodiacworld.gmap") {
    temp.target = findPlayer(this.bountyDB.bounties.(@player.account).target);
    player.sendMessage(fmt("Your target is no longer in the overworld so you are being assigned a new bounty."));
    target.sendMessage(BOUNTY_LOST);
    placePenalty(target);
    clearTarget(player);
    clearTarget(target);
    useLocator();
  } else {
    informDist(player);
  }
}


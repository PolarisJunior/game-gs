
function onPlayerEnters() {
  if (!hasweapon("+Gamble")) {
    player.addweapon("+Gamble");
  }
}

public function executeWager(amt, acct) {
  if (!player.HasItem("Trade Coin", amt)) {
    notEnoughCoins();
  } else if (player.account == acct) {
    player.sendMessage("[Gamble] You cannot accept your own wager.");
  } else if (takeWager(amt, acct)) {
    temp.host = int(random(1, 101));
    temp.accepter = int(random(1, 101));
    while (temp.host == temp.accepter) {
      temp.host = int(random(1, 101));
      temp.accepter = int(random(1, 101));
    }


    temp.hostPlayer = findplayer(acct);
    temp.hName = temp.hostPlayer.communityname != null ? temp.hostPlayer.communityname : temp.hostPlayer.account;
    temp.pName = player.communityname != null ? player.communityname : player.account;
    temp.hostMsg = "[Gamble] " @ temp.pName @ " took your wager rolled " @ temp.accepter @ " and you rolled " @ temp.host @ ". ";
    temp.playerMsg = "[Gamble] " @ temp.hName @ " rolled " @ temp.host @ " and you rolled " @ temp.accepter @ ". ";
    if (host > temp.accepter) {
      player.TakeItem("Trade Coin", int(amt), "Wager Loss: " @ player.account @ " " @ amt);
      temp.hostPlayer.AddItem("Trade Coin", "items/tradecoin", int(2 * amt - getTotalCut(amt)), "Wager Win: " @ acct @ " " @ 2 * amt - getTotalCut(amt));
      temp.hostMsg = winMsg(temp.hostMsg);
      temp.playerMsg = lossMsg(temp.playerMsg);
    } else {
      player.addItem("Trade Coin", "items/tradecoin", int(amt - getTotalCut(amt)), "Wager Win: " @ player.account @ " " @ amt - getTotalCut(amt));
      temp.hostMsg = lossMsg(temp.hostMsg);
      temp.playerMsg = winMsg(temp.playerMsg);
    }
    findNPC("Lottery").addToPool(int(getLotteryCut(amt)));
    player.sendMessage(temp.playerMsg);
    findplayer(acct).sendMessage(temp.hostMsg);
  }
}

public function addWager(amt) {
  if (player.HasItem("Trade Coin", amt)) {
    if (this.(@player.account) == null) {
      this.(@player.account) = {};
    }
    this.(@player.account).add(amt);
    player.TakeItem("Trade Coin", int(amt), "Place Wager: " @ player.account @ " " @ amt);
  } else {
    notEnoughCoins();
  }
}

public function removeWager(amt) {
  temp.removed = takeWager(amt, player.account);
  if (temp.removed) {
    player.AddItem("Trade Coin", "items/tradecoin", int(amt), "Remove Wager: " @ player.account @ " " @ amt);
  }
  return temp.removed;
}

function takeWager(amt, acct) {
  temp.removed = false;
  for (temp.wager : this.(@acct)) {
    if (temp.wager == amt) {
      this.(@acct).remove(temp.wager);
      temp.removed = true;
      break;
    }
  }
  if (!temp.removed) {
    player.sendMessage("[Gamble] That wager was not found! Somebody may have already accepted it.");
  }
  return temp.removed;
}

public function getAllWagers() {
  temp.bets = {};
  for (temp.p : allplayers) {
    //Checks that the player is not on RC
    if (temp.p.level != "") {
      temp.wagers = this.(@temp.p.account);
      if (temp.wagers != null) {
        for (temp.wager : temp.wagers) {
          temp.bets.add({temp.p.account, temp.wager});
        }
      }
    }

  }
  return temp.bets;
}

public function numWagers() {
  temp.wagers = this.(@player.account);
  return temp.wagers.size();
}

function getCut(amt) {
  return roundUp(amt * 0.001);
}

function getLotteryCut(amt) {
    getCut(amt);
}

function getTotalCut(amt) {
    return getCut(amt) + getLotteryCut(amt);
}

function roundUp(amt) {
  return int(amt + 0.5);
}

function winMsg(msg) {
  return msg @ "You won!";
}

function lossMsg(msg) {
  return msg @ "You lost!";
}

function notEnoughCoins() {
  player.sendMessage("[Gamble] You do not have enough trade coins.");
}

/*

*/

function onActionServerSide(cmd, data, acct) {
  if (cmd == "message") {
    temp.data = "[Gamble] " @ data;
    player.sendMessage(temp.data);
  } else {
    temp.gamble = findNPC("gamble");
    switch(cmd) {
    case "bet":
      if (temp.gamble.numWagers() >= 10) {
        onActionServerSide("message", "You can only have a maximum of 10 wagers at once");
      } else {
        temp.gamble.addWager(data);
        refresh();
      }
      break;
    case "createGUI": 
      triggerClient("weapon", this.name, "createGUI", temp.gamble.getAllWagers());
      break;
    case "remove_wager":
      temp.gamble.removeWager(data);
      refresh();
      break;
    case "accept_wager":
      temp.gamble.executeWager(data, acct);
      refresh();
      break;
    case "refresh":
      triggerClient("weapon", this.name, "refresh", temp.gamble.getAllWagers());
      break;
    }
  }
}

function refresh() {
  onActionServerSide("refresh");
}

function onPlayerLogin(temp.p) {
  temp.p.addWeapon(this.name);
}

//#CLIENTSIDE

function onCreated() {
  this.min = 1000;
  this.max = 100000000;
}

function onActionClientSide(cmd, data) {
  switch(cmd) {
  case "refresh":
    this.bets = data;
    populateRows();
    break;
  case "createGUI":
    this.bets = data;
    createGUI();
    break;
  }
}


function onPlayerChats() {
  if (player.chat.starts("/gamble")) {
    triggerServer("weapon", this.name, "createGUI");
    player.chat = "";
  }
}

function onBet() {
  temp.amt = "Bet_Amount".text;
  thiso.lastBet = temp.amt;
  if (temp.amt > this.max || temp.amt < this.min) {
    triggerServer("weapon", this.name, "message", "Wagers must be between " @ this.min @ " and " @ this.max);
  } else {
    triggerServer("weapon", this.name, "bet", int(temp.amt));
  }

}

function onRemove() {
  temp.rowID = "Bets_List".getselectedrow();
  temp.row = "Bets_List".rows[temp.rowID];
  temp.account = row.acct;
  temp.wager = row.amt;
  if (temp.account != player.account) {
    triggerServer("weapon", this.name, "message", "That is not your wager!");
  } else {
    triggerServer("weapon", this.name, "remove_wager", temp.wager);
  }
}

function onAccept() {
  temp.rowID = "Bets_List".getselectedrow();
  temp.row = "Bets_List".rows[temp.rowID];
  temp.account = row.acct;
  temp.wager = row.amt;
  triggerServer("weapon", this.name, "accept_wager", temp.wager, temp.account);
}

function onRefresh() {
  triggerServer("weapon", this.name, "refresh");
}

public function createGUI() {
  new GuiWindowCtrl( "Bets" ) {
    temp.iw = 160;
    temp.iwh = temp.iw / 2;
    profile = ZodiacWindowProfile2;
    width = 230 + temp.iw; 
    height = 350;
    x = (GraalControl.width - width)/2;
    y = (GraalControl.height - height)/2;
    canmove = true;
    canminimize = true;
    canclose = true;

    canresize = canmaximize = false;
    text = "Gamble";

    closequery = true;
    thiso.catchevent( name, "onCloseQuery", "onClose" );
    temp.listHeight = 300;
    new GuiScrollCtrl( "Bet_Window" ) {
      profile = ZodiacScrollProfile;
      x = 10; y = 27;
      width = 200 + temp.iwh;
      height = temp.listHeight;
      hScrollBar = "dynamic";
      vScrollBar = "dynamic";
      
      new GuiTextListCtrl( "Bets_List" ) {
        profile = ZodiacListProfile;
        x = y = 0;
        width = 300;
        height = temp.listHeight;
        fitparentwidth = true;

        populateRows();
        
        this.listType = "inventory";
        thiso.catchevent( name, "onDblClick", "onAccept" );
      };
    };
    temp.btnX = 6 + 490 / 2 - 16 - 16 + temp.iwh;
    temp.btnWidth = 74;
    new GuiTextEditCtrl( "Bet_Amount" )
    {
      profile = ZodiacTextEditProfile;
      useownprofile = true;
      profile.numbersonly = true;
      x = temp.btnX; y = 22 + (300 / 2) - 46 - 16 + 64 - 64 - 64;
      width = temp.btnWidth; height = 22;
      text = thiso.lastBet;

      thiso.catchevent( name, "onAction", "onSetBet" );
    };
    temp.btnHeight = 32;
    
    new GuiButtonCtrl( "Place_Bet" )
    {
      profile = ZodiacButtonProfile;
      x = temp.btnX; y = (300 / 2) - 46 - 16;
      width = temp.btnWidth;
      height = temp.btnHeight;
      text = "Wager";

      thiso.catchevent( name, "onAction", "onBet" );
    };
    new GuiButtonCtrl( "Accept_Bet" )
    {
      profile = ZodiacButtonProfile;
      x = temp.btnX; y = (300 / 2) - 46 - 16 + temp.btnHeight;
      width = temp.btnWidth;
      height = temp.btnHeight;
      text = "Accept";


      thiso.catchevent( name, "onAction", "onAccept" );
    };
    new GuiButtonCtrl( "Remove_Bet" )
    {
      profile = ZodiacButtonProfile;
      x = temp.btnX; y = (300 / 2) - 46 - 16 + (temp.btnHeight*2);
      width = temp.btnWidth;
      height = temp.btnHeight;
      text = "Remove";

      thiso.catchevent( name, "onAction", "onRemove" );
    };
    new GuiButtonCtrl( "Refresh_List" )
    {
      profile = ZodiacButtonProfile;
      x = temp.btnX; y = (300 / 2) - 46 - 16 + (temp.btnHeight*3);
      width = temp.btnWidth;
      height = temp.btnHeight;
      text = "Refresh";

      thiso.catchevent( name, "onAction", "onRefresh" );
    };
  }
}

function onClose(window) {
  window.hide();
  window.destroy();
}

function populateRows() {
  with ("Bets_List") {
    clearrows();
    addrow(0,"Bets").active = false;
    for (temp.b : thiso.bets) {
      temp.row = addrow(1, temp.b[0] @ " " @ temp.b[1]);
      row.acct = b[0];
      row.amt = b[1];
    }
  }
}

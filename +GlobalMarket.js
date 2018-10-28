/*
  todo
  refresh button
  filters
*/

function onCreated() {
  //Percentage cut for using the market
  const MARKET_FEE = 0.05;
}

//sanitize inputs, check for int overflow on amount/price, decimals, negatives

function onActionServerSide(cmd, data) {
  switch (cmd) {
  case "add_to_market":
    addToMarket(data, params[2], params[3]);
    refresh();
    break;
  case "open_market":
    if (clientr.itemprobation) {
      client.temp_addmessages.add("You can't trade, you are on item probation!");
      return;
    }
    else if (clientr.tradedisabled) {
      client.temp_addmessages.add("You are currently banned from trading!");
      return;
    }
    
    triggerClient("weapon", this.name, "open_market", retrieveMarketListings());
    break;
  case "purchase_item":
    purchaseItem(data, params[2], params[3]);
    refresh();
    break;
  case "remove_item":
    removeItem(data, params[2]);
    refresh();
    break;
  case "info":
    findWeapon("+Inventory").displayItem(data);
    break;
  case "refresh":
    refresh(data);
    break;
  case "retrieve":
    findNPC("TemporaryStorage").retrieveFromStorage();
    break;
  }

}

function addToMarket(item, amount, price) {
  temp.priceMax = 2000000000;
  temp.priceMin = 100;
  if (price > priceMax || price < priceMin) {
    player.sendMessage("Price must be between" SPC priceMin SPC "and" SPC priceMax); 
    return false;
  }
  if (amount < 1) {
    return false;
  }
  amount = int(amount);
  price = int(price);
  if (!player.HasItem(item, amount)) {
    player.sendMessage("[Market] You don't have have enough of that item");
  } else if (item in ("Trade Control").nontradableitems) {
    player.sendMessage("[Market] Sorry, that item can't be traded");
  } else {
    temp.itemNonEscaped = item;
    item = item.escape();
    
    temp.query = "INSERT OR IGNORE INTO `Global_Market` VALUES ('"@player.account@"',
'"@item@"', 0, "@price@")";
    temp.query2 = "UPDATE `Global_Market` SET amount=amount+"@amount@", price="@price@
    " WHERE `account`='"@player.account@"' AND `item`='"@item@"'";
    temp.req = requestSQL(query, false);
    temp.req2 = requestSQL(query2, false);
    
    if (req.error != "") {
      echo(req.error SPC player.account);
    } else if (req2.error != "") {
      echo(req2.error SPC player.account);
    } else {
      player.TakeItem(itemNonEscaped, amount, "global market");
      return true;
    }
  }

  return false;
}

function removeItem(item, amount) {
  temp.itemNonEscaped = item;
  item = item.escape();
  amount = int(amount);

  
  temp.query = getAmountQuery(player.account, item);
  temp.req = requestSQL(query, true);
  if (!req.completed) {
    waitFor(req, "onReceiveData", 60);
  }
  temp.dbAmount = req.rows[0][0];

  if (temp.dbAmount <= amount || amount <= 0) {
    query = getDeleteQuery(player.account, item);
    amount = dbAmount;
  } else {
    query = getUpdateQuery(player.account, item, amount);
  }
  req = requestSQL(query, false);
  if (req.error != "") {
    echo(req.error SPC player.account);
  } else if (amount > 0) {
    player.AddItem(itemNonEscaped, findArc(itemNonEscaped), amount, "Global market remove");
  }
  
}

function purchaseItem(item, amount, sellerAcct) {
  temp.itemNonEscaped = item;
  item = item.escape();
  amount = int(amount);

  temp.query = "SELECT amount, price FROM `Global_Market` WHERE `account`='"@sellerAcct@
  "' AND `item`='"@item@"'";
  temp.req = requestSQL(query, true);
  if (!req.completed) {
    waitFor(req, "onReceiveData", 60);
  }
  temp.dbAmount = req.rows[0][0];


  if (temp.dbAmount <= amount || amount <= 0) {
    query = getDeleteQuery(sellerAcct, item);
    amount = dbAmount;
  } else {
    query = getUpdatequery(sellerAcct, item, amount);
  }
  temp.cost = amount * req.rows[0][1];
  if (!player.HasItem("Trade Coin", cost)) {
    player.sendMessage("[Market] Not enough trade coins");
    return false;
  }
  req = requestSQL(query, false);
  if (req.error != "") {
    echo(req.error SPC player.account SPC sellerAcct SPC this.name);
  } else if (amount > 0) {
    player.AddItem(itemNonEscaped, findArc(itemNonEscaped), amount, "Global Market trade " @ player.account SPC sellerAcct);
    player.TakeItem("Trade Coin", cost, "Global Market trade " @ player.account SPC sellerAcct);
    temp.seller = findPlayer(sellerAcct);
    temp.gold = int(cost - (cost * MARKET_FEE));
    temp.soldMsg = player.account SPC "bought your" SPC item SPC "("@amount@") for" SPC cost SPC "";
    if (seller != null) {
      seller.AddItem("Trade Coin", "items/tradecoin", gold, "Global Market trade " @ player.account SPC sellerAcct);
      seller.sendPM(soldMsg);
    } else {
      findNPC("TemporaryStorage").addToStorage(sellerAcct, "Trade Coin", gold, soldMsg);
    }
    temp.logMsg = player.account SPC item SPC amount SPC "for" SPC gold SPC "from" SPC sellerAcct @ "\n";
    findNPC("Analyzer").saveToFile("personaluploads/Gr/Graal753610/markettrades.txt", logMsg);
    return true;
  }
}

function findArc(item) {
  return findNPC("Archetype Catalog").getArcFromName(item);
}

function retrieveMarketListings(str) {
  if (str == null) {
    temp.query = "SELECT * FROM `Global_Market` ORDER BY `item` ASC";
  } else {
    str = str.escape();
    temp.query = "SELECT * FROM `Global_Market` WHERE `item` LIKE '%"@str@"%' OR `account` LIKE '%"@str@"%' ORDER BY `item` ASC";
  }

  temp.req = requestSQL(temp.query, true);
  if (!req.completed) {
    waitFor(req, "onReceiveData", 60);
  }
  return req.rows;
}

function getAmountQuery(acct, item) {
  return "SELECT amount FROM `Global_Market` WHERE `account`='"@acct@
  "' AND `item`='"@item@"'";
}

function getDeleteQuery(acct, item) {
  return "DELETE FROM `Global_Market` WHERE `account`='"@acct@
  "' AND `item`='"@item@"'";
}

function getUpdateQuery(acct, item, amount) {
  return "UPDATE `Global_MARKET` SET `amount`=amount-"@amount SPC
  "WHERE `account`='"@acct@"' AND `item`='"@item@"'";
}

function refresh(str) {
  triggerClient("weapon", this.name, "refresh", retrieveMarketListings(str));
}

//#CLIENTSIDE

function onCreated() {
  join("mudfunctions");
}

function onActionClientSide(cmd, data) {
  switch (cmd) {
  case "open_market":
    this.marketListings = data;
    this.page = 0;
    createMarketWindow();
    populateMarketListings();
    break;
  case "refresh":
    this.marketListings = data;
    this.page = 0;
    populateMarketListings();
    break;
  case "refresh_inventory":
    populateInventory();
    break;
  }
}

function createMarketWindow() {
  if ("Market_Window_Ctrl" != null) {
    "Market_Window_Ctrl".destroy();
  }
  new GuiWindowCtrl( "Market_Window_Ctrl" )
  {
    temp.h = 370;
    temp.iw = 160;
    temp.iwh = temp.iw / 2;
    profile = ZodiacWindowProfile2;
    width = 510 + temp.iw; height = h;
    x = (GraalControl.width - width)/2;
    y = (GraalControl.height - height)/2;
    canmove = true;
    canminimize = true;
    canclose = true;

    canresize = canmaximize = false;
    text = "Global Market";

    closequery = true;

    thiso.catchevent( name, "onCloseQuery", "onClose" );
    
    new GuiScrollCtrl( "Market_ScrollInventory" )
    {
      profile = ZodiacScrollProfile;
      x = 11; y = 22;
      width = 200 + temp.iwh;
      height = 300;
      hScrollBar = "dynamic";
      vScrollBar = "dynamic";
      
      new GuiTextListCtrl( "Market_Inventory" )
      {
        profile = ZodiacListProfile;
        x = y = 0;
        width = 300;
        height = 300;
        fitparentwidth = false;

        
        this.shopID = temp.shopID;
        this.listType = "inventory";
        thiso.catchevent( name, "onDblClick", "onQuickAdd" );
      };
    };
    
    new GuiScrollCtrl( "Market_ScrollListings" )
    {
      profile = ZodiacScrollProfile;
      x = 200 + 100 - 6 + temp.iwh + 5;
      y = 22;
      width = 200 + temp.iwh;
      height = 300;
      hScrollBar = "dynamic";
      vScrollBar = "dynamic";
      
      new GuiTextListCtrl( "Market_Listings" )
      {
        profile = ZodiacListProfile;
        x = y = 0;
        width = 300;
        height = 300;
        fitparentwidth = false;


        this.shopID = temp.shopID;
        this.listType = "shop";
        thiso.catchevent( name, "onDblClick", "onInfo" );
      };
    };
    temp.refx = 190;
    new GuiTextEditCtrl( "Market_Quantity" )
    {
      profile = ZodiacTextEditProfile;
      useownprofile = true;
      profile.numbersonly = true;
      x = 11 + temp.refx + 100 / 2 - 16 - 16 + temp.iwh; y = 22 + (300 / 2) - 40 + 64 - 64 - 48;
      width = 32 + 32 + 10; height = 22;
      text = "1";

      thiso.catchevent( name, "onAction", "onAdd" );
    };
    
    new GuiTextCtrl( "Market_QuantityLabel" )
    {
      profile = ZodiacTextProfile;
      useownprofile = true;
      x = temp.refx - 2 + 100 / 2 - 16 - 6 + temp.iwh + 5; y = 22 + (300 / 2) - 40 + 64 - 64 - 64 - 2;
      width = 32 + 32; height = 22;
      text = "Quantity";
    };
    
    new GuiTextCtrl( "Market_PriceLabel" )
    {
      profile = ZodiacTextProfile;
      useownprofile = true;
      x = temp.refx + 100 / 2 - 16 - 6 + temp.iwh + 5; y = 22 + (300 / 2) - 46 - 16 + 64 - 64 - 80;
      width = 32 + 32; height = 22;
      text = "Price";
    };
    
    new GuiTextEditCtrl( "Market_Price")
    {
      profile = ZodiacTextEditProfile;
      useownprofile = true;
      profile.numbersonly = true;
      x = 11 + temp.refx + 100 / 2 - 16 - 16 + temp.iwh; y = 22 + (300 / 2) - 46 - 16 + 64 - 64 - 64;
      width = 32 + 32 + 10; height = 22;
      text = "0";

      thiso.catchevent( name, "onAction", "onSetPrice" );
    };

    new GuiButtonCtrl( "Market_Add")
    {
      profile = ZodiacButtonProfile;
      x = 7 + 200 + 100 / 2 - 16 + temp.iwh; y = 22 + (300 / 2) - 46 - 16;
      width = height = 32;
      text = ">";

      thiso.catchevent( name, "onAction", "onAdd" );
    };
    
    new GuiButtonCtrl( "Market_Remove" )
    {
      profile = ZodiacButtonProfile;
      x = 7 + 200 + 100 / 2 - 16 + temp.iwh; y = 22 + (300 / 2) - 46 - 16 + 64;
      width = height = 32;
      text = "<";

      thiso.catchevent( name, "onAction", "onRemove" );
    };
    new GuiButtonCtrl( "Storage_Retrieve" )
    {
      profile = ZodiacButtonProfile;
      x = 11 + temp.refx + 100 / 2 - 16 - 16 + temp.iwh; y = 22 + (300 / 2) - 46 - 16 + 64 + 32;
      width = 74;
      height = 32;
      text = "Retrieve";

      thiso.catchevent( name, "onAction", "onRetrieve" );
    };
    new GuiButtonCtrl( "Market_Refresh" )
    {
      profile = ZodiacButtonProfile;
      x = 11 + temp.refx + 100 / 2 - 16 - 16 + temp.iwh; y = 22 + (300 / 2) - 46 - 16 + 64 + 32 * 2;
      width = 74;
      height = 32;
      text = "Refresh";

      thiso.catchevent( name, "onAction", "onRefresh" );
    };
    new GuiButtonCtrl( "Market_Load_Inventory" )
    {
      profile = ZodiacButtonProfile;
      x = 11 + temp.refx + 100 / 2 - 16 - 16 + temp.iwh; y = 22 + (300 / 2) - 46 - 16 + 64 + 32 * 3;
      width = 74;
      height = 32;
      text = "Load Inv";

      thiso.catchevent( name, "onAction", "populateInventory" );
    };
    temp.searchWidth = 300;
    temp.searchX = "Market_Window_Ctrl".width / 4 + 15;
    temp.searchHeight = 22;
    temp.searchY = "Market_Window_Ctrl".height - searchHeight - 18;

    new GuiTextEditCtrl( "Market_Search" )
    {
      profile = ZodiacTextEditProfile;
      useownprofile = true;
      x = searchX; y = searchY;
      width = 300; height = 22;
      text = "";

    };
    new GuiButtonCtrl("Market_PrevPage") {
      profile = ZodiacButtonProfile;
      width = height = 32;
      y = "Market_Search".y - 6;
      x = "Market_Search".x + ("Market_Search".width);
      text = "<";
      thiso.catchevent(name, "onAction", "onPrev");
    }
    new GuiButtonCtrl(Market_NextPage) {
      profile = ZodiacButtonProfile;
      width = height = 32;
      y = "Market_PrevPage".y;
      x = "Market_PrevPage".x + "Market_PrevPage".width;
      text = ">";
      thiso.catchevent(name, "onAction", "onNext");
    }
    
    new GuiButtonCtrl( "Market_SearchButton" )
    {
      profile = ZodiacButtonProfile;
      useownprofile = true;
      x = searchX - searchWidth / 4.5; y = searchY;
      width = 32 + 32; height = 22;
      text = "Search";

      thiso.catchevent( name, "onAction", "onSearch" );
    };

  };

  return temp.window;
}

function onNext() {
  this.page += 1;
  populateMarketListings();  
}

function onPrev() {
  this.page = this.page <= 0 ? 0 : this.page - 1;
  populateMarketListings();
}


function populateMarketListings() {
  with ("Market_Listings") {
    clearrows();
    addrow(0,"Market Listings").active = false;
    temp.shownListings = thiso.marketListings.subarray(thiso.page*100, 100);
    for (temp.listing : shownListings) {
      temp.row = addrow(1, listing[1] SPC "("@currency(listing[3])@")" SPC "["@listing[2]@"]" SPC "-" SPC
                        listing[0]);
      row.item = listing[1];
      row.price = listing[3];
      row.owner = listing[0];
    }
  }
}
function populateInventory() {
  with ("Market_Inventory") {
    clearrows();
    addrow(0,"Inventory Items").active = false;
    temp.items = getStringKeys("player.clientr.item-");
    for (temp.item : items) {
      if (emods(item).pos("soulbound") == -1) {
        temp.itemQuant = player.clientr.(@"item-"@ item)[0];
        if (itemQuant <= 0) {
          continue;
        }
        
        addrow(1, temp.item SPC "["@itemQuant@"]").item = item;
      }
    }
  }
}

function onSearch() {
  if (timeout > 0) {
    findWeapon("+Message").addMessage("[Market] You can only make a search every 5 seconds");
  } else {
    temp.searchString = "Market_Search".text;
    triggerServer("weapon", this.name, "refresh", searchString);
    setTimer(5);
  }    
}

function onAdd() {
  if ("Market_Inventory".getSelectedId() == 1) {
    temp.rowIndex = "Market_Inventory".getSelectedRow();
    temp.item = "Market_Inventory".rows[rowIndex].item;
    if (emods(item).pos("soulbound") == -1) {
      temp.quant = "Market_Quantity".text;
      temp.price = "Market_Price".text;
      triggerServer("weapon", this.name, "add_to_market", item, quant, price);
    }

  }
}

function onInfo() {
  if ("Market_Listings".getSelectedId() == 1) {
    temp.rowIndex = "Market_Listings".getselectedrow();
    if (rowIndex > 0) {
      temp.item = "Market_Listings".rows[rowIndex].item;
    }
    triggerserver("weapon", this.name, "info", item);
  }
}

function onRemove() {
  if ("Market_Listings".getSelectedId() == 1) {
    temp.rowIndex = "Market_Listings".getSelectedRow();
    temp.quant = "Market_Quantity".text;
    if (rowIndex > 0) {
      temp.row = "Market_Listings".rows[rowIndex];
      temp.sellerAcct = row.owner;
      temp.item = row.item;
      if (sellerAcct == player.account) {
        triggerServer("weapon", this.name, "remove_item", item, quant);
      } else {
        triggerServer("weapon", this.name, "purchase_item", item, quant, sellerAcct);
      }
    }
  }
}

function onRetrieve() {
  triggerServer("weapon", this.name, "retrieve");
}

function onRefresh() {
  if (timeout > 0) {
    findWeapon("+Message").addMessage("[Market] You can only refresh every 5 seconds");
  } else {
    triggerServer("weapon", this.name, "refresh");
    setTimer(5);
  }
}

function onClose(window) {
  window.hide();
  window.destroy();  
}

function currency(val, sep) {
  if (val >= 1000) {
    temp.newval = "";
    for (temp.i = val.length() - 3; temp.i > 0; temp.i -= 3) {
      temp.newval = (sep ? sep : ",") @ val.substring(temp.i, 3) @ temp.newval; 
    }
    temp.newval = val.substring(0, 3 - abs(temp.i)) @ temp.newval;
    return temp.newval;
  } else {
    return (val ? val : "N/A");
  }
}

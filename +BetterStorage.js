// db layout
// storage_acctname
// item, arc, qty, image (PRIMARY KEY item, arc)

// TODO probably don't use objects so we can fully optimize speed
// implement serverside checks
const ALL_STORAGES = "All_Storages";
const BUFFER_SIZE = 1;
const DELAY = .2;

function onCreated() {
}

function onActionServerSide(cmd) {
  switch (cmd) {
  case "onDepositItems":
    onDepositItems(params[1], params[2]);
    break;
  case "onWithdrawItems":
    onWithdrawItems(params[1], params[2]);
    break;
  case "onWithdrawItem":
    onWithdrawItem(params[1], params[2], params[3]);
    break;
  case "onRequestItems":
    onRequestItems(params[1], false, params[2]);
    break;
  case "onCreateStorage":
    createStorage(player.account);
    clientr.hasBetterStorage = true;
    break;
  }
}

function transferOldStorage(acc) {
  temp.lines.loadlines("levels/storage/pstorage_"@acc@".txt");
  temp.tableName = getTableName(acc);
  temp.p = player;
  for (temp.line : lines) {
    temp.tokens = line.tokenize(",");
    temp.itemEscaped = line[0].escape();
    temp.arcEscaped = line[2].escape();
    temp.qty = line[1];
    temp.iconEscaped = line[3].escape();
    temp.query = format("INSERT OR IGNORE INTO %s VALUES ('%s', '%s', 0, '%s')",
                        tableName, itemEscaped, arcEscaped, iconEscaped);
    temp.query2 = format("UPDATE %s SET quantity=quantity+%d WHERE item='%s' AND arc='%s'", tableName, qty, itemEscaped, arcEscaped);
    temp.req = requestsql2("storage", query, false);
    temp.req2 = requestsql2("storage", query2, false);
    p.sendMessage(format("Deposited %d %s", qty, line[0]));
    sleep(.2);
  }
  temp.empty = "";
  empty.savestring("levels/storage/pstorage_"@acc@".txt", 0);
}

function createStorage(acc) {
  temp.tableName = getTableName(acc);
  temp.query = format("CREATE TABLE IF NOT EXISTS %s (item VARCHAR, arc VARCHAR, quantity INTEGER, icon VARCHAR, PRIMARY KEY (item, arc))",
                      tableName);
  requestsql2("storage", query, false);

  query = format("INSERT OR IGNORE INTO %s VALUES('%s')",
                 ALL_STORAGES, acc.escape());
  requestsql2("storage", query, false);

  // make index
  //query = format("CREATE INDEX IF NOT EXISTS index_%s ON storage_%s(item)");
}

function depositStorage(acc, item, qty) {
  qty = int(max(1, qty));
  temp.p = findPlayer(acc);
  if (!p.HasItem(item, qty)) {
    echo(format("%s tried to deposit %d %s but did not have that many", acc, item, qty));
  } else {
    // ::player has qty of the item and is logged in
    // ::qty is 1 or greater and an integer
    temp.itemEscaped = item.escape();
    temp.tableName = getTableName(acc);
    temp.arcEscaped = p.clientr.(@"item-"@item)[1].escape();
    temp.iconEscaped = p.clientr.(@"muditem_"@item)[3].escape();
    temp.query = format("INSERT OR IGNORE INTO %s VALUES ('%s', '%s', 0, '%s')",
                        tableName, itemEscaped, arcEscaped, iconEscaped);
    temp.query2 = format("UPDATE %s SET quantity=quantity+%d WHERE item='%s' AND arc='%s'", tableName, qty, itemEscaped, arcEscaped);

    // player.TakeItem should have no references to +BetterStorage
    p.TakeItem(item, qty, "BetterStorage Deposit");
    temp.req = requestsql2("storage", query, false);
    temp.req2 = requestsql2("storage", query2, false);
    savelog2("storage2/"@acc@".txt",
             format("%s deposited %s %s(s)", acc, item, qty));
    p.sendMessage(format("Deposited %d %s", qty, item));
  }
}

function withdrawStorage(acc, item, qty) {
  qty = int(max(1, qty));
  temp.storedData = retrieveItem(acc, item);
  temp.storedQty = storedData[2];
  if (qty > storedQty) {
    echo(format("%s tried to withdraw %d %s but only had %d",
                acc, qty, item, storedQty));
    return;
  }
  temp.p = findPlayer(acc);
  if (p == null) {
    return;
  }
  // ::player is logged in and has correct # of item in storage
  // ::qty is an integer and 1 or greater
  temp.tableName = getTableName(acc);
  temp.arc = storedData[1];
  temp.arcEscaped = arc.escape();
  temp.itemEscaped = item.escape();
  
  if (qty == storedQty) {
    temp.query = format("DELETE FROM %s WHERE item='%s' AND arc='%s'",
                        tableName,
                        itemEscaped, arcEscaped);
  } else {
    temp.query = format("UPDATE %s SET quantity=quantity-%d WHERE item='%s' AND arc='%s'", tableName, qty, itemEscaped, arcEscaped);
  }
  // DO NOT SWAP THE ORDER OF THESE TWO LINES
  // since AddItem can call depositStorage
  requestSql2("storage", query, false);
  p.AddItem(item, arc, qty, true, false, "BetterStorage Withdraw");
  savelog2("storage2/"@acc@".txt",
           format("%s withdrew %s %s(s)", acc, item, qty));
}

function retrieveStorage(acc, searchQuery) {
  temp.tableName = getTableName(acc);
  if (searchQuery == null || searchQuery == "") {
    temp.query = format("SELECT * FROM %s ORDER BY item", tableName);    
  } else {
    temp.query = format("SELECT * FROM %s WHERE item LIKE '%%%s%%' ORDER BY item", tableName, searchQuery.escape());
  }

  temp.req = requestSql2("storage", query, true);
  waitFor(req, "onReceiveData", 60);
  return req.rows;
}

function retrieveItem(acc, item) {
  temp.p = findPlayer(acc);
  temp.tableName = getTableName(acc);
  temp.itemEscaped = item.escape();
  temp.query = format("SELECT * FROM %s WHERE item='%s'",
                      tableName, itemEscaped);
  temp.req = requestSql2("storage", query, true);
  waitFor(req, "onReceiveData", 60);
  if (req.error != "") {
    echo(req.error);
    return;
  }
  return req.rows[0];
}

function retrieveQuantity(acc, item) {
  temp.p = findPlayer(acc);
  temp.tableName = getTableName(acc);
  temp.itemEscaped = item.escape();
  temp.query = format("SELECT quantity FROM %s WHERE item='%s'",
                      tableName, itemEscaped);
  temp.req = requestSql2("storage", query, true);
  waitFor(req, "onReceiveData", 60);
  if (req.error != "") {
    echo(req.error);
    return;
  }

  return req.rows.size() > 0 ? req.rows[0][0] : 0;
}

function getTableName(acc) {
  return "storage_" @ acc.escape();
}

function getIndexName(acc) {
  return "index_" @ acc.escape();
}

function onRequestItems(acc, refreshInventory, searchQuery) {
  temp.items = retrieveStorage(acc, searchQuery);
  triggerClient("weapon", this.name, "onStorageLoaded", items, refreshInventory, searchQuery);
}

function onWithdrawItem(item, qty, acc) {
  if (qty < 1) {
    return;
  }
  withdrawStorage(acc, item, int(qty));
}

function onWithdrawItems(withdrawData, acc) {
  onBufferedWithdrawItems(null, withdrawData, acc);
}

function onBufferedWithdrawItems(buffer, withdrawDataLeft, acc) {
  // withdraw items in buffer
  if (BUFFER_SIZE == 1) {
    for (temp.i = 0; i < withdrawDataLeft.size(); i+=2) {
      if (player == null || player.level.name != "escalus_residence1.nw") {
        return;
      }
      temp.item = withdrawDataLeft[i];
      temp.qty = withdrawDataLeft[i+1];
      withdrawStorage(acc, item, qty);
      sleep(DELAY);
    }
    temp.p = findPlayer(acc);
    p.sendMessage("Finished withdrawing items");
    with (p) {
      onRequestItems(acc, true);
    }
    return;
  }
  for (temp.i = 0; i < buffer.size(); i+=2) {
    temp.item = buffer[i];
    temp.qty = buffer[i+1];
    withdrawStorage(acc, item, int(qty));
  }
  if (withdrawDataLeft.size() > 0) {
    scheduleevent(DELAY, "BufferedWithdrawItems",
                  withdrawDataLeft.subarray(0, BUFFER_SIZE*2),
                  withdrawDataLeft.subarray(BUFFER_SIZE*2), acc);
  } else {
    findPlayer(p).sendMessage("Finished withdrawing items");
    onRequestItems(acc);
  }
}

public function onDepositItem(item, qty, acc) {
  depositStorage(acc, item, qty);
}

function onDepositItems(depositData, acc) {
  onBufferedDepositItems(null, depositData, acc);
  
}

// prevents server lag by buffering the deposits
function onBufferedDepositItems(buffer, depositDataLeft, acc) {
  // deposit items in buffer
  if (BUFFER_SIZE == 1) {
    for (temp.i = 0; i < depositDataLeft.size(); i+=2) {
      if (player == null || player.level.name != "escalus_residence1.nw") {
        return;
      }
      temp.item = depositDataLeft[i];
      temp.qty = depositDataLeft[i+1];
      depositStorage(acc, item, qty);
      sleep(DELAY);
    }
    temp.p = findPlayer(acc);
    p.sendMessage("Finished Depositing items");
    with (p) {
      onRequestItems(acc, true);
    }
    return;
  }
  // if change buffer size need to check player and level
  // deposit items in buffer
  for (temp.i = 0; i < buffer.size(); i+=2) {
    temp.item = buffer[i];
    temp.qty = buffer[i+1];
    depositStorage(acc, item, int(qty));
  }
  if (depositDataLeft.size() > 0) {
    scheduleevent(DELAY, "BufferedDepositItems",
                  depositDataLeft.subarray(0, BUFFER_SIZE*2),
                  depositDataLeft.subarray(BUFFER_SIZE*2), acc);
  } else {
    findPlayer(p).sendMessage("Finished depositing items");
    onRequestItems(acc);
  }
}


//#CLIENTSIDE

function onActionClientSide(cmd) {
  switch (cmd) {
  case "onStorageLoaded":
    makeStorage();
    onStorageLoaded(params[1]);
    populateInventory(params[3]);
    // refreshInventory
    // if (params[2]) {
    //   populateInventory();
    // }
    break;
  }
}

function onPlayerEnters() {
  if (BetterStorageWindow != null) {
    BetterStorageWindow.destroy();
  }
}

function onPlayerChats() {
  if (player.level.name != "escalus_residence1.nw") {
    return;
  }
  if (player.chat.starts("/storage2")) {
    if (!clientr.hasBetterStorage) {
      client.temp_addmessages.add("You need to do /getstorage2 to activate Storage2");
      return;
    }
    player.chat = "";
    makeStorage();
    triggerServer("weapon", this.name, "onRequestItems", player.account);
    populateInventory();
  } else if (player.chat.starts("/getstorage2")) {
    player.chat = "";
    triggerServer("weapon", this.name, "onCreateStorage");
  }
}

function onStorageLoaded(items) {
  with (StorageList) {
    clearrows();
    addrow(0, "Stored Items").active = false;
    for (temp.itemData : items) {
      temp.row = addrow(1, itemData[2] SPC itemData[0]);
      // row.icon.drawimagestretched(0, 0, 24, 24, itemData[3], 0, 0, 32, 32);
      row.item = itemData[0];
      row.quantity = itemData[2];
    }    
  }
}

function onRefresh(o) {
  onStorageLoaded(o);
  populateInventory();
}

function populateInventory(searchQuery) {
  plyaer.chat = searchQuery;
  with (InventoryList) {
    clearrows();
    addrow(0, "Inventory").active = false;
    temp.items = getStringKeys("player.clientr.item-");
    for (temp.item : items) {
      if (searchQuery != null && searchQuery != "" &&
          item.lower().pos(searchQuery) == -1) {
        continue;
      }
      temp.itemQuant = player.clientr.(@"item-"@ item)[0];
      if (itemQuant <= 0) {
        continue;
      }
      temp.row = addrow(1, itemQuant SPC item);
      row.item = item;
      row.quantity = itemQuant;
    }
  }
}

function makeStorage() {
  if (SPromptWindow != NULL) SPromptWindow.destroy();
  if (BetterStorageWindow != NULL) BetterStorageWindow.destroy();
  if (StorageWindow != null) StorageWindow.destroy();
  if (ShopWindow.active == true) ShopWindow.destroy();

  new GuiWindowCtrl(BetterStorageWindow) {
    profile = ZodiacWindowProfile2;
    clientrelative = true;
    height = 370;
    width = 670;
    
    canminimize = true;
    canmaximize = false;
    canmove = true;
    canresize = false;
    canclose = true;
    // closequery = false;
    // destroyonhide = false;
    text = "Storage";
    x = (screenwidth-width)*0.5;
    y = (screenheight-height)*0.5;
    new GuiTextEditCtrl(StorageSearch) {
      profile = ZodiacTextEditProfile;
      useownprofile = true;
      profile.modal = false;
      x = 245;
      y = -15;
      width = 160;
      height = 25;
      text = "Search...";
    }
    StorageSearch.profile.modal = true;
    new GuiButtonCtrl(SearchButton) {
      width = 64;
      height = 22;
      profile = ZodiacButtonProfile;
      x = StorageSearch.x + StorageSearch.width;
      y = StorageSearch.y;
      text = "Search";
    }
    new GuiButtonCtrl(JunkOnlyButton) {
      width = 64;
      height = 22;
      profile = ZodiacButtonProfile;
      x = SearchButton.x + SearchButton.width;
      y = SearchButton.y;
      text = "Junk Only";      
    }
    new GuiScrollCtrl(InventoryScroll) {
      profile = ZodiacScrollProfile;
      height = 226 + 14;
      hscrollbar = "alwaysOff";
      vscrollbar = "dynamic";
      width = 221 + 100;
      x = 2.5;
      y = 14;
      new GuiTextListCtrl(InventoryList) {
        profile = ZodiacListProfile;
        height = 32;
        horizsizing = "width";
        width = 217;
        clearrows();
        seticonsize(24,24);
      }
    }
    new GuiScrollCtrl(StorageScroll) {
      profile = ZodiacScrollProfile;
      height = 226 + 14;
      hscrollbar = "alwaysOff";
      vscrollbar = "dynamic";
      width = 221 + 100;
      x = InventoryScroll.x + InventoryScroll.width;
      y = 14;
      new GuiTextListCtrl(StorageList) {
        profile = ZodiacListProfile;
        height = 32;
        horizsizing = "width";
        width = 217;
        clearrows();
        seticonsize(24,24);
      }
    }

    new GuiButtonCtrl(WithdrawButton) {
      width = 64;
      height = 22;
      profile = ZodiacButtonProfile;
      x = StorageScroll.x;
      y = StorageScroll.y + StorageScroll.height + 2.5;
      text = "Withdraw";
    }
    new GuiButtonCtrl(DepositButton) {
      width = 64;
      height = 22;
      profile = ZodiacButtonProfile;
      x = InventoryScroll.x;
      y = InventoryScroll.y + InventoryScroll.height + 2.5;
      text = "Deposit";      
    }
    new GuiTextCtrl(QuantityLabel) {
      profile = ZodiacTextProfile;
      useownprofile = true;
      height = 22;
      x = DepositButton.x + 2.5 + DepositButton.width;
      y = DepositButton.y;
      text = "";
    }
    new GuiTextEditCtrl(QuantityEdit) {
      profile = ZodiacTextEditProfile;
      useownprofile = true;
      profile.numbersonly = true;
      x = DepositButton.x;
      y = QuantityLabel.height + QuantityLabel.y;
      width = 32 + 32 + 10; height = 22;
      text = 1;
    }
  }

}

function WithdrawButton.onAction() {
  temp.rowIndices = StorageList.getselectedrows();
  temp.withdrawData = new[0];
  for (temp.index : rowIndices) {
    temp.row = StorageList.rows[index];
    temp.actualWithdrawQty = 0;
    if (row.id == 1) {
      actualWithdrawQty = min(row.quantity, QuantityEdit.text);
      actualWithdrawQty = max(1, actualWithdrawQty);
      withdrawData.add(row.item);
      withdrawData.add(actualWithdrawQty);
    }
  }
  triggerServer("weapon", this.name, "onWithdrawItems",
                withdrawData, player.account);
  BetterStorageWindow.destroy();
}

function DepositButton.onAction() {
  temp.rowIndices = InventoryList.getselectedrows();
  temp.depositData = new[0];
  for (temp.index : rowIndices) {
    temp.row = InventoryList.rows[index];
    temp.actualQty = 0;

    if (row.id == 1) {
      actualQty = min(row.quantity, QuantityEdit.text);
      actualQty = max(actualQty, 1);
      depositData.add(row.item);
      depositData.add(actualQty);
    }
    // update client list
    // if (actualQty == row.quantity) {
    //   InventoryList.removerow(index);
    // } else {
    //   row.text = (row.quantity - actualQty) SPC row.item;
    //   row.quantity = (row.quantity - actualQty);
    // }
  }
  triggerServer("weapon", this.name, "onDepositItems",
                depositData, player.account);
  BetterStorageWindow.destroy();
}

function StorageSearch.onMouseDown() {
  StorageSearch.text = "";
}

function SearchButton.onAction() {
  triggerServer("weapon", this.name, "onRequestItems",
                player.account, StorageSearch.text.lower());
  //populateInventory(StorageSearch.text.lower());
}

function JunkOnlyButton.onAction() {
  findWeapon("+Junk").retrieveLists("onJunkListLoaded", "+BetterStorage");
}

public function onJunkListLoaded() {
  for (temp.i = InventoryList.rows.size()-1; i >= 0; i--) {
    if (!findWeapon("+Junk").isJunk(InventoryList.rows[i].item, true)) {
      InventoryList.removerow(i);
    }
  }

  for (temp.i = StorageList.rows.size()-1; i >= 0; i--) {
    if (!findWeapon("+Junk").isJunk(StorageList.rows[i].item, true)) {
      StorageList.removerow(i);
    }    
  }
}

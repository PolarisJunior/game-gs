/*
  TODO: Optimize so we don't do SELECT queries
  each time we insert to table
  
  refashion so we can use this in global market and such
*/

enum {
  PREFIX, SUFFIX, ITEM
}

function onCreated() {
  join("n_clientserver");
  this.tables = {"Junk_Prefix", "Junk_Suffix", "Junk_Item"};
}

function removeRule(o) {
  temp.query = getDeleteQuery(this.tables[o.rule_type],
                              player.account, o.rule);
  temp.req = requestSQL(query, false);
  if (!req.completed) {
    waitFor(req, "OnReceiveData", 60);
  }
  o.cmd = "retrieveLists";
  retrieveLists(o);
}

function addRule(o) {
  temp.query = getInsertQuery(this.tables[o.rule_type],
                              player.account, o.rule);
  temp.req = requestSQL(query, false);
  if (!req.completed) {
    waitFor(req, "OnReceiveData", 60);
  }
  o.cmd = "retrieveLists";
  retrieveLists(o);
}

function retrieveLists(o) {
  temp.x = new TStaticVar();
  x.junk_items = getJunkItems(player.account);
  x.junk_prefixes = getJunkPrefixes(player.account);
  x.junk_suffixes = getJunkSuffixes(player.account);
  x.cmd = "ListsLoaded";
  x.callback = o.callback;
  // if nonnull the callback applies to weapon wep_callback
  x.wep_callback = o.wep_callback;
  nTriggerClient(x);
}

function getRuleFromRow(row) {
  return row[0];
}

function doSelectQuery(query) {
  temp.req = requestSQL(query, true);
  if (!req.completed) {
    waitFor(req, "OnReceiveData", 60);
  }
  return req.rows;
}

function getJunkItems(acct) {
  return doSelectQuery(getSelectQuery("Junk_Item", acct));
}

function getJunkPrefixes(acct) {
  return doSelectQuery(getSelectQuery("Junk_Prefix", acct));
}

function getJunkSuffixes(acct) {
  return doSelectQuery(getSelectQuery("Junk_Suffix", acct));
}

function getSelectQuery(table, acct) {
  temp.query = format("SELECT rule FROM %s WHERE account='%s'",
                      table, acct);
  return query;
}

function getInsertQuery(table, acct, unsafeRule) {
  temp.safeRule = unsafeRule.escape();
  temp.query = format("INSERT INTO %s VALUES ('%s', '%s')",
                      table, acct, safeRule);
  return query;
}

function getDeleteQuery(table, acct, unsafeRule) {
  temp.safeRule = unsafeRule.escape();
  temp.query = format("DELETE FROM %s WHERE account='%s' AND rule='%s'",
                      table, acct, safeRule);
  return query
}

//#CLIENTSIDE

enum {
  PREFIX, SUFFIX, ITEM
}

function onCreated() {
  join("mudfunctions");
  this.focusedList = -1;
  retrieveLists(null);
}

function ListsLoaded(o) {
  client.junk_prefixes = flattenRows(o.junk_prefixes);
  client.junk_suffixes = flattenRows(o.junk_suffixes);
  client.junk_items = flattenRows(o.junk_items);
  if (o.wep_callback == null) {
    (@o.callback)(o.junk_prefixes, o.junk_suffixes, o.junk_items);    
  } else {
    findWeapon(o.wep_callback).(@o.callback)(o.junk_prefixes, o.junk_suffixes, o.junk_items);
  }

}

public function junkWindow() {
  join("n_guihelper");
  if (Junk_Window != null)
    Junk_Window.destroy();
  temp.spacing = 25;
  temp.btnSpace = 50;
  temp.btnWidth = 100;
  new GuiWindowCtrl(Junk_Window) {
    width = 900;
    height = 600;
    center(screenwidth, screenheight);
    profile = ZodiacWindowProfile2;
    canmove = true;
    canminimize = true;
    canclose = true;
    canmaximize = false;
    canresize = false;
    clipchildren = false;
    text = "Junk";

    new GuiScrollCtrl(Junk_Prefix_Scroll) {
      x = spacing;
      y = spacing;
      hScrollBar = "dynamic";
      vScrollBar = "dynamic";
      profile = ZodiacScrollProfile;
      width = (Junk_Window.width-(spacing*2))/3;
      height = Junk_Window.height-(spacing*2)-btnSpace;
      new GuiTextListCtrl(Junk_Prefix_List) {
        profile = ZodiacListProfile;
        x = 0;
        y = 0;
        height = Junk_Prefix_Scroll.height;
        fitparentwidth = true;
      }
    }
    new GuiScrollCtrl(Junk_Suffix_Scroll) {
      x = Junk_Prefix_Scroll.x+Junk_Prefix_Scroll.width;
      y = spacing;
      profile = ZodiacScrollProfile;
      hScrollBar = "dynamic";
      vScrollBar = "dynamic";
      width = (Junk_Window.width-spacing*2)/3;
      height = Junk_Window.height-(spacing*2)-btnSpace;
      new GuiTextListCtrl(Junk_Suffix_List) {
        profile = ZodiacListProfile;
        x = 0;
        y = 0;
        height = Junk_Suffix_Scroll.height;
        fitparentwidth = true;
      }
    }
    new GuiScrollCtrl(Junk_Item_Scroll) {
      x = Junk_Suffix_Scroll.x+Junk_Suffix_Scroll.width;
      y = spacing;
      profile = ZodiacScrollProfile;
      hScrollBar = "dynamic";
      vScrollBar = "dynamic";
      width = (Junk_Window.width-spacing*2)/3;
      height = Junk_Window.height-(spacing*2)-btnSpace;
      new GuiTextListCtrl(Junk_Item_List) {
        profile = ZodiacListProfile;
        x = 0;
        y = 0;
        height = Junk_Suffix_Scroll.height;
        fitparentwidth = true;
      }
    }
    new GuiButtonCtrl(Add_Prefix_Btn) {
      x = spacing;
      y = spacing + Junk_Prefix_Scroll.height;
      height = btnSpace;
      width = btnWidth;
      text = "Add Prefix";
      profile = ZodiacButtonProfile;
    }
    new GuiButtonCtrl(Add_Suffix_Btn) {
      x = Add_Prefix_Btn.x + Add_Prefix_Btn.width;
      y = Add_Prefix_Btn.y;
      height = btnSpace;
      width = btnWidth;
      text = "Add Suffix";
      profile = ZodiacButtonProfile;
    }
    new GuiButtonCtrl(Add_Item_Btn) {
      x = Add_Suffix_Btn.x + Add_Suffix_Btn.width;
      y = Add_Prefix_Btn.y;
      height = btnSpace;
      width = btnWidth;
      text = "Add Item";
      profile = ZodiacButtonProfile;
    }
    new GuiButtonCtrl(Remove_Btn) {
      x = Add_Item_Btn.x + Add_Item_Btn.width;
      y = Add_Prefix_Btn.y;
      height = btnSpace;
      width = btnWidth;
      text = "Remove";
      profile = ZodiacButtonProfile;
    }

    new GuiTextEditCtrl(Affix_Edit) {
      profile = ZodiacTextEditProfile;
      width = Junk_Window.width - btnWidth*4 -  (2*spacing);
      height = btnSpace;
      x = Remove_Btn.x + btnWidth;
      y = Remove_Btn.y;
      text = "";
    }
  }
  retrieveLists("populateLists");
}

/*
  Tells the server to get the junk data
*/
public function retrieveLists(callback, wepCallback) {
  this.obj.cmd = "retrieveLists";
  this.obj.callback = callback;
  this.obj.wep_callback = wepCallback;
  nTriggerServer();
}

function populateLists(prefixes, suffixes, items) {
  temp.arr = {prefixes, suffixes, items};
  for (temp.i = 0; i < 3; i++) {
    temp.list = getList(i);
    temp.rules = arr[i];
    with (list) {
      clearrows();
      addrow(0, getListHeader(i)).active = false;
      for (temp.r : rules) {
        addrow(1, getRuleFromRow(r));
      }
    }
  }
}

function getList(e) {
  temp.arr = {Junk_Prefix_List,
              Junk_Suffix_List, Junk_Item_List};
  return arr[e];
}

function getListHeader(e) {
  temp.arr = {"Junk Prefixes", "Junk Suffixes", "Junk Items"};
  return arr[e];
}

function removeRule(ruleType) {
  temp.list = getList(ruleType);
  if (list.getSelectedId() == 1) {
    temp.rowIndex = list.getSelectedRow();
    temp.row = list.rows[rowIndex];
    temp.rule = row.text;
    this.obj.rule = rule;
    this.obj.rule_type = ruleType;
    this.obj.cmd = "removeRule";
    this.obj.callback = "populateLists";
    nTriggerServer();
  }

} 

function addRule(ruleType) {
  temp.rule = Affix_Edit.text;
  if (rule != "") {
    this.obj.cmd = "addRule";
    this.obj.callback = "populateLists";
    this.obj.rule = rule.trim();
    this.obj.rule_type = ruleType;
    nTriggerServer();
    Affix_Edit.text = "";
  }
}


function Remove_Btn.onAction() {
  removeRule(this.focusedList);
}

function Add_Prefix_Btn.onAction() {
  addRule(PREFIX);
}

function Add_Suffix_Btn.onAction() {
  addRule(SUFFIX);
}

function Add_Item_Btn.onAction() {
  addRule(ITEM);
}


function Junk_Prefix_List.onMouseDown() {
  this.focusedList = PREFIX;
}

function Junk_Suffix_List.onMouseDown() {
  this.focusedList = SUFFIX;
}

function Junk_Item_List.onMouseDown() {
  this.focusedList = ITEM;
}

function getRuleFromRow(row) {
  return row[0];
}

function flattenRows(rows) {
  temp.flattened = new[0];
  for (temp.row : rows) {
    flattened.add(getRuleFromRow(row));
  }
  return flattened;
}

// pre assumes junk rules loaded already
// if all is true then includes all item types
public function isJunk(item, all) {
  // check exact matches first
  for (temp.junkItem : client.junk_items) {
    if (item == junkItem) {
      return true;
    }
  }

  if ((etype(item) != "armor" || esub(item) == "accessory") && !all) {
    return false;
  }

  item = item.lower();

  for (temp.prefix : client.junk_prefixes) {
    if (item.pos(prefix.lower()) == 0) {
      return true;
    }
  }

  temp.len = item.length();
  for (temp.suffix : client.junk_suffixes) {
    if (suffix.length() > item.length()) {
      continue;
    }
    temp.testStr = item.substring(len - suffix.length());
    if (testStr == suffix.lower()) {
      return true;
    }
  }

  return false;
}

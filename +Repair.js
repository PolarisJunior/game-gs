
function onCreated() {
  join("n_arc_helper");
  temp.recipes = {
    {"headhunter", {"Bloody Fragment", 1}, 50}
  };
  for (temp.recipe : recipes) {
    this.recipes.(@recipe[0]).materials = recipe[1];
    this.recipes.(@recipe[0]).increase = recipe[2];
  }
}

function onActionGetMaterial(item) {
  temp.arc = getBaseArc(clientr.(@"item-"@item)[1]);
  temp.materials = this.recipes.(@extractfilebase(arc)).materials;
  triggerClient("weapon", this.name, "list_material", materials);
}

function onActionServerSide(cmd, data) {
  switch (cmd) {
  case "get_material":
    onActionGetMaterial(data);
    break;
  case "repair":
    repairItem(data);
    break;
  }
}

function repairItem(item) {
  temp.realArc = clientr.(@"item-"@item)[1];
  temp.baseArc = getBaseArc(realArc);
  temp.d.loadvars("levels/archetype/"@baseArc@".arc");
  temp.mats = d.repair.tokenize(" ");

  temp.repairAmt = d.repair_amount;
  if (!hasMats(mats)) {
    player.sendMessage("You don't have the materials required to repair this item.");
  } else if (!player.HasItem(item, 1)) {
    player.sendMessage("You don't have the item you are trying to repair");
  } else {
    temp.newArc = fixedItemArc(item, repairAmt);
    takeMats(mats);
    player.TakeItem(item);
    player.AddItem(null, newArc, 1);
    temp.logMsg = item SPC "repaired into" SPC newArc @ "\n";
    triggerClient("weapon", this.name, "refresh");
  }
}

//make sure they still have their old arc
function fixedItemArc(item, repairAmt) {
  temp.realArc = clientr.(@"item-"@item)[1];
  temp.durId = realArc.substring(realArc.pos("$d")+2, 2);
  temp.oldDurValue = findNPC("Archetype Generator").getDurabilityName(durId);
  oldDurValue = oldDurValue.substring(0, oldDurValue.length() - 1);
  temp.newDurValue = oldDurValue + repairAmt;
  newDurValue = newDurValue > 100 ? 100 : newDurValue;
  temp.newCode = findNPC("Archetype Generator").getDurabilityCode(newDurValue @ "%");
  temp.newArc = realArc.substring(0, realArc.pos("$d")) @ "$d" @ newCode @ realArc.substring(realArc.pos("$d") + 4);
  
  return newArc;
}

function hasMats(mats) {
  for (temp.i = 0; i < mats.size(); i+= 2) {
    temp.checkarc.loadvars("levels/archetype/"@mats[i]@".arc");
    if (!player.HasItem(checkarc.wname, mats[i+1])) {
      return false;
    }
  }
  return true;
}

function takeMats(mats) {
  for (temp.i = 0; i < mats.size(); i+=2) {
    temp.iname = nameFromArc(mats[i]);
    player.TakeItem(iname, mats[i+1]);
  }
}

function nameFromArc(arc) {
  temp.checkarc.loadvars("levels/archetype/"@arc@".arc");
  return checkarc.wname;
}

//#CLIENTSIDE

function onActionClientSide(cmd, data) {
  switch (cmd) {
  case "list_material":
    onActionListMaterial(data);
    break;
  case "refresh":
    makeRepairGUI();
    break;
  }
}

//GRAALSCRIPT SOME FUCKY SHIT DECOMPOSES ARRAYS INTO THE PARAMETERS?? EVEN IF ITS NESTED
function onActionListMaterial(data) {
  with (Materials_List) {
    clearrows();
    addrow(0, "Materials Required").active = false;
    for (temp.i = 0; i < data.size(); i+=2) {
      temp.mat = data[i];
      temp.amount = data[i+1];
      temp.row = addrow(1, format("%d %s [%d]", amount, mat,
                                  clientr.(@"item-"@mat)[0]));
      row.mat = mat;
      row.amount = amount;
    }
  }
}

public function makeRepairGUI() {
  join("n_guihelper");
  if (Repair_Window != null) {
    Repair_Window.destroy();
  }

  temp.spacing = 25;
  new GuiWindowCtrl(Repair_Window) {
    profile = ZodiacWindowProfile2;
    width = 640;
    height = 560;
    center(screenwidth, screenheight);
    canresize = canminimize = canmaximize = false;
    canclose = true;
    visible = true;
    text = "Anvil";

    new GuiScrollCtrl(Items_Scroll) {
      new GuiTextListCtrl(Items_List);
    }
    new GuiScrollCtrl(Materials_Scroll) {
      new GuiTextListCtrl(Materials_List);
    }
    new GuiButtonCtrl(Repair_Btn);

  }

  with (Items_Scroll) {
    profile = ZodiacScrollProfile;
    width = (parent.width - (spacing * 2))/2;
    height = parent.height - (spacing*2);
    x = spacing;
    y = spacing;
    vScrollBar = "dynamic";
    hScrollBar = "dynamic";
  }
  with (Items_List) {
    profile = ZodiacListProfile;
    x = 0;
    y = 0;
    fitparentwidth = true;
    fillParentHeight(0);

  }
  with (Materials_Scroll) {
    profile = ZodiacScrollProfile;
    positionRight(Items_Scroll, 0);
    y = spacing;
    widthRelative(Items_Scroll, 1);
    heightRelative(Items_Scroll, .5);
    hScrollBar = "dynamic";
    vScrollBar = "dynamic";
  }
  with (Materials_List) {
    profile = ZodiacListProfile;
    x = 0;
    y = 0;
    fitparentwidth = true;
    fillParentHeight(0);
    clearrows();
    addrow(0, "Materials Required").active = false;
  }
  with (Repair_Btn) {
    profile = ZodiacButtonProfile;
    useownprofile = true;
    profile.fontsize = 48;
    profile.fontstyle = "Verdana";
    width = 196;
    height = 84;
    x = Materials_Scroll.x + Materials_Scroll.width/4 - spacing/2;
    y = Materials_Scroll.y+Materials_Scroll.width+ 50;
    text = "Repair";
  }
  populateItems();
}

function populateItems() {
  with (Items_List) {
    clearrows();
    addrow(0, "Repairable Items").active = false;
    for (temp.item : getstringkeys("clientr.item-")) {
      temp.mods = emods(item).tokenize(": ");
      temp.rIndex = mods.index("repairable");
      if (rIndex >= 0 || item.ends("%")) {
        temp.row = addrow(1, format("%s [%d]", item, clientr.(@"item-"@item)[0]));
        row.item = item;
      }
    }
  }
}

function Items_List.onSelect(id, text, index) {
  if (id > 0) {
    triggerServer("weapon", this.name, "get_material", Items_List.rows[index].item);
  }
}

function Repair_Btn.onAction() {
  if (Items_List.getSelectedId() > 0) {
    temp.row = Items_List.rows[Items_List.getSelectedRow()];
    triggerServer("weapon", this.name, "repair", row.item);    
  }
}

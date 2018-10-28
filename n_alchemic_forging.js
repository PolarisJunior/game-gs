
function manifestToArmorList(manifest) {
  temp.tokens = manifest.tokenize();
  temp.metal = tokens[0];
  temp.piece = tokens[1];

  temp.armorList = findNPC("Recipes").armorListFromMetal(metal.lower());
  return armorList;
}

function manifestToArmorPiece(manifest, type) {
  temp.tokens = manifest.tokenize();
  temp.armorList = manifestToArmorList(manifest);
  temp.slot = slotFromPiece(tokens[1]);

  for (temp.armor : armorList) {
    temp.armorData = findNPC("Archetype Generator").(@"armor_"@armor);
    if (armorData[1] == type && armorData[3] == slot) {
      return armor;
    }
  }
  return null;
}

function slotFromPiece(piece) {
  switch (piece) {
  case "Leggings":
    return "boot";
  case "Chestplate":
    return "chest";
  case "Helmet":
    return "head";
  case "Gloves":
    return "glove";
  }
  return null;
}

function onActionMakeArmor(manifest, type) {
  temp.generator = findNPC("Archetype Generator");
  temp.plain = manifestToArmorPiece(manifest, type);
  if (plain == null) {
    return;
  }
  temp.armorData = findNPC("Archetype Generator").(@"armor_"@plain);

  temp.lvl = armorData[0];
  temp.armorName = plain;
  // roll for prefix
  if (random(0, 100) < 50) {
    temp.prefix = generator.getPrefixName(generator.getRandomPrefix(lvl));
    armorName = prefix SPC armorName;
  }
  // roll for suffix
  if (random(0, 100) < 50) {
    temp.suffix = generator.getSuffixName(generator.getRandomSuffix(lvl));
    armorName = armorName SPC suffix;
  }

  if (player.HasItem(manifest, 1)) {
    player.TakeItem(manifest, 1);
    player.AddItem(armorName, findNPC("Archetype Catalog").getArcFromName(armorName), 1, true, false, "Crafted");
    triggeraction(this.x, this.y, "Created", manifest, player.account);
  }
}

function onActionSelectManifest(manifest, type) {
  temp.generator = findNPC("Archetype Generator");
  temp.plain = manifestToArmorPiece(manifest, type);
  triggeraction(this.x, this.y, "LoadPreview", plain, player.account);
}

//#CLIENTSIDE


function onPlayerTouchsMe() {
  this.metals = {"Copper", "Tin", "Iron", "Silver",
                 "Bronze", "Gold", "Electrum", "Steel",
                 "Platinum", "Mithril", "Obsidian"};
  this.manifests = {"Leggings Manifest", "Chestplate Manifest",
                    "Helmet Manifest", "Gloves Manifest"};
  onAlchemyWindow();
  populateManifests();
}

function getMetals() {
  return {"Copper", "Tin", "Iron", "Silver",
          "Bronze", "Gold", "Electrum", "Steel",
          "Platinum", "Mithril", "Obsidian"};
}

function getManifests() {
  return {"Leggings Manifest", "Chestplate Manifest",
          "Helmet Manifest", "Gloves Manifest"};
}

function getArmorTypes() {
  return {"Heavy", "Leather", "Eastern", "Cloth"};
}

function onAlchemyWindow() {
  join("n_guihelper");
  if (Alchemic_Forging_Window != null)
    Alchemic_Forging_Window.destroy();

  temp.spacing = 25;
  temp.windowWidth = 640;
  temp.windowHeight = 560;
  new GuiWindowCtrl(Alchemic_Forging_Window) {
    profile = ZodiacWindowProfile2;
    width = windowWidth;
    height = windowHeight;
    center(screenwidth, screenheight);
    canresize = canminimize = canmaximize = false;
    canclose = true;
    visible = true;
    text = "Alchemic Forging";
    new GuiScrollCtrl(Manifests_Scroll) {
      profile = ZodiacScrollProfile;
      width = Alchemic_Forging_Window.width/2 - spacing;
      height = windowHeight - spacing*2;
      x = spacing;
      y = spacing;
      new GuiTextListCtrl(Manifests_List) {
        profile = ZodiacListProfile;
	fitparentwidth = true;
        height = Manifests_Scroll.height;
        x = y = 0;
      }
    }

    new GuiTextCtrl(Armor_Type_Label) {
      profile = ZodiacTextProfile;
      width = Manifests_Scroll.width - spacing;
      height = 25;
      x = Manifests_Scroll.width + Manifests_Scroll.x + spacing;
      y = Manifests_Scroll.y;
      text = "Armor Type";
    }

    new GuiPopUpMenuCtrl(Armor_Type_Dropdown) {
      profile = ZodiacPopUpMenuProfile;
      textprofile = ZodiacListProfile;
      scrollprofile = ZodiacScrollProfile;
      //       profile = GuiBluePopUpMenuProfile;
      // textprofile = GuiBlueTextListProfile;
      // scrollprofile = GuiBlueScrollProfile;
      width = Manifests_Scroll.width - spacing;
      height = 25;
      x = Armor_Type_Label.x;
      y = Armor_Type_Label.y + Armor_Type_Label.height;
      clearrows();
      for (temp.type : getArmorTypes()) {
        addrow(1, type);
      }
      setselectedrow(0);
      
    }

    new GuiTextCtrl(Preview_Label) {
      profile = ZodiacTextProfile;
      height = 25;
      x = Manifests_Scroll.width + Manifests_Scroll.x + spacing;
      y = Armor_Type_Dropdown.y + Armor_Type_Dropdown.height + spacing;
      text = "";
    }
    

    new GuiButtonCtrl(Synthesize) {
      height = 48;
      width = Manifests_Scroll.width - spacing;
      x = Manifests_Scroll.x + Manifests_Scroll.width + spacing; 
      y = windowHeight - height - spacing;
      profile = ZodiacButtonProfile;
      text = "Synthesize";
    }
  }
}

function populateManifests() {
  temp.items = getstringkeys("clientr.item-");
  with (Manifests_List) {
    clearrows();
    addrow(0, "Manifests").active = false;
    for (temp.item : items) {
      if (isManifest(item)) {
        temp.qty = clientr.(@"item-"@item)[0];
        temp.row = addrow(1, qty SPC item);
        row.item = item;
        row.quantity = qty;
      }
    }
  }

}

function isManifest(itemName) {
  return startsMetal(itemName) && endsManifest(itemName);
}



function startsMetal(itemName) {
  for (temp.metal : getMetals()) {
    if (itemName.starts(metal)) {
      return true;
    }
  }
  return false;
}

function endsManifest(itemName) {
  for (temp.manifest : getManifests()) {
    if (itemName.pos(manifest) > -1) {
      return true;
    }
  }
  return false;
}

function Synthesize.onAction() {
  if (Manifests_List.getSelectedId() == 1) {
    temp.manifest = Manifests_List.rows[Manifests_List.getSelectedRow()].item;
    temp.type = Armor_Type_Dropdown.text.lower();
    triggeraction(this.x, this.y, "MakeArmor", manifest, type);
  }
}

function Manifests_List.onSelect() {
  if (Manifests_List.getSelectedId() == 1) {
    temp.manifest = Manifests_List.rows[Manifests_List.getSelectedRow()].item;
    temp.type = Armor_Type_Dropdown.text.lower();
    triggeraction(this.x, this.y, "SelectManifest", manifest, type);
  }  
}

function onActionLoadPreview(plain, acc) {
  if (player.account == acc) {
    Preview_Label.text = plain == null ? "Not yet supported. Select a stronger manifest" : plain;
  }
}

function onActionCreated(manifest, acc) {
  if (player.account == acc) {
    populateManifests();
  }
}

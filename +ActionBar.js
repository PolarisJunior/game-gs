
//#CLIENTSIDE

const BOX_WIDTH = 32;
const BOX_HEIGHT = 32;
const NUM_ICONS = 12;
const SPACING = 5;

// the action bar's offset from the bottom of the screen
const BAR_OFFSET_Y = 100;

function onCreated() {
  join("n_lists");
  onTimeout();
}



public function enableActionBar() {
  client.action_bar_enabled = true;
  onTimeout();
}

public function disableActionBar() {
  client.action_bar_enabled = false;
}

function displayActionBar() {
  temp.dummyIcon = findWeapon("+SkillMenu").GetSkillIcon(clientr.skills[0]);

  temp.iconWidth = getimgwidth(dummyIcon);
  temp.iconHeight = getimgheight(dummyIcon);

  temp.barStartX = getBarOffsetFromCenter(iconWidth, SPACING,
                                          NUM_ICONS, screenwidth/2);
  temp.mouseInIcon = false;
  for (temp.i = 0; i < NUM_ICONS; i++) {
    temp.skill = getWatchedSkillName(i);

    temp.icon = findWeapon("+SkillMenu").GetSkillIcon("$"@skill);
    temp.iconX = barStartX + iconWidth*i + SPACING*i;
    temp.iconY = screenheight - BAR_OFFSET_Y;

    temp.mouseInThisIcon = false;
    if (!mouseInIcon) {
      if ((mousescreenx in |iconX, iconX+iconWidth|) &&
          (mousescreeny in |iconY, iconY+iconHeight|)) {
        mouseInThisIcon = true;
      }
    }

    // cooldown meter
    temp.watched = getWatchedCd(i);
    if (watched != null && watched != "") {
      temp.currCooldown = getCooldownTimeLeft(watched);
      temp.percentLeft = currCooldown/this.(@"maxCd_"@i);

      with (drawRectangle(iconX, iconY+iconHeight*(1-percentLeft),
                          iconWidth, iconHeight*(percentLeft),
                          300+i)) {
        layer = 7;
        alpha = .5;
        red = .6;
        green = .6;
        blue = .6;
        if (mouseInThisIcon)
          y -= 5;
          
      }
    }

    with (findimg(200+i)) {
      x = iconX;
      y = iconY;
      width = iconWidth;
      height = iconHeight;
      image = icon;
      layer = 4;
      if (mouseInThisIcon)
        y -= 5;

    }

    // key label
    if (skill != null) {
      temp.labelText = getCellLabel(i);
      showtext(400+i, iconX, iconY+iconHeight, "Arial", "b", labelText);
      with (findimg(400+i)) {
        layer = 6;
        zoom = .5;
      }      
    }

  }
}

function onMouseDown(mousevalue) {
  if (mousevalue != "left")
    return;

  temp.dummyIcon = findWeapon("+SkillMenu").GetSkillIcon(clientr.skills[0]);
  temp.iconWidth = getimgwidth(dummyIcon);
  temp.iconHeight = getimgheight(dummyIcon);
  temp.barStartX = getBarOffsetFromCenter(iconWidth, SPACING,
                                          NUM_ICONS, screenwidth/2);
  for (temp.i = 0; i < NUM_ICONS; i++) {
    temp.iconX = barStartX + iconWidth*i + SPACING*i;
    temp.iconY = screenheight - BAR_OFFSET_Y;
    if ((mousescreenx in |iconX, iconX+iconWidth|) &&
        (mousescreeny in |iconY, iconY+iconHeight|)) {
      temp.skill = getWatchedSkillName(i);
      findWeapon("+SpellControl").onCastSpell("$"@skill, null, null);
      return;
    }
  }
}

function getTotalWidth(cellWidth, spacing, numIcons) {
  return cellWidth*numIcons+spacing*(numIcons-1)
}

function getBarOffsetFromCenter(cellWidth, spacing, numIcons, centerX) {
  temp.barWidth = getTotalWidth(cellWidth, spacing, numIcons);
  return centerX-(barWidth/2);
}

function drawRectangle(start_x, start_y, width, height, id) {
  return showpoly(id, {start_x, start_y,
                       start_x, start_y + height,
                       start_x + width, start_y + height,
                       start_x + width, start_y});
}

function getCooldownTimeLeft(skill) {
  return max(0, findWeapon("+Cooldowns").getCooldownTimeLeft(skill));
}

function onTimeout() {
  if (client.action_bar_enabled) {
    updateLastCooldowns();
    displayActionBar();
    setTimer(0.05);    
  } else {
    hideimgs(200, 200+NUM_ICONS);
    hideimgs(300, 300+NUM_ICONS);
    hideimgs(400, 400+NUM_ICONS);
  }
}

function setWatchedCd(cellIndex, watched, skillName, label) {
  temp.slot = clientr.character.slot;
  watched = watched.lower();
  client.actionBar.(@"slot_"@slot).(@"watcher_"@cellIndex) = watched;
  client.actionBar.(@"slot_"@slot).(@"watcher_"@cellIndex).skill = skillName;
  client.actionBar.(@"slot_"@slot).(@"watcher_"@cellIndex).label = label;
}

function getWatchedCd(cellIndex) {
  temp.slot = clientr.character.slot;
  return client.actionBar.(@"slot_"@slot).(@"watcher_"@cellIndex);
}

function getWatchedSkillName(cellIndex) {
  temp.slot = clientr.character.slot;
  return client.actionBar.(@"slot_"@slot).(@"watcher_"@cellIndex).skill;
}

function getCellLabel(cellIndex) {
  temp.slot = clientr.character.slot;
  return client.actionBar.(@"slot_"@slot).(@"watcher_"@cellIndex).label;
}


// this.lastCd_(*idx)
// this.maxCd_(*idx) = default to 1
function updateLastCooldowns() {
  for (temp.i = 0; i < NUM_ICONS; i++) {
    temp.currentCooldown = getCooldownTimeLeft(getWatchedCd(i));
    // client.temp_addmessages.add(this.(@"lastCd_"@i) SPC this.(@"maxCd_"@i) SPC getWatchedCd(i));
    if (this.(@"lastCd_"@i) == 0 && currentCooldown != 0) {
      this.(@"maxCd_"@i) = currentCooldown;
    }
    this.(@"lastCd_"@i) = currentCooldown;

  }

}


public function openActionBarSettings() {
  if (Ab_Settings_Window != null) {
    Ab_Settings_Window.destroy();
  }
  temp.spacing = 25;
  new GuiWindowCtrl(Ab_Settings_Window) {
    profile = ZodiacWindowProfile2;
    width = 200;
    height = 220;
    x = (screenwidth-width)/2;
    y = (screenheight-height)/2;
    canmove = true;
    canresize = false;
    canmaximize = false;
    canminimize = false;
    canclose = true;
    visible = true;
    text = "Action Bar";
    new GuiTextCtrl(Skills_Label) {
      profile = ZodiacTextProfile;
      width = Ab_Settings_Window.width-spacing*2;
      height = 20;
      x = spacing;
      y = spacing;
      text = "Skill: ";
    }
    new GuiPopUpMenuCtrl(Skills_Dropdown) {
      profile = GuiBluePopUpMenuProfile;
      textprofile = GuiBlueTextListProfile;
      scrollprofile = GuiBlueScrollProfile;
      width = Ab_Settings_Window.width-spacing*2;
      height = 20;
      x = spacing;
      y = Skills_Label.y + Skills_Label.height;
      clearrows();
      for (temp.skill : clientr.skills) {
        addrow(1, skill.substring(1));
      }
      setselectedrow(0);
    }
    new GuiTextCtrl(Cells_Label) {
      profile = ZodiacTextProfile;
      width = Ab_Settings_Window.width-spacing*2;
      height = 20;
      x = spacing;
      y = Skills_Dropdown.y + Skills_Dropdown.height;
      text = "Icon #: ";
    }
    new GuiPopUpMenuCtrl(Cells_Dropdown) {
      profile = GuiBluePopUpMenuProfile;
      textprofile = GuiBlueTextListProfile;
      scrollprofile = GuiBlueScrollProfile;
      width = Ab_Settings_Window.width-spacing*2;
      height = 20;
      x = spacing;
      y = Cells_Label.y+Cells_Label.height;
      clearrows();
      for (temp.i = 1; i <= NUM_ICONS; i++) {
        addrow(1, i);
      }
      setselectedrow(0);
    }
    new GuiTextCtrl(Watched_Label) {
      profile = ZodiacTextProfile;
      width = Ab_Settings_Window.width-spacing*2;
      height = 20;
      x = spacing;
      y = Cells_Dropdown.y + Cells_Dropdown.height;
      text = "Cooldown tag: ";
    }
    new GuiTextEditCtrl(Watched_Edit) {
      profile = ZodiacTextEditProfile;
      width = Ab_Settings_Window.width-spacing*2;
      height = 25;
      x = spacing;
      y = Watched_Label.y + Watched_Label.height;
    }
    new GuiTextCtrl(Icon_Label_Label) {
      profile = ZodiacTextProfile;
      width = Ab_Settings_Window.width-spacing*2;
      height = 20;
      x = spacing;
      y = Watched_Edit.y + Watched_Edit.height;
      text = "Key Label: ";
    }
    new GuiTextEditCtrl(Icon_Label_Edit) {
      profile = ZodiacTextEditProfile;
      width = Ab_Settings_Window.width-spacing*2;
      height = 25;
      x = spacing;
      y = Icon_Label_Label.y + Icon_Label_Label.height;
    }
    new GuiButtonCtrl(Apply_Changes_Btn) {
      profile = ZodiacButtonProfile;
      width = (Ab_Settings_Window.width-spacing*2)/2;
      height = 20;
      x = (Ab_Settings_Window.width-width)/2;
      y = Ab_Settings_Window.height - height-10;
      text = "Add";
    }
    
  }
}

public function openWithSkill(skill) {
  openActionBarSettings();
  Skills_Dropdown.setselectedrow(Skills_Dropdown.findtext(skill));
}


function Apply_Changes_Btn.onAction() {
  temp.idx = Cells_Dropdown.text - 1;
  temp.skill = Skills_Dropdown.text;
  temp.watched = Watched_Edit.text;
  if (watched == null || watched == "")
    watched = skill;
  temp.label = Icon_Label_Edit.text;
  setWatchedCd(idx, watched, skill, label);
  Ab_Settings_Window.destroy();
}


function onActionServerSide(cmd) {
  switch (cmd) {
  case "buy":
    temp.product = params[1];
    temp.purchaseQty = params[2];
    for (temp.n : npcs) {
      if ("n_component_shop" in n.joinedclasses && product in n.shopItems) {
        n.onPurchaseTransaction(product, purchaseQty);
      }
    }
    break;
  }

}
//#CLIENTSIDE

function onCreated() {
  join("mudfunctions");
}

function onActionClientside() {
  switch (params[0]) {
  case "openshop":
    OpenShop(params[1], params[2]);
    break;
  }
}

function ShowShop() {
  UpdateProfiles();
  if (CTFShopWindow.visible) this.lastselected = CTFShopList.getselectedrow();
  if (CTFShopWindow != NULL) CTFShopWindow.destroy();
  if (CTFShopSellWindow != NULL) CTFShopSellWindow.destroy();
  new GuiBitmapBorderCtrl(CTFShopWindow) {
    profile = "ZodiacBorderProfile";
    temp.iw = 32;
    width = 315 + temp.iw;
    height = 178;
    x = (screenwidth - width) / 2;
    y = (screenheight - height) / 2;
    canresize = canminimize = canmaximize = canclose = false;
    canmove = true;
    this.ctfwindow = true;
    
    new GuiScrollCtrl(CTFShopScroll) {
      profile = "ZodiacScrollProfile";
      x = 6;
      y = 6;
      width = 220 + temp.iw;
      height = 136;
      vScrollBar = "dynamic";
      hScrollBar = "alwaysOff";
      new GuiTextListCtrl(CTFShopList) {
        profile = "ZodiacListProfile";
        columns = "0 180";
        x = 0;
        y = 0;
        width = 300;
        height = 136;
      }
    }
    new GuiShowImgCtrl(CTFShopItemIcon) {
      image = "";
      x = 6 + 250 + 6 + temp.iw;
      y = 10;
    }
    new GuiTextCtrl(CTFShopTextPower) {
      profile = "ZodiacTextProfile";
      profile.align = "center";
      x = 6 + 220 + 6 + temp.iw;
      y = 50;
      width = 72;
      height = 20;
    }
    new GuiButtonCtrl(CTFShopButtonClose) {
      profile = "ZodiacButtonProfile";
      x = 210 - 10 - 50 + temp.iw;
      y = 144;
      width = 60;
      height = 28;
      text = "Close";
    }
    new GuiButtonCtrl(CTFShopButtonBuy2) {
      profile = "ZodiacButtonProfile";
      x = 210 - 10 - 38 - 77 - 80;
      y = 144;
      width = 60;
      height = 28;
      text = "Buy";
    }
    new GuiTextEditCtrl(Quantity_Edit) {
      profile = ZodiacTextEditProfile;
      useownprofile = true;
      x = 210 - 10 - 38 - 77 - 80 + 65;
      y = 144;
      width = 108;
      height = 28;
      text = 1;
      profile.numbersonly = true;
    }
  }
  for (s = 0; s < this.CTFShopitems.size()/3; s++) {
    //if (clientr.("item-" @ this.CTFShopitems[s*3])[0] != NULL && this.CTFShopitems[s*3] != "Mysterious Flag Key") continue;
    CTFShopList.addrow(0,this.CTFShopitems[s*3] @ "\t" @ this.CTFShopitems[s*3+2]);
  }
  
  CTFShopList.setselectedrow((this.lastselected > 0) ? this.lastselected : 0);
}

public function OpenShop(items, itemvar) {
  if (this.CTFShopopen) return;
  this.currency = (itemvar ? itemvar : "clientr.ctfpoints");
  this.currency_type = (itemvar ? getCurrType(itemvar) : "CTF Points");
  this.CTFShopmode = "buy";
  this.CTFShopitems = items;
  this.CTFShopopen = true;
  ShowShop();
}

function getCurrType(ivar) {
  if (ivar == "clientr.ctfpoints") {
    return "CTF Points";
  }
  if (ivar == "clientr.ecpoints") {
    return "Event Points";
  }  
  return ivar.starts("clientr.item-") ? ivar.substring("clientr.item-".length()) : ivar;
}

function getCurrQty(ivar) {
  temp.val = makevar(ivar);
  return (ivar.starts("clientr.item-") ? temp.val[0] : temp.val);
} 

function ceil(val) {
  if (val.pos(".") >= 0) val = int(val)+1;
  return val;
}

function CTFShopButtonBuy2.onAction() {
  temp.qitem = CTFShopList.getselectedtext().substring(0,CTFShopList.getselectedtext().pos("\t"));
  temp.amount = getCurrQty(this.currency);
  temp.purchaseQty = Quantity_Edit.text;

  if (purchaseQty < 1 || purchaseQty > 100000000) {
    client.temp_addmessages.add("Please enter a valid purchase quantity");
    return;
  }

  triggerserver("weapon", name, "buy", temp.qitem, purchaseQty);
}


function CTFShopList.onSelect() {
  if (!this.CTFShopopen) return;
  temp.item = CTFShopList.getselectedtext().substring(0,CTFShopList.getselectedtext().pos("\t"));
  temp.etype = etype(temp.item);
  CTFShopItemIcon.image = eicon(temp.item);
  CTFShopItemIcon.x = (42 + 243 - getimgwidth(CTFShopItemIcon.image)/2);
  CTFShopItemIcon.y = (30 - getimgheight(CTFShopItemIcon.image)/2);
  if (temp.etype == "armor") {
    CTFShopTextPower.text = "Defense:" SPC emax(CTFShopList.getselectedtext().substring(0,CTFShopList.getselectedtext().pos("\t")));
    if (emax(temp.item) <= 0) {
      CTFShopTextPower.text = "";
    }
  } else if (temp.etype == "weapon") {
    CTFShopTextPower.text = "Power:" SPC emax(temp.item);
    if (emax(temp.item) <= 0) CTFShopTextPower.text = "";
  } 
  else CTFShopTextPower.text = "";
}

function CTFShopList.onDblClick() {
  findweapon("+Inventory").onShowItemStats(CTFShopList.getselectedtext().substring(0,CTFShopList.getselectedtext().pos("\t")));
}

function CTFShopList.onRightMouseDown() {
  temp.growid = CTFShopList.getrowatpoint(mousescreenx,mousescreeny);
  CTFShopList.setselectedrow(temp.growid);
  findweapon("+Inventory").onShowItemStats(CTFShopList.getselectedtext().substring(0,CTFShopList.getselectedtext().pos("\t")));
}

function CTFShopButtonClose.onAction() {
  this.CTFShopopen = false;
  CTFShopWindow.destroy();
}

function onPlayerEnters() {
  if (this.CTFShopopen) this.CTFShopopen = false;
  if (CTFShopWindow.visible) CTFShopWindow.destroy();
} 


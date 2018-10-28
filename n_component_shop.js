/*

set this.shopItems of the form
{product, arc, price...}
additionally set
this.shopPurchaseMode, this.shopCurrencyMode, this.shopCurrency

overridable functions
giveProduct(): used to define custom purchase for things that are not 
standard items
canPurchase(product): determines whether the product can be purchased


TODO
Support non-homogeneous currency

support purchasing things that aren't items

TODO add purchasing multiple items
TODO add multiple currency types
TODO add currency aliases
*/

/*
Determines how the shopCurrency is interpreted
*/
enum ShopCurrencyMode {
  CLIENTR_FLAG = 1,
  ITEM  
}

/*
Either purchase items
or a custom defined commodity
*/
enum ShopPurchaseMode {
  ITEM = 1,
  CUSTOM
}

/*
  Defaults to trading Trade coins for items
*/
enum Defaults {
  SHOP_CURRENCY_MODE = ShopCurrencyMode.ITEM,
  SHOP_PURCHASE_MODE = ShopPurchaseMode.ITEM,
  SHOP_CURRENCY = "Trade Coin"
}

function onCreated() {
  this.shopCurrencyMode = this.shopCurrencyMode == null ? Defaults.SHOP_CURRENCY_MODE : this.shopMode;
  this.shopPurchaseMode = this.shopPurchaseMode == null ? Defaults.SHOP_PURCHASE_MODE : this.shopPurchaseMode;
  this.shopCurrency = this.shopCurrency == null ? Defaults.SHOP_CURRENCY : this.shopCurrency;

}

function onPlayerEnters() {
  player.AddWeapon("+UniversalShop");
}

function getCurrQty() {
  switch (this.shopCurrencyMode) {
  case ShopCurrencyMode.ITEM:
    return clientr.(@"item-"@this.shopCurrency)[0];
    break;
  case ShopCurrencyMode.CLIENTR_FLAG:
    return makevar(this.shopCurrency);
    break;
  }
  return 0;
}

public function onPurchaseTransaction(product, purchaseQty) {
  purchaseQty = int(purchaseQty);
  if (purchaseQty < 1 || purchaseQty > 100000000) {
    client.temp_addmessages.add("Please enter a valid purchase quantity");
    return;
  }

  temp.currencyQty = getCurrQty();
  temp.idx = this.shopItems.index(product);
  temp.price = this.shopItems[ind+2];

  if (price <= 0 || idx == -1) {
    echo(format("[Shop Alert] %s attempted to buy %s but it's not in the shop"),
         player.account, product);
    return;
  }
  if (currencyQty < price*purchaseQty) {
    client.temp_addmessages.add(format("You only have %d!", currencyQty));
    return;
  }

  if (!canPurchase(product, purchaseQty)) {
    return;
  }

  temp.success = takeCurrency(price, purchaseQty);
  if (!success) {
    client.temp_addmessages.add("Failed to purchase. Not enough currency.");
    return;
  }
  // currency has been taken
  giveProduct(product, purchaseQty);
  savelog2("npcshops/npcshops.txt", format("%s purchased %d %s for %d %s", player.account, purchaseQty,
                                           product, price*purchaseQty, this.shopCurrency));
}

function takeCurrency(price, purchaseQty) {
  temp.actualPrice = price*purchaseQty;
  switch (this.shopCurrencyMode) {
  case ShopCurrencyMode.ITEM:
    if (!player.HasItem(this.shopCurrency, actualPrice)) {
      return false;
    } 
    player.TakeItem(this.shopCurrency, actualPrice);
    return true;
    break;
  case ShopCurrencyMode.CLIENTR_FLAG:
    if (makevar(this.shopCurrency) < actualPrice) {
      return false;
    }
    makevar(this.shopCurrency) -= actualPrice;
    return true;
    break;
  }
  return false;
}

function canPurchase(product, purchaseQty) {
  return true;
}

function giveProduct(product, purchaseQty) {
  giveItem(product, purchaseQty);
}

function giveItem(item, purchaseQty) {
  temp.arc = this.shopItems[this.shopItems.index(item)+1];
  player.AddItem(item, arc, purchaseQty, true, false, format("Universal Shop: %s", player.level.name));
}

function onActionOpenShop() {
  for (temp.updates = 0; temp.updates < this.shopItems.size()/3; temp.updates++) {
    player.MUDLoadItem(this.shopItems[temp.updates*3],this.shopItems[temp.updates*3+1],"player");
    if (clientr.("item-" @ this.shopItems[temp.updates*3])[0] == -1)
      clientr.("item-" @ this.shopItems[temp.updates*3])[0] = 1;
  }

  triggerclient("weapon", "+UniversalShop", "openshop",
                this.shopItems, this.shopCurrency);
}


//#CLIENTSIDE

/*
popArea = {x, y, width, height}
boolean inArea: keep track of whether the player is in the area or not
so we dont open the shop multiple times

TODO proper poparea support
*/

enum ShopFlags {
  TOUCH = 1,
  CLICK = 2,
  POP = 4
}

enum Defaults {
  FLAGS = ShopFlags.TOUCH | ShopFlags.CLICK
}

function onCreated() {
  this.shopFlags = this.shopFlags == null ? Defaults.FLAGS : this.shopFlags;
  if ((this.shopFlags & ShopFlags.POP) == ShopFlags.POP) {
    this.inArea = false;
    setTimer(.05);
  }

}

function openShop() {
  triggerAction(this.x+1.5, this.y+1.5, "OpenShop");
}

function onPlayerTouchsMe() {
  if ((this.shopFlags & ShopFlags.TOUCH) == ShopFlags.TOUCH) {
    openShop();
  }
}

function onActionLeftMouse() {
  if ((this.shopFlags & ShopFlags.CLICK) == ShopFlags.CLICK) {
    openShop();
  }
}

function onTimeout() {
  if ((player.x in |this.popArea[0], this.popArea[0]+this.popArea[2]|) &&
      (player.y in |this.popArea[1], this.popArea[1]+this.popArea[3]|)) {
    if (!this.inArea) {
      // entered the area for the first time open shop
      this.inArea = true;
      openShop();
    }
  } else {
    // not in the area
    this.inArea = false;
  }

  setTimer(0.05);
}

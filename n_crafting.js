
/*
REQUIRED properties
this.getRecipeFunc
this.recipeType
this.professionType


overridable functions
getSuccessChance(recipe)
getEXPGain

TODO
getLevelNeeded in n_recipe needs to be changeable
*/

function onActionServerSide(cmd) {
  switch (cmd) {
  case "load_recipes":
    temp.n = findNPC("Recipes");
    temp.recipes = n.(@this.getRecipeFunc)();

    temp.recipesArr = new[0];
    for (temp.recipe : recipes) {
      recipesArr.add(recipe.savevarstoarray(false));
    }
    triggerClient("weapon", this.name, "recipes_loaded", recipesArr, params[1]);
    break;
  case "begin":
    if (timevar2 < clientr.processing_until) {
      sendMsg("You are already working");
    } else {
      temp.unsafeRecipe = new TStaticVar();
      unsafeRecipe.loadvarsfromarray(params[1]);
      temp.recipe = findNPC("Recipes").getRecipeById(unsafeRecipe.id,
                                                     this.recipeType);
      beginRecipe(recipe, params[2]);
    }
    break;
  }
}

function beginRecipe(recipe, n) {
  temp.lvlNeeded = car(getLevelNeeded(recipe));
  if (player.getProfessionLevel(this.professionType) < lvlNeeded) {
    sendMsg(format("You need a %s level of %d for this", this.professionType,
                   lvlNeeded));
  } else if (!hasItems(recipe.input)) {
    sendMsg("You do not have the required items");
  } else {
    temp.delay = getDelay(recipe);
    triggerClient("weapon", this.name, "start", delay);
    // to prevent spam smelting
    clientr.processing_until = timevar2 + delay;
    scheduleevent(delay, "FinishRecipe", recipe, n);
  }  
}

function onFinishRecipe(recipe, n) {
  if (hasItems(recipe.input)) {
    for (temp.pair : recipe.input) {
      player.TakeItem(cdr(pair), car(pair));
    }
    if (random(0, 1) <= getSuccessChance(recipe)) {
      for (temp.pair : recipe.output) {
        temp.arc = findNPC("Archetype Catalog").getArcFromName(cdr(pair));
        player.AddItem(cdr(pair), arc, car(pair), true, false,
                       "Made via" SPC this.recipeType);
      }
      temp.expGain = getEXPGain(recipe);
      if (expGain > 1000) {
        echo("%s got %d exp crafting %s at level %d", player.account,
             expGain, recipe.output, getProfessionLevel(this.professionType));
      } else {
        player.addProfessionExp(this.professionType, getEXPGain(recipe));                 }
    } else {
      sendMsg(format("Your low %s level caused you to fail and lose your materials", this.professionType));
    }
  }
  triggerClient("weapon", this.name, "finish",
                recipe.savevarstoarray(false), n); 
  
}

function hasItems(pairs) {
  for (temp.pair : pairs) {
    if (!player.HasItem(cdr(pair), car(pair))) {
      return false;
    }    
  }
  return true;
}

function getSuccessChance(recipe) {
  return 1;
}

/*
  Returns the EXP gained
*/
function getEXPGain(recipe) {
  temp.base = getBaseExp(recipe);
  temp.mult = base/7;
  temp.lvlNeeded = car(getLevelNeeded(recipe));
  temp.dif = player.getProfessionLevel(this.professionType) - lvlNeeded;
  temp.exp = base - mult*dif;
  return int(random(0.95, 1.05)*exp);
}

function sendMsg(msg) {
  player.sendMessage(format("[%s] %s", this.recipeType, msg));
}

//#CLIENTSIDE

/*
REQUIRED properties
this.window_name
this.button_text

*/

function onCreated() {
  join("n_generic_crafting_gui");
}

function onActionClientSide(cmd) {
  switch (cmd) {
  case "recipes_loaded":
    this.recipes = new[0];
    for (temp.data : params[1]) {
      temp.recipe = new TStaticVar();
      recipe.loadvarsfromarray(data);
      this.recipes.add(recipe);
    }
    // callback
    (@params[2])();
    break;
  case "start":
    join("n_progress_bar");
    temp.delay = params[1];
    freezeplayer(delay);
    beginProgress(delay);
    //    Recipe_GUI.destroy();
    Recipe_GUI.hide();
    break;
  case "finish":
    temp.n = params[2]-1;
    if (n > 0) {
      triggerServer("weapon", this.name, "begin", params[1], n);
    } else {
      //openRecipeGUI();
      Recipe_GUI.show();
    }
    break;
  }
}

function loadRecipes() {
  triggerServer("weapon", this.name, "load_recipes", "populateRecipesList");
}

function populateRecipesList() {
  with (Recipe_Tree) {
    clearnodes();
    for (temp.recipe : thiso.recipes) {

      temp.parentStr = "";
      for (temp.pair : recipe.output) {
        parentStr @= car(pair) SPC cdr(pair) @ " ";
      }
      parentStr = parentStr.trim();
      temp.section = getMatchingMisc(recipe, "section", "");
      if (section == "" || section == null)
        section = "Misc";
      if (getnodebypath(section, "/") == null) {
        temp.sectionNode = addnodebypath(section, "/");
//        sectionNode.expanded = false;
      }
      temp.node = addnodebypath(section@"/"@parentStr, "/");
      node.recipe = recipe;
      node.expanded = false;

      with (node) {
        for (temp.pair : recipe.input) {
          temp.child = addnodebypath(format("%d %s",
                                            car(pair), cdr(pair)), "/");
          child.image = child.expandedselectedimage = child.save = 2;
          child.recipe = recipe;
        }
      }
    }
    
  }
}

function onBegin() {
  temp.recipe = Recipe_Tree.getselectednode().recipe;
  if (recipe != null) {
    temp.o = recipe.savevarstoarray(false);
    triggerServer("weapon", this.name, "begin", o);
  }
}

function onBeginMultiple() {
  temp.recipe = Recipe_Tree.getselectednode().recipe;
  beginRecipe(recipe, 10);
}

function beginRecipe(recipe, n) {
  if (recipe != null) {
    temp.o = recipe.savevarstoarray(false);
    triggerServer("weapon", this.name, "begin", o, n);
  }
}

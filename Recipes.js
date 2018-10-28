
/*

todo
add item classes for crafting things that involve similar
items
*/

//recipe objects
//recipe requirements in other files

// this.recipe list of recipe objects

function onCreated() {
  join("n_lists");
  loadAllRecipes();
  // for (temp.recipe : this.recipes.forging) {
  // }
  this.metals = {"Copper", "Tin", "Iron", "Silver",
                 "Bronze", "Gold", "Electrum", "Steel",
                 "Platinum", "Mithril", "Obsidian"};
  temp.m = 3;
  for (temp.i = 25; i <= 55; i += 5) {
    this.metalsArmorTier.(@this.metals[m].lower())  = @i;
    m++;
  }
  this.metalsArmorTier.mithril = "55";
  this.metalsArmorTier.obsidian = "HAL";
  this.metalsArmorTier.adamantium = "62";

  //echo(filterArmorListByType(armorListFromMetal("obsidian"), "leather"));
}

public function loadAllRecipes() {
  this.idCounter = 0;
  this.recipes.smelting = loadSmeltingRecipes();
  this.recipes.forging = loadForgingRecipes();
  this.recipes.crafting = loadCraftingRecipes();  
}

public function getSmeltingRecipes() {
  return this.recipes.smelting;
}

public function getForgingRecipes() {
  return this.recipes.forging;
}

public function getCraftingRecipes() {
  return this.recipes.crafting;
}

public function getRecipeById(id, type) {
  temp.recipes = makevar("this.recipes."@(type.lower()));
  for (temp.recipe : recipes) {
    if (recipe.id == id) {
      return recipe;
    }
  }
  return null;
}


function loadSmeltingRecipes() {
  return loadRecipesWithoutConversion(SMELTERY_RECIPES_FILE);
}

function loadForgingRecipes() {
  return loadRecipesWithoutConversion(FORGING_RECIPES_FILE);
}

function loadCraftingRecipes() {
  return loadRecipesWithoutConversion(CRAFTING_RECIPES_FILE);
}


function loadRecipes(path) {
  temp.lines = new[0];
  temp.recipes = new[0];
  lines.loadlines(path);
  temp.i = 0;

  while (temp.i < lines.size()) {
    temp.outputs = new[0];
    temp.inputs = new[0];
    temp.misc = new[0];
    i = findPrefixedLine(lines, "output", i);
    outputs = convertArcs(parseRecipeLine(lines[i]));
    
    i = findPrefixedLine(lines, "input", i);
    inputs = convertArcs(parseRecipeLine(lines[i]));

    i = findPrefixedLine(lines, "misc", i);
    misc = parseRecipeLine(lines[i]);

    recipes.add(makeRecipe(inputs, outputs, misc));
    i++;
  }

  return recipes;
}

/*
  Like loadRecipes but does not convert from arc
  to itemname, new recipes should use this instead
*/
function loadRecipesWithoutConversion(path) {
  temp.lines = new[0];
  temp.recipes = new[0];
  lines.loadlines(path);
  temp.i = 0;
  while (temp.i < lines.size()) {
    temp.outputs = new[0];
    temp.inputs = new[0];
    temp.misc = new[0];
    i = findPrefixedLine(lines, "output", i);
    outputs = parseRecipeLine(lines[i]);
    
    i = findPrefixedLine(lines, "input", i);
    inputs = parseRecipeLine(lines[i]);

    i = findPrefixedLine(lines, "misc", i);
    misc = parseRecipeLine(lines[i]);

    recipes.add(makeRecipe(inputs, outputs, misc));
    i++;
  }

  return recipes;  
}

/*
  Easier to use item names than arcs
  so converts tuples of (#, arc) 
  to a tuple with the item name
*/
function convertArcs(pairs) {
  temp.ret = new[0];
  for (temp.pair : pairs) {
    temp.wname = findNPC("Archetype Catalog").getNameFromArc(cdr(pair));
    ret.add(cons(car(pair), wname));
  }

  return ret;
}

/*
  Finds the next line in lines prefixed with
  prefix. Starts searching from index (inclusive)
  returns index of the line
*/
function findPrefixedLine(lines, prefix, index) {
  while (!lines[index].starts(prefix) && index < lines.size()) {
    index++;
  }
  return index;
}

function parseRecipeLine(line) {
  temp.parsed = new[0];
  line = line.tokenize("=")[1];
  temp.numWithMats = line.tokenize(",");
  for (temp.numWithMat : numWithMats) {
    temp.toks = numWithMat.tokenize(" ");
    // fix for items with spaces, treat
    // first tok as qty and the rest as one str
    temp.component = "";
    for (temp.i = 1; i < toks.size(); i++) {
      component = component SPC toks[i];
    }

    parsed.add(cons(toks[0], component.trim()));
  }
  return parsed;
}


/*
  Recipe object
  input
  output
  requirements (or meta data)
*/
function makeRecipe(input, output, misc) {
  temp.v = new TStaticVar();
  v.input = input;
  v.output = output;
  v.misc = misc;
  v.id = this.idCounter;
  this.idCounter++;
  return v;
}

public function armorListFromMetal(metal) {
  temp.tier = this.metalsArmorTier.(@metal);
  temp.armorList = findNPC("Archetype Generator").(@"armorlist_"@tier);
  return armorList;
}

public function filterArmorListByType(armorList, type) {
  temp.filtered = new[0];
  for (temp.armor : armorList) {
    if (findNPC("Archetype Generator").(@"armor_"@armor)[1] == type) {
      filtered.add(armor);
    }
  }
  return filtered;
}

public function getMetalArmorTier(metal) {
  return this.metalsArmorTier.(@metal.lower());
}

public function slotFromPiece(piece) {
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

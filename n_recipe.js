/*
  For dealing with recipe objects
*/


/*
  delay: amount of delay to forge
  exp: base exp gained
  lvl: level requirement
*/

function getDelay(recipe) {
  return getMatchingMisc(recipe, "delay", 5);
}

function getLevelNeeded(recipe) {
  return getMatchingMiscPair(recipe, "lvl", 0);
}

function getBaseExp(recipe) {
  return getMatchingMisc(recipe, "exp", 0);
}

/*
  returns car(pair) whwere cdr(pair) matches
  match, if none exists returns
  d as a default
*/
function getMatchingMisc(recipe, match, d) {
  return car(getMatchingMiscPair(recipe, match.lower(), d));
}

/*
  returns pair whwere cdr(pair) matches
  match, if none exists returns
  d as a default
*/
function getMatchingMiscPair(recipe, match, d) {
  for (temp.pair : recipe.misc) {
    if (cdr(pair) == match) {
      return pair;
    }
  }
  return d;  
}

//#CLIENTSIDE

/*
  For dealing with recipe objects
*/


/*
  delay: amount of delay to forge
  exp: base exp gained
  lvl: level requirement
*/

function getDelay(recipe) {
  return getMatchingMisc(recipe, "delay", 5);
}

function getLevelNeeded(recipe) {
  return getMatchingMiscPair(recipe, "lvl", 0);
}

function getBaseExp(recipe) {
  return getMatchingMisc(recipe, "exp", 0);
}

/*
  returns car(pair) whwere cdr(pair) matches
  match, if none exists returns
  d as a default
*/
function getMatchingMisc(recipe, match, d) {
  return car(getMatchingMiscPair(recipe, match.lower(), d));
}

/*
  returns pair whwere cdr(pair) matches
  match, if none exists returns
  d as a default
*/
function getMatchingMiscPair(recipe, match, d) {
  for (temp.pair : recipe.misc) {
    if (cdr(pair) == match) {
      return pair;
    }
  }
  return d;  
}

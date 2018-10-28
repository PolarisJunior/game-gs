//Serverside version is latest version, clientside may not always be up to date

function map(f, arr) {
  temp.newArr = new[0];
  for (temp.thing : arr) {
    newArr.add((@f)(thing));
  }
  return newArr;
}

function filter(f, arr) {
  temp.newArr = new[0];
  for (temp.thing : arr) {
    if ((@f)(thing)) {
      newArr.add(thing);
    }
  }
  return newArr;
}

function reduce(f, arr, value) {
  for (temp.thing : arr) {
    value = (@f)(value, thing);
  }
  return value;
}

function forEach(f, arr) {
  map(f, arr);
}

function apply(f, arr) {
  return (@f)(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5],
              arr[6], arr[7], arr[8], arr[9], arr[10]);
}

function some(f, arr) {
  for (temp.elem : arr) {
    temp.result = (@f)(elem);
    if (result) {
      return result;
    }
  }
  return false;
}

function takeWhile(f, arr) {
  temp.newArr = new[0];
  for (temp.elem : arr) {
    if (!(@f)(elem)) {
      return newArr;
    }
    newArr.add(elem);
  }
  return newArr;
}

function dropWhile(f, arr) {
  
}

function take(n, arr) {
  temp.newArr = new[0];
  for (temp.i = 0; i < n; i++) {
    newArr.add(arr[i]);
  }
  return newArr;
}

function drop(n, arr) {
  //todo
}

function fisherYates(arr) {
  for (temp.i = 0; i < arr.size(); i++) {
    temp.rnd = int(random(i, arr.size()));
    temp.randomed = arr[rnd];
    arr[rnd] = arr[i];
    arr[i] = randomed;
  }
  return arr;
}

/*
  Boolean Functions
*/



/*
  Regex
*/

function regexMatch() {
  
}

//#CLIENTSIDE

function map(f, arr) {
  temp.newArr = new[0];
  for (temp.thing : arr) {
    newArr.add((@f)(thing));
  }
  return newArr;
}

function filter(f, arr) {
  temp.newArr = new[0];
  for (temp.thing : arr) {
    if ((@f)(thing)) {
      newArr.add(thing);
    }
  }
  return newArr;
}

function reduce(f, arr, value) {
  for (temp.thing : arr) {
    value = (@f)(value, thing);
  }
  return value;
}

function forEach(f, arr) {
  map(f, arr);
}

function apply(f, arr) {
  return (@f)(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5],
              arr[6], arr[7], arr[8], arr[9], arr[10]);
}

function some(f, arr) {
  for (temp.elem : arr) {
    temp.result = (@f)(elem);
    if (result) {
      return result;
    }
  }
  return false;
}

function takeWhile(f, arr) {
  temp.newArr = new[0];
  for (temp.elem : arr) {
    if (!(@f)(elem)) {
      return newArr;
    }
    newArr.add(elem);
  }
  return newArr;
}

function dropWhile(f, arr) {
  
}

function take(n, arr) {
  temp.newArr = new[0];
  for (temp.i = 0; i < n; i++) {
    newArr.add(arr[i]);
  }
  return newArr;
}

function drop(n, arr) {
  //todo
}



/*
  Boolean Functions
*/



/*
  Regex
*/

function regexMatch() {
  
}

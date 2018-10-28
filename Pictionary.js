
enum {
  LINE,
  CLEAR
}

function onCreated() {
  const DRAW_TIME = 45;
  this.word_bank = new[0];
  this.word_bank.loadlines("personaluploads/Gr/Graal753610/wordlist.txt");
  
  this.debugging = false;

  cancelevents("ChooseNext");

}

function onActionServerSide(cmd, data) {
  switch (cmd) {
  case LINE:
    for (temp.p : gameLevel().players) {
      p.triggerClient("weapon", this.name, LINE, data);
    }
    break;
  case CLEAR:
    for (temp.p : gameLevel().players) {
      p.triggerClient("weapon", this.name, CLEAR);
    }
    break;
  case "start":
    player.sendMessage("Starting Pictionary...");
    this.drawers_left = new[0];
    for (temp.p : gameLevel().players) {
      this.drawers_left.add(p.account);
    }
    
    this.scores.clearvars();
    cancelevents("ChooseNext");
    onChooseNext();
    break;
  case "correct_guess":
    if (data.lower().starts(this.current_word.lower()) &&
        !(player.account in this.has_guessed) &&
        player.account != this.current_drawer) {
      this.scores.(@this.current_drawer) += 500;
      this.scores.(@player.account) += 500 + (this.is_first*500);
      this.is_first = false;
      this.has_guessed.add(player.account);
      temp.scores = new[0];
      for (temp.a : getstringkeys("this.scores.")) {
        scores.add(a);
        scores.add(this.scores.(@a));
      }
      for (temp.p : gameLevel().players) {
        p.triggerClient("weapon", this.name, "update_scores", scores);
      }

    }
    break;
  case "next":
    cancelevents("ChooseNext");
    onChooseNext();
    break;
  }
}

function onChooseNext() {
  if (this.drawers_left.size() > 0) {
    this.current_drawer = chooseDrawer();
    this.current_word = chooseWord();
    resetGuessState();
    for (temp.p : gameLevel().players) {
      p.triggerClient("weapon", this.name, "new_drawer",
                      this.current_drawer, this.current_word, this.scores);      
    }
    scheduleevent(DRAW_TIME, "ChooseNext");
  } else {
    this.scores.clearvars();
    for (temp.p : gameLevel().players) {
      p.triggerClient("weapon", this.name, "game_over");
    }
  }
}

function resetGuessState() {
  this.is_first = true;
  this.has_guessed = null;
}


function chooseDrawer() {
  temp.drawer = this.drawers_left[int(random(0, this.drawers_left.size()))];
  this.drawers_left.remove(drawer);
  return drawer;
}

function chooseWord() {
  debugMessage(this.word_bank.size());
  return this.word_bank[int(random(0, this.word_bank.size()))];
}

function gameLevel() {
  return findLevel("event_pictionary.nw");
}

function debugMessage(s) {
  if (this.debugging) {
    findPlayer("Graal753610").sendMessage(s); 
  }
}

//#CLIENTSIDE

enum {
  LINE,
  CLEAR
}

function onCreated() {
  const INITIAL_LINE_ID = 301;
  const INITIAL_SCORE_ID = 260;
  const BOARD_ID = 200;
  const ERASER_ID = 201;
  
  const RED_ID = 202;
  const GREEN_ID = 203;
  const BLUE_ID = 204;
  const YELLOW_ID = 205;
  const BLACK_ID = 206;

  const WORD_ID = 250;
  const TIMER_ID = 251;



  const BOARD_WIDTH = 800;
  const BOARD_HEIGHT = 600;

  const COLOR_WIDTH = 64;
  const COLOR_HEIGHT = 64;

  const DRAW_TIME = 45;

  this.debugging = false;
  
  this.board_id = BOARD_ID;
  this.line_count = 0;
    
  this.horizontal_bounds = {screenwidth/2-400,
                            screenwidth/2+400};
  this.vertical_bounds = {screenheight/2-300,
                          screenheight/2+300};
  this.eraser.start_x = this.horizontal_bounds[1];
  this.eraser.start_y = this.vertical_bounds[1] - 64;
  this.eraser.width = 64;
  this.eraser.height = 64;

  this.colors = {RED_ID, {1, 0, 0, 1},
                 GREEN_ID, {0, 1, 0, 1},
                 BLUE_ID, {0, 0, 1, 1},
                 YELLOW_ID, {1, 1, 0, 1},
                 BLACK_ID, {0, 0, 0, 1}};
  this.board_color = {0.8, 0.8, 0.8, 1};
}

function onActionClientSide(cmd, data) {
  debugMessage("CLIENTSIDE" SPC cmd);
  switch (cmd) {
  case LINE:
    //format {start_x, start_y, color}
    if (player.account != this.current_drawer && this.playing) {
      debugMessage("Received Line Data:" SPC data);
      temp.coords = relativeToAbsolute(data[0], data[1], data[2], data[3]);
      drawLine(coords[0], coords[1], coords[2], coords[3], getLineId(this.count), data[4]);
      this.count++;
    }
    break;
  case CLEAR:
    if (player.account != this.current_drawer) {
      debugMessage("Received: CLEAR LINES");
      clearLines();
    }
    break;
  case "new_drawer":
    this.current_drawer = data;
    this.current_word = params[2];
    this.scores = params[3];
    this.draw_time = DRAW_TIME;

    makeStateText();
    clearLines();
    joinPictionary();
    break;
  case "update_scores":
    debugMessage("SCORES: " @ data);
    this.scores = data;
    makeScores();
    break;
  case "game_over":
    this.current_word = null;
    this.current_drawer = null;
    makeDrawerText("Game Finished!");
    break;
  }
}

function onPlayerEnters() {
  leavePictionary();
}

function onPlayerChats() {
  if (this.playing && player.chat.lower().starts(this.current_word.lower()) &&
      player.account != this.current_drawer) {
    triggerServer("weapon", this.name, "correct_guess", player.chat);
    client.temp_addmessages.add("You guessed correctly!");
    player.chat = "";
  }
  if (player.chat.lower().starts("/pictionary") && this.current_word != null) {
    debugMessage("Pictionary:");
    if (this.playing) {
      leavePictionary();
      debugMessage("Leaving Pictionary");
    } else {
      joinPictionary();
      debugMessage("Joining Pictionary");
    }
    player.chat = "";
  } else if (player.chat.lower().starts("/startpictionary") &&
             (player.account == "Graal753610" || player.guild.lower().starts("event"))) {
    triggerServer("weapon", this.name, "start");
    player.chat = "";
  } else if (player.chat.lower().starts("/close pictionary")) {
    leavePictionary();
  } else if (player.chat.lower().starts("/next") && this.current_drawer != null && player.guild.lower().starts("events")) {
    triggerServer("weapon", this.name, "next");
  } else if (player.chat.lower().starts("/hellopictionary")) {
    client.temp_addmessages.add("Pictionary Responsive");
  }
}

function joinPictionary() {
  this.playing = true;
  this.selected_color = this.colors[1];
  makeBoard();
  makeEraser();
  makeColors();
  makeStateText();
  makeScores();
  onTimeout();
}

function makeScores() {
  for (temp.i = 0; i < this.scores.size(); i+=2) {
    if ((i/2)<15) {
      temp.id = INITIAL_SCORE_ID+(i/2);
      showtext(id, this.horizontal_bounds[0] - 325,
               this.vertical_bounds[0]+(30*(i/2)), "Verdana", "",
               this.scores[i] @ ":" SPC this.scores[i+1]);
      changeimgvis(id, 4);
    }
  }
}

function makeStateText() {
  if (player.account == this.current_drawer) {
    makeDrawerText("You are drawing: " @ this.current_word);
  } else {
    makeDrawerText("Current Drawer: " SPC this.current_drawer);
  }
}

function makeEraser() {
  drawRectangle(this.eraser.start_x, this.eraser.start_y,
                this.eraser.width, this.eraser.height,
                ERASER_ID, this.board_color);
  changeimgvis(ERASER_ID, 10);
}

function makeBoard() {
  if (Pictionary_Board != null) {
    clearBoard();
  }
  new GuiDrawingPanel(Pictionary_Board) {
    x = thiso.horizontal_bounds[0];
    y = thiso.vertical_bounds[0];
    width = BOARD_WIDTH + 64;
    height = BOARD_HEIGHT;
    if (thiso.debugging) {
      //drawimagestretched(0, 0, 800, 600, "block.png", 0, 0, 32, 32);      
    }
  }
  drawRectangle(this.horizontal_bounds[0], this.vertical_bounds[0],
                BOARD_WIDTH, BOARD_HEIGHT,
                BOARD_ID, this.board_color);
  changeimgvis(BOARD_ID, 10);
}

function makeColors() {
  for (temp.i = 0; temp.i < this.colors.size(); i+=2) {
    drawRectangle(this.horizontal_bounds[1], this.vertical_bounds[0]+64*(i/2),
                  COLOR_WIDTH, COLOR_HEIGHT, this.colors[i], this.colors[i+1]);
  }
}

function makeDrawerText(text) {
  showtext(WORD_ID, this.horizontal_bounds[0], this.vertical_bounds[0] - 50,
           "Verdana", "", text);
  changeimgvis(WORD_ID, 4);
}

function makeTimer() {
  showtext(TIMER_ID, this.horizontal_bounds[1] - 40, this.vertical_bounds[0] - 50,
           "Verdana", "", int(this.draw_time) @ "s");
  changeimgvis(TIMER_ID, 4);
}



function leavePictionary() {
  this.playing = false;
  clearBoard();
  clearLines();
  clearTools();
  clearTexts();
}

function clearBoard() {
  debugMessage("Clearing Board...");
  Pictionary_Board.hide();
  Pictionary_Board.destroy();
  hideimg(BOARD_ID);
}

function clearTools() {
  hideimgs(ERASER_ID, this.colors[this.colors.size()-2]);
}

function clearLines() {
  this.start_x = null;
  this.start_y = null;
  hideimgs(INITIAL_LINE_ID, getCurrLineId());
  this.count = 0;
}

function clearTexts() {
  hideimgs(WORD_ID, 300);
}

function Pictionary_Board.onMouseDown() {
  onMouseUp("left");
}

function Pictionary_Board.onRightMouseDown() {
  onMouseUp("right");
}

function onMouseUp(btn) {
  if (!this.playing) {
    return;
  }
  if (this.current_drawer != player.account && !this.free_draw) {
    return;
  }
  debugMessage("params: " @ params);
  if (btn == "right") {
    this.start_x = null;
    this.start_y = null;
  } else if (inBounds(mousescreenx, mousescreeny)) {
    debugMessage(mousescreenx SPC mousescreeny);
    
    if (this.start_x == null) {
      this.start_x = mousescreenx;
      this.start_y = mousescreeny;            
    } else {
      debugMessage("Drawing line...");
      temp.lineId = getLineId(this.count);
      showpoly(lineId, {this.start_x, this.start_y,
                                       mousescreenx, mousescreeny});
      temp.color = selectedColor();
      changeimgcolors(lineId, color[0], color[1], color[2], color[3]);
      changeimgvis(lineId, lineId);

      temp.relativeLine = absoluteToRelative(this.start_x, this.start_y,
                                             mousescreenx, mousescreeny);
      triggerServer("weapon", this.name, LINE, {relativeLine[0], relativeLine[1],
                    relativeLine[2], relativeLine[3], color});
      this.count++;
      this.start_x = null;
      this.start_y = null;
    }
  } else if (inEraserBounds(mousescreenx, mousescreeny)) {
    clearLines();
    triggerServer("weapon", this.name, CLEAR);
  } else if (inColorBounds(mousescreenx, mousescreeny)) {
    temp.index = int((mousescreeny - this.vertical_bounds[0])/COLOR_HEIGHT);
    debugMessage("Color: "@index);
    this.selected_color = this.colors[index*2 + 1];
  }
}

function relativeToAbsolute(start_x, start_y, end_x, end_y) {
  return {start_x + this.horizontal_bounds[0], start_y + this.vertical_bounds[0],
          end_x + this.horizontal_bounds[0], end_y + this.vertical_bounds[0]};
}

function absoluteToRelative(start_x, start_y, end_x, end_y) {
  return {start_x - this.horizontal_bounds[0], start_y - this.vertical_bounds[0],
          end_x - this.horizontal_bounds[0], end_y - this.vertical_bounds[0]};  
}

function selectedColor() {
  return this.selected_color;
}

function inGenericBounds(x, y, start_x, start_y, end_x, end_y) {
  return (x in <start_x, end_x>) &&
    (y in <start_y, end_y>);
}

function inRectangle(x, y, start_x, start_y, width, height) {
  return inGenericBounds(x, y, start_x, start_y,
                         start_x + width, start_y + height);
}

function inEraserBounds(x, y) {
  return inGenericBounds(x, y, this.eraser.start_x, this.eraser.start_y,
                         this.eraser.start_x + this.eraser.width,
                         this.eraser.start_y + this.eraser.height);

}

function inColorBounds(x, y) {
  debugMessage(x SPC y SPC this.horizontal_bounds[1] SPC this.vertical_bounds[0] SPC COLOR_WIDTH SPC (this.colors.size()/2)*COLOR_HEIGHT);
  return inRectangle(x, y,
                     this.horizontal_bounds[1], this.vertical_bounds[0],
                     COLOR_WIDTH, (this.colors.size()/2)*COLOR_HEIGHT);
  
}

function inBounds(x, y) {
  return (x in <this.horizontal_bounds[0], this.horizontal_bounds[1]>) &&
    (y in <this.vertical_bounds[0], this.vertical_bounds[1]>);
}

function getLineId(count) {
  return INITIAL_LINE_ID + count;
}

function getCurrLineId() {
  return getLineId(this.count);
}

function onTimeout() {
  if (this.playing) {
    if (this.start_x != null) {
      temp.id = getCurrLineId();
      drawLine(this.start_x, this.start_y,
               mousescreenx, mousescreeny,
               id, selectedColor());
    } else {
      hideimg(getCurrLineId());
    }

    if (this.draw_time > 0) {
      makeTimer();
      this.draw_time -= 0.05;
    }
    setTimer(0.05);
  }
}

function changeColor(id, color) {
  changeimgcolors(id, color[0], color[1], color[2], color[3]);
}

function drawRectangle(start_x, start_y, width, height, id, color) {
  showpoly(id, {start_x, start_y,
                start_x, start_y + height,
                start_x + width, start_y + height,
                start_x + width, start_y});
  changeColor(id, color);
  changeimgvis(id, id);
}

function drawLine(start_x, start_y, end_x, end_y, id, color) {
  showpoly(id, {start_x, start_y,
                end_x, end_y});
  changeColor(id, color);
  changeimgvis(id, id);
}

function debugMessage(s) {
  if (this.debugging) {
    client.temp_addmessages.add(s);
  }
}

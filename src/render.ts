///<reference types="pixi.js"/>
// handles all rendering and visual output
// this is deliberately kept separate from internal game logic

import * as PIXI from "pixi.js"; // neat graphics library
import { currentGame } from "./game"; // Represents the overall game state
import * as entity from "./entity"; // Needed for displaying entities
import * as item from "./item"; // Needed for displaying inventory items
import * as room from "./room"; // everything room related!
export let ready = false; // make sure we don't render anything before that has been initialized

let heldItemDisplay = document.getElementById("selectedItemDisplay");

let inventoryButtonsDiv = document.getElementById("inventoryButtons");
inventoryButtonsDiv.innerHTML = "Please wait while the game loads!";

export const app = new PIXI.Application({
  width: 256,
  height: 256
});

// load assets here
// all of them do have to be loaded manually.
// there should be a spritesheet for this eventually
app.loader
  .add("assets/dirt.png")
  .add("assets/stone.png")
  .add("assets/water.png")
  .add("assets/player.png")
  .add("assets/lifebud.png")
  .add("assets/lifeseed.png")
  .load(setup);

function setup() {
  document.body.appendChild(app.view);

  ready = true;
}

// this should be called every time the game updates
export function render() {
  if (ready) {
    console.log("Updating screen!");
    while (app.stage.children[0]) {
      app.stage.removeChild(app.stage.children[0]);
    } // remove all existing objects

    // UPDATE UI

    // show buttons for each inventory item
    inventoryButtonsDiv.innerHTML = ""; // wipe this clean!
    currentGame
      .getCurrentPlayer()
      .getInventory()
      .getContents()
      .forEach(function(item: item.Item) {
        //sconsole.log("Creating button for item " + item.getDisplayName());
        let itemButton = document.createElement("BUTTON");
        itemButton.innerHTML =
          item.getDisplayName() + " x " + item.getQuantity();
        itemButton.onclick = function() {
          currentGame.getCurrentPlayer().setSelectedItem(item);
        };
        inventoryButtonsDiv.appendChild(itemButton);
      });

    // show current held item
    heldItemDisplay.innerHTML =
      currentGame
        .getCurrentPlayer()
        .getSelectedItem()
        .getDisplayName() +
      " x " +
      currentGame
        .getCurrentPlayer()
        .getSelectedItem()
        .getQuantity();

    // RENDER MAP

    let currentMap = currentGame.getCurrentRoom().getTileMap();

    for (let xStep = 0; xStep < currentMap.length; xStep++) {
      for (let yStep = 0; yStep < currentMap[0].length; yStep++) {
        let currentTile: PIXI.Sprite;

        // set appropriate texture
        switch (currentMap[xStep][yStep].getType()) {
          default:
          case "DIRT":
            currentTile = new PIXI.Sprite(
              app.loader.resources["assets/dirt.png"].texture
            );
            break;
          case "WATER":
            currentTile = new PIXI.Sprite(
              app.loader.resources["assets/water.png"].texture
            );
            break;
        }
        currentTile.x = (xStep + 1) * 16 - 16;
        currentTile.y = (yStep + 1) * 16 - 16;
        currentTile.interactive = true; // tiles should be clickable!

        let mouseDown = function() {
          // use the player's held item to use this target
          // if this was successful, result will be true
          let result = currentGame
            .getCurrentPlayer()
            .getSelectedItem()
            .useItem(undefined, currentMap[xStep][yStep]);

          if (!result) displayToastNotification("That didn't work.");
        };

        currentTile.on("mousedown", mouseDown);
        app.stage.addChild(currentTile);
      }
    }

    // RENDER ENTITIES
    let currentEntities = currentGame.getCurrentRoom().getEntities();

    currentEntities.forEach(function(currentEntity: entity.Entity) {
      let currentEntityDisplayName = currentEntity.getDisplayName();
      let currentEntitySprite: PIXI.Sprite;
      switch (currentEntity.getType()) {
        case entity.ENTITY_TYPE.PLANT_LIFEBUD:
          currentEntitySprite = new PIXI.Sprite(
            app.loader.resources["assets/lifebud.png"].texture
          );
          break;

        case entity.ENTITY_TYPE.OBJECT_STONE:
          currentEntitySprite = new PIXI.Sprite(
            app.loader.resources["assets/stone.png"].texture
          );
          break;

        default:
          currentEntitySprite = new PIXI.Sprite(
            app.loader.resources["assets/player.png"].texture
          );
          break;
      }
      currentEntitySprite.x = (currentEntity.getPosition().x + 1) * 16 - 16;
      currentEntitySprite.y = (currentEntity.getPosition().y + 1) * 16 - 16;
      currentEntitySprite.interactive = true; // tiles should be clickable!

      let mouseDown = function() {
        dismissTooltip(); // since mouseout doesn't get triggered when you click it
        // use the player's held item to use this target
        // if this was successful, result will be true
        let result = currentGame
          .getCurrentPlayer()
          .getSelectedItem()
          .useItem(currentEntity);

        if (!result) displayToastNotification("That didn't work.");
      };

      currentEntitySprite.on("mousedown", mouseDown); // pass through to its click function
      currentEntitySprite.on("mouseover", () => {
        // what do we do when the mouse is over this?
        displayTooltip(currentEntityDisplayName);
      });
      currentEntitySprite.on("mouseout", () => {
        // what do we do when the mouse leaves?
        dismissTooltip();
      });

      app.stage.addChild(currentEntitySprite);
    });
  }
}

// show a tooltip on the screen (only one at a time!)
function displayTooltip(text: string) {
  console.log("Mouse moved over " + text);
  //TODO: display tooltip
}

// dismiss the visible tooltip (only one at a time!)
function dismissTooltip() {
  console.log("Mouse left");
  // TODO: dismiss tooltip
}

// shows a toast notification (this can be called from other files!)
export function displayToastNotification(text: string, duration?: number) {
  console.log(text);
  // TODO: show toast notification
}

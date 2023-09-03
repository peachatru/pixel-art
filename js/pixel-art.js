// Initialize Variables using 'let' as the variables will change throughout its lifetime 

// CREATING the CANVAS
let container = document.querySelector(".container");
let createCanvasButton = document.getElementById("make-grid");
let widthOfCanvas = document.getElementById("canvas-width");
let heightOfCanvas = document.getElementById("canvas-height");
let grid = document.getElementById("grid");

// Painting and Updating the tile 
let colorButton = document.getElementById("color-input");
let paintButton = document.getElementById("paint-btn");
let redoButton = document.getElementById("redo-btn");

// clearing the canvas or erasing the tile
let clearCanvasButton = document.getElementById("clear-grid");
let eraseButton = document.getElementById("erase-btn");
let undoButton = document.getElementById("undo-btn");

// saving the image
let saveButton = document.getElementById("save-btn");
let imgTitle = document.getElementById("imgTitle");

// keeping track of the tile's current state for the undo / redo stacks
let undoStack = [];
let redoStack = [];
let redoColor = []; // we will also need to keep track of the tile's colors as the user decides to undo more than once

let deviceType = "";
//Initially draw and erase would be false
let draw = false;
let erase = false;

// Keeping track of the tile's current position
let tileAction = {
  mouse: {
    down: "mousedown",
    move: "mousemove",
    up: "mouseup",
  },
  touch: {
    down: "touchstart",
    move: "touchmove",
    up: "touchend",
  },
};

// This function will determine whether or not the device 
// is a touch-enabled device such as a tablet or smartphone
const doesDeviceSupportTouch = () => {
  try {
    document.createEvent("TouchEvent");
    deviceType = "touch";
    return true;
  } catch (e) {
    // it would fail on desktop devices that don't support touch tileAction
    deviceType = "mouse";
    return false;
  }
};

doesDeviceSupportTouch();

// creating the canvas with the user's given dimensions
function createCanvas() {
  grid.innerHTML = "";
  let count = 0;

  // get the width and height
  const height = parseInt(heightOfCanvas.value);
  const width =  parseInt(widthOfCanvas.value);

  // we're limiting the canvas size to be max 20x20
  if((width > 20) || (height > 20)) {
    alert("Max Dimensions are 20x20!");
    return;
  }

  grid.style.gridTemplateColumns = `repeat(${width},1fr)`;

  for (let i = 0; i < height * width; i++) {
      count += 1; 
      // we'll be keeping track of each individual pixel by creating a tile to add
      // to the grid
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.setAttribute("id", `tile${count}`);

      tile.addEventListener(tileAction[deviceType].down, () => {
        //user starts drawing
        draw = true;
        // we should change the tile's background color to transparent 
        // if they're erasing that pixel 
        if (erase) {
          tile.style.backgroundColor = "transparent";
        } else {
          // else then we'll update the tile's bg color 
          tile.style.backgroundColor = colorButton.value;
          // and push it to the undo stack 
          sendElementToStack(tile); 
        }
      });

      //  here we'll be listening for the event's coordinates and passing it on to 
      // check if the element's id matches the pixel's id
      tile.addEventListener(tileAction[deviceType].move, (e) => {
        /* elementFromPoint returns the element at x,y position of mouse */
        let pixelId = document.elementFromPoint(
          !doesDeviceSupportTouch() ? e.clientX : e.touches[0].clientX,
          !doesDeviceSupportTouch() ? e.clientY : e.touches[0].clientY
        ).id;
        //updatePixelColor
        updatePixelColor(pixelId);
      });


      //Stop drawing
      tile.addEventListener(tileAction[deviceType].up, () => {
        draw = false;
      });

      //append pixel to the grid canvas
      grid.appendChild(tile);
    }
}

//Create Grid
createCanvasButton.addEventListener("click", () => {
  createCanvas();
});


function updatePixelColor(pixelId) {
  let gridColumns = document.querySelectorAll(".tile");
  //loop through all boxes
  gridColumns.forEach((element) => {
    //if id matches then color
    if (pixelId == element.id) {
      if (draw && !erase) {
        element.style.backgroundColor = colorButton.value;
        sendElementToStack(element); 
      } else if (draw && erase) {
        element.style.backgroundColor = "transparent";
      }
    }
  });
}

// Keeping track of the elements painted so that we can revert change with the undo button
function sendElementToStack(element) {
  if(!undoStack.includes(element)) {
    undoStack.push(element);
  }
}

// clear entire grid and set all pixel background values to transparent
clearCanvasButton.addEventListener("click", () => {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((element) => {
    element.style.backgroundColor = "transparent";
  });
});

// On click, the erase boolean will be set to true and will update 
// the user's actions accordingly by making the colored pixels transparent
eraseButton.addEventListener("click", () => {
  erase = true;
});

// On click, the user will be able to draw and paint each pixel with the 
// desired color
paintButton.addEventListener("click", () => {
  document.getElementById('color-input-label').click(); 
  // colorButton.click();
  erase = false;
});

// Undo Button: will change the most recently colored pixel to transparent
undoButton.addEventListener("click", () => {
  // we want to check if the undoStack is NOT empty before we pop() the top element
  if(undoStack.length != 0) {
    let undoTile = undoStack.pop(); 

    // we also want to check if the redoStack does NOT already include the undo tile
    // so that we can prevent that tile's background color being overridden by the most recently used color
    if(!redoStack.includes(undoTile)) {
      redoColor.push(undoTile.style.backgroundColor); 
      redoStack.push(undoTile);
    }

    undoTile.style.backgroundColor = "transparent"; 
  } else {
    alert("Nothing to undo!");
  }
});

// Redo Button will pop the top most element and set that tile's
// background color to the same value as the redoColor stack's element
redoButton.addEventListener("click", () => {
  if(redoStack.length != 0) {
    let redoTile = redoStack.pop(); 
    redoTile.style.backgroundColor = redoColor.pop(); 
  } else {
    alert("You can only redo as much as you undo!");
  }
});

// saving image functionality adapted from: https://stackoverflow.com/questions/10673122/how-to-save-canvas-as-an-image-with-canvas-todataurl
saveButton.addEventListener("click", () => {

  // we shouldn't save an empty image header!
  if(imgTitle.value.length === 0) {
    alert("Your art needs to be named!");
  } else {
    // converts an HTML element to type canvas 
    html2canvas(grid).then((canvas) => {
      const img = document.createElement("img");
      img.src = canvas.toDataURL();
     
      const downloadButton = document.createElement("a");
      let format = document.getElementById("format").value;
      format = format.toLowerCase(); 

      if (format === "png") {
        downloadButton.setAttribute("href", img.src);
      } else if (format === "jpeg") {
        downloadButton.setAttribute("href", img.src.replace("image/png", "image/jpeg"));
      } else if (format === "svg") {
        downloadButton.setAttribute("href", img.src.replace("image/png", "image/svg+xml"));
      } else if(format === "") {
        alert("Please enter an image format!");
      } else { // if format is anything other than the format options provided
        alert("Please enter an image format!");

      }
    
      const imgFileName = imgTitle.value + '.' + `${format}`;
      downloadButton.setAttribute("download", imgFileName);
      downloadButton.click();
      downloadButton.remove();
      imageURL = "";
    });
  }
});

// by default, we want to load the canvas grid as a 10 x 10, but the user
// can always adjust the dimensions any time they want to!
window.onload = createCanvas; 
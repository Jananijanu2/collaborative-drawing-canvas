const canvas = document.getElementById("drawingCanvas");
const paint = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const eraserBtn = document.getElementById("eraserBtn");
const brushBtn = document.getElementById("brushBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const rectBtn = document.getElementById("rectBtn");
const circleBtn = document.getElementById("circleBtn");
const textBtn = document.getElementById("textBtn");

let drawing = false;
let lastCursor = null; 
let actions = [];
let undoneActions = [];
let prevMousePosition = null; 

paint.strokeStyle = colorPicker.value;
paint.lineWidth = brushSize.value;
paint.lineCap = "round";

colorPicker.addEventListener("input", () => paint.strokeStyle = colorPicker.value);
brushSize.addEventListener("input", () => paint.lineWidth = brushSize.value);

eraserBtn.addEventListener("click", () => paint.strokeStyle = "white");
brushBtn.addEventListener("click", () => paint.strokeStyle = colorPicker.value);


canvas.addEventListener("mousedown", (event) => {
  drawing = true;
  const exactSpot = getMouseSpot(event, canvas);
  prevMousePosition = exactSpot;
  paint.beginPath();
  paint.moveTo(exactSpot.x, exactSpot.y);

  actions.push({ 
    type: "line", 
    style: { color: paint.strokeStyle, width: paint.lineWidth }, 
    points: [[exactSpot.x, exactSpot.y]] 
  });
});


canvas.addEventListener("mousemove", (event) => {
  const exactSpot = getMouseSpot(event, canvas);

  if (drawing) {
    paint.lineTo(exactSpot.x, exactSpot.y);
    paint.stroke();

    actions[actions.length - 1].points.push([exactSpot.x, exactSpot.y]);

    shareLineEvent(prevMousePosition, exactSpot, paint.strokeStyle, paint.lineWidth);
    prevMousePosition = exactSpot;
  }

  shareCursorPosition(exactSpot.x, exactSpot.y);
});


canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);


undoBtn.addEventListener("click", () => {
  if (actions.length > 0) {
    const removed = actions.pop();
    undoneActions.push(removed);
    redrawCanvas();
    connection.emit("undo", removed); 
  }
});


redoBtn.addEventListener("click", () => {
  if (undoneActions.length > 0) {
    const restored = undoneActions.pop();
    actions.push(restored);
    redrawCanvas();
    connection.emit("redo", restored); 
  }
});


function redrawCanvas() {
  paint.clearRect(0, 0, canvas.width, canvas.height);
  actions.forEach(action => drawSavedAction(action));
  if (lastCursor){
    displayCursor(lastCursor); 
  }
}


function drawSavedAction(action) {
  paint.strokeStyle = action.style.color;
  paint.lineWidth = action.style.width;

  if (action.type === "line") {
    const pts = action.points;
    if (pts.length < 2) return;
    paint.beginPath();
    paint.moveTo(...pts[0]);
    pts.slice(1).forEach(p => paint.lineTo(...p));
    paint.stroke();
  } else if (action.type === "rect") {
    paint.strokeRect(action.x, action.y, action.width, action.height);
  } else if (action.type === "circle") {
    paint.beginPath();
    paint.arc(action.x, action.y, action.radius, 0, 2 * Math.PI);
    paint.stroke();
  } else if (action.type === "text") {
    paint.fillStyle = action.style.color;
    paint.font = "22px Roboto";
    paint.fillText(action.text, action.x, action.y);
  }
}


function displayCursor(position) {
  paint.beginPath();
  paint.arc(position.x, position.y, 2, 0, 2 * Math.PI);
  paint.fillStyle = "red";
  paint.fill();
}


function getMouseSpot(event, canvas) {
  const canvasRect = canvas.getBoundingClientRect();
  const horizontalScale = canvas.width / canvasRect.width;
  const verticalScale = canvas.height / canvasRect.height;
  return {
    x: (event.clientX - canvasRect.left) * horizontalScale,
    y: (event.clientY - canvasRect.top) * verticalScale
  };
}


canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  const touch = event.touches[0];
  const exactSpot = getMouseSpot(touch, canvas);
  drawing = true;
  prevMousePosition = exactSpot;
  paint.beginPath();
  paint.moveTo(exactSpot.x, exactSpot.y);

  actions.push({ 
    type: "line", 
    style: { color: paint.strokeStyle, width: paint.lineWidth }, 
    points: [[exactSpot.x, exactSpot.y]] 
  });
});


canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  const touch = event.touches[0];
  const exactSpot = getMouseSpot(touch, canvas);

  if (drawing) {
    paint.lineTo(exactSpot.x, exactSpot.y);
    paint.stroke();
    actions[actions.length - 1].points.push([exactSpot.x, exactSpot.y]);
    shareLineEvent(prevMousePosition, exactSpot, paint.strokeStyle, paint.lineWidth);
    prevMousePosition = exactSpot;
  }

  shareCursorPosition(exactSpot.x, exactSpot.y);
});

canvas.addEventListener("touchend", () => drawing = false);

rectBtn.addEventListener("click", () => {
  const rectAction = { 
    type: "rect", 
    style: { color: colorPicker.value, width: brushSize.value }, 
    x: 50, y: 50, width: 100, height: 80 
  };
  actions.push(rectAction);
  if (lastCursor) displayCursor(lastCursor);
  redrawCanvas();
  connection.emit("drawing_step", rectAction);
});

circleBtn.addEventListener("click", () => {
  const circleAction = { 
    type: "circle", 
    style: { color: colorPicker.value, width: brushSize.value }, 
    x: 150, y: 100, radius: 50 
  };
  actions.push(circleAction);
  if (lastCursor) displayCursor(lastCursor);
  redrawCanvas();
  connection.emit("drawing_step", circleAction);
});

textBtn.addEventListener("click", () => {
  const textAction = { 
    type: "text", 
    style: { color: colorPicker.value }, 
    text: "Hello User!", x: 200, y: 200 
  };
  actions.push(textAction);
  if (lastCursor) displayCursor(lastCursor);

  redrawCanvas();
  connection.emit("drawing_step", textAction);
});


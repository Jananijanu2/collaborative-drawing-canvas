const connection = io("collaborative-drawing-canvas-production-50a8.up.railway.app");

function shareLineEvent(prevMousePosition, exactSpot, color, width) {
  const drawData = {
    type: "line", 
    style: { color, width },
    points: [[prevMousePosition.x, prevMousePosition.y], [exactSpot.x, exactSpot.y]]
  };
  connection.emit('drawing_step', drawData);
}

function shareCursorPosition(x, y) {
  connection.emit("cursor", { x, y });
}

connection.on("drawing_step", (data) => {
  console.log("Received from server:", data); 
  actions.push(data);          
  drawSavedAction(data);       
});

connection.on("undo", (removed) => {
  const idx = actions.findIndex(a => JSON.stringify(a) === JSON.stringify(removed));
  if (idx !== -1) actions.splice(idx, 1);
  redrawCanvas();
});

connection.on("redo", (restored) => {
  actions.push(restored);
  redrawCanvas();
});

connection.on("cursor", (position) => {
  lastCursor = position;      
  displayCursor(position);     
});



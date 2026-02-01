**HOW THE APP WORKS**



&nbsp;      It uses HTML5 Canvas for drawing and Socket.IO for sending messages between users.



**1.Data Flow Diagram**



&nbsp;      Mouse/Finger/Shape/Text **(You move your mouse or finger on the canvas)**

&nbsp;          |

&nbsp;          |

&nbsp;      Canvas.js **(Collects your position data)**

&nbsp;          |

&nbsp;          |

&nbsp;      webSocket.js **(Sends this data to the server)**

&nbsp;          |

&nbsp;          |

&nbsp;        Server.js **(Server shares the data with all the other users)**

&nbsp;          |

&nbsp;          |

&nbsp;     Other Canvas.js **(In other Canvas.js your drawing shows the same in their tab)**





**2.WebSocket Messages**



**Messages you send**



* &nbsp;drawing\_step - Sent when you draw a line, circle, rectangle, or text.
* &nbsp;cursor - Sent when your mouse or finger moves.



**Messages you receive**



 drawing\_step - Replays the stroke/shape/text on the canvas.
* &nbsp;cursor - Shows a red dot when other users' pointer moves.

&nbsp;



**3.Undo/Redo Strategy**



* &nbsp;Every action (line, circle, rectangle, text) is saved in an actions\[] list.
* &nbsp;Undo removes the last action and puts it in undoneActions\[].
* &nbsp;Redo takes it back from undoneActions.
* &nbsp;This only works for your own canvas, not shared with other users.





**4.Performance Decisions**



* &nbsp;We send data on every time the mouse move, so the drawings appear live.
* &nbsp;Canvas is cleared and redrawn when undo/redo happens.





**5.Handling Conflicts**



* &nbsp;If two people draw at the same time, both strokes are shown.
* &nbsp;No blocking — everyone can draw freely.
* &nbsp;Undo/Redo is local, so one person cannot erase another’s work.





**6.Bonus Features**



* &nbsp;Mobile touch support: Touch events (touchstart, touchmove, touchend) allow drawing with fingers on phones/tablets.
* &nbsp;Creative features: Buttons for shapes (circle, rectangle) and text drawing.

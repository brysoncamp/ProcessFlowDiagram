const arrowWidth = 13;
const arrowHeight = 5;
const defaultLength = 100;

// Assume we have an initial JSON object with group positions and IDs
var groupsData = {
    "groups": [
      { "id": "group1", "x": 50, "y": 75, "w": 100, "h": 50, "destGroup": "group2" },
      { "id": "group2", "x": 350, "y": 75, "w": 100, "h": 50, "destGroup": null }
      // ... more groups
    ]
  };

var draw = SVG().addTo('#drawing').size('100%', '100%');
  
// Function to create a draggable group with a rectangle, text, line, and arrow
function createDraggableGroup(data, fillColor) {
    var group = draw.group().attr({ 'data-id': data.id });
    
    // Create rectangle and text for the step
    group.rect = group.rect(data.w, data.h).attr({ fill: 'white', stroke: 'black' }).move(data.x, data.y);
    group.text = group.text('Step').attr({stroke: 'black' }).move(data.x + 25, data.y + 20);
    group.data = data
    drawLineAndArrow(group)

    // Add event listeners for dragging
    group.on('mousedown', function(event) {
        startDrag(event, group);
    });
   
    return group;
}

// Function to start dragging
function startDrag(event, group) {
    // Get the initial mouse position
    var startX = event.clientX;
    var startY = event.clientY;
    group.referencedLine.remove();
    group.referencedArrow.remove();
    // Get the initial position of the group
    var groupX = group.x();
    var groupY = group.y();
    
    // Function to handle dragging (mousemove event)
    function drag(event) {
        // Calculate the new position of the group
        var dx = event.clientX - startX;
        var dy = event.clientY - startY;
        group.data.x = groupX + dx;
        group.data.y = groupY + dy;
        group.move(groupX + dx, groupY + dy);
    }

    // Function to end dragging (mouseup event)
    function endDrag() {
        // Remove the event listeners
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('mouseup', endDrag);

        drawLineAndArrow(group)

        // Update the JSON object with the new position
        var id = group.attr('data-id');
        var groupData = groupsData.groups.find(g => g.id === id);
        if (groupData) {
            groupData.x = group.x();
            groupData.y = group.y();
            // Persist the new position to the JSON file
            savePositionsToFile(groupsData);
        }
    }
    
    // Add the event listeners
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);
}

// Adjusted drawLineAndArrow function
function drawLineAndArrow(group) {
    // Calculate start positions for line inside this function
    const lineStartX = group.data.x + group.data.w;
    const lineStartY = group.data.y + group.data.h/2;
    const { lineEndX, lineEndY } = calculateLineEnd(group.data, lineStartX, lineStartY);

    // Create a new line and arrow using the SVG.js methods
    var newLine = group.line(lineStartX, lineStartY, lineEndX, lineEndY).stroke({ color: '#000', width: 2 });
    var newArrow = group.polygon(`0,0 0,${arrowHeight} ${arrowWidth},0 0,-${arrowHeight}`).move(lineEndX, lineEndY-arrowHeight).fill('#000');

    // If you need to reference these later, you can assign them to properties on the group
    group.referencedLine = newLine;
    group.referencedArrow = newArrow;
}

function calculateLineEnd(data, lineStartX, lineStartY) {
    let lineEndX;
    let lineEndY;

    if (data.destGroup === null) {
        lineEndX = lineStartX + defaultLength;
        lineEndY = lineStartY;
    } else {
        const destGroupData = groupsData.groups.find(g => g.id === data.destGroup);
        if (destGroupData) {
            lineEndX = destGroupData.x;
            lineEndY = destGroupData.y + destGroupData.h/2;
        } else {
            lineEndX = lineStartX + defaultLength;
            lineEndY = lineStartY;
        }
    }

    return { lineEndX, lineEndY };
}

  // Function to save the updated positions to a file
  function savePositionsToFile(updatedData) {
      // Convert the JSON object to a string
      var jsonString = JSON.stringify(updatedData);
     
      // Code to save jsonString to a file
      // This will depend on your environment, e.g., Node.js, browser, etc.
      // For example, in Node.js, you might use fs.writeFileSync('path/to/file.json', jsonString);
  }
  
  // Create groups from the JSON data
  groupsData.groups.forEach(data => {
      createDraggableGroup(data, '#000');
  });
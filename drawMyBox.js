const arrowWidth = 13;
const arrowHeight = 5;
const defaultLength = 100;

// Assume we have an initial JSON object with group positions and IDs
var groupsData = {  // This will be retrieved by a call to the back-end
    "groups": [
      { "id": "group1", "name": "Thickener 1", "x": 50, "y": 75, "w": 100, "h": 50, "destGroup": "group2" },
      { "id": "group2", "name": "Thickener 2", "x": 350, "y": 75, "w": 100, "h": 50, "destGroup": null }
      // ... more groups
    ]
  };

var draw = SVG().addTo('#drawing').size('100%', '100%');
  
// Function to create a draggable group with a rectangle, text, line, and arrow
function createDraggableGroup(data, fillColor) {
    var group = draw.group().attr({ 'data-id': data.id });
    
    // Create rectangle and text for the step
    group.rect = group.rect(data.w, data.h).attr({ fill: 'white', stroke: 'black' }).move(data.x, data.y);
    
    // Create text for the step
    group.text = group.text(data.name).attr({stroke: 'black' }).move(data.x + 25, data.y + 20);
    
    // Centering text within rectangle
    var bbox = group.text.bbox();
    group.text.move(data.x + (data.w - bbox.width) / 2, data.y + (data.h - bbox.height) / 2);

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
    
    deleteLineAndArrow(group)

    // Get the initial mouse position
    var startX = event.clientX;
    var startY = event.clientY;
    
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

function deleteLineAndArrow(group) {
    group.referencedLine.remove();
    group.referencedArrow.remove();
}

function drawLineAndArrow(group) {
    // Calculate start positions for line inside this function
    const { lineStartX, lineStartY, lineEndX, lineEndY } = calculateLineEnds(group.data);

    // Calculate midpoint for orthogonal arrangement
    const midPointX = (lineStartX + lineEndX) / 2; // or some other logic to determine the bend point
    const midPointY = (lineStartY + lineEndY) / 2; // or some other logic to determine the bend point

    // Create a new polyline with two segments using the SVG.js methods
    var newLine = group.polyline([[lineStartX, lineStartY], [midPointX, lineStartY], [midPointX, midPointY], [midPointX, lineEndY], [lineEndX, lineEndY]])
        .fill('none')
        .stroke({ color: '#000', width: 2 });

    var newArrow = group.polygon(`0,0 0,${arrowHeight} ${arrowWidth},0 0,-${arrowHeight}`)
        .move(lineEndX - arrowWidth / 2, lineEndY - arrowHeight / 2)
        .fill('#000');

    // If you need to reference these later, you can assign them to properties on the group
    group.referencedLine = newLine;
    group.referencedArrow = newArrow;
}

function calculateLineEnds(data) {
    let lineStartX = data.x + data.w;  // assumes connecting to right-hand side
    let lineStartY = data.y + data.h / 2;  // assumes connecting a mid-point
    let lineEndX;
    let lineEndY;

    if (data.destGroup === null) {
        lineEndX = lineStartX + defaultLength;
        lineEndY = lineStartY;
    } else {
        const destGroupData = groupsData.groups.find(g => g.id === data.destGroup);
        if (destGroupData) {
            lineEndX = destGroupData.x;  // assumes connecting to left-hand side
            lineEndY = destGroupData.y + destGroupData.h/2; // assumes connecting to mid-point
        } else {
            lineEndX = lineStartX + defaultLength;  // assumes no terminal connection
            lineEndY = lineStartY;  // assumes horizontal line.
        }
    }

    return { lineStartX, lineStartY, lineEndX, lineEndY };
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
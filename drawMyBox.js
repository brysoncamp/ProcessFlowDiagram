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
    var rect = group.rect(data.w, data.h).attr({ fill: 'white', stroke: 'black' }).move(data.x, data.y);
    var text = group.text('Step').attr({stroke: 'black' }).move(data.x + 25, data.y + 20);
   
    // Draw an arrow from the rectangle
    const defaultLength = 100;
    const lineStartX = data.x + data.w;
    const lineStartY = data.y + data.h/2;
    const { lineEndX, lineEndY } = calculateLineEnd(data, lineStartX, lineStartY, defaultLength);
    // let lineEndX;
    // let lineEndY;
    // // Check if destGroup is null or not
    // if (data.destGroup === null) {
    //     lineEndX = lineStartX + defaultLength; // Use defaultLength if destGroup is null
    //     lineEndY = lineStartY;
    // } else {
    //     // Find the destination group's data using its id
    //     const destGroupData = groupsData.groups.find(g => g.id === data.destGroup);
    //     if (destGroupData) {
    //         lineEndX = destGroupData.x; // Use the x attribute of the destination group
    //         lineEndY = destGroupData.y + destGroupData.h/2;
    //     } else {
    //         lineEndX = lineStartX + defaultLength; // Fallback to defaultLength if destGroupData is not found
    //         lineEndY = lineStartY;
    //     }
    // }

    var line = group.line(lineStartX, lineStartY, lineEndX, lineEndY).stroke({ color: '#000', width: 2 });
    const arrowWidth = 13;
    const arrowHeight = 5;
    var arrow = group.polygon(`0,0 0,${arrowHeight} ${arrowWidth},0 0,-${arrowHeight}`).move(lineEndX, lineEndY-arrowHeight).fill('#000');
   
    // Add event listeners for dragging
    group.on('mousedown', function(event) {
        startDrag(event, group);
    });
   
    return group;
}

function calculateLineEnd(data, lineStartX, lineStartY, defaultLength) {
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

// Function to start dragging
function startDrag(event, group) {
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
        group.move(groupX + dx, groupY + dy);
    }

    // Function to end dragging (mouseup event)
    function endDrag() {
        // Remove the event listeners
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('mouseup', endDrag);

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
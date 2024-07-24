const canvas = SVG().addTo("#canvas").size("100%", "100%");

const canvasElement = document.getElementById('canvas');
const canvasWidth = canvasElement.clientWidth;
const canvasHeight = canvasElement.clientHeight;


const marginFactor = 0.1; // 10% margin

// Calculate the maximum dimensions for the rectangle
const maxRectWidth = canvasWidth * (1 - marginFactor);
const maxRectHeight = canvasHeight * (1 - marginFactor);

// Calculate the dimensions of the 16:9 rectangle
let rectWidth, rectHeight;
if (maxRectWidth / maxRectHeight > 16 / 9) {
    rectHeight = maxRectHeight;
    rectWidth = rectHeight * (16 / 9);
} else {
    rectWidth = maxRectWidth;
    rectHeight = rectWidth * (9 / 16);
}

// Calculate the position to center the rectangle
const rectX = (canvasWidth - rectWidth) / 2;
const rectY = (canvasHeight - rectHeight) / 2;

// Create and position the rectangle in the center of the canvas

const rect = canvas.rect(rectWidth, rectHeight)
    .attr({ fill: 'white' })
    .move(rectX, rectY)
    .stroke({ color: '#ccc', width: 1 });

let zoomLevel = 1;
const zoomFactor = 0.025;
const minZoom = 0.1;
const maxZoom = 4;

function zoom(delta) {
    zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));

    // Calculate new viewBox dimensions
    const viewBoxWidth = canvasWidth / zoomLevel;
    const viewBoxHeight = canvasHeight / zoomLevel;

    // Center the viewBox around the center of the canvas
    const viewBoxX = (canvasWidth - viewBoxWidth) / 2;
    const viewBoxY = (canvasHeight - viewBoxHeight) / 2;

    canvas.viewbox(viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight);
}

// Add event listeners for mouse wheel zoom
canvasElement.addEventListener('wheel', (event) => {
    event.preventDefault();
    zoom(event.deltaY < 0 ? zoomFactor : -zoomFactor);
});
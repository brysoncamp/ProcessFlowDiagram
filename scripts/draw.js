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
const zoomFactor = 0.02;
const minZoom = 0.1;
const maxZoom = 4;


let mouseX = 0;
let mouseY = 0;

const container = document.querySelector(".canvas-container");

container.addEventListener('mousemove', (event) => {
    const rect = canvasElement.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});




function zoom(delta) {
    zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));

    const newCanvasWidth = canvasWidth * zoomLevel;
    const newCanvasHeight = canvasHeight * zoomLevel;

    const newRectWidth = rectWidth * zoomLevel;
    const newRectHeight = rectHeight * zoomLevel;

    const newRectX = (newCanvasWidth - newRectWidth)/2;
    const newRectY = (newCanvasHeight - newRectHeight)/2;

    rect.size(newRectWidth, newRectHeight);
    rect.move(newRectX, newRectY);
    canvas.size(newCanvasWidth, newCanvasHeight);

    const svgElement = canvasElement.querySelector('svg'); 
    const svgBounding = svgElement.getBoundingClientRect();

    if (svgElement.clientHeight > canvasHeight) {
        const totalScrollableWidth = container.scrollWidth - container.clientWidth;
        const totalScrollableHeight = container.scrollHeight - container.clientHeight;

        container.scrollLeft = totalScrollableWidth * ((mouseX / container.scrollWidth ));
        container.scrollTop = totalScrollableHeight * ((mouseY / container.scrollHeight));
    } else {
        const translateX = canvasWidth/2 - svgBounding.width/2;
        const translateY = canvasHeight/2 - svgBounding.height/2;
        svgElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
}


// Add event listeners for mouse wheel zoom
container.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = canvasElement.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    console.log(event.deltaY);
    if (Math.abs(event.deltaY) < 3) return;
    
    zoom(event.deltaY < 0 ? zoomFactor : -zoomFactor);
});
class Canvas {
    constructor() {
        this.container = document.querySelector(".canvas-container");
        this.canvasElement = document.getElementById("canvas");
        this.canvas = SVG().addTo("#canvas").size("100%", "100%");
        this.group = this.canvas.group();
        this.updateCanvasDimensions();
        this.setupPage();
        this.setupZoomSettings();
    }

    updateCanvasDimensions() {
        this.canvasWidth = this.canvasElement.clientWidth;
        this.canvasHeight = this.canvasElement.clientHeight;
    }

    setupPage() {
        const marginFactor = 0.1;
    
        // Calculate the maximum dimensions for the inner rectangle with 10% margin
        const maxRectWidth = this.canvasWidth * (1 - marginFactor);
        const maxRectHeight = this.canvasHeight * (1 - marginFactor);
    
        // Calculate the dimensions of the 16:9 rectangle for the inner rectangle
        if (maxRectWidth / maxRectHeight > 16 / 9) {
            this.rectHeight = maxRectHeight;
            this.rectWidth = this.rectHeight * (16 / 9);
        } else {
            this.rectWidth = maxRectWidth;
            this.rectHeight = this.rectWidth * (9 / 16);
        }


        // Calculate dimensions for the outer rectangle (10% larger than the canvas)
        const overRectWidth = this.canvasWidth * (1 + marginFactor);
        const overRectHeight = this.canvasHeight * (1 + marginFactor);
    
        // Position for the outer rectangle, offset to maintain central alignment
        const overRectX = (this.canvasWidth - overRectWidth) / 2;
        const overRectY = (this.canvasHeight - overRectHeight) / 2;
    
        // Create and position the outer rectangle (black) around the canvas
        this.outerRect = this.group.rect(overRectWidth, overRectHeight)
            .attr({ fill: 'none' })  // Make the outer rectangle black
            .move(overRectX, overRectY);
    
        // Calculate the position to center the rectangle
        const rectX = (this.canvasWidth - this.rectWidth) / 2;
        const rectY = (this.canvasHeight - this.rectHeight) / 2;
    
        // Create and position the inner rectangle (white) in the center of the canvas
        this.innerRect = this.group.rect(this.rectWidth, this.rectHeight)
            .attr({ fill: 'white' })
            .move(rectX, rectY)
            .stroke({ color: '#ccc', width: 1 });

        this.box = this.group.rect(50, 50)
            .attr({ fill: 'white' })
            .move(this.canvasWidth/16*6, 400)
            .stroke({ color: 'black', width: 1 });

        this.groupBbox = this.group.bbox();
    }

    setupZoomSettings() {
        this.zoomLevel = 1;
        this.zoomFactor = 0.02;
        this.minZoom = 0.1;
        this.maxZoom = 4;
    }

    handleResize(event) {
        // Handle resize
    }

    updateMousePosition(event) {
        const rect = this.canvasElement.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

    zoom(delta) {
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
        const newCanvasWidth = this.groupBbox.width * this.zoomLevel;
        const newCanvasHeight = this.groupBbox.height * this.zoomLevel;
        this.group.size(newCanvasWidth, newCanvasHeight);
        this.group.move(0, 0);
        this.canvas.size(newCanvasWidth, newCanvasHeight);

        const svgElement = this.canvasElement.querySelector("svg"); 
        const svgBounding = svgElement.getBoundingClientRect();
    
        if (svgElement.clientHeight > this.canvasHeight) {
            const totalScrollableWidth = this.container.scrollWidth - this.container.clientWidth;
            const totalScrollableHeight = this.container.scrollHeight - this.container.clientHeight;
            this.container.scrollLeft = totalScrollableWidth * (this.mouseX / this.container.scrollWidth);
            this.container.scrollTop = totalScrollableHeight * (this.mouseY / this.container.scrollHeight);
        } else {
            const translateX = this.canvasWidth / 2 - svgBounding.width / 2;
            const translateY = this.canvasHeight / 2 - svgBounding.height / 2;
            svgElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
    }
    
    
    
    
    
    
    
        

    handleWheel(event) {
        event.preventDefault();
        this.updateMousePosition(event);
        if (Math.abs(event.deltaY) < 3) return;
        this.zoom(event.deltaY < 0 ? this.zoomFactor : -this.zoomFactor);
    }
}

export default Canvas; 
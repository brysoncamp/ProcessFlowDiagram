import Unit from "./Unit.mjs"

class Canvas {
    constructor() {
        this.container = document.querySelector(".canvas-container");
        this.canvasElement = document.getElementById("canvas");
        this.canvas = SVG().addTo("#canvas").size("100%", "100%").attr("overflow", "visible");

        this.group = this.canvas.group();
        this.updateCanvasDimensions();
        this.setupPage();
        this.setupZoomSettings();
        this.units = [];
        this.isDraggingUnit = false;
        this.isDeletingUnit = false;
        this.moveUnits = [];
        this.hoverUnit = null;
        //this.hoverUnits = [];
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

        this.groupBbox = this.group.bbox();
    }

    setupZoomSettings() {
        this.zoomLevel = 1;
        this.zoomFactor = 0.02;
        this.minZoom = 0.9; /* 0.1 */
        this.maxZoom = 4;
    }

    deleteRecentUnit() {
        const unit = this.units[this.units.length - 1];
        unit.delete();
        this.isDraggingUnit = false;
    }

    deleteMovingUnit() {
        for (const unit of this.moveUnits) {
            unit.hide();
        }
        this.isDeletingUnit = true;
    }

    dropDeletingUnit() {
        for (const unit of this.moveUnits) {
            unit.show();
        }
        this.isDeletingUnit = false;
    }

    addUnit(x, y, draggingSymbolName) {
        const unit = new Unit(this.group, x, y, draggingSymbolName, this.zoomLevel);
        this.units.push(unit);
        return unit;
    }

    handleResize(event) {
        // Handle resize
    }

    updateMousePosition(event) {
        const rect = this.canvasElement.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
    }

    handleUnitDrop(event, draggingSymbolName) {
        this.updateMousePosition(event);
        console.log("Unit drop", event.target);
        this.addUnit(this.mouseX, this.mouseY, draggingSymbolName);
        this.startX = this.mouseX;
        this.startY = this.mouseY; 
        this.isDraggingUnit = true;

        const unit = this.units[this.units.length - 1];
        unit.updatePosition();
        unit.setMoveCursor();
        unit.bringToFront();
        this.moveUnits.push(unit);

        /* 
        this.startX = this.mouseX;
        this.startY = this.mouseY; 
        this.isDraggingUnit = true;
        
        const unitId = event.target.getAttribute("id").split("-")[1];
        const unit = this.units[unitId];
        unit.updatePosition();
        unit.setMoveCursor();
        this.moveUnits.push(unit);

        */
    }

    zoom(delta) {

        const rect = this.group.rect(1, 1).attr({ x: this.mouseX, y: this.mouseY });
        const rectBbox = rect.rbox();

        const currentGroupBbox = this.group.bbox();
        const baseCanvasWidth = currentGroupBbox.width / this.zoomLevel;
        const baseCanvasHeight = currentGroupBbox.height / this.zoomLevel;

        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));

        const newCanvasWidth = baseCanvasWidth * this.zoomLevel; // = this.groupBbox.width * this.zoomLevel;
        const newCanvasHeight = baseCanvasHeight * this.zoomLevel; // = this.groupBbox.height * this.zoomLevel;
        this.group.size(newCanvasWidth, newCanvasHeight);
        this.group.move(0, 0);
        this.canvas.size(newCanvasWidth, newCanvasHeight);

        const rectBbox2 = rect.rbox();
        rect.remove();

        const nonScalingElements = this.group.find(".non-scaling");

        // Applying inverse scale to these elements
        nonScalingElements.forEach((element) => {
            const siteSize = element.data("siteSize");
            const siteScale = element.data("scale");
            const newSiteSize = siteSize / this.zoomLevel;

            const widthPercent = element.data("widthPercent");
            const heightPercent = element.data("heightPercent");

            const unitElement = element.parent().findOne(".unit-path");
            const unitBbox = unitElement.bbox();

            const newX = unitBbox.x * siteScale + widthPercent * unitBbox.width * siteScale - newSiteSize/2;
            const newY =  unitBbox.y * siteScale + heightPercent * unitBbox.height * siteScale - newSiteSize/2;
    
            element.size(newSiteSize, newSiteSize);
            element.move(newX, newY);
        });

        const svgElement = this.canvasElement.querySelector("svg"); 
        const svgBounding = svgElement.getBoundingClientRect();
    
        if (svgElement.clientHeight > this.canvasHeight) {
            //console.log(this.container.scrollLeft - rectBbox.x + rectBbox2.x);
            this.container.scrollLeft = this.container.scrollLeft - rectBbox.x + rectBbox2.x;
            this.container.scrollTop =this.container.scrollTop - rectBbox.y + rectBbox2.y;
        } else {
            //const translateX = this.canvasWidth / 2 - svgBounding.width / 2;
            //const translateY = this.canvasHeight / 2 - svgBounding.height / 2;
            //svgElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
            
        }
    }

    handleUnitMove(event) {
        requestAnimationFrame(() => {
            this.updateMousePosition(event);
            const moveX = (this.mouseX - this.startX)/this.zoomLevel;
            const moveY = (this.mouseY - this.startY)/this.zoomLevel;
            //console.log(moveX, moveY);
            for (const unit of this.moveUnits) {
                unit.movePositionBy(moveX, moveY);
            }
        });
    }

    getId(element) {
        return element.getAttribute("id").split("-")[1];
    }

    getUnit(element) {
        const unitId = this.getId(element);
        return this.units[unitId];
    }
    
    handleUnitDown(event) {
        this.updateMousePosition(event);
        this.startX = this.mouseX;
        this.startY = this.mouseY; 
        this.isDraggingUnit = true;
        
        const unit = this.getUnit(event.target);
        unit.updatePosition();
        unit.bringToFront();
        unit.setMoveCursor();
        this.moveUnits.push(unit);
    }

    handleWheel(event) {
        event.preventDefault();
        this.updateMousePosition(event);
        if (Math.abs(event.deltaY) < 4) return;
        this.zoom(event.deltaY < 0 ? this.zoomFactor : -this.zoomFactor);
    }

    resetMoveSymbol() {
        for (const unit of this.moveUnits) {
            unit.updatePosition();
            unit.unsetMoveCursor();
        }
        this.moveUnits = [];
        this.isDraggingUnit = false;
        
        if (this.isDeletingUnit) {
            for (const unit of this.moveUnits) {
                unit.delete()
            }
            this.isDeletingUnit = false;
        }
    }

    handleUnitHover(element) {
        //console.log("handleUnitHover", element);

        // instead of having a hover sites array, we have one unit
        // if we are hovering over a new unit, we first unhover the last unit
        
        const unit = this.getUnit(element);
        if (this.hoverUnit !== unit) {
            this.handleNotUnitHover()
        }

        this.hoverUnit = unit;
        this.hoverUnit.showSites();

        /*if (!this.hoverUnits.includes(unit)) {
            unit.showSites();
            this.hoverUnits.push(unit);
        }*/
    }

    handleNotUnitHover() {
        //this.hoverUnits.forEach((hoverUnit) => hoverUnit.hideSites());
        //this.hoverUnits = [];
        if (this.hoverUnit) {
            this.hoverUnit.hideSites();
            this.hoverUnit = null;
        }
    }

    handleSiteHover(siteElement, unitElement) {
        //console.log("handle site hover", siteElement, unitElement);
        const siteId = this.getId(siteElement);
        //console.log("site id", siteId);
        const unit = this.getUnit(unitElement);
        unit.hoverSite(siteId);
    }

    handleNotSiteHover() {
        //this.hoverUnits.forEach((hoverUnit) => hoverUnit.notHoverSites());
        if (this.hoverUnit) this.hoverUnit.notHoverSites();
    }
    
    handlePanStart(event) {
        this.panStartX = event.clientX;
        this.panStartY = event.clientY;
        this.scrollLeft = this.container.scrollLeft;
        this.scrollTop = this.container.scrollTop;
    }

    handlePanMove(event) {
        const deltaX = event.clientX - this.panStartX;
        const deltaY = event.clientY - this.panStartY;
        //console.log("hanlde pan move", this.container);
    
        this.container.scrollLeft = this.scrollLeft - deltaX;
        this.container.scrollTop = this.scrollTop - deltaY;
    }
    


}

export default Canvas; 
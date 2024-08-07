const symbols = {
    square: {
        dimensions: {width: 75, height: 75},
        pathData: "M40.5,5.5H7.5a2,2,0,0,0-2,2v33a2,2,0,0,0,2,2h33a2,2,0,0,0,2-2V7.5A2,2,0,0,0,40.5,5.5Z",
        textCentre: {x: 0.5, y: 0.5},
        toSites: [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.5, 1], [0, 1], [1, 0.5], [1, 1]],
        fromSites: [[0.25, 0], [0.5, 0], [0.75, 0], [0, 0.5], [0.5, 1], [0, 1], [1, 0.5], [1, 1]]
    }
}

// fromSites: [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.5, 1], [0, 1], [1, 0.5], [1, 1]]

class Site {
    static SITE_SIZE = 8;
    static SITE_PATH = "M7.5 9.125C8.39746 9.125 9.125 8.39746 9.125 7.5C9.125 6.60254 8.39746 5.875 7.5 5.875C6.60254 5.875 5.875 6.60254 5.875 7.5C5.875 8.39746 6.60254 9.125 7.5 9.125ZM7.5 10.125C8.94975 10.125 10.125 8.94975 10.125 7.5C10.125 6.05025 8.94975 4.875 7.5 4.875C6.05025 4.875 4.875 6.05025 4.875 7.5C4.875 8.94975 6.05025 10.125 7.5 10.125Z";

    constructor(unitElement, unitGroup, siteLocation, zoomLevel) {
        this.widthPercent = siteLocation[0];
        this.heightPercent = siteLocation[1];
        this.siteSize = Site.SITE_SIZE * zoomLevel;
        this.siteElement = this.createSite(unitElement, unitGroup, zoomLevel);
    }

    createSite(unitElement, unitGroup, zoomLevel) {
        const unitBbox = unitElement.bbox();
        const xPosition = unitBbox.x * zoomLevel + this.widthPercent * unitBbox.width * zoomLevel - Site.SITE_SIZE/2; 
        const yPosition = unitBbox.y * zoomLevel + this.heightPercent * unitBbox.height * zoomLevel - Site.SITE_SIZE/2; 
        this.createSiteAtCoordinates(unitGroup, xPosition, yPosition, zoomLevel);       
    }

    createSiteAtCoordinates(unitGroup, xPosition, yPosition, zoomLevel) {
        const siteElement = unitGroup.path(Site.SITE_PATH).size(Site.SITE_SIZE, Site.SITE_SIZE).move(xPosition, yPosition).fill("#00AFAE");
        siteElement.addClass("non-scaling");
        siteElement.data("siteSize", this.siteSize);
        siteElement.data("widthPercent", this.widthPercent);
        siteElement.data("heightPercent", this.heightPercent);
        siteElement.data("scale", zoomLevel);
        return siteElement;
    }
}

class Unit {
    static idCounter = 0;

    constructor(group, x, y, symbolName, zoomLevel) {

        const symbol = symbols[symbolName];
        this.fromSites = [];

        this.unitGroup = group.group();
        this.unitGroup.addClass("unit");

        this.id = Unit.idCounter++;
        this.scale = zoomLevel;

        const width = symbol.dimensions.width;
        const height = symbol.dimensions.height;

        const xPosition = x/this.scale - width/2; // (x - width / 2) / this.scale; 
        const yPosition = y/this.scale - height/2; // (y - height / 2) / this.scale;

        // Create and configure the element
        this.element = this.unitGroup.path(symbol.pathData)
            .attr({
                fill: 'white',
                stroke: 'black',
                'stroke-width': 1,
                id: `unit-${this.id}`,
                class: "unit-path"
            })
            .size(width, height)
            .scale(this.scale, 0, 0)
            .move(xPosition, yPosition);

        this.border = this.unitGroup.rect(width, height)
            .fill('none')
            .stroke({ width: 0})
            .scale(this.scale, 0, 0)
            .move(xPosition, yPosition);

        symbol.fromSites.forEach((fromSite) => {
            this.fromSites.push(new Site(this.element, this.unitGroup, fromSite, zoomLevel))
        })
        this.updatePosition();
    }

    createUnit() {
        
    }

    movePositionBy(moveX, moveY) {
        const newX = this.x + moveX*this.scale;
        const newY = this.y + moveY*this.scale;
        this.unitGroup.move(newX, newY);
    }

    setMoveCursor() {
        this.unitGroup.addClass("unit-move");
        //this.border.stroke({ width: 1, color: '#11D1D0', dasharray: '3, 4' });
        this.border.stroke({ width: 1, color: '#11D1D0'});
    }

    unsetMoveCursor() {
        this.unitGroup.removeClass("unit-move");
        this.border.stroke({ width: 0 });
    }

    updatePosition() {
        const bbox = this.unitGroup.bbox();
        this.x = bbox.x;
        this.y = bbox.y;
    }

    bringToFront() {
        this.unitGroup.front();
    }

    delete() {
        this.unitGroup.remove();
    }

    hide() {
        this.unitGroup.attr({ visibility: 'hidden' });
    }

    show() {
        this.unitGroup.attr({ visibility: 'visible' });
    }
}

export default Unit; 
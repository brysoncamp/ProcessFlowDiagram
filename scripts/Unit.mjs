const symbols = {
    square: {
        dimensions: {width: 75, height: 75},
        pathData: "M40.5,5.5H7.5a2,2,0,0,0-2,2v33a2,2,0,0,0,2,2h33a2,2,0,0,0,2-2V7.5A2,2,0,0,0,40.5,5.5Z",
        textCentre: {x: 0.5, y: 0.5},
        toSites: [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.5, 1], [0, 1], [1, 0.5], [1, 1]],
        fromSites: [[0.25, 0], [0.5, 0], [0.75, 0], [0, 0.5], [0.5, 1], [0, 1], [1, 0.5], [1, 1]]
    },
    circle: {
        dimensions: {width: 75, height: 75},
        pathData: "M24,2.5 A21.5,21.5 0 1,1 24,45.5 A21.5,21.5 0 1,1 24,2.5",
        textCentre: {x: 0.5, y: 0.5},
        toSites: [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.5, 1], [0, 1], [1, 0.5], [1, 1]],
        fromSites: [[0.5, 0], [0, 0.5], [0.5, 1], [1, 0.5]]
    }
    
}

// fromSites: [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.5, 1], [0, 1], [1, 0.5], [1, 1]]

class Site {
    static idCounter = 0;

    static SITE_SIZE = 16; // This will represent the diameter of the outer circle
    static OUTER_CIRCLE_PATH = "M7.5 9.125C8.39746 9.125 9.125 8.39746 9.125 7.5C9.125 6.60254 8.39746 5.875 7.5 5.875C6.60254 5.875 5.875 6.60254 5.875 7.5C5.875 8.39746 6.60254 9.125 7.5 9.125Z";
    static INNER_CIRCLE_PATH = "M7.5 5.875A1.625 1.625 0 1 1 7.5 9.125A1.625 1.625 0 1 1 7.5 5.875Z"; // Smaller circle inside

    constructor(unitElement, unitGroup, siteLocation, zoomLevel, outerColor = "rgba(0, 175, 174, 0.25)", innerColor = "#00AFAE") {
        this.id = Site.idCounter++;
        this.widthPercent = siteLocation[0];
        this.heightPercent = siteLocation[1];
        this.siteSize = Site.SITE_SIZE * zoomLevel;
        this.outerColor = outerColor;
        this.innerColor = innerColor;
        this.siteElement = this.createSite(unitElement, unitGroup, zoomLevel);
    }

    createSite(unitElement, unitGroup, zoomLevel) {
        const unitBbox = unitElement.bbox();
        const xPosition = unitBbox.x * zoomLevel + this.widthPercent * unitBbox.width * zoomLevel - Site.SITE_SIZE / 2; 
        const yPosition = unitBbox.y * zoomLevel + this.heightPercent * unitBbox.height * zoomLevel - Site.SITE_SIZE / 2;
        return this.createSiteAtCoordinates(unitGroup, xPosition, yPosition, zoomLevel);       
    }

    createSiteAtCoordinates(unitGroup, xPosition, yPosition, zoomLevel) {
        // Create outer circle
        const outerCircle = unitGroup.circle(Site.SITE_SIZE)
            .move(xPosition, yPosition)
            .fill("transparent")
            .addClass("unit-site");
        
        // Create inner circle (smaller and centered inside the outer circle)
        const innerCircle = unitGroup.circle(Site.SITE_SIZE / 2)
            .move(xPosition + Site.SITE_SIZE / 4, yPosition + Site.SITE_SIZE / 4) // Center the inner circle
            .fill("transparent")
            .addClass("unit-site");
        
        // Create a group for both circles and store data
        const siteGroup = unitGroup.group().add(outerCircle).add(innerCircle);
        siteGroup.addClass("non-scaling site");
        siteGroup.attr("id", `site-${this.id}`);
        siteGroup.data("siteSize", this.siteSize);
        siteGroup.data("widthPercent", this.widthPercent);
        siteGroup.data("heightPercent", this.heightPercent);
        siteGroup.data("scale", zoomLevel);
        return siteGroup;
    }

    showSite() {
        //this.siteElement.children()[0].fill(this.outerColor); // Outer circle
        this.siteElement.children()[1].fill(this.innerColor); // Inner circle
    }

    hideSite() {
        this.siteElement.children()[0].fill("transparent"); // Outer circle
        this.siteElement.children()[1].fill("transparent"); // Inner circle
    }

    hoverSite() {
        this.siteElement.children()[0].fill(this.outerColor); // Outer circle
    }

    notHoverSite() {
        this.siteElement.children()[0].fill("transparent");
    }
}


class Unit {
    static idCounter = 0;

    constructor(group, x, y, symbolName, zoomLevel) {

        Site.idCounter = 0;

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

    showSites() {
        this.fromSites.forEach((fromSite) => {
            fromSite.showSite();
        })
    }

    hideSites() {
        this.fromSites.forEach((fromSite) => {
            fromSite.hideSite();
        })
    }

    hoverSite(siteId) {
        const site = this.fromSites[siteId];
        site.hoverSite();
    }

    notHoverSites() {
        this.fromSites.forEach((fromSite) => fromSite.notHoverSite());
    }
}

export default Unit; 
class Unit {
    static idCounter = 0;

    constructor(group, x, y, pathData) {
        this.group = group;
        this.pathData = pathData;
        this.id = Unit.idCounter++;
        this.scale = 1;

        this.unitGroup = this.group.group();


        this.element = this.unitGroup.path(pathData)
            .attr({
                fill: 'white',
                stroke: 'black',
                'stroke-width': 1,
                class: 'unit',
                id: `unit-${this.id}`
            })
            .move(x, y);

        this.border = this.unitGroup.rect(37, 37)
            .fill('none')
            .stroke({ width: 0})
            .move(x, y);

        this.updatePosition();
    }

    movePositionBy(moveX, moveY) {
        const newX = this.x + moveX/this.scale;
        const newY = this.y + moveY/this.scale;
        this.unitGroup.move(newX, newY);
    }

    setMoveCursor() {
        this.group.addClass("unit-move");
        this.border.stroke({ width: 1, color: '#11D1D0', dasharray: '3, 4' });
    }

    unsetMoveCursor() {
        this.group.removeClass("unit-move");
        this.border.stroke({ width: 0 });
    }

    updatePosition() {
        const bbox = this.unitGroup.bbox();
        this.x = bbox.x;
        this.y = bbox.y;
        console.log(this.x, this.y)
    }
}

export default Unit; 
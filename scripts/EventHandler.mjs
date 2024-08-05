import Canvas from "./Canvas.mjs";
import Sidebar from "./Sidebar.mjs";

class EventHandler {
    constructor() {
        this.setupElements();
        this.setupObjects();
    }

    setupElements() {
        this.canvasContainer = document.getElementById("canvasContainer");
        this.search = document.getElementById("search");
    }

    setupObjects() {
        this.canvas = new Canvas();
        this.sidebar = new Sidebar();
    }

    handleResize(event) {
        this.canvas.handleResize(event);
    }

    handleClick(event) {
        const closestCategoryName = event.target.closest('.symbol-category-name');
        if (closestCategoryName) {
            this.sidebar.toggleSymbolCategory(closestCategoryName);
        }

        if (event.target.id === "cross") {
            this.sidebar.clearSearchValue();
        }
    }

    handleMousedown(event) {
        const closestSymbol = event.target.closest(".symbol");
        if (closestSymbol) {
            this.sidebar.handleSymbolDown(event);
        }

        const closestUnit = event.target.closest(".unit");
        if (closestUnit) {
            this.canvas.handleUnitDown(event);
        }
    }

    handleMouseup(event) {
        this.sidebar.resetDraggingSymbol(event);
        this.canvas.resetMoveSymbol();
    }

    handleMousemove(event) {
        if (this.sidebar.isDraggingSymbol) {
            this.sidebar.handleDraggingMove(event);
        }

        if (this.canvas.isDraggingUnit) {
            this.canvas.handleUnitMove(event);
        }
    }

    setupListeners() {
        window.addEventListener("resize", this.handleResize.bind(this));

        document.addEventListener("click", this.handleClick.bind(this));
        document.addEventListener("mouseup", this.handleMouseup.bind(this));
        document.addEventListener("mousedown", this.handleMousedown.bind(this));
        document.addEventListener("mousemove", this.handleMousemove.bind(this));
        document.addEventListener("mouseover", this.sidebar.handleMouseoverSymbol.bind(this.sidebar));

        this.canvasContainer.addEventListener("mousemove", this.canvas.updateMousePosition.bind(this.canvas));
        this.canvasContainer.addEventListener("wheel", this.canvas.handleWheel.bind(this.canvas));

        this.search.addEventListener("input", this.sidebar.handleSearchInput.bind(this.sidebar));
    }
}

const eventHandler = new EventHandler();
eventHandler.setupListeners();
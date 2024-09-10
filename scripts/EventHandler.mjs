import Canvas from "./Canvas.mjs";
import Sidebar from "./Sidebar.mjs";

class EventHandler {
    constructor() {
        this.setupElements();
        this.setupObjects();

        this.handlePanMoveBound = this.canvas.handlePanMove.bind(this.canvas);
        this.handlePanMouseupBound = this.handlePanMouseup.bind(this);
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

    
    setUnitCursor(cursorStyle) {
        document.documentElement.style.setProperty('--unit-cursor', cursorStyle);
    }
    
    handleMousedown(event) {

        const isRightClick = event.button === 2;
        const isCanvasClick = event.target.closest("#canvas") ? true : false;
 
        if (isCanvasClick && isRightClick) {
            console.log("right click on canvas");
            this.canvas.handlePanStart(event);
            this.canvasContainer.style.cursor = "grabbing";
            this.setUnitCursor("grabbing");
            document.addEventListener("mousemove", this.handlePanMoveBound);
            document.addEventListener("mouseup", this.handlePanMouseupBound);

        }

        if (isRightClick) return;
        
        const closestSymbol = event.target.closest(".symbol");
        if (closestSymbol) {
            this.sidebar.handleSymbolDown(event);
        }

        const closestUnit = event.target.closest(".unit");
        const closestSite = event.target.closest(".site");
        if (closestUnit && !closestSite) {
            this.canvas.handleUnitDown(event);
        } else if (closestSite) {
            console.log("handle site click");
        }

       
    }

    handlePanMouseup() {
        console.log("mouse up happening");
        this.setUnitCursor("pointer");
        this.canvasContainer.style.cursor = "default";
        document.removeEventListener("mousemove", this.handlePanMoveBound);
        document.removeEventListener("mouseup", this.handlePanMouseupBound);
    }

    handleMouseup(event) {
        this.sidebar.resetDraggingSymbol(event);
        this.canvas.resetMoveSymbol();

        /*if (event.target.classList.contains('unit-path')) {
            this.canvas.handleUnitHover(event);
        }*/
    }

    handleMousemove(event) {
        if (this.sidebar.isDraggingSymbol) {
            this.sidebar.handleDraggingMove(event);
        }

        if (this.canvas.isDraggingUnit) {
            this.canvas.handleUnitMove(event);
        }
    }

    handleMouseover(event) {
        if (this.sidebar.isDraggingSymbol && !this.canvas.isDraggingUnit) {
            const isCanvasElement = event.target.closest("#canvasContainer");
            if (isCanvasElement) {
                console.log("create unit");
                this.canvas.handleUnitDrop(event, this.sidebar.draggingSymbolName);
            }
        } else if (this.sidebar.isDraggingSymbol && this.canvas.isDraggingUnit) {
            const isCanvasElement = event.target.closest("#canvasContainer");
            if (!isCanvasElement) {
                console.log("delete unit");
                this.canvas.deleteRecentUnit();
            }
        } else if (this.canvas.isDraggingUnit) {
            const isCanvasElement = event.target.closest("#canvasContainer");
            if (!isCanvasElement) {
                console.log("stop moving unit");
                this.canvas.deleteMovingUnit();
                //this.canvas.resetMoveSymbol();
            } else if (this.canvas.isDeletingUnit) {
                this.canvas.dropDeletingUnit();
            }
        } else if (event.target.classList.contains('unit-path')) {
            this.canvas.handleUnitHover(event.target);
            this.canvas.handleNotSiteHover();
            
        } else if (event.target.classList.contains('unit-site')) {
            const unitElement = event.target.parentElement.parentElement.querySelector(".unit-path");
            this.canvas.handleUnitHover(unitElement);
            this.canvas.handleSiteHover(event.target.parentElement, unitElement);
            //console.log(event.target.parentElement);
            
        } else {
            //console.log("remove", event.target);
            this.canvas.handleNotSiteHover();
            this.canvas.handleNotUnitHover();
        }

        // else if mouse is not over one of the sites, turn off all sites. 


        // if (event.target.contains class unit-path then
          // the

    }



    setupListeners() {
        window.addEventListener("resize", this.handleResize.bind(this));

        document.addEventListener("click", this.handleClick.bind(this));
        document.addEventListener("mouseup", this.handleMouseup.bind(this));
        document.addEventListener("mousedown", this.handleMousedown.bind(this));
        document.addEventListener("mousemove", this.handleMousemove.bind(this));
        document.addEventListener("mouseover", this.handleMouseover.bind(this));
        document.addEventListener("mouseover", this.sidebar.handleMouseoverSymbol.bind(this.sidebar));

        this.canvasContainer.addEventListener("mousemove", this.canvas.updateMousePosition.bind(this.canvas));
        this.canvasContainer.addEventListener("wheel", this.canvas.handleWheel.bind(this.canvas));
        this.canvasContainer.addEventListener('contextmenu', (event) => event.preventDefault());

        this.search.addEventListener("input", this.sidebar.handleSearchInput.bind(this.sidebar));
    }
}

const eventHandler = new EventHandler();
eventHandler.setupListeners();
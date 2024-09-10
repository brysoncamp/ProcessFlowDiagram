class Sidebar {
    constructor() {
        this.setupElements();
        this.setupVariables();
    }

    setupElements() {
        this.symbolHighlight = document.getElementById("symbolHighlight");
        this.symbolHighlightName = document.getElementById("symbolHighlightName");
        this.symbolHighlightImage = document.getElementById("symbolHighlightImage");
        this.search = document.getElementById("search");
        this.cross = document.getElementById("cross");
        this.symbols = document.querySelectorAll(".symbol");
        this.symbolCategories = document.querySelectorAll(".symbol-category-name");
        this.symbolDragging = document.getElementById("symbolDragging");
        this.sidebar = document.getElementById("sidebar");
    }

    setupVariables() {
        this.isDraggingSymbol = false;
        this.sidebarTopOffset = this.sidebar.getBoundingClientRect().top;
        this.sidebarRightOffset = this.sidebar.getBoundingClientRect().right;
        this.symbolDraggingOffset = this.symbolDragging.clientHeight/2;
    }

    toggleSymbolCategory(closestCategoryName) {
        closestCategoryName.classList.toggle("closed");
    }

    updateHighlightName(mouseoverSymbol) {
        const mouseoverSybolName = mouseoverSymbol.dataset.name;
        this.symbolHighlightName.innerText = mouseoverSybolName ? mouseoverSybolName : "";
    }

    updateHighlightPosition(event, mouseoverSymbol) {
        const symbolRect = event.target.getBoundingClientRect();
        this.symbolHighlight.style.top = symbolRect.top - this.symbolHighlight.offsetHeight/2 - mouseoverSymbol.offsetHeight/2 + 6 + "px";
    }

    updateHighlightImage(mouseoverSymbol) {
        this.symbolHighlightImage.innerHTML = "";
        const mouseoverSymbolImage = mouseoverSymbol.querySelector("img");
        if (mouseoverSymbolImage) symbolHighlightImage.insertAdjacentHTML("beforeend", mouseoverSymbolImage.outerHTML);
    }

    handleMouseoverSymbol(event) {
        const mouseoverSymbol = event.target.closest(".symbol");
        if (mouseoverSymbol && !this.isDraggingSymbol) {
            this.updateHighlightName(mouseoverSymbol);
            this.updateHighlightPosition(event, mouseoverSymbol);
            this.updateHighlightImage(mouseoverSymbol);
            symbolHighlight.classList.add("highlight-visible");
        } else {
            symbolHighlight.classList.remove("highlight-visible")
        }
    }

    filterSymbolsBySearchTerm(searchTerm) {
        this.symbols.forEach(symbol => {
            const nameData = symbol.getAttribute("data-name");
            if (!nameData) return;
            
            const name = nameData.toLowerCase();
    
            if (name.includes(searchTerm)) {
                symbol.classList.remove("symbol-hidden");
            } else {
                symbol.classList.add("symbol-hidden");
            }
        });
    }

    updateVisibleCategories() {
        this.symbolCategories.forEach(symbolCategory => {
            const symbolCollection = symbolCategory.nextElementSibling;
            const notAllSymbolsHidden = symbolCollection && symbolCollection.querySelectorAll(".symbol:not(.symbol-hidden)").length > 0;
            if (notAllSymbolsHidden) {
                symbolCategory.classList.remove("closed");
            } else {
                symbolCategory.classList.add("closed");
            }
        });
    }

    hideOrShowCross(searchValue) {
        if (searchValue === "") {
            this.cross.classList.add("cross-hidden");
        } else {
            this.cross.classList.remove("cross-hidden");
        }
    }

    handleSearchInput(event) {
        const searchValue = event.target.value;
        const searchTerm = searchValue ? searchValue.toLowerCase() : "";
        this.filterSymbolsBySearchTerm(searchTerm);
        this.updateVisibleCategories();
        this.hideOrShowCross(searchValue);
    }
    
    clearSearchValue() {
        this.search.value = "";
        this.symbolCategories.forEach(symbolCategory => symbolCategory.classList.remove("closed"));
        const hiddenSymbols = document.querySelectorAll(".symbol-hidden");
        hiddenSymbols.forEach(hiddenSymbol => hiddenSymbol.classList.remove("symbol-hidden"));
        this.cross.classList.add("cross-hidden");
    }

    hideDraggingSymbol() {
        this.symbolDragging.style.left = "-10rem";
        this.symbolDragging.style.top = "-10rem";
    }

    resetDraggingSymbol() {
        const symbolsDown = document.querySelectorAll(".symbol-down");
        symbolsDown.forEach(symbolDown => {
            symbolDown.classList.remove("symbol-down");
        })
        this.isDraggingSymbol = false;
        this.hideDraggingSymbol();
    }

    startDraggingSymbol(symbol) {
        this.isDraggingSymbol = true;
        this.draggingSymbolName = symbol.getAttribute('data-name').toLowerCase();;
        symbol.classList.add("symbol-down");
        this.symbolHighlight.classList.remove("highlight-visible");
    }

    updateDraggingImage(symbol) {
        this.symbolDragging.innerHTML = "";
        const mousedownSymbolImage = symbol.querySelector("img");
        if (mousedownSymbolImage) this.symbolDragging.insertAdjacentHTML("beforeend", mousedownSymbolImage.outerHTML);
    }

    handleSymbolDown(event) {
        const symbol = event.target.closest(".symbol");
        if (symbol) {
            this.startDraggingSymbol(symbol);
            this.updateDraggingImage(symbol);
        }
    }

    handleDraggingMove(event) {
        const isWithinSidebar = event.clientX <= this.sidebarRightOffset;
        if (isWithinSidebar) {
            this.symbolDragging.style.left = `${event.clientX - this.symbolDraggingOffset}px`;
            this.symbolDragging.style.top = `${event.clientY - this.sidebarTopOffset - this.symbolDraggingOffset}px`;
        } else {
            this.hideDraggingSymbol();
        }
    }
}

export default Sidebar;
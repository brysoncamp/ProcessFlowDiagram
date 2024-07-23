// Collapsable Symbol Categories

const symbolCategories = document.querySelectorAll(".symbol-category-name");

const toggleSymbolCategory = (event) => {
    event.target.closest(".symbol-category-name").classList.toggle("closed");
}

symbolCategories.forEach((symbolCategory) => {
    symbolCategory.addEventListener("click", toggleSymbolCategory);
})

// Moving Symbol Highlight

const symbolHighlight = document.getElementById("symbolHighlight");
const symbolHighlightName = document.getElementById("symbolHighlightName");
const symbolHighlightImage = document.getElementById("symbolHighlightImage");

document.addEventListener("mouseover", (event) => {
    const mouseoverSymbol = event.target.closest(".symbol");
    if (mouseoverSymbol) {
        // Adjust highlight name
        const mouseoverSybolName = mouseoverSymbol.dataset.name;
        symbolHighlightName.innerText = mouseoverSybolName ? mouseoverSybolName : "";
        
        // Adjust highlight position
        const symbolRect = event.target.getBoundingClientRect();
        symbolHighlight.style.top = symbolRect.top - symbolHighlight.offsetHeight/2 - mouseoverSymbol.offsetHeight/2 + 6 + "px";
        
        // Adjust highlight image
        symbolHighlightImage.innerHTML = "";
        const mouseoverSymbolImage = mouseoverSymbol.querySelector("img");
        if (mouseoverSymbolImage) symbolHighlightImage.insertAdjacentHTML("beforeend", mouseoverSymbolImage.outerHTML);

        // Show highlight
        symbolHighlight.classList.add("highlight-visible");
    } else {
        // Hide highlight
        symbolHighlight.classList.remove("highlight-visible")
    }
})

// Clear Search

const search = document.getElementById("search");
const cross = document.getElementById("cross");

cross.addEventListener("click", () => {
    search.value = "";
    symbolCategories.forEach(symbolCategory => symbolCategory.classList.remove("closed"));
    const hiddenSymbols = document.querySelectorAll(".symbol-hidden");
    hiddenSymbols.forEach(hiddenSymbol => hiddenSymbol.classList.remove("symbol-hidden"));
    cross.classList.add("cross-hidden");
})

// Search Filtering

const symbols = document.querySelectorAll(".symbol");

search.addEventListener("input", (event) => {
    const searchValue = event.target.value;
    const searchTerm = searchValue ? searchValue.toLowerCase() : "";

    // Hide or show symbols dependent on the search term
    symbols.forEach(symbol => {
        const nameData = symbol.getAttribute("data-name");
        if (!nameData) return;
        
        const name = nameData.toLowerCase();

        if (name.includes(searchTerm)) {
            symbol.classList.remove("symbol-hidden");
        } else {
            symbol.classList.add("symbol-hidden");
        }
    });

    // Close empty categories and open non-empty categories
    symbolCategories.forEach(symbolCategory => {
        const symbolCollection = symbolCategory.nextElementSibling;
        const notAllSymbolsHidden = symbolCollection && symbolCollection.querySelectorAll(".symbol:not(.symbol-hidden)").length > 0;
        if (notAllSymbolsHidden) {
            symbolCategory.classList.remove("closed");
        } else {
            symbolCategory.classList.add("closed");
        }
    });

    // Hide or show cross
    if (searchValue === "") {
        cross.classList.add("cross-hidden");
    } else {
        cross.classList.remove("cross-hidden");
    }
});

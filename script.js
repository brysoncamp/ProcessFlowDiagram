const symbolCategories = document.querySelectorAll(".symbol-category-name");

const toggleSymbolCategory = (event) => {
    event.target.closest(".symbol-category-name").classList.toggle("closed");
}

symbolCategories.forEach((symbolCategory) => {
    symbolCategory.addEventListener("click", toggleSymbolCategory);
})
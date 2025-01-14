window.searchPokemon = function() {
  searchAndFilter();
};

window.searchAndFilter = function() {
  const searchTerm = document.getElementById("search-bar").value.toLowerCase().trim();
  const selectedType = document.getElementById("type-filter").value;
  const filtered = window.pokemonData.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(searchTerm);
    const matchesType = selectedType === "all" || pokemon.types.includes(selectedType);
    return matchesName && matchesType;
  });
  displayPokemon(filtered.slice(0, window.currentLimit));
};
document.addEventListener("DOMContentLoaded", () => {
    let offset = 20;
    const limit = 20;
  
    async function fetchPokemonList() {
      const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
      const response = await fetch(url);
      return await response.json();
    }
  
    async function fetchPokemonDetails(url) {
      const response = await fetch(url);
      return await response.json();
    }
  
    async function loadMorePokemon() {
      try {
        const { results: pokemonList } = await fetchPokemonList();
        const newPokemon = await Promise.all(
          pokemonList.map(async ({ url }) => {
            const { id, name, sprites, types } = await fetchPokemonDetails(url);
            return {
              id,
              name,
              image: sprites.other["official-artwork"].front_default || sprites.front_default,
              types: types.map(({ type }) => type.name),
            };
          })
        );
        appendPokemon(newPokemon);
      } catch (error) {
        console.error("Fehler beim Laden der Pokémon:", error);
      }
    }
  
    function createCardHTML(pokemon) {
    
      const template = document.getElementById("pokemon-card-template").innerHTML;
      const primaryType = pokemon.types[0];
      const cardHTML = template
        .replace(/{{id}}/g, pokemon.id)
        .replace(/{{type}}/g, primaryType)
        .replace(/{{image}}/g, pokemon.image)
        .replace(/{{name}}/g, pokemon.name)
        .replace(/{{nameCapitalized}}/g, capitalizeFirstLetter(pokemon.name))
        .replace(/{{typeIcons}}/g, pokemon.types.map((type) => `
          <img 
            src="./img/icons/${type}.svg" 
            alt="${type}" 
            title="${capitalizeFirstLetter(type)}"
            class="type-icon ${type}"
            onerror="this.src='img/icons/default.svg';"
          />
        `).join(""));
    
      return cardHTML;
    }
  
    function appendPokemon(pokemons) {
      const cardsContainer = document.getElementById("cards-container");
      pokemons.forEach((pokemon) => {
        const card = document.createElement("div");
        const primaryType = pokemon.types[0];
        card.classList.add("col-6", "col-md-4", "col-lg-3", "mb-4", `${primaryType}-card`);
        card.innerHTML = createCardHTML(pokemon);
        cardsContainer.appendChild(card);
      });
      setupDetailViewListeners();
    }
  
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  
    document.getElementById("load-more").addEventListener("click", () => {
      offset += limit;
      loadMorePokemon();
    });
  
    loadMorePokemon();
  });
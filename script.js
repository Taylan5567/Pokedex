function clearCardsContainer(c) {
  c.innerHTML = "";
}

function showNoPokemonFound(c) {
  c.innerHTML = "<p class='text-center'>Keine Pokémon gefunden!</p>";
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createCardHTML(p) {
  const template = document.getElementById("pokemon-card-template").innerHTML;
  const t = p.types[0];
  const cardHTML = template
    .replace(/{{id}}/g, p.id)
    .replace(/{{type}}/g, t)
    .replace(/{{image}}/g, p.image)
    .replace(/{{name}}/g, p.name)
    .replace(/{{nameCapitalized}}/g, capitalizeFirstLetter(p.name))
    .replace(/{{typeIcons}}/g, p.types.map(typeName => `
      <img 
        src="./img/icons/${typeName}.svg" 
        alt="${typeName}" 
        title="${capitalizeFirstLetter(typeName)}" 
        class="${typeName}"
        onerror="this.src='img/icons/default.svg';"
        style="width:50px; border-radius:10px;"
      />
    `).join(""));

  return cardHTML;
}


function createPokemonCardElement(p) {
  const card = document.createElement("div");
  card.classList.add("col-6", "col-md-4", "col-lg-3", "mb-4");
  card.innerHTML = createCardHTML(p);
  return card;
}

function appendPokemonCards(c, list) {
  list.forEach((p) => {
    const card = createPokemonCardElement(p);
    c.appendChild(card);
  });
}

window.displayPokemon = function(pokemonList) {
  clearCardsContainer(window.cardsContainer);
  if (pokemonList.length === 0) {
    showNoPokemonFound(window.cardsContainer);
    return;
  }
  appendPokemonCards(window.cardsContainer, pokemonList);
  setupDetailViewListeners();
};

window.populateTypeFilter = function(data) {
  const typeFilter = document.getElementById("type-filter");
  typeFilter.innerHTML = `<option value="all">Alle Typen</option>`;
  const uniqueTypes = new Set();
  data.forEach(p => p.types.forEach(t => uniqueTypes.add(t)));
  uniqueTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = capitalizeFirstLetter(type);
    typeFilter.appendChild(option);
  });
};

async function loadPokemon(limit = 151) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
  const data = await response.json();
  const detailedPokemon = await Promise.all(
    data.results.map(async (pokemon) => {
      const details = await fetch(pokemon.url).then(res => res.json());
      return {
        id: details.id,
        name: details.name,
        image: details.sprites.other["official-artwork"].front_default || details.sprites.front_default,
        types: details.types.map((type) => type.type.name)
      };
    })
  );
  window.pokemonData = detailedPokemon;
  displayPokemon(window.pokemonData.slice(0, window.currentLimit));
  populateTypeFilter(window.pokemonData);
}

document.addEventListener("DOMContentLoaded", async () => {
  window.pokemonData = [];
  window.currentLimit = 20;
  window.cardsContainer = document.getElementById("cards-container");
  await loadPokemon();
});
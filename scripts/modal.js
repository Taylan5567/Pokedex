document.addEventListener("DOMContentLoaded", () => {
  const detailsContainer = document.getElementById("pokemon-details");
  const detailsName = document.getElementById("details-name");
  const detailsImage = document.getElementById("details-image");
  const detailsId = document.getElementById("details-id");
  const detailsTypes = document.getElementById("details-types");
  const detailsWeight = document.getElementById("details-weight");
  const detailsHeight = document.getElementById("details-height");
  const detailsAbilities = document.getElementById("details-abilities");
  const detailsEvolutions = document.getElementById("details-evolutions");
  const closeDetailsBtn = document.getElementById("close-details");
  const prevDetailsBtn = document.getElementById("prev-details");
  const nextDetailsBtn = document.getElementById("next-details");

  async function fetchPokemonDetails(pokemonId) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    return await response.json();
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function setBasicDetails(data) {
    detailsName.textContent = capitalizeFirstLetter(data.name);
    detailsImage.src = data.sprites.other["official-artwork"].front_default || data.sprites.front_default || "./img/default.png";
    detailsId.textContent = `№ ${data.id}`;
    detailsWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;
    detailsHeight.textContent = `${(data.height / 10).toFixed(1)} m`;
  }

  function setTypes(data) {
    detailsTypes.innerHTML = data.types.map((type) => {
      const typeName = type.type.name;
      return `
        <img 
          src="./img/icons/${typeName}.svg" 
          alt="${typeName}" 
          title="${capitalizeFirstLetter(typeName)}" 
          class="type-icon ${typeName}" 
          onerror="this.src='img/icons/default.svg';" 
        />
      `;
    }).join("");
  }

  function setAbilities(data) {
    detailsAbilities.innerHTML = data.abilities
      .map((ability) => capitalizeFirstLetter(ability.ability.name))
      .join(", ");
  }

  async function fetchEvolutions(speciesUrl) {
    const speciesResponse = await fetch(speciesUrl);
    const speciesData = await speciesResponse.json();
    if (!speciesData.evolution_chain) return null;
    const evolutionsResponse = await fetch(speciesData.evolution_chain.url);
    return await evolutionsResponse.json();
  }

  async function setEvolutions(evolutionData) {
    const evolutions = [];
    for (let evo = evolutionData.chain; evo; evo = evo.evolves_to[0]) {
      const { name } = evo.species;
      const { sprites } = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then((res) => res.json());
      evolutions.push(`
        <div class="evolution">
          <img src="${sprites.other["official-artwork"].front_default || sprites.front_default || "./img/default.png"}" 
               alt="${capitalizeFirstLetter(name)}" 
               style="width:50px;height:50px;">
          <span>${capitalizeFirstLetter(name)}</span>
        </div>
      `);
    }
    detailsEvolutions.innerHTML = evolutions.join(" ") || "Keine Evolutionen verfügbar";
  }

  async function displayPokemonInfo(data) {
    setBasicDetails(data);
    setTypes(data);
    setAbilities(data);
  }
  
  async function handleEvolutions(data) {
    const evolutionData = await fetchEvolutions(data.species.url);
    if (evolutionData) await setEvolutions(evolutionData);
  }
  
  function updateCurrentIndex(data) {
    const currentIndex = window.pokemonData.findIndex(p => p.id === data.id);
    detailsContainer.dataset.currentIndex = currentIndex; 
    detailsContainer.style.display = "block";
    return currentIndex;
  }
  
  function updateDetailArrows(currentIndex) {
    prevDetailsBtn.style.display = currentIndex > 0 ? "inline-block" : "none";
    nextDetailsBtn.style.display = currentIndex < window.pokemonData.length - 1 ? "inline-block" : "none";
  }
  
  async function showPokemonDetails(pokemonId) {
    try {
      const data = await fetchPokemonDetails(pokemonId);
      await displayPokemonInfo(data);
      await handleEvolutions(data);
      const currentIndex = updateCurrentIndex(data);
      updateDetailArrows(currentIndex);
    } catch (error) {
      console.error("Fehler beim Laden der Pokémon-Details:", error);
    }
  }

  function setupDetailViewListeners() {
    document.querySelectorAll(".card[data-id]").forEach((card) => {
      card.addEventListener("click", () => showPokemonDetails(card.getAttribute("data-id")));
    });
  }

  closeDetailsBtn.addEventListener("click", () => {
    detailsContainer.style.display = "none";
  });

  prevDetailsBtn.addEventListener("click", () => {
    let idx = parseInt(detailsContainer.dataset.currentIndex, 10);
    if (idx > 0) {
      idx--;
      const prevPokemon = window.pokemonData[idx];
      showPokemonDetails(prevPokemon.id);
    }
  });

  nextDetailsBtn.addEventListener("click", () => {
    let idx = parseInt(detailsContainer.dataset.currentIndex, 10);
    if (idx < window.pokemonData.length - 1) {
      idx++;
      const nextPokemon = window.pokemonData[idx];
      showPokemonDetails(nextPokemon.id);
    }
  });

  window.setupDetailViewListeners = setupDetailViewListeners;
  window.showPokemonDetails = showPokemonDetails;
});
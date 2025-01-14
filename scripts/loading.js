document.addEventListener("DOMContentLoaded", () => {
    const loadingScreen = document.getElementById("loading-screen");
    const spinnerText = document.getElementById("spinner-text");

    const textArray = [
        "Wird geladen...", 
        "Daten werden vorbereitet...", 
        "Fast geschafft...", 
        "Pokémon werden geladen...", 
        "Bereit machen!"
    ];
    let textIndex = 0;

    setInterval(() => {
        textIndex = (textIndex + 1) % textArray.length; 
        spinnerText.textContent = textArray[textIndex];
    }, 2000);

    setTimeout(() => {
        loadingScreen.style.display = "none";
    }, 3000);
});
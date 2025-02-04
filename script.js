document.addEventListener("DOMContentLoaded", async () => {
    console.log("Fetching game data...");
    const gamesList = document.getElementById("games-list");

    try {
        const response = await fetch("https://cv-server-9l5d.onrender.com/get");
        const data = await response.json();

        if (data.error) {
            console.error("Error fetching game data:", data.error);
            return;
        }

        data.games.forEach(game => {
            const gameCard = document.createElement("div");
            gameCard.className = "game-card";
            gameCard.innerHTML = `
                <img src="${game.thumbnail_url}" alt="${game.name}">
                <h3>${game.name}</h3>
                <p>Players: ${game.active_users}</p>
                <p>Total Visits: ${game.total_plays}</p>
            `;
            gamesList.appendChild(gameCard);
        });

    } catch (error) {
        console.error("Error fetching games:", error);
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    console.log("heya?")
    const gamesList = document.getElementById("games-list");

    const response = await fetch("games.json");
    const games = await response.json();

    async function fetchGameDetails(gameId) {
        try {
            const universeResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${gameId}`);
            const universeData = await universeResponse.json();
            const gameData = universeData.data[0];
            console.log(gameData)

            const thumbnailResponse = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${gameId}&size=512x512&format=png`);
            const thumbnailData = await thumbnailResponse.json();
            const imageUrl = thumbnailData.data[0]?.imageUrl || "default-thumbnail.png";

            return {
                name: gameData.name,
                players: gameData.playing,
                visits: gameData.visits,
                image: imageUrl
            };
        } catch (error) {
            console.error(`Error fetching game data for ID ${gameId}:`, error);
            return null;
        }
    }

    for (const game of games) {
        const details = await fetchGameDetails(game.id);
        console.log("details:")
        console.log(details)
        if (!details) continue;

        const gameCard = document.createElement("div");
        gameCard.className = "game-card";
        gameCard.innerHTML = `
            <img src="${details.image}" alt="${details.name}">
            <h3>${details.name}</h3>
            <p>Players: ${details.players}</p>
            <p>Total Visits: ${details.visits}</p>
        `;
        gamesList.appendChild(gameCard);
    }
});

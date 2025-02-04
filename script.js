document.addEventListener("DOMContentLoaded", async () => {
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    document.body.appendChild(overlay);

    const popup = document.createElement("div");
    popup.id = "popup";
    popup.innerHTML = `
        <div id="popup-content">
            <span id="close-popup">&times;</span>
            <h2 id="popup-title"></h2>
            <p><a id="popup-link" href="#" target="_blank"></a></p>
            <div class="game-desc"><p id="popup-contributions"></p></div>
        </div>
    `;
    document.body.appendChild(popup);

    function closePopup() {
        overlay.style.display = "none";
        popup.style.display = "none";
    }

    overlay.addEventListener("click", closePopup);
    document.getElementById("close-popup").addEventListener("click", closePopup);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closePopup();
    });

    const gamesList = document.getElementById("games-list");
    try {
        const response = await fetch("https://cv-server-9l5d.onrender.com/get");
        const data = await response.json();

        const loader = document.getElementById("loader");
        if (loader) {
            loader.remove();
        }

        if (data.error) {
            console.error("Error fetching game data:", data.error);
            return;
        }

        const sortedGames = data.data.sort((a, b) => b.total_plays - a.total_plays);
        sortedGames.forEach(game => {
            const gameCard = document.createElement("div");
            gameCard.className = "game-card";
            gameCard.innerHTML = `
                <img src="${game.thumbnail_url}" alt="${game.name}">
                <h3>${game.name}</h3>
                <p>Active Players: ${game.active_users}</p>
                <p>Total Visits: ${game.total_plays}</p>
            `;
            gamesList.appendChild(gameCard);

            gameCard.addEventListener('click', function () {
                gameCard.addEventListener("click", function () {
                    document.getElementById("popup-title").textContent = game.name;
                    document.getElementById("popup-link").href = "https://roblox.com/games/" + game.root_place;
                    document.getElementById("popup-link").textContent = "Click here to play";
                    document.getElementById("popup-contributions").innerHTML = game.extra_description;
    
                    overlay.style.display = "block";
                    popup.style.display = "block";
                });
            });
        });

    } catch (error) {
        console.error("Error fetching games:", error);
    }
});

const startTime = 1630317600
const unixTime = Math.floor(Date.now() / 1000);
const difference = Math.floor((unixTime-startTime)/31556926);

const lastCache = Number(localStorage.getItem("lastCache"))
const cache = localStorage.getItem("cache")
let useCache = false
if (lastCache && (unixTime - lastCache) < 180 && cache) { // reload after at least a minute
    useCache = true
}

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("particles-container")
    function createParticle() {
        const particle = document.createElement("div")
        particle.classList.add("particle")
                
        const size = Math.random() * 6 + 4
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${Math.random() * 100}vw`
            
        const duration = Math.random() * 5 + 5
        particle.style.animationDuration = `${duration}s`
            
        container.appendChild(particle)
            
        setTimeout(() => {
            particle.remove()
        }, duration * 1000)
    }
    setInterval(createParticle, 100)
    
    document.getElementById("stat-active").innerText = String(difference) + "+"

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
    let totalVisits = 0
    let totalPlayers = 0
    try {
        let data = {}
        if (useCache) {
            data = JSON.parse(cache)
        } else {
            const response = await fetch("https://cv-server-9l5d.onrender.com/get");
            data = await response.json();

            localStorage.setItem("lastCache", String(Math.floor(Date.now()/1000)))
            localStorage.setItem("cache", JSON.stringify(data))
        }

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
            totalVisits += game.total_plays
            totalPlayers += game.active_users

            if (game.total_plays >= 1000000) {
                game.total_plays = String(Math.floor(game.total_plays/100000)/10) + "M+"
            } else if (game.total_plays >= 1000) {
                game.total_plays = String(Math.floor(game.total_plays/100)/10) + "K+"
            }

            const gameCard = document.createElement("div");
            gameCard.className = "game-card";
            gameCard.innerHTML = `
                <img src="${game.thumbnail_url}" class="thumbnail" alt="${game.name}">
                <h3>${game.name}</h3>
                <p class="holder"><img src="Assets/People.png" class="token">${game.active_users}</p>
                <p class="holder"><img src="Assets/Eye.png" class="token">${game.total_plays}</p>
            `;
            gamesList.appendChild(gameCard);

            gameCard.addEventListener('click', function () {
                document.getElementById("popup-title").textContent = game.name;
                document.getElementById("popup-link").href = "https://roblox.com/games/" + game.root_place;
                document.getElementById("popup-link").textContent = "Click here to play";
                document.getElementById("popup-contributions").innerHTML = game.extra_description;
    
                overlay.style.display = "block";
                popup.style.display = "block";
            });
        });

        document.getElementById("stat-players").innerText = String(totalPlayers)
        document.getElementById("stat-visits").innerText = String(Math.floor(totalVisits/100000)/10) + "M+"
    } catch (error) {
        console.error("Error fetching games:", error);
        const loader = document.getElementById("loader");
        if (loader) {
            loader.innerText = "Load failed.";
        }
    }
});

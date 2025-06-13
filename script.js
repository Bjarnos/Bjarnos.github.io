// Settings
const placeIds = [78606358056604, 17554141378, 127214494370392, 92774394395352, 127022380236821, 91538944718650];
const descriptions = {
    default: "error",
    78606358056604: "🐛 Reported multiple exploitable features and bugs",
    17554141378: "🐛 Done a lot of bug patches<br>⚡ Added a few extra features, like events",
    127214494370392: "🛡️ Created an anti-exploit system that prevents spawning currency<br>🚫 Banned all old exploiters<br>⚡ Added a lot of new features including SurfaceAppearances and new pets",
    92774394395352: "🥚 Added 2 new eggs<br>🛡️ Added anti-exploits",
    127022380236821: "🛡️ Added anti-exploit to prevent fake purchases<br>💬 Migrated to the new chat system",
    91538944718650: "📜 Written a lot of new client and server code<br>👑 Co-owner & Head scripter"
};

// Scroll to top on page load/refresh
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Animated tab title
const prefix = 'Bjarnos | ';
const suffixes = ['Roblox Game Developer', 'Security Systems Engineer', 'Full-Stack Developer'];
let index = 0;

function updateTitle() {
    document.title = prefix + suffixes[index];
    index = (index + 1) % suffixes.length;
}

updateTitle();
setInterval(updateTitle, 3000);

// Calculate years of experience
const startTime = 1630317600;
const unixTime = Math.floor(Date.now() / 1000);
const difference = Math.floor((unixTime - startTime) / 31556926);

let overlay;

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("stat-active").innerText = String(difference) + "+";
    
    // Popup functionality
    overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");
    const closeBtn = document.getElementById("close-popup");
    
    function closePopup() {
        overlay.style.display = "none";
        popup.style.display = "none";
    }
    
    overlay.addEventListener("click", () => {
        closePopup();
    });
    closeBtn.addEventListener("click", closePopup);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closePopup();
        }
    });
    
    // Fetch games data
    const gamesList = document.getElementById("games-list");
    
    let totalVisits = 0;
    let totalPlayers = 0;
    let gamesData = [];
    
    try {
        const proxy = 'https://corsproxy.io/?';
        
        const universePromises = placeIds.map(placeId => 
            fetch(proxy + encodeURIComponent(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`))
                .then(res => res.json())
                .then(data => ({ placeId, universeId: data.universeId }))
                .catch(() => ({ placeId, universeId: null }))
        );
        
        const universeData = await Promise.all(universePromises);
        const validUniverseIds = universeData.filter(d => d.universeId).map(d => d.universeId);
        
        if (validUniverseIds.length === 0) {
            throw new Error("No valid universe IDs found");
        }
        
        const detailsResponse = await fetch(proxy + encodeURIComponent(`https://games.roblox.com/v1/games?universeIds=${validUniverseIds.join(',')}`));
        const detailsData = await detailsResponse.json();
        
        const thumbnailResponse = await fetch(proxy + encodeURIComponent(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${validUniverseIds.join(',')}&size=512x512&format=Png&isCircular=false`));
        const thumbnailData = await thumbnailResponse.json();
        
        const thumbnailMap = {};
        thumbnailData.data.forEach(thumb => {
            if (thumb.state === 'Completed' && thumb.imageUrl) {
                thumbnailMap[thumb.targetId] = thumb.imageUrl;
            }
        });
        
        detailsData.data.forEach(game => {
            if (game.id == 6763336660) {
                game.visits = (game.visits || 0) + 367709;
            }
            
            const gameInfo = {
                id: game.id,
                name: game.name,
                playing: game.playing || 0,
                visits: game.visits || 0,
                thumbnail: thumbnailMap[game.id] || 'https://via.placeholder.com/512x512/1e293b/60a5fa?text=Loading...',
                placeId: game.rootPlaceId
            };
            gamesData.push(gameInfo);
            totalVisits += gameInfo.visits;
            totalPlayers += gameInfo.playing;
        });
        
        gamesData.sort((a, b) => b.playing - a.playing);
        gamesList.innerHTML = '';
        
        gamesData.forEach(game => {
            let displayVisits = game.visits;
            if (game.visits >= 1000000000) {
                displayVisits = (Math.floor(game.visits / 100000000) / 10) + "B";
            } else if (game.visits >= 1000000) {
                displayVisits = (Math.floor(game.visits / 100000) / 10) + "M";
            } else if (game.visits >= 1000) {
                displayVisits = (Math.floor(game.visits / 100) / 10) + "K";
            }
            
            const gameCard = document.createElement("div");
            gameCard.className = "game-card";
            gameCard.innerHTML = `
                <img src="${game.thumbnail}" class="game-thumbnail" alt="${game.name}" loading="lazy">
                <div class="game-info">
                    <h3 class="game-name">${game.name}</h3>
                    <div class="game-stats">
                        <div class="game-stat">
                            <span class="online-indicator"></span>
                            <span>${game.playing.toLocaleString()}</span>
                        </div>
                        <div class="game-stat">
                            <img src="https://img.icons8.com/ios-filled/20/94a3b8/visible.png" class="icon" alt="Visits">
                            <span>${displayVisits}</span>
                        </div>
                    </div>
                </div>
            `;
            gamesList.appendChild(gameCard);
            
            gameCard.addEventListener('click', function() {
                const originalData = universeData.find(d => d.universeId === game.id);
                const placeId = originalData ? originalData.placeId : game.placeId;
                
                document.getElementById("popup-title").textContent = game.name;
                document.getElementById("popup-players").textContent = game.playing.toLocaleString();
                
                let displayVisits = game.visits.toLocaleString();
                if (game.visits >= 1000000000) {
                    displayVisits = (Math.floor(game.visits / 100000000) / 10) + "B";
                } else if (game.visits >= 1000000) {
                    displayVisits = (Math.floor(game.visits / 100000) / 10) + "M";
                } else if (game.visits >= 1000) {
                    displayVisits = (Math.floor(game.visits / 100) / 10) + "K";
                }
                document.getElementById("popup-visits").textContent = displayVisits;
                
                document.getElementById("popup-play-btn").href = `https://www.roblox.com/games/${placeId}`;
                
                document.getElementById("popup-contributions").innerHTML = descriptions[game.placeId] || descriptions.default;
                
                overlay.style.display = "block";
                popup.style.display = "block";
            });
        });
        
        document.getElementById("stat-players").innerText = totalPlayers.toLocaleString();
        if (totalVisits >= 1000000000) {
            document.getElementById("stat-visits").innerText = (Math.floor(totalVisits / 100000000) / 10) + "B+";
        } else {
            document.getElementById("stat-visits").innerText = (Math.floor(totalVisits / 100000) / 10) + "M+";
        }
        
    } catch (error) {
        console.error("Error loading games:", error);
        gamesList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Unable to load portfolio. Please try again later.</p>';
        
        document.getElementById("stat-players").innerText = "error";
        document.getElementById("stat-visits").innerText = "error";
    }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        // Only prevent default for hash links
        if (this.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// Cursor grid effect (only on desktop)
if (window.innerWidth > 768) {
    const cursorGlow = document.querySelector('.cursor-glow');
    const gridCanvas = document.querySelector('.grid-highlight');
    const ctx = gridCanvas.getContext('2d');
    
    function resizeCanvas() {
        gridCanvas.width = window.innerWidth;
        gridCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        document.body.classList.add('cursor-active');
    });
    
    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active');
    });
    
    function animateCursor() {
        mouseX += (targetX - mouseX) * 0.1;
        mouseY += (targetY - mouseY) * 0.1;
        
        ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        
        const gridSize = 50;
        const radius = 150;
        
        for (let x = 0; x < gridCanvas.width; x += gridSize) {
            for (let y = 0; y < gridCanvas.height; y += gridSize) {
                const distX = x - mouseX;
                const distY = y - mouseY;
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                if (dist < radius) {
                    const opacity = Math.pow(1 - (dist / radius), 1.5);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.4})`;
                    ctx.lineWidth = 1 + opacity * 1.5;
                    
                    ctx.beginPath();
                    ctx.moveTo(x, Math.max(0, y - gridSize));
                    ctx.lineTo(x, Math.min(gridCanvas.height, y + gridSize));
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(Math.max(0, x - gridSize), y);
                    ctx.lineTo(Math.min(gridCanvas.width, x + gridSize), y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// Prevent zoom on iOS
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

document.addEventListener('touchmove', function(e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajustamos al tamaño de pantalla
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// CARGAR IMÁGENES
const background = new Image();
background.src = "fondo_amor.jpg";

const player = new Image();
player.src = "messi.png";

const bulletImg = new Image();
bulletImg.src = "corazon.png";

const enemyImg = new Image();
enemyImg.src = "antonella.png";

let bullets = [];
let enemies = [];
let particles = [];

let score = 0;
let lives = 3;
let gameStarted = false;
let gameOver = false;
let win = false;

let enemySpeed = canvas.height * 0.006;

// POSICIONES
let playerX = canvas.width / 2;
let playerY = canvas.height - canvas.height * 0.15;
let isDragging = false;

// DISPARO AUTOMÁTICO
let shootTimer = 0;
let canShoot = true;

// TAMAÑOS RESPONSIVOS
const playerSize = canvas.width * 0.12; // 12% del ancho
const bulletSize = canvas.width * 0.08;  // 8% del ancho
const enemySize = canvas.width * 0.12;   // 12% del ancho

// EVENTOS TÁCTILES
function handleStart(e) {
    e.preventDefault();
    gameStarted = true;
    isDragging = true;
}

function handleMove(e) {
    e.preventDefault();
    let touch = e.touches[0];
    if (touch) {
        playerX = touch.clientX;
        // Limitar al canvas
        playerX = Math.max(playerSize/2, Math.min(canvas.width - playerSize/2, playerX));
    }
}

function handleEnd(e) {
    e.preventDefault();
    isDragging = false;
    shootTimer = 0;
}

// Agregar event listeners
canvas.addEventListener("touchstart", handleStart);
canvas.addEventListener("touchmove", handleMove);
canvas.addEventListener("touchend", handleEnd);

// Soporte para mouse (PC)
canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    gameStarted = true;
    isDragging = true;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
        playerX = e.clientX;
        playerX = Math.max(playerSize/2, Math.min(canvas.width - playerSize/2, playerX));
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    shootTimer = 0;
});

// FUNCIONES
function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            life: 30,
            size: Math.random() * 8 + 2
        });
    }
}

function resetGame() {
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    lives = 3;
    enemySpeed = canvas.height * 0.006;
    gameOver = false;
    win = false;
    gameStarted = false;
    playerX = canvas.width / 2;
    shootTimer = 0;
}

function update() {
    if (!gameStarted || gameOver) return;

    // crear enemigos
    if (Math.random() < 0.025) {
        enemies.push({
            x: Math.random() * (canvas.width - enemySize),
            y: -enemySize,
            width: enemySize,
            height: enemySize,
        });
    }

    // DISPARO AUTOMÁTICO CORREGIDO
    if (isDragging && gameStarted && !gameOver) {
        shootTimer++;
        if (shootTimer >= 15) { // Dispara cada 15 frames
            bullets.push({
                x: playerX - bulletSize/2,
                y: playerY - bulletSize,
                width: bulletSize,
                height: bulletSize,
            });
            shootTimer = 0;
        }
    }

    // mover balas
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= canvas.height * 0.02;
        if (bullets[i].y < -50) {
            bullets.splice(i, 1);
        }
    }

    // mover enemigos
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemySpeed;
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            lives--;
        }
    }

    // colisión balas-enemigos
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        for (let ei = enemies.length - 1; ei >= 0; ei--) {
            if (
                bullets[bi].x < enemies[ei].x + enemies[ei].width &&
                bullets[bi].x + bullets[bi].width > enemies[ei].x &&
                bullets[bi].y < enemies[ei].y + enemies[ei].height &&
                bullets[bi].y + bullets[bi].height > enemies[ei].y
            ) {
                createExplosion(enemies[ei].x + enemies[ei].width / 2, enemies[ei].y + enemies[ei].height / 2);
                enemies.splice(ei, 1);
                bullets.splice(bi, 1);
                score++;
                break;
            }
        }
    }

    // partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].dx;
        particles[i].y += particles[i].dy;
        particles[i].life--;
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // dificultad progresiva
    enemySpeed = canvas.height * (0.006 + score * 0.00003);

    // condiciones de victoria/derrota
    if (lives <= 0) {
        gameOver = true;
        win = false;
    }
    if (score >= 150) {
        win = true;
        gameOver = true;
    }
}

function draw() {
    // fondo
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // si no ha empezado
    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("❤️ Toca para comenzar ❤️", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Toca y arrastra para mover", canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText("Llega a 150 puntos para ganar", canvas.width / 2, canvas.height / 2 + 100);
        return;
    }

    // jugador - CORREGIDO: usando canvas.width en lugar de WIDTH
    if (player.complete) {
        ctx.drawImage(player, playerX - playerSize/2, playerY - playerSize/2, playerSize, playerSize);
    }

    // balas
    bullets.forEach((b) => {
        ctx.drawImage(bulletImg, b.x, b.y, b.width, b.height);
    });

    // enemigos
    enemies.forEach((e) => {
        ctx.drawImage(enemyImg, e.x, e.y, e.width, e.height);
    });

    // partículas - CORREGIDO
    particles.forEach((p) => {
        ctx.fillStyle = `rgba(255, 100, 150, ${p.life / 30})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // HUD
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 4;
    ctx.fillText("❤️ " + lives, 20, 50);
    ctx.fillText("⭐ " + score, 20, 100);
    ctx.shadowBlur = 0;

    // Barra de progreso
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(canvas.width - 220, 20, 200, 30);
    ctx.fillStyle = score >= 150 ? "#4CAF50" : "#FF69B4";
    ctx.fillRect(canvas.width - 220, 20, (score / 150) * 200, 30);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("150 ⭐", canvas.width - 60, 45);

    // Final
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        let msg = win ? "🏆 ¡VICTORIA ÉPICA! 🏆" : "💔 GAME OVER 💔";
        ctx.fillText(msg, canvas.width / 2, canvas.height / 2 - 60);

        if (win) {
            ctx.font = "28px Arial";
            ctx.fillText("✨ Feliz San Valentin ✨", canvas.width / 2, canvas.height / 2);
            ctx.font = "24px Arial";
            ctx.fillText("¡150 puntos! 🎉", canvas.width / 2, canvas.height / 2 + 50);
        }

        ctx.font = "22px Arial";
        ctx.fillText("Toca para reiniciar", canvas.width / 2, canvas.height / 2 + 120);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Esperar a que carguen las imágenes
let imagesLoaded = 0;
const images = [background, player, bulletImg, enemyImg];
images.forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === images.length) {
            loop();
        }
    };
});

// Redimensionar con la ventana
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    playerY = canvas.height - canvas.height * 0.15;
    enemySpeed = canvas.height * 0.006;
    playerX = Math.min(playerX, canvas.width - playerSize/2);
    playerX = Math.max(playerSize/2, playerX);
});
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const squid = {
    x: 100,
    y: 300,
    width: 60,
    height: 40,
    velocity: 0
};

const obstacles = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let difficulty = 'medium';
let jumpStrength = -8;

// Bubble system
const bubbles = [];
for (let i = 0; i < 10; i++) {
    bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1
    });
}

function drawSquid() {
    ctx.save();
    ctx.translate(squid.x + squid.width / 2, squid.y + squid.height / 2);
    ctx.rotate(squid.velocity * 0.05);

    // Body
    ctx.beginPath();
    ctx.moveTo(-squid.width / 2, 0);
    ctx.bezierCurveTo(-squid.width / 4, -squid.height / 2, squid.width / 4, -squid.height / 2, squid.width / 2, 0);
    ctx.bezierCurveTo(squid.width / 4, squid.height / 2, -squid.width / 4, squid.height / 2, -squid.width / 2, 0);
    let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, squid.width / 2);
    gradient.addColorStop(0, '#FF69B4');
    gradient.addColorStop(1, '#FF1493');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#C71585';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(-squid.width / 5, -squid.height / 6, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-squid.width / 5, -squid.height / 6, 4, 0, Math.PI * 2);
    ctx.fill();

    // Highlight in the eye
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-squid.width / 5 - 2, -squid.height / 6 - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Tentacles
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(-squid.width / 2 + i * squid.width / 8, squid.height / 4);
        ctx.quadraticCurveTo(
            -squid.width / 2 + i * squid.width / 8 + Math.sin(Date.now() / 200 + i) * 5, 
            squid.height / 2 + 15, 
            -squid.width / 2 + i * squid.width / 8 + Math.sin(Date.now() / 200 + i + Math.PI) * 5, 
            squid.height / 2 + 30
        );
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Top obstacle (seaweed)
        let gradientTop = ctx.createLinearGradient(obstacle.x, 0, obstacle.x + obstacle.width, 0);
        gradientTop.addColorStop(0, '#006400');
        gradientTop.addColorStop(0.5, '#008000');
        gradientTop.addColorStop(1, '#006400');
        ctx.fillStyle = gradientTop;
        ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.topHeight);
        
        // Bottom obstacle (coral)
        let gradientBottom = ctx.createLinearGradient(obstacle.x, canvas.height, obstacle.x + obstacle.width, canvas.height);
        gradientBottom.addColorStop(0, '#FF6347');
        gradientBottom.addColorStop(0.5, '#FF7F50');
        gradientBottom.addColorStop(1, '#FF6347');
        ctx.fillStyle = gradientBottom;
        ctx.fillRect(obstacle.x, canvas.height - obstacle.bottomHeight, obstacle.width, obstacle.bottomHeight);

        // Add some texture
        ctx.strokeStyle = '#004d00';
        ctx.lineWidth = 1;
        for (let i = 0; i < obstacle.width; i += 5) {
            ctx.beginPath();
            ctx.moveTo(obstacle.x + i, 0);
            ctx.lineTo(obstacle.x + i, obstacle.topHeight);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(obstacle.x + i, canvas.height - obstacle.bottomHeight);
            ctx.lineTo(obstacle.x + i, canvas.height);
            ctx.stroke();
        }
    });
}

function updateGame() {
    if (gameOver || !gameStarted) return;

    let gravity = 0.4;
    let obstacleSpeed = 2;
    let gapSize = 200;

    switch(difficulty) {
        case 'easy':
            gravity = 0.3;
            jumpStrength = -7;
            obstacleSpeed = 1.5;
            gapSize = 250;
            break;
        case 'medium':
            gravity = 0.4;
            jumpStrength = -8;
            obstacleSpeed = 2;
            gapSize = 200;
            break;
        case 'hard':
            gravity = 0.5;
            jumpStrength = -9;
            obstacleSpeed = 3;
            gapSize = 180;
            break;
    }

    squid.velocity += gravity;
    squid.y += squid.velocity;

    if (squid.y + squid.height > canvas.height || squid.y < 0) {
        gameOver = true;
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed;

        if (
            squid.x < obstacle.x + obstacle.width &&
            squid.x + squid.width > obstacle.x &&
            (squid.y < obstacle.topHeight || squid.y + squid.height > canvas.height - obstacle.bottomHeight)
        ) {
            gameOver = true;
        }

        if (obstacle.x + obstacle.width < 0) {
            obstacles.shift();
            score++;
        }
    });

    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 250) {
        const minHeight = 50;
        const maxHeight = canvas.height - gapSize - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        obstacles.push({
            x: canvas.width,
            width: 60,
            topHeight: topHeight,
            bottomHeight: canvas.height - topHeight - gapSize
        });
    }
}

function drawBackground() {
    // Ocean gradient
    let oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGradient.addColorStop(0, '#00308F');
    oceanGradient.addColorStop(1, '#001f5c');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw and update bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
        
        bubble.y -= bubble.speed;
        if (bubble.y + bubble.size < 0) {
            bubble.y = canvas.height + bubble.size;
            bubble.x = Math.random() * canvas.width;
        }
    });

    // Draw seaweed
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 100, canvas.height);
        for (let j = 0; j < 5; j++) {
            ctx.quadraticCurveTo(
                i * 100 + 20 * Math.sin(Date.now() / 1000 + i),
                canvas.height - j * 30,
                i * 100,
                canvas.height - (j + 1) * 30
            );
        }
        ctx.strokeStyle = '#008000';
        ctx.lineWidth = 5;
        ctx.stroke();
    }
}

function drawScore() {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawMenuScreen(isGameOver = false) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 36px Arial';
    
    if (isGameOver) {
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2 - 100);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 70, canvas.height / 2 - 50);
    } else {
        ctx.fillText('Swimmy Squid', canvas.width / 2 - 120, canvas.height / 2 - 100);
    }
    
    ctx.font = '24px Arial';
    ctx.fillText('Select Difficulty:', canvas.width / 2 - 80, canvas.height / 2 + 10);

    ['easy', 'medium', 'hard'].forEach((diff, index) => {
        const buttonWidth = 70;
        const buttonHeight = 30;
        const buttonSpacing = 10;
        const startX = canvas.width / 2 - ((buttonWidth * 3 + buttonSpacing * 2) / 2);
        const buttonX = startX + (buttonWidth + buttonSpacing) * index;
        const buttonY = canvas.height / 2 + 40;

        // Draw button
        ctx.fillStyle = difficulty === diff ? '#4CAF50' : '#FFF';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        // Draw text
        ctx.fillStyle = difficulty === diff ? '#FFF' : '#000';
        ctx.font = '16px Arial';
        const text = diff.charAt(0).toUpperCase() + diff.slice(1);
        const textWidth = ctx.measureText(text).width;
        const textX = buttonX + (buttonWidth - textWidth) / 2;
        const textY = buttonY + buttonHeight / 2 + 5;

        ctx.fillText(text, textX, textY);
    });

    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText(isGameOver ? 'Tap or Press Spacebar to Restart' : 'Tap or Press Spacebar to Start', 
                 canvas.width / 2 - 160, canvas.height / 2 + 120);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    updateGame();
    drawObstacles();
    drawSquid();
    drawScore();

    if (!gameStarted || gameOver) {
        drawMenuScreen(gameOver);
    }

    requestAnimationFrame(gameLoop);
}

function handleJump() {
    if (!gameStarted || gameOver) {
        gameStarted = true;
        gameOver = false;
        squid.y = 300;
        squid.velocity = 0;
        obstacles.length = 0;
        score = 0;
    } else {
        squid.velocity = jumpStrength;
    }
}

function handleInteraction(x, y) {
    if (!gameStarted || gameOver) {
        const buttonWidth = 70;
        const buttonHeight = 30;
        const buttonSpacing = 10;
        const startX = canvas.width / 2 - ((buttonWidth * 3 + buttonSpacing * 2) / 2);
        const buttonY = canvas.height / 2 + 40;
        
        if (y > buttonY && y < buttonY + buttonHeight) {
            if (x > startX && x < startX + buttonWidth) {
                difficulty = 'easy';
            } else if (x > startX + buttonWidth + buttonSpacing && x < startX + 2 * buttonWidth + buttonSpacing) {
                difficulty = 'medium';
            } else if (x > startX + 2 * (buttonWidth + buttonSpacing) && x < startX + 3 * buttonWidth + 2 * buttonSpacing) {
                difficulty = 'hard';
            } else {
                handleJump();
            }
        } else {
            handleJump();
        }
    } else {
        handleJump();
    }
}

canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    handleInteraction(x, y);
});

canvas.addEventListener('touchstart', event => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = event.touches[0].clientX - rect.left;
    const y = event.touches[0].clientY - rect.top;
    handleInteraction(x, y);
});

// Keyboard controls
document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        handleJump();
        event.preventDefault();
    }
});

// Touch controls
canvas.addEventListener('touchstart', event => {
    event.preventDefault();
    if (!gameStarted) {
        const rect = canvas.getBoundingClientRect();
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;
        
        // Check if touch is within difficulty selection area
        if (y > canvas.height / 2 + 10 && y < canvas.height / 2 + 40) {
            const buttonWidth = 70;
            const buttonSpacing = 10;
            const startX = canvas.width / 2 - ((buttonWidth * 3 + buttonSpacing * 2) / 2);
            
            if (x > startX && x < startX + buttonWidth) {
                difficulty = 'easy';
            } else if (x > startX + buttonWidth + buttonSpacing && x < startX + 2 * buttonWidth + buttonSpacing) {
                difficulty = 'medium';
            } else if (x > startX + 2 * (buttonWidth + buttonSpacing) && x < startX + 3 * buttonWidth + 2 * buttonSpacing) {
                difficulty = 'hard';
            }
        } else {
            // If touch is outside difficulty buttons, start the game
            handleJump();
        }
    } else {
        handleJump();
    }
});

// Mouse controls (for easier testing on desktop)
canvas.addEventListener('click', event => {
    if (gameStarted) {
        handleJump();
    } else {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (y > canvas.height / 2 + 10 && y < canvas.height / 2 + 40) {
            if (x > canvas.width / 2 - 90 && x < canvas.width / 2 - 40) difficulty = 'easy';
            else if (x > canvas.width / 2 - 30 && x < canvas.width / 2 + 20) difficulty = 'medium';
            else if (x > canvas.width / 2 + 30 && x < canvas.width / 2 + 80) difficulty = 'hard';
        } else {
            handleJump();
        }
    }
});

// Prevent default touch behavior to avoid scrolling while playing
document.body.addEventListener('touchstart', function(e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener('touchend', function(e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener('touchmove', function(e) {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, { passive: false });

// Start the game loop
gameLoop();
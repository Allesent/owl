const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const music = document.getElementById("music");

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
});

let started = false;
let startTime = 0;

// ---------------- ЗВЁЗДЫ ----------------

const stars = [];

for (let i = 0; i < 250; i++) {
    stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1 + Math.random() * 2
    });
}

function drawStars() {
    ctx.fillStyle = "white";

    for (const star of stars) {

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.r * 0.15;

        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }
    }
}

// ---------------- СТАРТ ----------------

startScreen.addEventListener("click", async () => {

    if (started) return;

    started = true;

    startScreen.style.display = "none";

    try {
        await music.play();
    } catch (e) {
        console.log(e);
    }

    startTime = performance.now();
});
// ---------------- СЕРДЦЕ ----------------

const particles = [];

const HEART_SCALE = 18;

for (let i = 0; i < 900; i++) {

    const t = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random());

    const heartX = 16 * Math.pow(Math.sin(t), 3);

    const heartY =
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t);

    particles.push({

        sx: Math.random() * width,
        sy: Math.random() * height,

        tx: width / 2 + heartX * HEART_SCALE * r,
        ty: height / 2 - heartY * HEART_SCALE * r,

        delay: Math.random() * 2,

        fallOffset: 0,
        fallSpeed: 2 + Math.random() * 5
    });
}

function drawHeart(elapsed) {

    let beat = 0;
    let pulse = 1;

    if (elapsed > 6) {

        beat =
            (Math.sin(elapsed * Math.PI * 2.2) + 1) / 2;

        beat = Math.pow(beat, 4);

        pulse = 1 + beat * 0.12;
    }

    for (const p of particles) {

        let progress =
            Math.max(
                0,
                Math.min(
                    (elapsed - p.delay) / 4,
                    1
                )
            );

        progress =
            progress * progress *
            (3 - 2 * progress);

        let x =
            p.sx +
            (p.tx - p.sx) * progress;

        let y =
            p.sy +
            (p.ty - p.sy) * progress;

        const shake = beat * 2;

        x =
            width / 2 +
            (x - width / 2) * pulse +
            (Math.random() - 0.5) * shake;

        y =
            height / 2 +
            (y - height / 2) * pulse +
            (Math.random() - 0.5) * shake;

        const brightness =
            180 +
            75 *
                Math.sin(
                    elapsed * 4 +
                    x * 0.01
                );

        const color =
            `rgb(
                255,
                ${Math.max(0, brightness / 2)},
                ${Math.max(0, brightness)}
            )`;

        ctx.fillStyle = color;

        ctx.font = "16px Arial";
        ctx.font = "bold 16px Arial";

        ctx.fillText(
            "LOVE YOU",
            x,
            y
        );
    }
}

// ---------------- ФИНАЛЬНАЯ ЛОГИКА ----------------

const FINAL_TIME = 30;

let broken = false;
let fadeStarted = false;
let opacity = 0;
let typed = "";

// плавное затухание громкости
function fadeMusic() {
    let vol = music.volume;

    const fadeInterval = setInterval(() => {
        vol -= 0.02;

        if (vol <= 0) {
            vol = 0;
            music.pause();
            clearInterval(fadeInterval);
        }

        music.volume = vol;
    }, 100);
}

function animate(time) {

    if (!started) {
        requestAnimationFrame(animate);
        return;
    }

    const elapsed = (time - startTime) / 1000;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    drawStars();

    // запуск разрушения
    if (elapsed >= FINAL_TIME) {
        broken = true;

        if (!fadeStarted) {
            fadeStarted = true;
            fadeMusic();
        }
    }

    // рисуем сердце или его распад
    if (!broken) {
        drawHeart(elapsed);
    } else {

        // падающие частицы
        for (const p of particles) {

            p.fallOffset += p.fallSpeed;

            let progress = 1;

            let x =
                width / 2 +
                (p.tx - width / 2) * progress;

            let y =
                height / 2 +
                (p.ty - height / 2) * progress +
                p.fallOffset;

            ctx.fillStyle = "rgba(255, 120, 180, 1)";
            ctx.font = "16px Arial";
            ctx.fillText("LOVE YOU", x, y);
        }

        // затемнение
        if (opacity < 0.85) opacity += 0.005;

        ctx.fillStyle = `rgba(0,0,0,${opacity})`;
        ctx.fillRect(0, 0, width, height);

        // печатающийся текст
        const message =
            "I'm tired of all the innuendos between us, owl.";

        const typedLength = Math.floor(
            (elapsed - FINAL_TIME) / 0.06
        );

        typed = message.slice(0, typedLength);

        ctx.fillStyle = "rgb(255, 200, 220)";
        ctx.font = "28px Arial";
        ctx.textAlign = "center";

        ctx.fillText(typed, width / 2, height / 2);
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);







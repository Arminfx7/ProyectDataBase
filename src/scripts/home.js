const images = [
    "./img/Corolla-Sedan-5.jpeg", 
    "./img/civic.jpg", 
    "./img/frontier.jpg"
];

let idx = 0;
const img = document.getElementById('slider-img');
img.src = images[0];

setInterval(() => {
    idx = (idx + 1) % images.length;
    img.style.opacity = 0;
    setTimeout(() => {
        img.src = images[idx];
        img.style.opacity = 1;
    }, 600);
}, 5000);
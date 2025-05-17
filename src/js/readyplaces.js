export default function readyPlaces() {
    document.querySelectorAll('.route-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const city = 'Москва';
            window.location.href = `route.html?type=${type}&city=${city}`;
        });
    });
}
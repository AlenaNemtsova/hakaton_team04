
export default function getGeolocation() {
    return new Promise((resolve, reject) => {
        const cityElem = document.getElementById('js-city');

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            const msg = 'Геолокация не поддерживается';
            if (cityElem) cityElem.textContent = msg;
            reject(new Error(msg));
        }

        function success(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ru`)
                .then((response) => response.json())
                .then((data) => {
                    const address = data.address;
                    const city = address.city || address.town || address.village || 'Город не найден';

                    // выводим на страницу
                    if (cityElem) cityElem.textContent = city;

                    // возвращаем координаты для использования в initTopPlaces
                    resolve({ lat, lon, city });
                })
                .catch(() => {
                    if (cityElem) cityElem.textContent = 'Ошибка при определении города';
                    reject(new Error('Ошибка при определении города'));
                });
        }

        function error(err) {
            const msg = `Ошибка при получении геолокации: ${err.message}`;
            if (cityElem) cityElem.textContent = msg;
            reject(new Error(msg));
        }
    });
}
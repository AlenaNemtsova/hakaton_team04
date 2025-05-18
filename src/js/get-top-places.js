import getGeolocation from './geolocation.js';
import fetchTopPlaces from './fetch-top-places.js';

function updateTopPlaces(places) {
    const listElem = document.querySelector('.top-places__list');
    listElem.innerHTML = '';

    if (!places.length) {
        listElem.innerHTML = '<div class="top-places__item">Ничего не найдено</div>';
        return;
    }

    //получаем первые 3 топ-места в указанной локации
    const top3 = places.slice(0, 3);

    top3.forEach(place => {
        const name = place.title;
        const link = `https://ru.wikipedia.org/?curid=${place.pageid}`;
        const image = place.image || './src/assets/placeholder.jpg';

        const item = document.createElement('div');
        item.classList.add('top-places__item');
        item.innerHTML = `
            <div class="top-places__image-placeholder">
                <img src="${image}" alt="${name}" />
            </div>
            <div class="top-places__caption">
                <a href="${link}" target="_blank" rel="noopener noreferrer">${name}</a>
            </div>
        `;
        listElem.appendChild(item);
    });
}

export default async function initTopPlaces() {
    try {
        const { lat, lon, city } = await getGeolocation();

        console.log();
        // Обновляем заголовок секции
        const titleElem = document.getElementById('js-top-places-title');
        if (titleElem && city) {
            titleElem.textContent = `Топовые места в регионе: ${city}`;
        }

        const places = await fetchTopPlaces(lat, lon);

        updateTopPlaces(places);
    } catch (err) {
        console.error('Ошибка:', err);
        document.querySelector('.top-places__list').innerHTML =
            '<div class="top-places__item">Не удалось загрузить места</div>';
    }
}
export default function hero() {

    const cities = [
        {
            name: 'paris',
            url: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg',
            alt: 'Eiffel Tower in Paris'
        },
        {
            name: 'newyork',
            url: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg',
            alt: 'New York City skyline'
        },
        {
            name: 'tokyo',
            url: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg',
            alt: 'Tokyo cityscape with Mt. Fuji'
        },
        {
            name: 'rome',
            url: 'https://images.pexels.com/photos/532263/pexels-photo-532263.jpeg',
            alt: 'Roman Colosseum'
        }
    ];

    const citySelector = document.createElement('div');
    citySelector.className = 'city-selector';

    cities.forEach((city, index) => {
        const dot = document.createElement('div');
        dot.className = `city-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.city = city.name;
        citySelector.appendChild(dot);

        dot.addEventListener('click', () => {
            updateCityImage(city);

            document.querySelectorAll('.city-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
    });

    document.querySelector('.hero__image').appendChild(citySelector);

    // Смена изображений городов каждые 3 секунды
    let currentCityIndex = 0;

    function updateCityImage(city) {
        const currentImg = document.querySelector('.current-city');
        currentImg.src = city.url;
        currentImg.alt = city.alt;
        currentImg.dataset.city = city.name;
    }

    setInterval(() => {
        currentCityIndex = (currentCityIndex + 1) % cities.length;
        updateCityImage(cities[currentCityIndex]);

        // Обновление активной точки
        document.querySelectorAll('.city-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentCityIndex);
        });
    }, 3000);
}

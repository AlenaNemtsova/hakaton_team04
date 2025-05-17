export default function hero() {
    // const getStartedBtn = element.querySelector('#get-started-btn');
    // getStartedBtn.addEventListener('click', () => {
    //     document.getElementById('search-section').scrollIntoView({
    //         behavior: 'smooth'
    //     });
    // });

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

    // 
    const cityImageContainer = element.querySelector('.city-image-container');
    const citySelector = document.createElement('div');
    citySelector.className = 'city-selector';

    cities.forEach((city, index) => {
        const dot = document.createElement('div');
        dot.className = `city-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.city = city.name;
        citySelector.appendChild(dot);

        dot.addEventListener('click', () => {
            updateCityImage(city);

            element.querySelectorAll('.city-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
    });

    element.querySelector('.hero-image').appendChild(citySelector);

    // Setup rotating city images every 5 seconds
    let currentCityIndex = 0;

    function updateCityImage(city) {
        const currentImg = element.querySelector('.current-city');
        currentImg.src = city.url;
        currentImg.alt = city.alt;
        currentImg.dataset.city = city.name;
    }

    setInterval(() => {
        currentCityIndex = (currentCityIndex + 1) % cities.length;
        updateCityImage(cities[currentCityIndex]);

        // Update active dot
        element.querySelectorAll('.city-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentCityIndex);
        });
    }, 5000);
}

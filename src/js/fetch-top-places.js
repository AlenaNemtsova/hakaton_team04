export default async function fetchTopPlaces(lat, lon) {
    const radius = 10000; // метров
    const limit = 10;

    const geoUrl = `https://ru.wikipedia.org/w/api.php?` +
        `action=query&list=geosearch&gscoord=${lat}%7C${lon}` +
        `&gsradius=${radius}&gslimit=${limit}&format=json&origin=*`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    const pages = geoData.query.geosearch;

    // Получаем изображения по названию статьи
    const enrichedPlaces = await Promise.all(pages.map(async place => {
        const title = encodeURIComponent(place.title);
        const imageUrl = `https://ru.wikipedia.org/w/api.php?` +
            `action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=400&origin=*`;

        try {
            const imgRes = await fetch(imageUrl);
            const imgData = await imgRes.json();

            const page = Object.values(imgData.query.pages)[0];
            const image = page?.thumbnail?.source || null;

            return {
                title: place.title,
                pageid: place.pageid,
                image,
            };
        } catch (e) {
            return {
                title: place.title,
                pageid: place.pageid,
                image: null,
            };
        }
    }));

    return enrichedPlaces;
}

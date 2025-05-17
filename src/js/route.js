const rapidApiKey = "11fb352ef4mshd236fc96c4b8421p182a00jsn9694a7105cee";
const openKey = "///";

function getParams() {
    const url = new URL(window.location.href);
    return {
        type: url.searchParams.get('type'),
        city: url.searchParams.get('city')
    };
}

async function fetchPlacesFromAI(city, type) {
    const prompt = `Составь JSON-массив с 5 интересными местами категории "${type}" в городе ${city}. Верни только JSON, без описаний и текста. Пример: ["Парк Горького", "Бар Петрович", "Музей Искусств", "Кафе Сова", "Усадьба Коломенское"]`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${openKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6
        })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
        console.error("Некорректный ответ от OpenAI:", data);
        throw new Error("OpenAI не вернул результат");
    }
    const text = data.choices[0].message.content.trim();

    if (text.startsWith("```")) {
        text = text.replace(/```json|```/g, "").trim();
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Не удалось распарсить ответ от OpenAI:", text);
        return [];
    }
}

async function geocodePlace(placeName) {
    const response = await fetch("https://opencage-geocode.p.rapidapi.com/geocode/v1/json?q=" + encodeURIComponent(placeName), {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "opencage-geocode.p.rapidapi.com"
        }
    });

    const data = await response.json();
    if (data.results.length === 0) throw new Error("Место не найдено: " + placeName);
    return data.results[0].geometry; // { lat, lng }
}

async function getRoute(from, to) {
    const url = `https://trueway-directions.p.rapidapi.com/FindDrivingRoute?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "trueway-directions.p.rapidapi.com"
        }
    });

    const data = await response.json();
    if (!data.route) throw new Error("Маршрут не найден");
    return data.route.geometry;
}

function drawRouteOnMap(geojson, map) {
    L.geoJSON(geojson, {
        style: { color: 'blue', weight: 4 }
    }).addTo(map);
}

(async () => {
    const map = L.map('map').setView([55.75, 37.61], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const { type, city } = getParams();
    const placeNames = await fetchPlacesFromAI(city, type);

    try {
        const coords = await Promise.all(placeNames.map(geocodePlace));

        coords.forEach((point, index) => {
            L.marker([point.lat, point.lng]).addTo(map).bindPopup(placeNames[index]);
        });

        for (let i = 0; i < coords.length - 1; i++) {
            const routeGeojson = await getRoute(coords[i], coords[i + 1]);
            drawRouteOnMap(routeGeojson, map);
        }
        const validCoords = coords.filter(c => c && typeof c.lat === "number" && typeof c.lng === "number");

        if (validCoords.length === 0) {
            throw new Error("Невозможно отобразить маршрут — нет валидных координат");
        }

        map.fitBounds(validCoords.map(p => [p.lat, p.lng]));

        // Сохраняем маршрут
        document.getElementById("save-route").addEventListener("click", () => {
            localStorage.setItem("savedRoute", JSON.stringify(placeNames));
            alert("Маршрут сохранён!");
        });

        // Генерация PDF
        document.getElementById("download-pdf").addEventListener("click", () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(`Маршрут по категории "${type}" в городе ${city}`, 10, 10);
            placeNames.forEach((place, i) => {
                doc.text(`${i + 1}. ${place}`, 10, 20 + i * 10);
            });
            doc.save("маршрут.pdf");
        });

    } catch (e) {
        console.error(e.message);
        alert("Ошибка: " + e.message);
    }
})();
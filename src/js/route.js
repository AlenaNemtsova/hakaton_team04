const openKey = "0eb5ec211dmshccc10bb0722767bp1073e4jsn0388a6c58479";
const orsApiKey = "5b3ce3597851110001cf624855e2e77f184046bdbffba4c2ede8cc4c";

function getParams() {
    const url = new URL(window.location.href);
    return {
        type: url.searchParams.get('type'),
        city: url.searchParams.get('city')
    };
}

async function fetchPlacesFromAI(city, type) {
    const prompt = `Составь JSON-массив из 5 интересных мест в городе ${city} по категории "${type}". 
Укажи:
- name (название)
- lat (широта)
- lng (долгота)
- description (короткое описание)
- budget (низкий, средний, высокий)
- rating (оценка от 1 до 5)
- image_url (найди изображение этого места в Google и дай ссылку на изображение) 

Формат: [{"name":"...","lat":...,"lng":...,"description":"...","budget":"...","rating":4,"image_url":"..."}]
Верни только JSON без текста.`;
    // image_url нейросетка не генерирует, поэтому тут нужно подумать как подключить изображения
    const response = await fetch("https://open-ai21.p.rapidapi.com/conversationllama", {
        method: "POST",
        headers: {
            'x-rapidapi-key': openKey,
            "Content-Type": "application/json",
            'x-rapidapi-host': 'open-ai21.p.rapidapi.com'
        },
        body: JSON.stringify({ messages: [{ "role": "user", "content": prompt }] })
    });

    const data = await response.json();
    let text = data.result?.trim().replace(/<\|.*?\|>|```json|```/g, "").trim();
    const jsonMatch = text.match(/\[.*\]/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
}

async function getRoute(from, to) {
    const res = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
        method: "POST",
        headers: {
            "Authorization": orsApiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            coordinates: [
                [from.lng, from.lat],
                [to.lng, to.lat]
            ]
        })
    });
    const data = await res.json();
    if (!data.features?.length) throw new Error("Маршрут не найден");
    return data;
}

function drawRouteOnMap(geojson, map) {
    L.geoJSON(geojson, {
        style: { color: 'green', weight: 3 }
    }).addTo(map);
}

function renderPlacesInfo(places, map) {
    const container = document.getElementById("places-list");
    container.innerHTML = "";
    places.forEach(p => {
        const el = document.createElement("div");
        el.className = "place-card";
        el.innerHTML = `
      <img src="${p.image_url}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>Бюджет:</strong> ${p.budget}</p>
      <p><strong>Рейтинг:</strong> ${p.rating} / 5</p>
    `;
        el.addEventListener("click", () => {
            map.setView([p.lat, p.lng], 15);
        });
        container.appendChild(el);
    });
}

(async () => {
    const map = L.map('map').setView([55.75, 37.61], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const { type, city } = getParams();
    const places = await fetchPlacesFromAI(city, type);
    const validPlaces = places.filter(p => p.lat && p.lng);

    if (!validPlaces.length) return alert("Места не найдены");

    // Маркеры
    validPlaces.forEach(p => {
        L.marker([p.lat, p.lng])
            .addTo(map)
            .bindPopup(`<strong>${p.name}</strong><br>${p.description}`);
    });

    // Маршруты
    for (let i = 0; i < validPlaces.length - 1; i++) {
        try {
            const route = await getRoute(validPlaces[i], validPlaces[i + 1]);
            drawRouteOnMap(route, map);
        } catch (e) {
            console.warn(`Ошибка построения маршрута между ${validPlaces[i].name} и ${validPlaces[i + 1].name}:`, e.message);
        }
    }

    map.fitBounds(validPlaces.map(p => [p.lat, p.lng]));
    renderPlacesInfo(validPlaces, map);

    // Кнопки
    document.getElementById("save-route").addEventListener("click", () => {
        localStorage.setItem("savedRoute", JSON.stringify(validPlaces));
        alert("Маршрут сохранён!");
    });

    document.getElementById("download-pdf").addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text(`Маршрут: ${type} в ${city}`, 10, 10);
        validPlaces.forEach((p, i) => {
            doc.text(`${i + 1}. ${p.name} (${p.rating}/5, ${p.budget})`, 10, 20 + i * 10);
        });
        doc.save("маршрут.pdf");
    });

})();
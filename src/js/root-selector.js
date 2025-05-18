
export default function rootSelector() {
    // const openAiKey = ""
    //закодировать ключ

    const budgetMap = {
        1: "Гуляем скромно",
        2: "Средний бюджет",
        3: "Ни в чем себе не отказывай"
    };



    async function fetchPlacesFromAI(city, type) {
        const prompt = `В городе ${city} подбери по одному интересному месту для каждой выбранной категории: ${interests.join(", ")}. Для каждого места верни: 
  - "category": категория интереса
  - "name": название места
  - "description": короткое описание
  - "rating": оценка от 1 до 5
  - "image": "https://unsplash.com/photos/a-large-building-with-two-towers-and-a-clock-88r_u2sLI3s"

Верни результат в виде массива объектов JSON. Пример:

[
  {
    "category": "музеи",
    "name": "Музей современного искусства",
    "description": "Один из самых известных музеев города с выставками современного искусства.",
    "rating": 4.7,
    "image": "https://unsplash.com/photos/a-large-building-with-two-towers-and-a-clock-88r_u2sLI3s"
  },
]`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openAiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Не удалось распарсить JSON:", text);
            return [];
        }
    }

    // Обработка формы
    document.addEventListener("DOMContentLoaded", () => {
        const form = document.querySelector(".route-selector__form");
        const resultsDiv = document.getElementById("js-results");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const city = form.city.value.trim();
            const duration = form.duration.value.trim();
            const tourType = form["tour-type"].value;
            const interests = [...form.querySelectorAll("input[name='interests']:checked")].map(el => el.value);
            const budgetValue = form.budget.value;
            const budget = budgetMap[budgetValue] || "Средний бюджет";

            if (!city.interests.length === 0) {
                resultsDiv.innerHTML = "<p>Пожалуйста, укажите город и хотя бы один интерес.</p>";
                return;
            }

            resultsDiv.innerHTML = "<p>Ищем интересные места для маршрута...</p>";

            try {
                const allPlaces = [];

                for (const interest of interests) {
                    const places = await fetchPlacesFromAI(city, interest);
                    allPlaces.push({ category: interest, places });
                }

                resultsDiv.innerHTML = allPlaces
                    .map(place => `
          <div class="place-card">
            <img src="${place.image}" alt="${place.name}" class="place-card__image"/>
            <div class="place-card__info">
              <h3>${place.name} (${place.category})</h3>
              <p>${place.description}</p>
              <p><strong>Рейтинг:</strong> ${place.rating} / 5</p>
            </div>
          </div>
        `).join("");

            } catch (err) {
                console.error(err);
                resultsDiv.innerHTML = "<p>Произошла ошибка при подборе маршрута. Попробуйте ещё раз.</p>";
            }
        });
    });
}

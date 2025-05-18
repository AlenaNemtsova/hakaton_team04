export default function handleFormSubmit() {
  const encodedKey = 'c2stcHJvai1DMG1BMmdILWFHVWlFYmZWSUQ2a0FWdWUtOWI0dEZMVmQ0WjhVeWZiZ050RWZEck4yMk9Db1VyemZUM3A3TEdkYnVfTzZqdDl3aVQzQmxia0ZKNWVWZkNDR191R3FpZzhMLVR0a3JuRTNBMHB5U2NpOGd2QndPRnA2ZE9RN0s0NkViemkwVzZBOXV0YjJkcWpuQ3BVcFkwSzJSMEE='
  const openAiKey = atob(encodedKey);

  // const budgetMap = {
  // 	1: "Гуляем скромно",
  // 	2: "Средний бюджет",
  // 	3: "Ни в чем себе не отказывай"
  // };

  async function fetchPlacesFromAI(city, interests) {

    const prompt = `В городе ${city} подбери по одному интересному месту для каждой из категорий: ${interests.join(", ")}. Верни только JSON-массив, как пример:
  [
    {
      "category": "музеи",
      "name": "Музей современного искусства",
      "description": "...",
      "rating": 4.7,
      "image": "https://..."
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка API: ${response.status} — ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    function extractJsonArray(str) {
      const match = str.match(/\[.*\]/s);
      return match ? match[0] : null;
    }

    console.log("Ответ AI:", text);


    try {
      // return JSON.parse(text);
      const jsonStr = extractJsonArray(text);
      if (!jsonStr) throw new Error("JSON-массив не найден");
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Не удалось распарсить JSON:", text);
      return [];
    }
  }




  const form = document.querySelector(".route-selector__form");
  const resultsDiv = document.getElementById("js-results");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const city = form.city.value.trim();
    const interests = [...form.querySelectorAll("input[name='interests']:checked")].map(el => el.value);

    if (!city || interests.length === 0) {
      resultsDiv.innerHTML = "<p>Пожалуйста, укажите город и хотя бы один интерес.</p>";
      return;
    }

    resultsDiv.innerHTML = "<p>Ищем интересные места для маршрута...</p>";

    try {
      const places = await fetchPlacesFromAI(city, interests); // один массив

      resultsDiv.innerHTML = places.map(place => `
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
}

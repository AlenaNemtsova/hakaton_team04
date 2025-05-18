document.addEventListener('DOMContentLoaded', () => {
	const savedRoutesList = document.getElementById('saved-routes-list');

	const encoded = new URLSearchParams(window.location.search).get('data');

	// 📌 Если открыт маршрут по ссылке — показать, но не сохранять
	if (encoded) {
		try {
			const json = decodeURIComponent(atob(encoded));
			const route = JSON.parse(json);
			renderRoute(route, savedRoutesList, undefined); // без индекса — не показываем "Удалить"
			return;
		} catch (e) {
			console.error('Ошибка при декодировании маршрута из ссылки:', e);
			savedRoutesList.innerText = 'Ошибка при загрузке маршрута.';
			return;
		}
	}

	// 📁 Загружаем маршруты из localStorage
	const raw = localStorage.getItem('savedRoutes');
	let routes = [];
	if (raw) {
		try {
			routes = JSON.parse(raw);
		} catch (e) {
			console.error('Ошибка при чтении сохранённых маршрутов:', e);
		}
	}

	if (!routes.length) {
		savedRoutesList.innerText = 'Сохранённых маршрутов пока нет.';
		return;
	}

	routes.forEach((route, index) => {
		renderRoute(route, savedRoutesList, index);
	});
});

function renderRoute(route, container, index = 0) {
	const box = document.createElement('div');

	const title = document.createElement('h2');
	title.textContent = `Маршрут ${index + 1 || 1}: ${route.cityName} — ${route.theme
		}`;
	box.appendChild(title);

	route.days.forEach((day, i) => {
		const dayBlock = document.createElement('div');

		const dayTitle = document.createElement('h3');
		dayTitle.textContent = `День ${i + 1}: ${day.title}`;
		dayBlock.appendChild(dayTitle);

		const placeList = document.createElement('ul');
		day.places.forEach((place) => {
			const li = document.createElement('li');
			li.innerHTML = `
				<strong>${place.time}</strong> — 
				${place.name} (${getPlaceTypeName(place.type)})<br>
				<small>${place.address}</small>
			`;
			placeList.appendChild(li);
		});

		dayBlock.appendChild(placeList);
		box.appendChild(dayBlock);
	});

	// 🔵 Кнопка "Скачать PDF"
	const pdfButton = document.createElement('button');
	pdfButton.textContent = 'Скачать PDF';
	pdfButton.addEventListener('click', () => {
		const newWindow = window.open('', '_blank');
		const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; }
        h2 { color: #1e40af; }
        h3 { color: #2563eb; margin-top: 1rem; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 0.5rem; }
      </style>
    `;

		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          ${style}
        </head>
        <body>
          <h2>Маршрут ${index + 1 || 1}: ${route.cityName} — ${route.theme}</h2>
          ${route.days
				.map(
					(day, i) => `
              <h3>День ${i + 1}: ${day.title}</h3>
              <ul>
                ${day.places
							.map(
								(place) => `
                  <li><strong>${place.time}</strong> — ${place.name
									} (${getPlaceTypeName(place.type)})<br/>
                  <small>${place.address}</small></li>
                `
							)
							.join('')}
              </ul>
            `
				)
				.join('')}
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <script>
            window.onload = () => {
              html2pdf().set({
                margin: 10,
                filename: 'Маршрут-${index + 1 || 1}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              }).from(document.body).save();
            };
          </script>
        </body>
      </html>
    `;

		newWindow.document.write(html);
		newWindow.document.close();
	});
	box.appendChild(pdfButton);

	// 🔵 Кнопка "Поделиться"
	const shareButton = document.createElement('button');
	shareButton.textContent = 'Поделиться';
	shareButton.style.marginLeft = '10px';
	shareButton.addEventListener('click', () => {
		try {
			const encoded = btoa(encodeURIComponent(JSON.stringify(route)));
			const url = `${window.location.origin}/saved-routes.html?data=${encoded}`;
			window.open(url, '_blank');
		} catch (err) {
			alert('Не удалось открыть маршрут');
		}
	});
	box.appendChild(shareButton);

	// 🔵 Кнопка "Удалить" (только если это сохранённый маршрут)
	if (index !== undefined) {
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Удалить';
		deleteButton.style.marginLeft = '10px';
		deleteButton.addEventListener('click', () => {
			const raw = localStorage.getItem('savedRoutes');
			let routes = raw ? JSON.parse(raw) : [];
			routes.splice(index, 1);
			localStorage.setItem('savedRoutes', JSON.stringify(routes));
			location.reload();
		});
		box.appendChild(deleteButton);
	}

	container.appendChild(box);
}

function getPlaceTypeName(type) {
	const map = {
		attraction: 'Достопримечательность',
		museum: 'Музей',
		restaurant: 'Ресторан',
		cafe: 'Кафе',
		bar: 'Бар',
		hotel: 'Отель',
		park: 'Парк',
	};
	return map[type] || type;
}

document.addEventListener('DOMContentLoaded', () => {
	const savedRoutesList = document.getElementById('saved-routes-list');

	// Загружаем массив маршрутов из localStorage
	const raw = localStorage.getItem('savedRoutes');
	let routes = [];
	if (raw) {
		try {
			routes = JSON.parse(raw);
		} catch (e) {
			console.error('Ошибка при парсинге сохранённых маршрутов:', e);
		}
	}

	if (routes.length === 0) {
		savedRoutesList.innerText = 'Сохранённых маршрутов пока нет.';
		return;
	}

	// Перебираем маршруты
	routes.forEach((route, index) => {
		const container = document.createElement('div');
		container.style.border = '1px solid #ccc';
		container.style.padding = '10px';
		container.style.marginBottom = '16px';

		const summary = document.createElement('p');
		summary.textContent = `Маршрут ${index + 1}: Город: ${
			route.cityName
		}, дней: ${route.days.length}, тема: ${route.theme}`;
		container.appendChild(summary);

		// Кнопка "Скачать PDF"
		const pdfButton = document.createElement('button');
		pdfButton.textContent = 'Скачать PDF';
		pdfButton.addEventListener('click', () => {
			html2pdf()
				.from(container)
				.save(`Маршрут-${index + 1}.pdf`);
		});
		container.appendChild(pdfButton);

		// Кнопка "Поделиться ссылкой"
		const shareButton = document.createElement('button');
		shareButton.textContent = 'Поделиться';
		shareButton.style.marginLeft = '10px';
		shareButton.addEventListener('click', () => {
			const encoded = btoa(JSON.stringify(route));
			const url = `${window.location.origin}/?data=${encoded}`;
			navigator.clipboard.writeText(url).then(() => {
				alert('Ссылка скопирована в буфер обмена!');
			});
		});
		container.appendChild(shareButton);

		// Кнопка "Удалить"
		const deleteButton = document.createElement('button');
		deleteButton.textContent = 'Удалить';
		deleteButton.style.marginLeft = '10px';
		deleteButton.addEventListener('click', () => {
			routes.splice(index, 1);
			localStorage.setItem('savedRoutes', JSON.stringify(routes));
			location.reload();
		});
		container.appendChild(deleteButton);

		savedRoutesList.appendChild(container);
	});
});

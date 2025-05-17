//Сюда импортируем все js-файлы

//Пример импорта js-файла
import setupCounter from './js/counter.js';

//Вызываем свои функции в проекте
document.addEventListener('DOMContentLoaded', () => {
	setupCounter(); //вызов функции
});

//Функция сохранения маршрута
export function saveRouteToLocalStorage(newRoute) {
	const raw = localStorage.getItem('savedRoutes');
	const routes = raw ? JSON.parse(raw) : [];

	routes.push(newRoute);
	localStorage.setItem('savedRoutes', JSON.stringify(routes));
}

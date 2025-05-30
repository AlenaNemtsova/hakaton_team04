import './styles/main.css';

//Сюда импортируем свои js-файлы
import hero from './js/hero.js';
import rootSelector from './js/root-selector.js';
import handleFormSubmit from './js/handle-form-submit.js';
import initTopPlaces from './js/get-top-places.js';
import readyPlaces from './js/readyplaces.js'
import initBurgerMenu from './js/burger-menu.js';

//Вызываем функции из js-файлов
document.addEventListener('DOMContentLoaded', () => {
	hero();
	initTopPlaces();
	handleFormSubmit();
	readyPlaces();
	initBurgerMenu();
});

//Функция сохранения маршрута
function saveRouteToLocalStorage(newRoute) {
	const raw = localStorage.getItem('savedRoutes');
	const routes = raw ? JSON.parse(raw) : [];

	routes.push(newRoute);
	localStorage.setItem('savedRoutes', JSON.stringify(routes));
}


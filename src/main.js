//Сюда импортируем все js-файлы

//Пример импорта js-файла
import setupCounter from './js/counter.js';
import readyPlaces from './js/readyplaces.js'


//Вызываем свои функции в проекте
document.addEventListener('DOMContentLoaded', () => {
  setupCounter() //вызов функции
  readyPlaces()
});

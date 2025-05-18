export default function initBurgerMenu() {
    const checkbox = document.getElementById('burger-checkbox');
    const overlay = document.querySelector('.overlay');
    const headerNav = document.querySelector('.header__nav');
    const body = document.body;

    if (!checkbox || !overlay || !headerNav) return;

    // Функция обновления состояния меню и прокрутки
    const updateMenuState = () => {
        if (checkbox.checked) {
            headerNav.classList.add('active');    // показать меню
            overlay.classList.add('active');      // показать затемнение
            body.classList.add('no-scroll');      // запрет прокрутки
        } else {
            headerNav.classList.remove('active'); // скрыть меню
            overlay.classList.remove('active');   // скрыть затемнение
            body.classList.remove('no-scroll');   // разрешить прокрутку
        }
    };

    // При клике по overlay — закрываем бургер и убираем запрет прокрутки
    overlay.addEventListener('click', () => {
        checkbox.checked = false;
        updateMenuState();
    });

    // При нажатии ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && checkbox.checked) {
            checkbox.checked = false;
            updateMenuState();
        }
    });

    // Отслеживаем изменения чекбокса (вкл/выкл меню)
    checkbox.addEventListener('change', updateMenuState);
}

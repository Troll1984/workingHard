


//Календарь  flatpickr
flatpickr("#time", {
  mode: "range",
  dateFormat: "d.m.Y",
  locale: "uk",
  minDate: "today"
});
// Код для сохранения
let formAscetic = document.querySelector('#form-ascetic');
let menu = document.querySelector('#menu');
formAscetic.addEventListener('submit', (event) => {
    event.preventDefault();

    let formData = new FormData(formAscetic);

    let nameAscetic = formData.get('name').trim();
    let timeAscetic = formData.get('time').trim();
    let resultAscetic = formData.get('result').trim();

    // Проверяем заполнение полей
    if (!nameAscetic || !timeAscetic || !resultAscetic) {
        alert('Заполни все поля!');
        return;
    }

    // Проверяем, что выбраны обе даты
    let dates = timeAscetic.split(' to ');

    if (dates.length !== 2 || !dates[0] || !dates[1]) {
        alert('Выбери дату начала и окончания аскезы!');
        return;
    }

    // Проверяем корректность диапазона
    function parseDate(value) {
        let [day, month, year] = value.split('.').map(Number);
        let date = new Date(year, month - 1, day);

        if (
            date.getDate() !== day ||
            date.getMonth() !== month - 1 ||
            date.getFullYear() !== year
        ) {
            return null;
        }

        return date;
    }

    let startDate = parseDate(dates[0]);
    let endDate = parseDate(dates[1]);

    if (!startDate || !endDate || endDate < startDate) {
        alert('Выбери корректный период аскезы!');
        return;
    }

    // Запрещаем начинать аскезу в прошлом
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
        alert('Дата начала не может быть в прошлом!');
        return;
    }

    // Создаём аскезу только после успешных проверок
    let newAscetic = {
        nameAscetic,
        timeAscetic,
        resultAscetic,
        completedDays: [],
        status: 'active'
    };

    let ascetics = JSON.parse(
        localStorage.getItem('key') || '[]'
    );

    ascetics.push(newAscetic);

    localStorage.setItem('key', JSON.stringify(ascetics));

    window.location.href = './ascetic.html';
});
menu.addEventListener('click', () => {
   window.location.href = './ascetic.html';
    
})



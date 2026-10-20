

let language = localStorage.getItem('language') || 'en';

let languageSelect = document.querySelector('#language');

if (languageSelect) {
    languageSelect.value = language;

    languageSelect.addEventListener('change', () => {
        localStorage.setItem('language', languageSelect.value);
        location.reload();
    });
}

let saveAscetic = document.querySelector('.save-ascetic');
let back = document.querySelector('.btn');

let ascetics = JSON.parse(localStorage.getItem('key')) || [];

function saveData() {
    localStorage.setItem('key', JSON.stringify(ascetics));
}
back.addEventListener('click', () => {
     window.location.href = './index.html';
})
// Получаем начало сегодняшнего дня по местному времени
function getToday() {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}

// Преобразуем дату формата 20.10.2026 в объект Date
function parseDate(dateString) {
    let [day, month, year] = dateString.split('.').map(Number);
    return new Date(year, month - 1, day);
}

// Преобразуем Date в формат DD.MM.YYYY
function formatDate(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');

    return `${day}.${month}.${date.getFullYear()}`;
}
// Проверяем статус аскезы
function checkAscetic(element, startDate, endDate) {
    let today = getToday();
      // Нарушенную или завершённую аскезу не меняем
    if (element.status === 'failed' ||
        element.status === 'completed') {
        return;
    }
     let day = new Date(startDate);

    // Если начало аскезы ещё не наступило
    if (today < day) {
        element.status = 'planned';
        return;
    }
     // Проверяем все дни до сегодняшнего
    while (day < today && day <= endDate) {
        let dateString = formatDate(day);

        if (!element.completedDays.includes(dateString)) {
            element.status = 'failed';
            return;
        }

        day.setDate(day.getDate() + 1);
    }
      // Если весь срок закончился
    if (today > endDate) {
        element.status = 'completed';
    } else {
        element.status = 'active';
    }
}
// Создаём карточки
function renderAscetics() {
    saveAscetic.innerHTML = '';

    ascetics.forEach((element, index) => {
        if (!Array.isArray(element.completedDays)) {
            element.completedDays = [];
        }
      
      

        let card = document.createElement('div');
        card.classList.add('ascetic-card');

        let name = document.createElement('h1');
        let time = document.createElement('p');
        let result = document.createElement('h3');
        let status = document.createElement('h3');

        name.textContent = element.nameAscetic;
        time.textContent = element.timeAscetic;
        result.textContent = element.resultAscetic;

        // Разбираем диапазон Flatpickr
        let dates = element.timeAscetic.split(' to ');
        let startDate = parseDate(dates[0]);
        let endDate = dates[1]
            ? parseDate(dates[1])
            : new Date(startDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        // Проверяем корректность дат
        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            endDate < startDate
        ) {
            card.append(name, time, result);
            saveAscetic.append(card);
            return;
        }

        checkAscetic(element, startDate, endDate);

        // Статус
        function updateStatus() {
            status.className = '';

            if (element.status === 'failed') {
                status.textContent = '❌ Аскеза не соблюдена';
                status.classList.add('status-failed');
            } else if (element.status === 'completed') {
                status.textContent = '✅ Аскеза завершена';
                status.classList.add('status-completed');
            } else if (element.status === 'planned') {
                status.textContent = '⏳ Аскеза ещё не началась';
                status.classList.add('status-active');
            } else {
                status.textContent = '🟢 Аскеза в процессе';
                status.classList.add('status-active');
            }
        }

        // Прогресс
        let totalDays = Math.round(
            (endDate - startDate) / 86400000
        ) + 1;

        let progressTitle = document.createElement('h3');
        progressTitle.textContent = 'Progress';

        let progressText = document.createElement('p');
        let progressBar = document.createElement('progress');

        progressBar.max = totalDays;

        function updateProgress() {
            let completed = element.completedDays.length;

            progressBar.value = completed;

            progressText.textContent =
                `${completed} / ${totalDays} days (${Math.round(completed / totalDays * 100)}%)`;
        }

        // Календарь
        let calendarTitle = document.createElement('h3');
        calendarTitle.textContent = 'Mark your days';

        let calendar = document.createElement('div');
        calendar.classList.add('ascetic-calendar');

        let offset = (startDate.getDay() + 6) % 7;

        for (let i = 0; i < offset; i++) {
            let emptyDay = document.createElement('span');
            emptyDay.classList.add('empty-day');
            calendar.append(emptyDay);
        }

        let today = getToday();

        for (let i = 0; i < totalDays; i++) {
            let currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            let dateString = formatDate(currentDate);
            let dayButton = document.createElement('button');

            dayButton.type = 'button';
            dayButton.textContent = currentDate.getDate();
            dayButton.classList.add('calendar-day');
            dayButton.title = dateString;

            let isCompleted =
                element.completedDays.includes(dateString);

            let isToday =
                currentDate.getTime() === today.getTime();

            if (isCompleted) {
                dayButton.classList.add('completed');
            }

            // Только сегодня можно поставить отметку.
            // Прошлые и будущие дни заблокированы.
            dayButton.disabled =
                !isToday ||
                element.status === 'failed' ||
                element.status === 'completed';

            dayButton.setAttribute(
                'aria-pressed',
                String(isCompleted)
            );

            dayButton.addEventListener('click', () => {
                // Повторная проверка непосредственно при клике
                let actualToday = getToday();

                if (
                    currentDate.getTime() !== actualToday.getTime() ||
                    element.status === 'failed' ||
                    element.status === 'completed'
                ) {
                    return;
                }

                let dayIndex =
                    element.completedDays.indexOf(dateString);

                if (dayIndex === -1) {
                    element.completedDays.push(dateString);
                } else {
                    // Сегодняшнюю отметку можно снять до полуночи
                    element.completedDays.splice(dayIndex, 1);
                }

                saveData();
                renderAscetics();
            });

            calendar.append(dayButton);
        }

        // Удаление карточки
        let deleteButton = document.createElement('button');
        
        
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        

        deleteButton.addEventListener('click', () => {
            ascetics.splice(index, 1);
            saveData();
            renderAscetics();
           
        });        
        

        updateStatus();
         
        card.append(
            name,
            time,
            result,
            status,
            progressTitle,
            progressText,
            progressBar,
            calendarTitle,
            calendar,
            deleteButton
        );
       
       
        saveAscetic.append(card);
        
        updateProgress();
    });
 
    saveData();
   
}

// Перерисовываем карточки и проверяем пропущенные дни
function checkAllAscetics() {
    renderAscetics();
}

// Запускаем проверку в начале
checkAllAscetics();

// Планируем следующую проверку на местную полночь
function scheduleMidnightCheck() {
    let now = new Date();
    let nextMidnight = new Date(now);

    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    let delay = nextMidnight.getTime() - now.getTime();

    setTimeout(() => {
        checkAllAscetics();
        scheduleMidnightCheck();
    }, delay);
}

scheduleMidnightCheck();

// Проверяем время, когда пользователь возвращается на вкладку
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkAllAscetics();
    }
});

// Проверяем время, когда пользователь возвращается в окно
window.addEventListener('focus', checkAllAscetics);
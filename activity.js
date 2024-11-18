const pages = dv.pages('"/"'); // Все заметки
const today = dv.luxon.DateTime.now(); // Текущая дата
const endDate = today.endOf('day'); // Конечная точка (сегодня)
const startDate = endDate.minus({ weeks: 52 }).startOf('week'); // Начало отсчёта (52 недели назад)

// == Настройки цветов и стилей ==
const emptyColor = "rgb(38, 50, 56)";
const gradientColors = ["#1B5E20", "#2E7D32", "#388E3C", "#43A047", "#4CAF50", "#66BB6A"];
const daySize = 14; // Размер ячейки в пикселях

// == Собираем данные о заметках ==
const notesCountByDate = {};
pages.forEach(page => {
    const created = page.file.cday; // Дата создания файла
    if (created) {
        const dateKey = created.startOf('day').toISODate();
        notesCountByDate[dateKey] = (notesCountByDate[dateKey] || 0) + 1; // Увеличиваем счётчик
    }
});

// == Подготовка календаря ==
const calendar = Array.from({ length: 7 }, () => Array(52).fill(null)); // 7 строк (по дням недели), 52 недели

let date = startDate;
while (date <= endDate) {
    const weekOfYear = Math.floor(date.diff(startDate, 'weeks').weeks); // Номер недели от начала
    const dayOfWeek = date.weekday - 1; // Понедельник = 0
    const dateKey = date.toISODate();
    const count = notesCountByDate[dateKey] || 0;
    const color = determineColor(count); // Определение цвета
    const tooltip = `${dateKey}: ${count} заметок`; // Подсказка
    calendar[dayOfWeek][weekOfYear] = getDayEl(color, tooltip); // Добавляем элемент
    date = date.plus({ days: 1 });
}

// == Рендеринг ==
const startYear = startDate.year;
const endYear = endDate.year;
const yearTitle = `${startYear} - ${endYear}`; // Заголовок годов

let outputHTML = `<div style="text-align:left;">`; // Устанавливаем выравнивание календаря по левому краю
outputHTML += `<h2 style="margin-bottom:10px;font-size:large;">${yearTitle}</h2>`; // Заголовок года

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Дни недели и дни
dayNames.forEach((day, rowIndex) => {
    outputHTML += `<div style="display:flex;align-items:center;margin-bottom:2px;">`;
    outputHTML += `<span style="width:30px;text-align:right;margin-right:5px;font-size:small;font-weight:bold;line-height:${daySize}px;">${day}</span>`;
    calendar[rowIndex].forEach(cell => {
        outputHTML += cell || `<span style="width:${daySize}px;height:${daySize}px;border-radius:2px;background-color:${emptyColor};display:inline-block;margin:0.5px;vertical-align:middle;"></span>`;
    });
    outputHTML += `</div>`;
});

// Добавляем легенду
outputHTML += `<div style="margin-top:10px;display:flex;align-items:center;">`;
outputHTML += `<span style="font-size:small;margin-right:10px;">Less</span>`;
gradientColors.forEach(color => {
    outputHTML += `<span style="width:${daySize}px;height:${daySize}px;border-radius:2px;background-color:${color};display:inline-block;margin:0.5px;"></span>`;
});
outputHTML += `<span style="font-size:small;margin-left:10px;">More</span>`;
outputHTML += `</div>`;

// Выводим итоговый HTML
dv.el("div", outputHTML);

// == Функции ==
function getDayEl(color, tooltip) {
    return `<span style="width:${daySize}px;height:${daySize}px;border-radius:2px;background-color:${color};display:inline-block;margin:0.5px;vertical-align:middle;" title="${tooltip}"></span>`;
}

function determineColor(count) {
    if (count === 0) return emptyColor;
    const colorIndex = Math.min(count, gradientColors.length - 1); // Ограничиваем индекс
    return gradientColors[colorIndex];
}

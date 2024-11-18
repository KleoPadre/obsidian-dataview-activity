const pages = dv.pages('"/"'); // All notes
const today = dv.luxon.DateTime.now(); // Current date
const endDate = today.endOf('day'); // End point (today)
const startDate = endDate.minus({ weeks: 52 }).startOf('week'); // Start point (52 weeks ago)

// == Color and style settings ==
const emptyColor = "rgb(38, 50, 56)";
const gradientColors = ["#1B5E20", "#2E7D32", "#388E3C", "#43A047", "#4CAF50", "#66BB6A"];
const daySize = 14; // Cell size in pixels

// == Collect notes data ==
const notesCountByDate = {};
pages.forEach(page => {
    const created = page.file.cday; // File creation date
    if (created) {
        const dateKey = created.startOf('day').toISODate();
        notesCountByDate[dateKey] = (notesCountByDate[dateKey] || 0) + 1; // Increment counter
    }
});

// == Prepare calendar ==
const calendar = Array.from({ length: 7 }, () => Array(52).fill(null)); // 7 rows (by days of week), 52 weeks
let date = startDate;
while (date <= endDate) {
    const weekOfYear = Math.floor(date.diff(startDate, 'weeks').weeks); // Week number from start
    const dayOfWeek = date.weekday - 1; // Monday = 0
    const dateKey = date.toISODate();
    const count = notesCountByDate[dateKey] || 0;
    const color = determineColor(count); // Determine color
    const tooltip = `${dateKey}: ${count} notes`; // Tooltip
    calendar[dayOfWeek][weekOfYear] = getDayEl(color, tooltip); // Add element
    date = date.plus({ days: 1 });
}

// == Rendering ==
const startYear = startDate.year;
const endYear = endDate.year;
const yearTitle = `${startYear} - ${endYear}`; // Years title
let outputHTML = `<div style="text-align:left;">`; // Set calendar alignment to left
outputHTML += `<h2 style="margin-bottom:10px;font-size:large;">${yearTitle}</h2>`; // Year title
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Days of week and days
dayNames.forEach((day, rowIndex) => {
    outputHTML += `<div style="display:flex;align-items:center;margin-bottom:2px;">`;
    outputHTML += `<span style="width:30px;text-align:right;margin-right:5px;font-size:small;font-weight:bold;line-height:${daySize}px;">${day}</span>`;
    calendar[rowIndex].forEach(cell => {
        outputHTML += cell || `<span style="width:${daySize}px;height:${daySize}px;border-radius:2px;background-color:${emptyColor};display:inline-block;margin:0.5px;vertical-align:middle;"></span>`;
    });
    outputHTML += `</div>`;
});

// Add legend
outputHTML += `<div style="margin-top:10px;display:flex;align-items:center;">`;
outputHTML += `<span style="font-size:small;margin-right:10px;">Less</span>`;
gradientColors.forEach(color => {
    outputHTML += `<span style="width:${daySize}px;height:${daySize}px;border-radius:2px;background-color:${color};display:inline-block;margin:0.5px;"></span>`;
});
outputHTML += `<span style="font-size:small;margin-left:10px;">More</span>`;
outputHTML += `</div>`;

// Output final HTML
dv.el("div", outputHTML);

// == Functions ==
function getDayEl(color, tooltip) {
    return `<span style="width:${daySize}px;height:${daySize}px;border-radius:2px;background-color:${color};display:inline-block;margin:0.5px;vertical-align:middle;" title="${tooltip}"></span>`;
}

function determineColor(count) {
    if (count === 0) return emptyColor;
    const colorIndex = Math.min(count, gradientColors.length - 1); // Limit index
    return gradientColors[colorIndex];
}

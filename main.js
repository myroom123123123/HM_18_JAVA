// --- Адаптер для старого API ---
// Приклад старого API:
// [
//   { event_name: '...', event_type: '...', event_date: '...', event_price: 100, tickets: 50, place: '...' }
// ]
function adaptOldApiData(oldData) {
	return oldData.map(item => ({
		id: Math.random().toString(36).slice(2),
		name: item.event_name,
		type: item.event_type,
		date: item.event_date,
		price: item.event_price,
		ticketsAvailable: item.tickets,
		location: item.place
	}));
}

// --- Кешування та ініціалізація подій ---
const defaultEvents = [
	{
		id: 1,
		name: "Концерт Океан Ельзи",
		type: "концерт",
		date: "2025-12-20",
		price: 800,
		ticketsAvailable: 120,
		location: "Палац Спорту, Київ"
	},
	{
		id: 2,
		name: "Театр: За двома зайцями",
		type: "театр",
		date: "2025-12-22",
		price: 400,
		ticketsAvailable: 60,
		location: "Театр ім. Франка, Київ"
	},
	{
		id: 3,
		name: "Кіно: Дюна 2",
		type: "кіно",
		date: "2025-12-15",
		price: 250,
		ticketsAvailable: 200,
		location: "Кінотеатр Multiplex, Київ"
	}
];

let events = [];
try {
	const cached = localStorage.getItem('events');
	events = cached ? JSON.parse(cached) : defaultEvents;
} catch (e) {
	events = defaultEvents;
}

function saveEventsToCache() {
	localStorage.setItem('events', JSON.stringify(events));
}

// --- Сповіщення ---
function showNotification(message, type = 'success') {
	const notif = document.getElementById('notification');
	if (!notif) return;
	notif.textContent = message;
	notif.style.display = 'block';
	notif.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
	notif.style.color = type === 'success' ? '#155724' : '#721c24';
	notif.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
	setTimeout(() => {
		notif.style.display = 'none';
	}, 2000);
}

// --- Фільтрація та сортування ---
function getFilteredSortedEvents() {
	const type = document.getElementById('filter-type')?.value || '';
	const sortBy = document.getElementById('sort-by')?.value || 'date';
	let filtered = events;
	if (type) {
		filtered = filtered.filter(e => e.type === type);
	}
	if (sortBy === 'date') {
		filtered = filtered.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
	} else if (sortBy === 'price') {
		filtered = filtered.slice().sort((a, b) => a.price - b.price);
	}
	return filtered;
}

function updateEventsList() {
	renderEvents(getFilteredSortedEvents());
}

// --- Рендер подій та купівля ---
function renderEvents(eventsArray) {
	const container = document.getElementById('events-list');
	if (!container) return;
	container.innerHTML = eventsArray.map(event => `
		<div class="event-card">
			<h3>${event.name}</h3>
			<p>Тип: ${event.type}</p>
			<p>Дата: ${event.date}</p>
			<p>Місце: ${event.location}</p>
			<p>Ціна: ${event.price} грн</p>
			<p>Доступно квитків: ${event.ticketsAvailable}</p>
			<button class="buy-btn" data-id="${event.id}" ${event.ticketsAvailable === 0 ? 'disabled' : ''}>Купити</button>
		</div>
	`).join('');
	container.querySelectorAll('.buy-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const id = Number(this.dataset.id);
			const eventObj = events.find(e => e.id === id);
			if (eventObj && eventObj.ticketsAvailable > 0) {
				eventObj.ticketsAvailable--;
				saveEventsToCache();
				showNotification('Квиток успішно куплено!', 'success');
				updateEventsList();
			} else {
				showNotification('Квитки закінчилися!', 'error');
			}
		});
	});
}

// --- Ініціалізація ---
document.addEventListener('DOMContentLoaded', () => {
	renderEvents(events);
	document.getElementById('filter-type').addEventListener('change', updateEventsList);
	document.getElementById('sort-by').addEventListener('change', updateEventsList);
});

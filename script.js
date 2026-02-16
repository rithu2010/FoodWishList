// Change this to your backend base URL when deploying
// For local development: http://localhost:8080
// For Render: https://your-backend-service.onrender.com
const API_BASE_URL = 'http://localhost:8080';

const foodForm = document.getElementById('food-form');
const foodIdInput = document.getElementById('food-id');
const foodNameInput = document.getElementById('food-name');
const restaurantNameInput = document.getElementById('restaurant-name');
const ratingInput = document.getElementById('rating');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const refreshBtn = document.getElementById('refresh-btn');
const foodList = document.getElementById('food-list');
const emptyState = document.getElementById('empty-state');
const alertsContainer = document.getElementById('alerts');
const apiUrlDisplay = document.getElementById('api-url-display');

apiUrlDisplay.textContent = `${API_BASE_URL}/foods`;

function showAlert(message, type = 'success') {
    const div = document.createElement('div');
    div.className = `alert alert-${type === 'error' ? 'error' : 'success'}`;
    div.textContent = message;
    alertsContainer.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 3500);
}

function validateForm() {
    const foodName = foodNameInput.value.trim();
    const ratingVal = ratingInput.value.trim();

    if (!foodName) {
        showAlert('Food name is required.', 'error');
        return false;
    }

    if (ratingVal) {
        const rating = Number(ratingVal);
        if (Number.isNaN(rating) || rating < 1 || rating > 5) {
            showAlert('Rating must be a number between 1 and 5.', 'error');
            return false;
        }
    }

    return true;
}

async function fetchFoods() {
    try {
        const res = await fetch(`${API_BASE_URL}/foods`);
        if (!res.ok) {
            throw new Error('Failed to fetch food items');
        }
        const data = await res.json();
        renderFoodList(data);
    } catch (err) {
        console.error(err);
        showAlert('Could not load wishlist items. Check the backend API.', 'error');
    }
}

function renderFoodList(items) {
    foodList.innerHTML = '';

    if (!items || items.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    items
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .forEach(item => {
            const card = document.createElement('div');
            card.className = 'food-card';

            const main = document.createElement('div');
            main.className = 'food-main';

            const title = document.createElement('div');
            title.className = 'food-title';
            title.textContent = item.foodName;

            const restaurant = document.createElement('div');
            restaurant.className = 'food-restaurant';
            restaurant.textContent = item.restaurantName || 'Unknown restaurant';

            const meta = document.createElement('div');
            meta.className = 'food-meta';

            const addedDate = item.dateAdded ? new Date(item.dateAdded) : null;
            const dateText = addedDate
                ? `Added on ${addedDate.toLocaleDateString()} ${addedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Date unknown';

            meta.textContent = dateText;

            main.appendChild(title);
            main.appendChild(restaurant);

            const ratingSpan = document.createElement('span');
            ratingSpan.className = 'rating-badge';
            ratingSpan.textContent = item.rating ? `★ ${item.rating}/5` : 'No rating yet';
            meta.appendChild(document.createTextNode(' • '));
            meta.appendChild(ratingSpan);

            main.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'food-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn-edit';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => startEdit(item));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => handleDelete(item.id));

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            card.appendChild(main);
            card.appendChild(actions);

            foodList.appendChild(card);
        });
}

async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }

    const payload = {
        foodName: foodNameInput.value.trim(),
        restaurantName: restaurantNameInput.value.trim() || null,
        rating: ratingInput.value ? Number(ratingInput.value) : null
    };

    const id = foodIdInput.value;
    const isEdit = Boolean(id);

    try {
        const url = isEdit
            ? `${API_BASE_URL}/foods/${id}`
            : `${API_BASE_URL}/foods`;

        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorBody = await res.json().catch(() => null);
            if (errorBody && typeof errorBody === 'object') {
                const messages = Object.values(errorBody).join(' | ');
                throw new Error(messages || 'Request failed');
            }
            throw new Error('Request failed');
        }

        const saved = await res.json();
        if (isEdit) {
            showAlert(`Updated "${saved.foodName}".`, 'success');
        } else {
            showAlert(`Added "${saved.foodName}" to wishlist.`, 'success');
        }
        resetForm();
        await fetchFoods();
    } catch (err) {
        console.error(err);
        showAlert(err.message || 'Could not save item.', 'error');
    }
}

async function handleDelete(id) {
    if (!confirm('Are you sure you want to remove this item from your wishlist?')) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/foods/${id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) {
            throw new Error('Delete failed');
        }
        showAlert('Item removed from wishlist.', 'success');
        await fetchFoods();
    } catch (err) {
        console.error(err);
        showAlert('Could not delete item.', 'error');
    }
}

function startEdit(item) {
    foodIdInput.value = item.id;
    foodNameInput.value = item.foodName || '';
    restaurantNameInput.value = item.restaurantName || '';
    ratingInput.value = item.rating != null ? item.rating : '';

    submitBtn.textContent = 'Update Item';
    cancelEditBtn.classList.remove('hidden');
}

function resetForm() {
    foodIdInput.value = '';
    foodNameInput.value = '';
    restaurantNameInput.value = '';
    ratingInput.value = '';
    submitBtn.textContent = 'Add to Wishlist';
    cancelEditBtn.classList.add('hidden');
}

foodForm.addEventListener('submit', handleSubmit);
cancelEditBtn.addEventListener('click', resetForm);
refreshBtn.addEventListener('click', fetchFoods);

fetchFoods();


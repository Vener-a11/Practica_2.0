    let books = [];

    // ---------- Вспомогательная функция для fetch ----------
    async function apiRequest(url, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Ошибка запроса');
        }
        return response.json();
    }

    // ---------- Загрузка книг с сервера ----------
    async function loadBooks() {
        try {
            const data = await apiRequest('/api/books');
            books = data;
            updateStats();
            renderTable();
        } catch (e) {
            alert('Не удалось загрузить список книг: ' + e.message);
        }
    }

    // ---------- Статистика ----------
    function updateStats() {
        const totalBooks = books.length;
        const totalCopies = books.reduce((sum, b) => sum + (b.copies || 0), 0);
        const uniqueGenres = new Set(books.map(b => b.genre)).size;
        const uniqueAuthors = new Set(books.map(b => b.author)).size;

        document.getElementById('statsContainer').innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${totalBooks}</div>
                <div class="stat-label">Всего книг</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalCopies}</div>
                <div class="stat-label">Экземпляров</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${uniqueGenres}</div>
                <div class="stat-label">Жанров</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${uniqueAuthors}</div>
                <div class="stat-label">Авторов</div>
            </div>
        `;
    }

    // ---------- Отрисовка таблицы с фильтрами ----------
    function renderTable() {
        const titleFilter = document.getElementById('filterTitle').value.toLowerCase().trim();
        const authorFilter = document.getElementById('filterAuthor').value.toLowerCase().trim();
        const genreFilter = document.getElementById('filterGenre').value;
        const yearFilter = document.getElementById('filterYear').value;

        let filtered = books.filter(book => {
            const matchTitle = titleFilter === '' || book.title.toLowerCase().startsWith(titleFilter);
            let matchAuthor = true;
            if (authorFilter) {
                const surname = book.author.split(' ')[0].toLowerCase();
                matchAuthor = surname.startsWith(authorFilter);
            }
            const matchGenre = genreFilter === 'all' || book.genre === genreFilter;
            const matchYear = !yearFilter || book.year == yearFilter;
            return matchTitle && matchAuthor && matchGenre && matchYear;
        });

        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = filtered.map(book => `
            <tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.year}</td>
                <td>${book.genre}</td>
                <td>${book.copies}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editBook(${book.id})">✏️</button>
                    <button class="action-btn delete-btn" onclick="deleteBook(${book.id})">🗑</button>
                </td>
            </tr>
        `).join('');
    }

    // ---------- Добавление книги ----------
    function showAddModal() {
        document.getElementById('addModal').style.display = 'flex';
        document.getElementById('modalTitle').value = '';
        document.getElementById('modalAuthor').value = '';
        document.getElementById('modalYear').value = '';
        document.getElementById('modalGenre').value = '';
        document.getElementById('modalCopies').value = '1';
        document.getElementById('modalDescription').value = '';
    }

    function closeModal() {
        document.getElementById('addModal').style.display = 'none';
    }

    async function addBookFromModal() {
        const title = document.getElementById('modalTitle').value.trim();
        const author = document.getElementById('modalAuthor').value.trim();
        const year = parseInt(document.getElementById('modalYear').value);
        const genre = document.getElementById('modalGenre').value.trim();
        const copies = parseInt(document.getElementById('modalCopies').value) || 1;
        const description = document.getElementById('modalDescription').value.trim();

        if (!title || !author || !year || !genre) {
            alert("Заполните обязательные поля!");
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('title', title);
            formData.append('author', author);
            formData.append('year', year);
            formData.append('genre', genre);
            formData.append('copies', copies);
            formData.append('description', description);

            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            if (!response.ok) throw new Error('Ошибка добавления');
            alert("Книга успешно добавлена!");
            closeModal();
            await loadBooks();
        } catch (e) {
            alert('Не удалось добавить книгу: ' + e.message);
        }
    }

    // ---------- Редактирование ----------
    let editingId = null;

    function editBook(id) {
        const book = books.find(b => b.id === id);
        if (!book) return;

        editingId = id;
        document.getElementById('editModalTitle').value = book.title;
        document.getElementById('editModalAuthor').value = book.author;
        document.getElementById('editModalYear').value = book.year;
        document.getElementById('editModalGenre').value = book.genre;
        document.getElementById('editModalCopies').value = book.copies;
        document.getElementById('editModalDescription').value = book.description || '';

        document.getElementById('editModal').style.display = 'flex';
    }

    function closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        editingId = null;
    }

    async function saveEditedBook() {
        if (!editingId) return;

        const title = document.getElementById('editModalTitle').value.trim();
        const author = document.getElementById('editModalAuthor').value.trim();
        const year = parseInt(document.getElementById('editModalYear').value);
        const genre = document.getElementById('editModalGenre').value.trim();
        const copies = parseInt(document.getElementById('editModalCopies').value) || 1;
        const description = document.getElementById('editModalDescription').value.trim();

        if (!title || !author || !year || !genre) {
            alert("Заполните обязательные поля!");
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('title', title);
            formData.append('author', author);
            formData.append('year', year);
            formData.append('genre', genre);
            formData.append('copies', copies);
            formData.append('description', description);

            const response = await fetch(`/api/books/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            if (!response.ok) throw new Error('Ошибка обновления');
            alert("Книга успешно обновлена!");
            closeEditModal();
            await loadBooks();
        } catch (e) {
            alert('Не удалось обновить книгу: ' + e.message);
        }
    }

    // ---------- Удаление ----------
    async function deleteBook(id) {
        if (!confirm("Удалить книгу?")) return;
        try {
            const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Ошибка удаления');
            await loadBooks();
        } catch (e) {
            alert('Не удалось удалить книгу: ' + e.message);
        }
    }

    // ---------- Фильтры ----------
    function resetFilters() {
        document.getElementById('filterTitle').value = '';
        document.getElementById('filterAuthor').value = '';
        document.getElementById('filterGenre').value = 'all';
        document.getElementById('filterYear').value = '';
        renderTable();
    }

    // ---------- Список годов ----------
    function showYearList() {
        const years = [...new Set(books.map(b => b.year))].sort((a, b) => b - a);
        const container = document.getElementById('yearList');
        container.innerHTML = years.map(year => `
            <div class="year-item" onclick="selectYear(${year})">${year}</div>
        `).join('');
        document.getElementById('yearListModal').style.display = 'flex';
    }

    function selectYear(year) {
        document.getElementById('filterYear').value = year;
        closeYearListModal();
        renderTable();
    }

    function closeYearListModal() {
        document.getElementById('yearListModal').style.display = 'none';
    }

    // ---------- Модалка разработчика ----------
    function showDevModal() {
        document.getElementById('devModal').style.display = 'flex';
    }
    function closeDevModal() {
        document.getElementById('devModal').style.display = 'none';
    }

    // ---------- Инициализация ----------
    loadBooks();

    // Навешиваем обработчики на фильтры
    document.getElementById('filterTitle').addEventListener('input', renderTable);
    document.getElementById('filterAuthor').addEventListener('input', renderTable);
    document.getElementById('filterGenre').addEventListener('change', renderTable);
    document.getElementById('filterYear').addEventListener('input', renderTable);

    // Делаем функции глобальными для вызова из onclick
    window.showAddModal = showAddModal;
    window.closeModal = closeModal;
    window.addBookFromModal = addBookFromModal;
    window.editBook = editBook;
    window.saveEditedBook = saveEditedBook;
    window.closeEditModal = closeEditModal;
    window.deleteBook = deleteBook;
    window.resetFilters = resetFilters;
    window.showYearList = showYearList;
    window.selectYear = selectYear;
    window.closeYearListModal = closeYearListModal;
    window.showDevModal = showDevModal;
    window.closeDevModal = closeDevModal;
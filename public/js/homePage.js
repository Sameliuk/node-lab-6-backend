document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const lotsContainer = document.getElementById('lots-container');

    async function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            window.location.href = '/';
            return;
        }

        try {
            const response = await fetch('/lots/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: searchTerm }),
            });

            if (response.status === 404) {
                // Redirect to home with not found parameter
                window.location.href =
                    '/?search=notfound&q=' + encodeURIComponent(searchTerm);
                return;
            }

            if (!response.ok) {
                throw new Error('Помилка пошуку');
            }

            // Redirect to home with search query
            window.location.href = '/?q=' + encodeURIComponent(searchTerm);
        } catch (error) {
            console.error('Search error:', error);
            alert('Помилка при виконанні пошуку. Спробуйте пізніше.');
        }
    }

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

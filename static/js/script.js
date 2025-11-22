document.addEventListener('DOMContentLoaded', function () {

    const menuContainer = document.getElementById('menu-container');
    const bestsellersContainer = document.getElementById('bestsellers-container');

    // Fetch and display the main menu categories
    fetch('/api/menu-categories')
        .then(response => response.json())
        .then(data => {
            menuContainer.innerHTML = ''; // Clear "Loading..." text
            data.forEach(item => {
                const link = document.createElement('a');
                link.href = item.url;
                link.className = 'block hover:text-blue-600';
                link.textContent = item.name;
                menuContainer.appendChild(link);
            });
        })
        .catch(error => {
            console.error('Error fetching menu categories:', error);
            menuContainer.innerHTML = '<p class="text-red-500">Could not load menu.</p>';
        });

    // Fetch and display the best sellers from the MongoDB aggregation
    fetch('/api/best-sellers')
        .then(response => response.json())
        .then(data => {
            bestsellersContainer.innerHTML = ''; // Clear "Loading..." text

            if (data.error) throw new Error(data.error);
            if (data.length === 0) {
                 bestsellersContainer.innerHTML = '<p>No best sellers found.</p>';
                 return;
            }

            data.forEach(item => {
                const bestSellerItem = document.createElement('div');
                bestSellerItem.className = 'block';
                bestSellerItem.textContent = `${item.name} (${item.orders} orders)`;
                bestsellersContainer.appendChild(bestSellerItem);
            });
        })
        .catch(error => {
            console.error('Error fetching best sellers:', error);
            bestsellersContainer.innerHTML = '<p class="text-red-500">Could not load best sellers.</p>';
        });
});
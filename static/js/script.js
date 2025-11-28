document.addEventListener('DOMContentLoaded', function () {

    const menuContainer = document.getElementById('menu-container');
    const bestsellersContainer = document.getElementById('bestsellers-container');
    
    // --- TOGGLE LOGIC ---
    const categoriesHeader = document.getElementById('categories-header');
    const categoriesArrow = document.getElementById('categories-arrow');
    
    // Set to FALSE so it starts closed
    let isMenuOpen = false;

    categoriesHeader.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            // OPEN THE MENU
            // Remove hidden classes
            menuContainer.classList.remove('max-h-0', 'opacity-0');
            // Add visible classes (max-h-[1000px] allows it to grow to fit content)
            menuContainer.classList.add('max-h-[1000px]', 'opacity-100');
            // Rotate arrow down (0 degrees)
            categoriesArrow.classList.remove('-rotate-90');
        } else {
            // CLOSE THE MENU
            // Remove visible classes
            menuContainer.classList.remove('max-h-[1000px]', 'opacity-100');
            // Add hidden classes
            menuContainer.classList.add('max-h-0', 'opacity-0');
            // Rotate arrow right (-90 degrees)
            categoriesArrow.classList.add('-rotate-90');
        }
    });

    // --- HELPER FUNCTION ---
    function toTitleCase(str) {
        if(!str) return "";
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    // --- FETCH CATEGORIES ---
    fetch('/api/menu-categories')
        .then(response => response.json())
        .then(data => {
            menuContainer.innerHTML = '';
            
            if (data.length === 0) {
                menuContainer.innerHTML = '<p class="text-sm text-gray-500">No categories found.</p>';
                return;
            }

            data.forEach(item => {
                let name = item.name || item.categoryName || item;
                const displayName = toTitleCase(name); 

                const link = document.createElement('a');
                link.href = '#'; 
                // DARK MODE STYLING
                link.className = 'block px-3 py-2 text-sm text-gray-300 rounded hover:bg-gray-800 hover:text-white hover:pl-4 transition-all duration-200';
                link.textContent = displayName;
                
                menuContainer.appendChild(link);
            });
        })
        .catch(error => {
            console.error('Error fetching menu:', error);
            menuContainer.innerHTML = '<p class="text-red-500 text-sm">Failed to load menu.</p>';
        });

    // --- FETCH BEST SELLERS ---
    fetch('/api/best-sellers')
        .then(response => response.json())
        .then(data => {
            bestsellersContainer.innerHTML = '';

            if (data.error || data.length === 0) {
                 bestsellersContainer.innerHTML = `
                    <div class="p-3 bg-gray-800 rounded border border-gray-700 text-center">
                        <p class="text-xs text-gray-500">No sales data yet.</p>
                    </div>`;
                 return;
            }

            data.forEach((item, index) => {
                const displayName = toTitleCase(item.name);
                
                const card = document.createElement('div');
                card.className = 'flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700 shadow-sm hover:border-red-900 transition';
                
                card.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <span class="flex items-center justify-center w-6 h-6 bg-red-900 text-red-200 font-bold text-xs rounded-full">
                            ${index + 1}
                        </span>
                        <span class="text-sm font-medium text-gray-200">${displayName}</span>
                    </div>
                    <span class="text-xs text-gray-500">${item.orders} sold</span>
                `;
                bestsellersContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching best sellers:', error);
        });
});
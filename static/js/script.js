document.addEventListener('DOMContentLoaded', function () {

    // --- DOM ELEMENTS ---
    const bestsellersContainer = document.getElementById('bestsellers-container');
    const mainMenuGrid = document.getElementById('main-menu-grid');

    // --- DYNAMIC ANIMATION OBSERVER ---
    // Watches elements as they enter and leave the screen
    const observerOptions = {
        root: null, // Viewport
        rootMargin: '0px', 
        threshold: 0.1 // Trigger when 10% is visible
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const el = entry.target;
            
            if (entry.isIntersecting) {
                // ITEM ENTERS SCREEN: Animate In (Visible)
                el.classList.remove('opacity-0', 'translate-y-12', 'scale-95');
                el.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            }
            // Optional: Uncomment else block if you want items to fade out when scrolling up
            // else {
            //     el.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
            //     el.classList.add('opacity-0', 'translate-y-12', 'scale-95');
            // }
        });
    }, observerOptions);


    // --- HELPER FUNCTIONS ---
    function toTitleCase(str) {
        if(!str) return "";
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }

    function formatPrice(price) {
        return "₱" + price;
    }

    // --- 1. FETCH SIDEBAR BEST SELLERS (Smart Auto-Update) ---
    let lastBestSellersData = ""; // Store data string to detect changes

    function loadBestSellers() {
        fetch('/api/best-sellers')
            .then(response => response.json())
            .then(data => {
                if (!bestsellersContainer) return;
                
                // SMART CHECK: Only update DOM if data has actually changed
                // This prevents the list from "flashing" every 3 seconds
                const currentDataStr = JSON.stringify(data);
                if (currentDataStr === lastBestSellersData) {
                    return; 
                }
                lastBestSellersData = currentDataStr;

                // Clear current list to rebuild
                bestsellersContainer.innerHTML = '';
                
                if (data.error || data.length === 0) {
                     bestsellersContainer.innerHTML = `<div class="p-3 bg-gray-900 rounded border border-gray-800 text-center"><p class="text-xs text-gray-500">No sales data yet.</p></div>`;
                     return;
                }
                
                data.forEach((item, index) => {
                    const card = document.createElement('div');
                    // Animation Initial State: Hidden, Lower, Smaller
                    card.className = 'flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800 shadow-sm border-l-4 border-l-red-800 opacity-0 translate-y-12 scale-95 transition-all duration-700 ease-out';
                    
                    card.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <span class="flex items-center justify-center w-6 h-6 bg-red-900 text-red-200 font-bold text-xs rounded-full">${index + 1}</span>
                            <span class="text-sm font-medium text-gray-300">${toTitleCase(item.name)}</span>
                        </div>
                        <span class="text-xs text-gray-600 font-mono">${item.orders} sold</span>
                    `;
                    bestsellersContainer.appendChild(card);
                    
                    // Attach observer to new item so it animates in
                    scrollObserver.observe(card);
                });
            })
            .catch(err => console.error("Best sellers error:", err));
    }

    // Load immediately
    loadBestSellers();
    
    // Auto-refresh every 3 seconds (Fast updates)
    setInterval(loadBestSellers, 3000);


    // --- 2. FETCH MAIN MENU GRID ---
    if (mainMenuGrid) {
        fetch('/api/full-menu')
            .then(response => response.json())
            .then(data => {
                mainMenuGrid.innerHTML = '';
                
                const categories = Object.keys(data).sort(); 

                if (categories.length === 0) {
                    mainMenuGrid.innerHTML = '<p class="text-white opacity-50">Menu is currently empty.</p>';
                    return;
                }

                categories.forEach(categoryName => {
                    const products = data[categoryName];
                    if (products.length === 0) return;

                    // Section Wrapper
                    const section = document.createElement('div');
                    
                    // Sticky Title Header
                    const title = document.createElement('h2');
                    title.className = 'text-3xl font-bold text-gray-100 mb-6 font-serif border-l-4 border-red-600 pl-4 sticky top-0 bg-gray-950/95 backdrop-blur-md py-4 z-20 shadow-lg shadow-black/40 opacity-0 translate-y-12 transition-all duration-700 ease-out';
                    title.textContent = toTitleCase(categoryName);
                    section.appendChild(title);
                    
                    // Observe Title
                    scrollObserver.observe(title);

                    // Grid Container
                    const grid = document.createElement('div');
                    grid.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20';

                    // Product Cards
                    products.forEach((prod, index) => {
                        const card = document.createElement('div');
                        
                        // Premium Card Styling + Animation Classes
                        card.className = 'group relative bg-gray-900/85 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col justify-between h-full opacity-0 translate-y-12 scale-95 transition-all duration-700 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50 hover:border-red-500/30';
                        
                        // Stagger Delay (Make them appear one by one)
                        card.style.transitionDelay = `${(index % 4) * 100}ms`; 

                        card.innerHTML = `
                            <!-- Hover Glow Line -->
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl"></div>

                            <!-- Name -->
                            <div class="mb-4">
                                <h3 class="text-gray-100 font-bold text-lg leading-snug tracking-wide group-hover:text-red-400 transition-colors">
                                    ${toTitleCase(prod.name)}
                                </h3>
                            </div>
                            
                            <!-- Price Section -->
                            <div class="mt-auto border-t border-white/10 pt-3 flex items-center justify-between">
                                <span class="text-[10px] text-gray-500 uppercase tracking-widest font-bold group-hover:text-gray-400 transition-colors">Regular</span>
                                <span class="text-yellow-500 font-bold text-2xl font-serif tracking-wider drop-shadow-sm group-hover:text-yellow-400 transition-colors">
                                    ${formatPrice(prod.price)}
                                </span>
                            </div>
                        `;
                        grid.appendChild(card);
                        
                        // Observe Card
                        scrollObserver.observe(card);
                    });

                    section.appendChild(grid);
                    mainMenuGrid.appendChild(section);
                });
            })
            .catch(err => {
                console.error("Error loading main menu:", err);
                mainMenuGrid.innerHTML = '<p class="text-red-400">Could not load menu.</p>';
            });
    }
});
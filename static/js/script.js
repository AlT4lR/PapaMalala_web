document.addEventListener('DOMContentLoaded', function () {

    // --- DOM ELEMENTS ---
    const bestsellersContainer = document.getElementById('bestsellers-container');
    const mainMenuGrid = document.getElementById('main-menu-grid');
    
    // --- MOBILE MENU LOGIC ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebarContent = document.getElementById('sidebar-content');

    if (mobileMenuBtn && sidebarContent) {
        mobileMenuBtn.addEventListener('click', () => {
            // Toggle the 'hidden' class to show/hide content
            sidebarContent.classList.toggle('hidden');
        });
    }

    // --- DYNAMIC ANIMATION OBSERVER ---
    const observerOptions = {
        root: null, 
        rootMargin: '0px', // Trigger exactly when it enters view
        threshold: 0.1     // Trigger when 10% of item is visible
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const el = entry.target;
            
            if (entry.isIntersecting) {
                // ENTERING VIEW: Animate In
                el.classList.remove('opacity-0', 'translate-y-12', 'scale-95');
                el.classList.add('opacity-100', 'translate-y-0', 'scale-100');
            } else {
                // LEAVING VIEW: Reset to Invisible (allows fade-in on scroll up)
                el.classList.add('opacity-0', 'translate-y-12', 'scale-95');
                el.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
            }
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

    // --- 1. FETCH SIDEBAR BEST SELLERS ---
    let lastBestSellersData = ""; 

    function loadBestSellers() {
        if (!bestsellersContainer) return;

        fetch('/api/best-sellers')
            .then(response => response.json())
            .then(data => {
                const currentDataStr = JSON.stringify(data);
                if (currentDataStr === lastBestSellersData) return; 
                lastBestSellersData = currentDataStr;

                bestsellersContainer.innerHTML = '';
                
                if (data.error || data.length === 0) {
                     bestsellersContainer.innerHTML = `<div class="p-3 bg-gray-900 rounded border border-gray-800 text-center"><p class="text-xs text-gray-500">No sales data yet.</p></div>`;
                     return;
                }
                
                data.forEach((item, index) => {
                    const card = document.createElement('div');
                    // ANIMATION CLASSES: opacity-0 translate-y-12 scale-95
                    card.className = 'flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800 shadow-sm border-l-4 border-l-red-800 opacity-0 translate-y-12 scale-95 transition-all duration-500 ease-out';
                    
                    // Slightly shorter delay for sidebar items so they feel snappier on re-entry
                    card.style.transitionDelay = `${index * 50}ms`;

                    card.innerHTML = `
                        <div class="flex items-center space-x-3">
                            <span class="flex items-center justify-center w-6 h-6 bg-red-900 text-red-200 font-bold text-xs rounded-full">${index + 1}</span>
                            <span class="text-sm font-medium text-gray-300">${toTitleCase(item.name)}</span>
                        </div>
                        <span class="text-xs text-gray-600 font-mono">${item.orders} sold</span>
                    `;
                    bestsellersContainer.appendChild(card);
                    scrollObserver.observe(card);
                });
            })
            .catch(err => console.error("Best sellers error:", err));
    }

    loadBestSellers();

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

                    const section = document.createElement('div');
                    
                    const title = document.createElement('h2');
                    title.className = 'text-2xl md:text-3xl font-bold text-gray-100 mb-4 md:mb-6 font-serif border-l-4 border-red-600 pl-4 sticky top-0 bg-gray-950/95 backdrop-blur-md py-4 z-20 shadow-lg shadow-black/40 opacity-0 translate-y-12 transition-all duration-500 ease-out';
                    title.textContent = toTitleCase(categoryName);
                    section.appendChild(title);
                    scrollObserver.observe(title);

                    const grid = document.createElement('div');
                    grid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20';

                    products.forEach((prod, index) => {
                        const card = document.createElement('div');
                        
                        // Added 'overflow-hidden' so the image stays rounded
                        card.className = 'group relative bg-gray-900/85 backdrop-blur-md border border-white/5 rounded-xl flex flex-col justify-between h-full opacity-0 translate-y-12 scale-95 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-black/50 hover:border-red-500/30 overflow-hidden';
                        
                        // Staggered Delay Logic
                        const delayIndex = (index % (window.innerWidth < 768 ? 2 : 4)); 
                        card.style.transitionDelay = `${delayIndex * 100}ms`; 

                        // FALLBACK IMAGE URL
                        const fallbackImage = "https://placehold.co/600x400/111827/DC2626?text=Coming+Soon";

                        card.innerHTML = `
                            <!-- IMAGE SECTION -->
                            <div class="relative h-48 w-full overflow-hidden bg-gray-800">
                                <img src="${prod.image}" 
                                     alt="${prod.name}" 
                                     loading="lazy"
                                     onerror="this.onerror=null; this.src='${fallbackImage}';"
                                     class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                                
                                <!-- Dark Gradient at bottom of image -->
                                <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                                
                                <!-- THE RED LINE ANIMATION -->
                                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                            </div>

                            <!-- CONTENT SECTION -->
                            <div class="p-4 flex flex-col flex-1">
                                <div class="mb-4">
                                    <h3 class="text-gray-100 font-bold text-base md:text-lg leading-snug tracking-wide group-hover:text-red-400 transition-colors">
                                        ${toTitleCase(prod.name)}
                                    </h3>
                                </div>
                                <div class="mt-auto pt-3 flex items-center justify-between border-t border-white/10">
                                    <span class="text-[10px] text-gray-500 uppercase tracking-widest font-bold group-hover:text-gray-400 transition-colors">Regular</span>
                                    <span class="text-yellow-500 font-bold text-xl md:text-2xl font-serif tracking-wider drop-shadow-sm group-hover:text-yellow-400 transition-colors">
                                        ${formatPrice(prod.price)}
                                    </span>
                                </div>
                            </div>
                        `;
                        grid.appendChild(card);
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
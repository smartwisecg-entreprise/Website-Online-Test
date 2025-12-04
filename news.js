// Remplacez le fichier news.js par celui-ci
document.addEventListener('DOMContentLoaded', () => {
    // Ne s'exécute que si on est sur la page d'actualités
    if (!document.getElementById('news-grid')) {
        return;
    }

    const newsGrid = document.getElementById('news-grid');
    const filterContainer = document.querySelector('.filter-container');
    const searchInput = document.getElementById('search-input');
    let allArticles = [];
    let currentLang = localStorage.getItem('language') || 'fr';

    // --- FONCTION UTILE ---
    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    // --- Fonctions d'affichage ---
    const renderArticles = (articles) => {
        newsGrid.innerHTML = ''; // Vide la grille

        if (articles.length === 0) {
            // NOUVELLE LOGIQUE AMÉLIORÉE
            if (allArticles.length === 0) {
                // CAS 1 : Il n'y a AUCUNE actualité de publiée
                newsGrid.innerHTML = `
                    <div class="empty-state-container">
                        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18V7.125C4.5 6.504 5.004 6 5.625 6H9" />
                        </svg>
                        <h3 data-key="news_no_articles_title">Aucune actualité pour le moment</h3>
                        <p data-key="news_no_articles_subtitle">Revenez bientôt pour découvrir nos dernières annonces.</p>
                    </div>
                `;
            } else {
                // CAS 2 : La recherche ou le filtre n'a donné aucun résultat
                newsGrid.innerHTML = `<p class="search-no-results" data-key="news_no_results">Aucun article ne correspond à votre recherche.</p>`;
            }
            updateTextContent(); // Mettre à jour les textes traduits
            return;
        }

        articles.forEach((article, index) => {
            const card = document.createElement('div');
            card.className = 'news-card';

            const category = article[`category_${currentLang}`];
            const title = article[`title_${currentLang}`];
            const summary = article[`summary_${currentLang}`];
            const date = new Date(article.date).toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            
            const slug = slugify(article.title_fr);
            const articleUrl = `articles/${slug}.html`;

            card.innerHTML = `
                <a href="${articleUrl}" class="card-link">
                    <div class="card-image-container">
                        <img src="${article.image}" alt="${title}">
                    </div>
                    <div class="card-content">
                        <span class="card-category">${category}</span>
                        <h3 class="card-title">${title}</h3>
                        <p class="card-date">${date}</p>
                        <p class="card-summary">${summary}</p>
                    </div>
                </a>
            `;
            newsGrid.appendChild(card);

            setTimeout(() => {
                card.classList.add('visible');
            }, 100 * index);
        });
    };

    const populateFilters = (articles) => {
        const categories = [...new Set(articles.map(article => article[`category_${currentLang}`]))];
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.category = category;
            button.textContent = category;
            filterContainer.appendChild(button);
        });
    };

    // --- Récupération des données et initialisation ---
    const fetchNews = async () => {
        try {
            // Simulation d'un fichier vide pour tester : remplacez 'news.json' par 'empty-news.json'
            const response = await fetch('news.json'); 
            if (!response.ok) throw new Error('Network response was not ok');
            
            // Gestion d'un fichier JSON potentiellement vide qui retournerait null
            const data = await response.json();
            allArticles = data || [];
            
            allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Si le tableau est vide, les filtres ne seront pas peuplés, ce qui est correct.
            if (allArticles.length > 0) {
                populateFilters(allArticles);
            }
            renderArticles(allArticles);

        } catch (error) {
            console.error('Failed to fetch news:', error);
            newsGrid.innerHTML = `<p data-key="news_fetch_error">Erreur lors du chargement des actualités.</p>`;
            updateTextContent();
        }
    };
    
    fetchNews();

    // --- Gestion des événements (Filtres et Recherche) ---
    filterContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const category = e.target.dataset.category;
            const activeButton = document.querySelector('.filter-btn.active');
            if (activeButton) {
                activeButton.classList.remove('active');
            }
            e.target.classList.add('active');

            let filteredArticles;
            if (category === 'all') {
                filteredArticles = allArticles;
            } else {
                filteredArticles = allArticles.filter(article => article[`category_${currentLang}`] === category);
            }
            renderArticles(filteredArticles);
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        // Si la recherche est vide, on réaffiche les articles filtrés par catégorie (ou tous)
        const activeCategoryButton = document.querySelector('.filter-btn.active') || { dataset: { category: 'all' }};
        const currentCategory = activeCategoryButton.dataset.category;
        
        let articlesToSearch = allArticles;
        if (currentCategory !== 'all') {
            articlesToSearch = allArticles.filter(article => article[`category_${currentLang}`] === currentCategory);
        }

        const filteredArticles = articlesToSearch.filter(article => 
            article[`title_${currentLang}`].toLowerCase().includes(searchTerm) ||
            article[`summary_${currentLang}`].toLowerCase().includes(searchTerm)
        );
        renderArticles(filteredArticles);
    });
    
    // --- Gestion du changement de langue ---
    const langSwitcher = document.querySelector('.lang-switcher');
    if(langSwitcher) {
        langSwitcher.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.closest('a')?.getAttribute('lang');
            if (lang && lang !== currentLang) {
                currentLang = lang;
                localStorage.setItem('language', lang);
                filterContainer.innerHTML = `<button class="filter-btn active" data-category="all" data-key="news_filter_all">Tous</button>`;
                populateFilters(allArticles);
                renderArticles(allArticles);
                updateTextContent(); 
            }
        });
    }

    // Fonction pour mettre à jour les textes statiques
    const updateTextContent = () => {
        const lang = localStorage.getItem('language') || 'fr';
        if (typeof translations === 'undefined') return; 

        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.dataset.key;
            if (translations[lang] && translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const placeholderKey = searchInput.getAttribute('data-key-placeholder');
            if (placeholderKey && translations[lang] && translations[lang][placeholderKey]) {
                searchInput.placeholder = translations[lang][placeholderKey];
            }
        }
    };
});
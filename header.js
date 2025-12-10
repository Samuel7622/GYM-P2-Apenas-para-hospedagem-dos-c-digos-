// menu.js - Funcionalidades principais do header
document.addEventListener('DOMContentLoaded', function() {
    // ========== VARIÁVEIS GLOBAIS ==========
    const menuTrigger = document.getElementById('menuTrigger');
    const slideMenu = document.getElementById('slideMenu');
    const menuCloseBtn = document.getElementById('menuCloseBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    const searchToggle = document.getElementById('searchToggle');
    const searchField = document.getElementById('searchField');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const menuSearchBtn = document.getElementById('menuSearchBtn');
    
    // Dados de exemplo para pesquisa
    const searchData = [
        { category: 'Academia', title: 'Smart Strong', description: 'R. Ângelo Gonçalves, n°137 - Pedro II', link: '#' },
        { category: 'Academia', title: 'Rede-Fit P2', description: 'R. Cel. Cordeiro, 739 - Pedro II', link: 'Redefit.html' },
        { category: 'Academia', title: 'Olympic Fit', description: 'Av. Dr. José Lourenço Mourão, 865A - Pedro II', link: '#' },
        { category: 'Personal', title: 'Personal Trainers', description: 'Encontre profissionais qualificados', link: 'personais.html' },
        { category: 'Blog', title: 'Dicas de Treino', description: 'Ganhe massa muscular rápido e com saúde', link: '#blog' },
        { category: 'Sorteio', title: 'Sorteios Mensais', description: 'Participe de nossos sorteios exclusivos', link: '#news' }
    ];
    
    // ========== MENU HAMBURGUER ==========
    function toggleMenu() {
        const isMenuOpen = slideMenu.classList.contains('open');
        
        if (!isMenuOpen) {
            slideMenu.classList.add('open');
            menuOverlay.classList.add('visible');
            menuTrigger.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            slideMenu.classList.remove('open');
            menuOverlay.classList.remove('visible');
            menuTrigger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Event listeners para menu
    if (menuTrigger) {
        menuTrigger.addEventListener('click', toggleMenu);
    }
    
    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', toggleMenu);
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', toggleMenu);
    }
    
    // Fechar menu ao clicar em links
    const menuLinks = document.querySelectorAll('.nav-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
    
    // ========== BARRA DE PESQUISA ==========
    function toggleSearch() {
        const isExpanded = searchField.classList.contains('expanded');
        
        if (!isExpanded) {
            searchField.classList.add('expanded');
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        } else {
            searchField.classList.remove('expanded');
            searchResults.classList.remove('active');
            searchInput.value = '';
        }
    }
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchResults.classList.remove('active');
            return;
        }
        
        // Filtrar resultados
        const filteredResults = searchData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
        
        // Atualizar resultados
        if (filteredResults.length > 0) {
            searchResults.innerHTML = filteredResults.map(item => `
                <div class="search-result-item" onclick="window.location.href='${item.link}'">
                    <div class="result-category">${item.category}</div>
                    <div class="result-title">${item.title}</div>
                    <div class="result-description">${item.description}</div>
                </div>
            `).join('');
            searchResults.classList.add('active');
        } else {
            searchResults.innerHTML = `
                <div class="search-result-item">
                    <div class="result-title">Nenhum resultado encontrado</div>
                    <div class="result-description">Tente buscar por "academia", "personal" ou "blog"</div>
                </div>
            `;
            searchResults.classList.add('active');
        }
    }
    
    // Event listeners para pesquisa
    if (searchToggle) {
        searchToggle.addEventListener('click', toggleSearch);
    }
    
    if (searchInput) {
        // Buscar ao digitar
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 300);
        });
        
        // Fechar resultados ao pressionar ESC
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchField.classList.remove('expanded');
                searchResults.classList.remove('active');
            }
        });
    }
    
    // Fechar resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchToggle.contains(e.target) && !searchField.contains(e.target) && !searchResults.contains(e.target)) {
            if (window.innerWidth > 768) {
                searchResults.classList.remove('active');
            }
        }
    });
    
    // Botão de busca no menu
    if (menuSearchBtn) {
        menuSearchBtn.addEventListener('click', () => {
            window.location.href = 'academias-filtro-sem-logar.html';
        });
    }
    
    // ========== FUNÇÕES DE USUÁRIO LOGADO ==========
    function updateHeaderForLoggedUser(user) {
        console.log('Atualizando header para usuário:', user);
        
        // Substituir botão Login por componente de usuário
        const loginButtons = document.querySelectorAll('.gym-access-btn');
        loginButtons.forEach(btn => {
            if (btn.textContent.includes('Login')) {
                const initials = getInitials(user.name);
                const firstName = user.name.split(' ')[0];
                
                // Criar componente de usuário
                const userComponent = `
                    <div class="user-header-container" id="userHeaderContainer" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        background: rgba(0, 255, 136, 0.1);
                        border: 2px solid rgba(0, 255, 136, 0.3);
                        border-radius: 30px;
                        padding: 6px 16px 6px 6px;
                        transition: all 0.3s ease;
                        cursor: pointer;
                        position: relative;
                    ">
                        <div class="user-avatar" style="
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 700;
                            font-size: 16px;
                            color: #000;
                            border: 2px solid #fff;
                        ">${initials}</div>
                        
                        <span class="user-name-text" style="
                            font-size: 14px;
                            font-weight: 600;
                            color: #fff;
                        ">${firstName}</span>
                        
                        <div class="user-dropdown-menu" id="userDropdownMenu" style="
                            position: absolute;
                            top: calc(100% + 10px);
                            right: 0;
                            background: #1a1a1a;
                            border: 2px solid rgba(0, 255, 136, 0.3);
                            border-radius: 16px;
                            padding: 12px;
                            min-width: 220px;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
                            opacity: 0;
                            visibility: hidden;
                            transform: translateY(-10px);
                            transition: all 0.3s ease;
                            z-index: 3000;
                        ">
                            <div style="padding: 12px; border-bottom: 1px solid rgba(0, 255, 136, 0.2); margin-bottom: 8px;">
                                <div style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px;">${user.name}</div>
                                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${user.email || 'usuario@gymp2.com'}</div>
                            </div>
                            
                            <a href="#perfil" style="
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                padding: 12px;
                                border-radius: 10px;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                color: #fff;
                                text-decoration: none;
                                margin-bottom: 4px;
                            ">
                                <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                </svg>
                                Meu Perfil
                            </a>
                            
                            <div id="logoutBtn" style="
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                padding: 12px;
                                border-radius: 10px;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                color: #ff4444;
                                border-top: 1px solid rgba(255, 68, 68, 0.2);
                                margin-top: 8px;
                            ">
                                <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                                </svg>
                                Sair
                            </div>
                        </div>
                    </div>
                `;
                
                btn.outerHTML = userComponent;
                
                // Configurar eventos do dropdown
                setTimeout(setupUserDropdownEvents, 100);
            }
        });
    }
    
    function getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }
    
    function setupUserDropdownEvents() {
        const userContainer = document.getElementById('userHeaderContainer');
        const dropdownMenu = document.getElementById('userDropdownMenu');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (!userContainer || !dropdownMenu || !logoutBtn) return;
        
        // Toggle dropdown
        userContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = dropdownMenu.style.opacity === '1';
            
            if (isVisible) {
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.visibility = 'hidden';
                dropdownMenu.style.transform = 'translateY(-10px)';
            } else {
                dropdownMenu.style.opacity = '1';
                dropdownMenu.style.visibility = 'visible';
                dropdownMenu.style.transform = 'translateY(0)';
            }
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', () => {
            dropdownMenu.style.opacity = '0';
            dropdownMenu.style.visibility = 'hidden';
            dropdownMenu.style.transform = 'translateY(-10px)';
        });
        
        // Logout
        logoutBtn.addEventListener('click', () => {
            if (confirm('Deseja realmente sair da sua conta?')) {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('gymp2_current_user');
                alert('Logout realizado com sucesso!');
                window.location.reload();
            }
        });
        
        // Efeitos de hover
        userContainer.addEventListener('mouseenter', () => {
            userContainer.style.background = 'rgba(0, 255, 136, 0.2)';
            userContainer.style.borderColor = 'rgba(0, 255, 136, 0.5)';
            userContainer.style.transform = 'translateY(-2px)';
            userContainer.style.boxShadow = '0 4px 15px rgba(0, 255, 136, 0.3)';
        });
        
        userContainer.addEventListener('mouseleave', () => {
            userContainer.style.background = 'rgba(0, 255, 136, 0.1)';
            userContainer.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            userContainer.style.transform = 'translateY(0)';
            userContainer.style.boxShadow = 'none';
        });
    }
    
    // ========== VERIFICAR STATUS DE LOGIN AO CARREGAR ==========
    function checkLoginStatus() {
        const userData = localStorage.getItem('currentUser') || 
                        localStorage.getItem('gymp2_current_user');
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                updateHeaderForLoggedUser(user);
                updateMenuForLoggedUser(user);
            } catch (error) {
                console.error('Erro ao processar dados do usuário:', error);
            }
        }
    }
    
    // ========== ATUALIZAR MENU HAMBURGUER ==========
    function updateMenuForLoggedUser(user) {
        const navigationList = document.querySelector('.navigation-list');
        if (!navigationList) return;
        
        // Encontrar item de Login
        const navItems = navigationList.querySelectorAll('.nav-item');
        let loginItem = null;
        
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link && link.textContent.trim() === 'Login') {
                loginItem = item;
            }
        });
        
        if (loginItem) {
            const firstName = user.name.split(' ')[0];
            
            // Substituir Login por Perfil
            loginItem.innerHTML = `
                <a href="#perfil" class="nav-link" style="color: #00ff88; font-weight: 700; background: rgba(0, 255, 136, 0.1); border-radius: 8px; margin: 5px 0; padding: 12px 15px !important;">
                    <i class="fas fa-user" style="margin-right: 10px;"></i>
                    Meu Perfil (${firstName})
                </a>
            `;
            
            // Adicionar item Sair
            const logoutItem = document.createElement('li');
            logoutItem.className = 'nav-item';
            logoutItem.innerHTML = `
                <a href="#logout" class="nav-link" style="color: #ff4444; background: rgba(255, 68, 68, 0.1); border-radius: 8px; margin: 5px 0; padding: 12px 15px !important;" id="menuLogoutBtn">
                    <i class="fas fa-sign-out-alt" style="margin-right: 10px;"></i>
                    Sair
                </a>
            `;
            
            navigationList.appendChild(logoutItem);
            
            // Evento de logout no menu
            const menuLogoutBtn = document.getElementById('menuLogoutBtn');
            if (menuLogoutBtn) {
                menuLogoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Deseja realmente sair da sua conta?')) {
                        localStorage.removeItem('currentUser');
                        localStorage.removeItem('gymp2_current_user');
                        window.location.reload();
                    }
                });
            }
        }
    }
    
    // ========== INICIALIZAÇÃO ==========
    checkLoginStatus();
    
    // Observar mudanças no localStorage
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser' || e.key === 'gymp2_current_user') {
            window.location.reload();
        }
    });
    
    // ========== DEBUG ==========
    console.log('✅ Header inicializado com sucesso!');
});

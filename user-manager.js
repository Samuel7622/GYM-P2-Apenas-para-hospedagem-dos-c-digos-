// user-manager.js - Sistema completo de gerenciamento de usuários
class UserManager {
    constructor() {
        this.usersKey = 'gymp2_users';
        this.currentUserKey = 'gymp2_current_user';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.usersKey)) {
            const initialUsers = {
                'admin@gymp2.com': {
                    name: 'Administrador',
                    email: 'admin@gymp2.com',
                    password: '123456',
                    joined: new Date().toISOString(),
                    role: 'admin'
                },
                'usuario@gymp2.com': {
                    name: 'João Silva',
                    email: 'usuario@gymp2.com',
                    password: '123456',
                    joined: new Date().toISOString(),
                    role: 'user'
                }
            };
            localStorage.setItem(this.usersKey, JSON.stringify(initialUsers));
        }
    }

    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || {};
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    getUser(email) {
        const users = this.getUsers();
        return users[email] || null;
    }

    createUser(userData) {
        const users = this.getUsers();

        if (users[userData.email]) {
            return { success: false, message: 'Email já cadastrado' };
        }

        users[userData.email] = {
            ...userData,
            joined: new Date().toISOString(),
            role: 'user'
        };

        this.saveUsers(users);
        return { success: true, message: 'Conta criada com sucesso!' };
    }

    login(email, password) {
        const user = this.getUser(email);

        if (!user) {
            return { success: false, message: 'Email não encontrado' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Senha incorreta' };
        }

        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
        return { success: true, message: 'Login realizado com sucesso!', user };
    }

    logout() {
        localStorage.removeItem(this.currentUserKey);
    }

    getCurrentUser() {
        const userData = localStorage.getItem(this.currentUserKey);
        return userData ? JSON.parse(userData) : null;
    }

    updateUserProfile(updatedData) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return { success: false, message: 'Nenhum usuário logado' };

        const users = this.getUsers();
        if (users[currentUser.email]) {
            users[currentUser.email] = { ...users[currentUser.email], ...updatedData };
            this.saveUsers(users);
            
            // Atualizar usuário atual também
            const updatedUser = { ...currentUser, ...updatedData };
            localStorage.setItem(this.currentUserKey, JSON.stringify(updatedUser));
            
            return { success: true, message: 'Perfil atualizado!', user: updatedUser };
        }
        
        return { success: false, message: 'Erro ao atualizar perfil' };
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    requireAuth(redirectUrl = 'login-gym.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}

// Tornar global para acesso em todas as páginas
window.userManager = new UserManager();

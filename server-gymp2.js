// server-gymp2.js - VERSÃO SEGURA E MELHORADA
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const DATA_FILE = 'usuarios.json';
const SESSION_FILE = 'sessoes.json';

// Utilitário para hash de senhas
function hashPassword(password, salt = null) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt };
}

function verifyPassword(password, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

// Gera token de sessão seguro
function gerarToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Cria estrutura inicial dos arquivos
async function inicializarArquivos() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        const estruturaInicial = {
            sistema: "Gymp2 - Sistema Seguro",
            versao: "2.0",
            criado_em: new Date().toISOString(),
            total_usuarios: 0,
            usuarios: {},
            logs: []
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(estruturaInicial, null, 2));
        console.log('✅ Arquivo de dados criado');
    }

    try {
        await fs.access(SESSION_FILE);
    } catch {
        await fs.writeFile(SESSION_FILE, JSON.stringify({ sessoes: {} }, null, 2));
        console.log('✅ Arquivo de sessões criado');
    }
}

// Lê dados do arquivo
async function lerDados() {
    const conteudo = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(conteudo);
}

// Salva dados no arquivo
async function salvarDados(dados) {
    await fs.writeFile(DATA_FILE, JSON.stringify(dados, null, 2));
}

// Gerencia sessões
async function lerSessoes() {
    const conteudo = await fs.readFile(SESSION_FILE, 'utf8');
    return JSON.parse(conteudo);
}

async function salvarSessoes(sessoes) {
    await fs.writeFile(SESSION_FILE, JSON.stringify(sessoes, null, 2));
}

// Limpa sessões expiradas (> 24h)
async function limparSessoesExpiradas() {
    const sessoes = await lerSessoes();
    const agora = Date.now();
    const EXPIRACAO = 24 * 60 * 60 * 1000; // 24 horas

    Object.keys(sessoes.sessoes).forEach(token => {
        const sessao = sessoes.sessoes[token];
        if (agora - sessao.criado_em > EXPIRACAO) {
            delete sessoes.sessoes[token];
        }
    });

    await salvarSessoes(sessoes);
}

// Registra log de atividade
async function registrarLog(tipo, dados) {
    const db = await lerDados();
    
    const log = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        tipo: tipo,
        dados: dados,
        ip: dados.ip || 'localhost'
    };

    db.logs.push(log);
    
    // Mantém apenas os últimos 1000 logs
    if (db.logs.length > 1000) {
        db.logs = db.logs.slice(-1000);
    }

    await salvarDados(db);
}

// Handlers das rotas
async function handleCadastro(body) {
    const { name, email, password } = body;

    // Validações
    if (!name || !email || !password) {
        return { success: false, message: 'Todos os campos são obrigatórios' };
    }

    if (password.length < 6) {
        return { success: false, message: 'Senha deve ter no mínimo 6 caracteres' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: 'Email inválido' };
    }

    const db = await lerDados();

    // Verifica se email já existe
    if (db.usuarios[email]) {
        await registrarLog('cadastro_falha', { email, motivo: 'email_existente' });
        return { success: false, message: 'Email já cadastrado' };
    }

    // Cria hash da senha
    const { hash, salt } = hashPassword(password);

    // Salva usuário
    db.usuarios[email] = {
        name,
        email,
        passwordHash: hash,
        passwordSalt: salt,
        role: 'user',
        criado_em: new Date().toISOString(),
        ultimo_login: null
    };

    db.total_usuarios = Object.keys(db.usuarios).length;
    await salvarDados(db);

    await registrarLog('cadastro_sucesso', { email, name });

    return { 
        success: true, 
        message: 'Conta criada com sucesso!',
        user: { name, email, role: 'user' }
    };
}

async function handleLogin(body) {
    const { email, password } = body;

    if (!email || !password) {
        return { success: false, message: 'Email e senha são obrigatórios' };
    }

    const db = await lerDados();
    const usuario = db.usuarios[email];

    if (!usuario) {
        await registrarLog('login_falha', { email, motivo: 'email_nao_encontrado' });
        return { success: false, message: 'Email não encontrado' };
    }

    // Verifica senha
    const senhaCorreta = verifyPassword(password, usuario.passwordHash, usuario.passwordSalt);

    if (!senhaCorreta) {
        await registrarLog('login_falha', { email, motivo: 'senha_incorreta' });
        return { success: false, message: 'Senha incorreta' };
    }

    // Atualiza último login
    usuario.ultimo_login = new Date().toISOString();
    await salvarDados(db);

    // Cria sessão
    const token = gerarToken();
    const sessoes = await lerSessoes();
    
    sessoes.sessoes[token] = {
        email,
        criado_em: Date.now(),
        ip: 'localhost'
    };

    await salvarSessoes(sessoes);
    await registrarLog('login_sucesso', { email, name: usuario.name });

    return {
        success: true,
        message: 'Login realizado com sucesso!',
        token,
        user: {
            name: usuario.name,
            email: usuario.email,
            role: usuario.role
        }
    };
}

async function handleVerificarSessao(token) {
    await limparSessoesExpiradas();
    
    const sessoes = await lerSessoes();
    const sessao = sessoes.sessoes[token];

    if (!sessao) {
        return { success: false, message: 'Sessão inválida' };
    }

    const db = await lerDados();
    const usuario = db.usuarios[sessao.email];

    if (!usuario) {
        return { success: false, message: 'Usuário não encontrado' };
    }

    return {
        success: true,
        user: {
            name: usuario.name,
            email: usuario.email,
            role: usuario.role
        }
    };
}

async function handleLogout(token) {
    const sessoes = await lerSessoes();
    
    if (sessoes.sessoes[token]) {
        const email = sessoes.sessoes[token].email;
        delete sessoes.sessoes[token];
        await salvarSessoes(sessoes);
        await registrarLog('logout', { email });
        return { success: true, message: 'Logout realizado' };
    }

    return { success: false, message: 'Sessão não encontrada' };
}

async function handleStats() {
    const db = await lerDados();
    const sessoes = await lerSessoes();

    const loginsHoje = db.logs.filter(log => {
        const hoje = new Date().toDateString();
        const logDate = new Date(log.timestamp).toDateString();
        return log.tipo === 'login_sucesso' && logDate === hoje;
    }).length;

    return {
        total_usuarios: db.total_usuarios,
        sessoes_ativas: Object.keys(sessoes.sessoes).length,
        logins_hoje: loginsHoje,
        total_logs: db.logs.length
    };
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        let body = '';
        req.on('data', chunk => body += chunk.toString());

        req.on('end', async () => {
            const parsedBody = body ? JSON.parse(body) : {};

            let resultado;

            // Rotas
            if (req.method === 'POST' && req.url === '/cadastro') {
                resultado = await handleCadastro(parsedBody);
            } 
            else if (req.method === 'POST' && req.url === '/login') {
                resultado = await handleLogin(parsedBody);
            }
            else if (req.method === 'POST' && req.url === '/verificar-sessao') {
                resultado = await handleVerificarSessao(parsedBody.token);
            }
            else if (req.method === 'POST' && req.url === '/logout') {
                resultado = await handleLogout(parsedBody.token);
            }
            else if (req.method === 'GET' && req.url === '/stats') {
                resultado = await handleStats();
            }
            else if (req.method === 'GET' && req.url === '/status') {
                resultado = { 
                    status: 'online',
                    timestamp: new Date().toISOString()
                };
            }
            else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Rota não encontrada' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resultado));
        });

    } catch (error) {
        console.error('❌ Erro:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: false, 
            message: 'Erro interno do servidor',
            error: error.message 
        }));
    }
});

// Inicialização
async function iniciarServidor() {
    await inicializarArquivos();
    
    server.listen(PORT, () => {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 SERVIDOR GYMP2 V2.0 - SEGURO E OTIMIZADO');
        console.log('='.repeat(60));
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`🔒 Senhas: Criptografadas com PBKDF2 + SHA512`);
        console.log(`📁 Dados: ${path.resolve(DATA_FILE)}`);
        console.log(`🎫 Sessões: ${path.resolve(SESSION_FILE)}`);
        console.log('='.repeat(60));
        console.log('\n✅ Rotas disponíveis:');
        console.log('   POST /cadastro');
        console.log('   POST /login');
        console.log('   POST /verificar-sessao');
        console.log('   POST /logout');
        console.log('   GET  /stats');
        console.log('   GET  /status');
        console.log('\n💡 Pressione Ctrl+C para parar\n');
    });
}

iniciarServidor();

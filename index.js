const express = require('express');
const { createClient } = require('@supabase/supabase-js');
// const MessagingResponse = require('twilio').twiml.MessagingResponse; // COMENTADO: Twilio

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Adicionar suporte para JSON

// CORS para permitir requisições do frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Adicionar middleware de log para debug
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST') {
        console.log('Body recebido:', req.body);
    }
    next();
});

// Substitua com as suas chaves do Supabase
const supabaseUrl = 'https://gaptsfozqyybssxxmedj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcHRzZm96cXl5YnNzeHhtZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzA2ODIsImV4cCI6MjA3MjQwNjY4Mn0.0iun-arhyO0Ntxm4xj7GASFdlbvJcLdEWS9aTyeM5jw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Rota de health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        timestamp: new Date().toISOString(),
        message: 'API Financeiro funcionando!'
    });
});

// NOVA ROTA: Adicionar transação via API
app.post('/api/transacoes', async (req, res) => {
    try {
        const { valor, categoria, tipo, descricao, user_id } = req.body;

        // Validações básicas
        if (!valor || !categoria || !tipo || !user_id) {
            return res.status(400).json({
                error: 'Campos obrigatórios: valor, categoria, tipo, user_id'
            });
        }

        if (tipo !== 'receita' && tipo !== 'despesa') {
            return res.status(400).json({
                error: 'Tipo deve ser "receita" ou "despesa"'
            });
        }

        if (valor <= 0) {
            return res.status(400).json({
                error: 'Valor deve ser maior que zero'
            });
        }

        // Inserir no Supabase
        const { data, error } = await supabase
            .from('transacoes')
            .insert([{
                valor: parseFloat(valor),
                categoria: categoria.trim(),
                tipo,
                descricao: descricao || `${tipo} - ${categoria}`,
                user_id,
                data: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Erro ao inserir transação:', error);
            return res.status(500).json({
                error: 'Erro ao registrar transação',
                details: error.message
            });
        }

        console.log('✅ Transação registrada via API:', data[0]);
        res.status(201).json({
            success: true,
            message: 'Transação registrada com sucesso!',
            data: data[0]
        });

    } catch (err) {
        console.error('❌ Erro geral na API:', err);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
});

// NOVA ROTA: Listar transações via API
app.get('/api/transacoes/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limite = 50 } = req.query;

        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user_id', userId)
            .order('data', { ascending: false })
            .limit(parseInt(limite));

        if (error) {
            console.error('Erro ao buscar transações:', error);
            return res.status(500).json({
                error: 'Erro ao buscar transações',
                details: error.message
            });
        }

        res.json({
            success: true,
            data: data || [],
            total: data?.length || 0
        });

    } catch (err) {
        console.error('❌ Erro ao listar transações:', err);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
});

// NOVA ROTA: Deletar transação via API
app.delete('/api/transacoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                error: 'user_id é obrigatório'
            });
        }

        const { error } = await supabase
            .from('transacoes')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) {
            console.error('Erro ao deletar transação:', error);
            return res.status(500).json({
                error: 'Erro ao deletar transação',
                details: error.message
            });
        }

        res.json({
            success: true,
            message: 'Transação deletada com sucesso!'
        });

    } catch (err) {
        console.error('❌ Erro ao deletar transação:', err);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
});

/* 
==============================================
CÓDIGO TWILIO COMENTADO TEMPORARIAMENTE
==============================================

// Função normalizar texto (remove acentos e converte para minúsculo)
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// Função extrair dados mais flexível com mais categorias
function extrairDados(texto) {
    const textoNormal = normalizarTexto(texto);
    
    const palavrasReceita = [
        'receita', 'ganhei', 'ganho', 'recebi', 'recebo', 'salario', 'salário', 
        'freelance', 'freela', 'trabalho', 'pagamento', 'pago', 'renda', 
        'bonus', 'comissao', 'venda', 'vendi', 'rendimento', 'extra'
    ];
    
    // Categorias de despesas reconhecidas
    const categoriasDespesa = [
        'mercado', 'supermercado', 'gasolina', 'combustivel', 'posto',
        'loja', 'salao', 'farmacia', 'drogaria', 'aluguel', 'rent',
        'restaurante', 'lanche', 'comida', 'food', 'uber', 'taxi',
        'conta', 'luz', 'agua', 'internet', 'celular', 'telefone',
        'medico', 'hospital', 'dentista', 'roupas', 'vestuario',
        'casa', 'decoracao', 'moveis', 'eletronicos', 'games',
        'cinema', 'entretenimento', 'curso', 'educacao', 'livro',
        'transporte', 'onibus', 'metro', 'estacionamento', 'pedagio', 'jantinha'
    ];
    
    const ehReceita = palavrasReceita.some(palavra => textoNormal.includes(palavra));
    
    const numeroMatch = textoNormal.match(/(\d+(?:[.,]\d+)?)/);
    if (!numeroMatch) return null;
    
    const valor = parseFloat(numeroMatch[1].replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return null;
    
    // Extrair categoria mais inteligente
    let categoria = textoNormal
        .replace(/\d+(?:[.,]\d+)?/g, '')
        .replace(new RegExp(palavrasReceita.join('|'), 'g'), '')
        .trim();
    
    // Tentar identificar categoria específica para despesas
    if (!ehReceita) {
        const categoriaEncontrada = categoriasDespesa.find(cat => textoNormal.includes(cat));
        if (categoriaEncontrada) {
            categoria = categoriaEncontrada;
        }
    }
    
    if (!categoria || categoria.length < 2) {
        categoria = ehReceita ? 'receita' : 'despesa';
    }
    
    categoria = categoria.replace(/\s+/g, ' ').trim();
    
    return {
        tipo: ehReceita ? 'receita' : 'despesa',
        valor: valor,
        categoria: categoria,
        descricao: texto.trim()
    };
}

// Função para listar transações recentes com IDs
async function listarTransacoesRecentes(userId, limite = 5) {
    try {
        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user_id', userId)
            .order('data', { ascending: false })
            .limit(limite);

        if (error) {
            console.error('Erro ao buscar transações:', error);
            return 'Erro ao buscar transações.';
        }

        if (!data || data.length === 0) {
            return 'Nenhuma transação encontrada.';
        }

        let lista = `📋 *Últimas ${data.length} transações:*\n\n`;
        data.forEach((t, index) => {
            const emoji = t.tipo === 'receita' ? '💚' : '💸';
            const sinal = t.tipo === 'receita' ? '+' : '-';
            const dataFormatada = new Date(t.data).toLocaleDateString('pt-BR');
            lista += `${index + 1}. ${emoji} ${t.categoria}: ${sinal}R$ ${t.valor.toFixed(2)}\n`;
            lista += `   📅 ${dataFormatada} | ID: ${t.id.substring(0, 8)}\n\n`;
        });
        
        lista += '💡 Para apagar: "apagar 1" ou "apagar último"';
        return lista;
    } catch (err) {
        console.error('Erro na função listarTransacoesRecentes:', err);
        return 'Erro interno ao listar transações.';
    }
}

// Rota para receber mensagens do Twilio - COMENTADA
app.post('/whatsapp', async (req, res) => {
    console.log('🚀 Mensagem recebida no WhatsApp - FUNCIONALIDADE COMENTADA');
    
    // Criar twiml no início para estar disponível em todo escopo
    // const twiml = new MessagingResponse();
    
    // Configurar timeout de resposta
    res.setTimeout(10000); // 10 segundos max

    try {
        res.status(503).json({
            message: 'WhatsApp funcionalidade temporariamente desabilitada',
            status: 'disabled'
        });
    } catch (responseError) {
        console.error('❌ Erro ao enviar resposta:', responseError);
        res.status(500).end();
    }
});

FIM DO CÓDIGO TWILIO COMENTADO
==============================================
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/`);
    console.log(`📱 API Transações: http://localhost:${PORT}/api/transacoes`);
    console.log(`⚠️  WhatsApp funcionalidade temporariamente desabilitada`);
});
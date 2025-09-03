const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
app.use(express.urlencoded({ extended: false }));

// Substitua com as suas chaves do Supabase
const supabaseUrl = 'https://gaptsfozqyybssxxmedj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcHRzZm96cXl5YnNzeHhtZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzA2ODIsImV4cCI6MjA3MjQwNjY4Mn0.0iun-arhyO0Ntxm4xj7GASFdlbvJcLdEWS9aTyeM5jw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        'transporte', 'onibus', 'metro', 'estacionamento', 'pedagio'
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
    const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(limite);

    if (error || !data || data.length === 0) {
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
}

// Rota para receber mensagens do Twilio
app.post('/whatsapp', async (req, res) => {
    const mensagem = req.body.Body;
    const from = req.body.From;
    // Extrair userId do número do WhatsApp de forma mais robusta
    const userId = from.replace('whatsapp:', '').replace('+', '');
    const mensagemNormal = normalizarTexto(mensagem);
    const twiml = new MessagingResponse();

    try {
        // Comando para listar transações
        if (mensagemNormal.includes('listar') || mensagemNormal.includes('lista') || mensagemNormal.includes('historico')) {
            const lista = await listarTransacoesRecentes(userId, 10);
            twiml.message(lista);
        }
        
        // Comando para apagar transação específica ou última
        else if (mensagemNormal.includes('apagar') || mensagemNormal.includes('deletar')) {
            // Buscar últimas transações para referência
            const { data: transacoes, error } = await supabase
                .from('transacoes')
                .select('*')
                .eq('user_id', userId)
                .order('data', { ascending: false })
                .limit(10);

            if (error || !transacoes || transacoes.length === 0) {
                twiml.message('❌ Nenhuma transação encontrada para apagar.');
            } else {
                // Verificar se é para apagar por número (apagar 1, apagar 2, etc.)
                const numeroMatch = mensagemNormal.match(/apagar\s+(\d+)/);
                
                if (numeroMatch) {
                    const indice = parseInt(numeroMatch[1]) - 1;
                    if (indice >= 0 && indice < transacoes.length) {
                        const transacao = transacoes[indice];
                        await supabase.from('transacoes').delete().eq('id', transacao.id).eq('user_id', userId);
                        const emoji = transacao.tipo === 'receita' ? '💚' : '💸';
                        twiml.message(`✅ Transação ${indice + 1} apagada:\n${emoji} ${transacao.categoria}: R$ ${transacao.valor.toFixed(2)} (${transacao.tipo})`);
                    } else {
                        twiml.message('❌ Número inválido. Digite "listar" para ver as transações numeradas.');
                    }
                }
                // Apagar última transação
                else if (mensagemNormal.includes('ultimo') || mensagemNormal.includes('última')) {
                    const transacao = transacoes[0];
                    await supabase.from('transacoes').delete().eq('id', transacao.id).eq('user_id', userId);
                    const emoji = transacao.tipo === 'receita' ? '💚' : '💸';
                    twiml.message(`✅ Última transação apagada:\n${emoji} ${transacao.categoria}: R$ ${transacao.valor.toFixed(2)} (${transacao.tipo})`);
                }
                // Apagar por ID parcial
                else {
                    const idParcial = mensagem.match(/([a-f0-9]{6,})/i);
                    if (idParcial) {
                        const transacao = transacoes.find(t => t.id.startsWith(idParcial[1]));
                        if (transacao) {
                            await supabase.from('transacoes').delete().eq('id', transacao.id).eq('user_id', userId);
                            const emoji = transacao.tipo === 'receita' ? '💚' : '💸';
                            twiml.message(`✅ Transação apagada:\n${emoji} ${transacao.categoria}: R$ ${transacao.valor.toFixed(2)} (${transacao.tipo})`);
                        } else {
                            twiml.message('❌ ID não encontrado. Digite "listar" para ver os IDs.');
                        }
                    } else {
                        twiml.message('❌ Especifique qual apagar: "apagar 1", "apagar último" ou "listar" para ver opções.');
                    }
                }
            }
        }
        
        else if (mensagemNormal.includes('ajuda') || mensagemNormal.includes('help')) {
            const mensagemAjuda = `🤖 *Assistente Financeiro*

📝 *Registrar:*
• "50 mercado" 
• "100 gasolina"
• "30 farmácia"
• "80 loja"
• "ganhei 500 freelance"
• "salário 3000"

📋 *Gerenciar:*
• "listar" - ver últimas transações
• "apagar 1" - apagar transação 1
• "apagar último" - apagar última

📊 *Ver relatórios:*
• "relatório" / "saldo"
• "hoje" / "semana" / "mês"

🌐 *Dashboard:*
• "dashboard" - link do painel

💡 Categorias reconhecidas: mercado, gasolina, loja, salão, farmácia, aluguel, restaurante, uber, conta, médico, roupas e muito mais!`;
            twiml.message(mensagemAjuda);
        }
        
        else if (mensagemNormal.includes('dashboard')) {
            const dashboardUrl = `https://dashboard-financeiro-six.vercel.app/?user_id=${userId}`;
            twiml.message(`🌐 *Dashboard Financeiro*\n\nSeu link pessoal:\n${dashboardUrl}\n\n📱 Melhor visualização no celular!\n\n🔗 Você pode compartilhar este link - cada pessoa terá seus próprios dados separados.`);
        }
        
        else if (mensagemNormal.includes('relatorio') || mensagemNormal.includes('saldo') || 
                  mensagemNormal.includes('hoje') || mensagemNormal.includes('semana') || 
                  mensagemNormal.includes('mes')) {
            
            let filtroTempo = '';
            let dataInicio = new Date();
            
            if (mensagemNormal.includes('hoje')) {
                dataInicio.setHours(0, 0, 0, 0);
                filtroTempo = 'hoje';
            } else if (mensagemNormal.includes('semana')) {
                dataInicio.setDate(dataInicio.getDate() - 7);
                filtroTempo = 'últimos 7 dias';
            } else if (mensagemNormal.includes('mes')) {
                dataInicio.setMonth(dataInicio.getMonth() - 1);
                filtroTempo = 'último mês';
            } else {
                dataInicio.setMonth(dataInicio.getMonth() - 3);
                filtroTempo = 'últimos 3 meses';
            }

            const { data, error } = await supabase
                .from('transacoes')
                .select('*')
                .eq('user_id', userId)
                .gte('data', dataInicio.toISOString())
                .order('data', { ascending: false });

            if (error) {
                console.error('Erro ao buscar transações:', error);
                twiml.message('❌ Erro ao buscar dados. Tente novamente.');
            } else {
                const receitas = data.filter(t => t.tipo === 'receita');
                const despesas = data.filter(t => t.tipo === 'despesa');
                
                const totalReceitas = receitas.reduce((sum, t) => sum + t.valor, 0);
                const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0);
                const saldo = totalReceitas - totalDespesas;

                let resumo = `📊 *Relatório (${filtroTempo})*\n\n`;
                resumo += `💰 Saldo: R$ ${saldo.toFixed(2)}\n`;
                resumo += `📈 Receitas: R$ ${totalReceitas.toFixed(2)}\n`;
                resumo += `📉 Despesas: R$ ${totalDespesas.toFixed(2)}\n`;
                resumo += `📝 Total: ${data.length} transações`;
                
                if (data.length > 0) {
                    resumo += `\n\n*Últimas transações:*`;
                    data.slice(0, 5).forEach(t => {
                        const emoji = t.tipo === 'receita' ? '💚' : '💸';
                        const sinal = t.tipo === 'receita' ? '+' : '-';
                        resumo += `\n${emoji} ${t.categoria}: ${sinal}R$ ${t.valor.toFixed(2)}`;
                    });
                    
                    if (data.length > 5) {
                        resumo += `\n\n💡 Digite "listar" para ver todas`;
                    }
                }
                
                twiml.message(resumo);
            }
        }
        
        else {
            const dados = extrairDados(mensagem);
            
            if (dados && dados.valor > 0) {
                const { data, error } = await supabase
                    .from('transacoes')
                    .insert([{
                        valor: dados.valor,
                        categoria: dados.categoria,
                        tipo: dados.tipo,
                        descricao: dados.descricao,
                        user_id: userId,
                        data: new Date().toISOString()
                    }])
                    .select();

                if (error) {
                    console.error('Erro ao inserir transação:', error);
                    twiml.message('❌ Erro ao registrar transação. Tente novamente.');
                } else {
                    const emoji = dados.tipo === 'receita' ? '💚' : '💸';
                    const sinal = dados.tipo === 'receita' ? '+' : '-';
                    twiml.message(`${emoji} *Transação registrada!*\n\n${dados.categoria}: ${sinal}R$ ${dados.valor.toFixed(2)}\nTipo: ${dados.tipo}\n\n💡 Digite "listar" para ver todas ou "relatório" para resumo.`);
                }
            } else {
                twiml.message(`❌ *Formato não reconhecido!*

✅ *Exemplos corretos:*
• "50 mercado"
• "100 gasolina" 
• "30 farmácia"
• "ganhei 500 freelance"
• "salário 3000"

🏷️ *Categorias reconhecidas:*
mercado, gasolina, loja, salão, farmácia, aluguel, restaurante, uber, conta, médico, roupas e mais!

💡 Digite *"ajuda"* para ver todos os comandos.`);
            }
        }

    } catch (err) {
        console.error('Erro geral:', err);
        twiml.message('❌ Erro interno do servidor. Tente novamente em alguns minutos.');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
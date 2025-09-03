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

// Função extrair dados mais flexível
function extrairDados(texto) {
    const textoNormal = normalizarTexto(texto);
    
    const palavrasReceita = [
        'receita', 'ganhei', 'ganho', 'recebi', 'recebo', 'salario', 'salário', 
        'freelance', 'freela', 'trabalho', 'pagamento', 'pago', 'renda', 
        'bonus', 'comissao', 'venda', 'vendi'
    ];
    
    const ehReceita = palavrasReceita.some(palavra => textoNormal.includes(palavra));
    
    const numeroMatch = textoNormal.match(/(\d+(?:[.,]\d+)?)/);
    if (!numeroMatch) return null;
    
    const valor = parseFloat(numeroMatch[1].replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return null;
    
    let categoria = textoNormal
        .replace(/\d+(?:[.,]\d+)?/g, '')
        .replace(new RegExp(palavrasReceita.join('|'), 'g'), '')
        .trim();
    
    if (!categoria) {
        categoria = ehReceita ? 'receita' : 'despesa';
    }
    
    categoria = categoria.replace(/\s+/g, ' ').trim() || (ehReceita ? 'receita' : 'despesa');
    
    return {
        tipo: ehReceita ? 'receita' : 'despesa',
        valor: valor,
        categoria: categoria,
        descricao: texto.trim()
    };
}

// Rota para receber mensagens do Twilio
app.post('/whatsapp', async (req, res) => {
    const mensagem = req.body.Body;
    const from = req.body.From;
    const userId = from.split(':')[1];
    const mensagemNormal = normalizarTexto(mensagem);
    const twiml = new MessagingResponse();

    try {
        if (mensagemNormal.includes('apagar ultimo') || mensagemNormal.includes('deletar ultimo')) {
            const { data, error } = await supabase
                .from('transacoes')
                .select('id, descricao, valor, tipo')
                .eq('user_id', userId)
                .order('data', { ascending: false }) // Corrigido
                .limit(1);

            if (error || !data || data.length === 0) {
                twiml.message('❌ Nenhuma transação encontrada para apagar.');
            } else {
                const transacao = data[0];
                await supabase.from('transacoes').delete().eq('id', transacao.id);
                twiml.message(`✅ Última transação apagada:\n${transacao.categoria}: R$ ${transacao.valor.toFixed(2)} (${transacao.tipo})`);
            }
        }
        
        else if (mensagemNormal.includes('ajuda') || mensagemNormal.includes('help')) {
            const mensagemAjuda = `🤖 *Assistente Financeiro*
📝 *Registrar gastos/receitas:*
• "50 mercado"
• "100 gasolina" 
• "ganhei 500 freelance"
• "salario 3000"
📊 *Ver relatórios:*
• "relatorio"
• "saldo"
• "hoje"
• "semana"
• "mes"
🗑️ *Apagar:*
• "apagar ultimo"
🌐 *Dashboard:*
• "dashboard"
💡 Pode usar acentos e maiúsculas normalmente!`;
            twiml.message(mensagemAjuda);
        }
        
        else if (mensagemNormal.includes('dashboard')) {
            const dashboardUrl = `https://dashboard-financeiro-six.vercel.app/?user_id=${userId}`;
            twiml.message(`🌐 *Dashboard Financeiro*\n\nAcesse: ${dashboardUrl}\n\n📱 Melhor visualização no celular!`);
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
                .gte('data', dataInicio.toISOString()) // Corrigido
                .order('data', { ascending: false }); // Corrigido

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
                resumo += `📝 Total de transações: ${data.length}`;
                
                if (data.length > 0) {
                    resumo += `\n\n*Últimas transações:*`;
                    data.slice(0, 5).forEach(t => {
                        const emoji = t.tipo === 'receita' ? '💚' : '💸';
                        const sinal = t.tipo === 'receita' ? '+' : '-';
                        resumo += `\n${emoji} ${t.categoria}: ${sinal}R$ ${t.valor.toFixed(2)}`;
                    });
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
                        user_id: userId
                    }]);

                if (error) {
                    console.error('Erro ao inserir transação:', error);
                    twiml.message('❌ Erro ao registrar transação. Tente novamente.');
                } else {
                    const emoji = dados.tipo === 'receita' ? '💚' : '💸';
                    const sinal = dados.tipo === 'receita' ? '+' : '-';
                    twiml.message(`${emoji} *Transação registrada!*\n\n${dados.categoria}: ${sinal}R$ ${dados.valor.toFixed(2)}\nTipo: ${dados.tipo}`);
                }
            } else {
                twiml.message(`❌ *Formato não reconhecido!*
✅ *Exemplos corretos:*
• "50 mercado"
• "100 gasolina"
• "ganhei 500 freelance"
• "salário 3000"
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
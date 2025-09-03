const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
app.use(express.urlencoded({ extended: false }));

// Substitua com as suas chaves do Supabase
const supabaseUrl = 'https://gaptsfozqyybssxxmedj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcHRzZm96cXl5YnNzeHhtZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzA2ODIsImV4cCI6MjA3MjQwNjY4Mn0.0iun-arhyO0Ntxm4xj7GASFdlbvJcLdEWS9aTyeM5jw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CORREÇÃO E MELHORIA 1: FUNÇÃO PARA EXTRAIR DADOS (RECEITAS, DESPESAS E CATEGORIAS) ---
function extrairDados(texto) {
    const textoFormatado = texto.toLowerCase().trim();

    // Palavras-chave para identificar receitas
    const palavrasChaveReceita = ['receita', 'ganhei', 'salario', 'salário', 'pago', 'pagamento'];

    // Padrão para transações do tipo "categoria valor" ou "valor categoria"
    // Ex: "mercado 50", "50 mercado"
    const matchValorCategoria = textoFormatado.match(/^(\d+(?:[.,]\d+)?)\s+(.*)$/) || textoFormatado.match(/^(.*)\s+(\d+(?:[.,]\d+)?)$/);
    if (matchValorCategoria) {
        const valor = parseFloat((matchValorCategoria[1] || matchValorCategoria[2]).replace(',', '.'));
        const categoria = (matchValorCategoria[2] || matchValorCategoria[1]).trim();
        const tipo = palavrasChaveReceita.some(p => categoria.startsWith(p)) ? 'receita' : 'despesa';
        return { tipo, valor, categoria };
    }

    // Padrão para transações com palavras-chave de receita
    // Ex: "ganhei 500 freela", "salário 1500"
    for (const p of palavrasChaveReceita) {
        if (textoFormatado.startsWith(p)) {
            const match = textoFormatado.match(new RegExp(`^${p}\\s+(\\d+(?:[.,]\\d+)?)(?:\\s+(.*))?$`));
            if (match) {
                const valor = parseFloat(match[1].replace(',', '.'));
                const categoria = match[2] || p;
                return { tipo: 'receita', valor, categoria };
            }
        }
    }

    return null; // Formato não reconhecido
}

// Rota para receber mensagens do Twilio
app.post('/whatsapp', async (req, res) => {
    const mensagem = req.body.Body.toLowerCase().trim();
    const twiml = new MessagingResponse();

    // --- CORREÇÃO E MELHORIA 2: LÓGICA DE EXCLUSÃO MAIS INTUITIVA ---
    if (mensagem.startsWith('apagar ultimo') || mensagem.startsWith('apagar último')) {
        try {
            // Busca a última transação
            const { data, error } = await supabase
                .from('transacoes')
                .select('id')
                .order('data', { ascending: false })
                .limit(1);

            if (error || !data || data.length === 0) {
                twiml.message('Nenhuma transação encontrada para apagar.');
            } else {
                const idToDelete = data[0].id;
                await supabase.from('transacoes').delete().eq('id', idToDelete);
                twiml.message(`A última transação (ID: ${idToDelete.substring(0, 5)}...) foi apagada.`);
            }
        } catch (err) {
            twiml.message('Ops! Algo deu errado no servidor ao tentar apagar a última transação.');
            console.error('Erro geral ao apagar:', err);
        }
    } else if (mensagem.startsWith('apagar ')) {
        const termoBusca = mensagem.replace('apagar ', '').trim();
        try {
            // Busca transações que correspondem ao termo de busca
            const { data, error } = await supabase
                .from('transacoes')
                .select('id, descricao, valor')
                .ilike('descricao', `%${termoBusca}%`)
                .order('data', { ascending: false })
                .limit(1);
            
            if (error || !data || data.length === 0) {
                twiml.message(`Não encontrei nenhuma transação com a descrição "${termoBusca}".`);
            } else {
                const idToDelete = data[0].id;
                await supabase.from('transacoes').delete().eq('id', idToDelete);
                twiml.message(`Transação de R$ ${data[0].valor.toFixed(2)} com descrição "${data[0].descricao}" foi apagada.`);
            }
        } catch (err) {
            twiml.message('Ops! Algo deu errado no servidor ao tentar apagar a transação.');
            console.error('Erro geral ao apagar por descrição:', err);
        }
    }
    // --- FIM DA LÓGICA DE EXCLUSÃO ---
    else if (mensagem === 'ajuda') {
        const mensagemAjuda = `
        Olá! Eu sou seu assistente financeiro. Aqui estão os comandos que você pode usar:

        * **Registrar Transação:**
          - Despesa: "despesa 50 mercado" ou "mercado 50"
          - Receita: "ganhei 300 freela" ou "salario 1500"

        * **Consultar Relatórios:**
          - "relatorio de hoje"
          - "relatorio da semana"
          - "relatorio do mes"

        * **Acessar o Dashboard:**
          - "dashboard"
        
        * **Deletar uma Transação:**
          - "apagar ultimo" (para o último lançamento)
          - "apagar [descrição]" (para o último lançamento com essa descrição)

        * **Obter Ajuda:**
          - "ajuda"
        `;
        twiml.message(mensagemAjuda);
    } else if (mensagem === 'dashboard') {
        const dashboardUrl = 'https://dashboard-financeiro-six.vercel.app/';
        twiml.message(`Acesse seu dashboard financeiro em: ${dashboardUrl}`);
    } 
    // --- CORREÇÃO E MELHORIA 3: TRATANDO VÁRIOS COMANDOS DE RELATÓRIO ---
    else if (mensagem.startsWith('relatorio') || mensagem === 'meu saldo' || mensagem === 'minhas despesas' || mensagem === 'minhas receitas') {
        
        let filtroDeTempo = 'all'; // Padrão: todos os tempos
        const now = new Date();
        let queryDate = new Date(0); // Epoch para pegar tudo

        if (mensagem.includes('hoje')) {
            filtroDeTempo = 'today';
            queryDate.setHours(0, 0, 0, 0);
        } else if (mensagem.includes('semana')) {
            filtroDeTempo = 'this_week';
            queryDate.setDate(now.getDate() - 7);
        } else if (mensagem.includes('mes') || mensagem.includes('mês')) {
            filtroDeTempo = 'this_month';
            queryDate.setMonth(now.getMonth() - 1);
        }

        try {
            const { data, error } = await supabase
                .from('transacoes')
                .select('*')
                .gte('data', queryDate.toISOString())
                .order('data', { ascending: false });

            if (error) {
                twiml.message('Erro ao buscar dados para o relatório.');
                console.error('Erro Supabase:', error);
            } else {
                const totalReceita = data.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0);
                const totalDespesa = data.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0);
                const saldo = totalReceita - totalDespesa;

                let resumo = `*Resumo Financeiro* (${filtroDeTempo === 'today' ? 'hoje' : filtroDeTempo === 'this_week' ? 'últimos 7 dias' : 'últimos 30 dias'}):\n`;
                resumo += `\nSaldo atual: R$ ${saldo.toFixed(2)}`;
                resumo += `\nReceitas: R$ ${totalReceita.toFixed(2)}`;
                resumo += `\nDespesas: R$ ${totalDespesa.toFixed(2)}`;
                
                // Adiciona os últimos 5 lançamentos ao relatório
                const ultimosLancamentos = data.slice(0, 5);
                if (ultimosLancamentos.length > 0) {
                    resumo += `\n\n*Últimos Lançamentos:*`;
                    ultimosLancamentos.forEach(t => {
                        resumo += `\n- ${t.categoria}: ${t.tipo === 'receita' ? '+' : '-'} R$ ${t.valor.toFixed(2)}`;
                    });
                }
                
                twiml.message(resumo);
            }
        } catch (err) {
            twiml.message('Não consegui gerar o relatório. Tente novamente mais tarde.');
            console.error(err);
        }
    }
    // --- FIM DA LÓGICA DE RELATÓRIO ---
    else {
        const dados = extrairDados(mensagem);
        if (dados) {
            try {
                const { data, error } = await supabase
                    .from('transacoes')
                    .insert([{
                        valor: dados.valor,
                        categoria: dados.categoria,
                        tipo: dados.tipo,
                        descricao: mensagem // Salva a mensagem original como descrição
                    }]);

                if (error) {
                    twiml.message('Ops! Ocorreu um erro ao registrar a transação.');
                    console.error('Erro Supabase:', error);
                } else {
                    twiml.message(`Transação de ${dados.valor} (${dados.tipo}) registrada com sucesso!`);
                }
            } catch (err) {
                twiml.message('Ops! Algo deu errado no servidor.');
                console.error('Erro geral:', err);
            }
        } else {
            twiml.message('Formato inválido. Use "despesa 50 mercado", "ganhei 500 freela", "dashboard" ou "ajuda".');
        }
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
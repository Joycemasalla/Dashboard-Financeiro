const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();
app.use(express.urlencoded({ extended: false }));

// Substitua com as suas chaves do Supabase
const supabaseUrl = 'https://gaptsfozqyybssxxmedj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhcHRzZm96cXl5YnNzeHhtZWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzA2ODIsImV4cCI6MjA3MjQwNjY4Mn0.0iun-arhyO0Ntxm4xj7GASFdlbvJcLdEWS9aTyeM5jw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para extrair dados da mensagem
// Novo código da função para extrair dados da mensagem
function extrairDados(texto) {
    const textoFormatado = texto.toLowerCase().trim();

    // Padrão para despesa: "mercado 50", "gasolina 100", "despesa 50 mercado"
    // Captura: categoria (palavra), valor (número)
    let match = textoFormatado.match(/^(\w+)\s+(\d+(?:[.,]\d+)?)$/);
    if (match) {
        return { tipo: 'despesa', valor: parseFloat(match[2].replace(',', '.')), categoria: match[1] };
    }
    
    // Padrão para receita: "ganhei 500", "salario 1500", "receita 500 freela"
    // Captura: categoria (palavra), valor (número)
    match = textoFormatado.match(/^(ganhei|receita|salario)\s+(\d+(?:[.,]\d+)?)(?:\s+(.*))?$/);
    if (match) {
        const categoria = match[3] || match[1]; // Usa a categoria se houver, senão usa a palavra-chave
        return { tipo: 'receita', valor: parseFloat(match[2].replace(',', '.')), categoria: categoria };
    }

    return null; // Formato não reconhecido
}

// Rota para receber mensagens do Twilio

// Rota para receber mensagens do Twilio
app.post('/whatsapp', async (req, res) => {
    const mensagem = req.body.Body.toLowerCase().trim();
    const twiml = new MessagingResponse();

    // Comandos de informação
    if (mensagem === 'dashboard') {
        const dashboardUrl = 'SUA_URL_DO_DASHBOARD_NO_VERCEL'; // Substitua pelo seu link do Vercel
        twiml.message(`Acesse seu dashboard financeiro em: ${dashboardUrl}`);
    } else if (mensagem.startsWith('relatorio')) {
        let filtroDeTempo = '';
        if (mensagem.includes('hoje')) {
            filtroDeTempo = 'today';
        } else if (mensagem.includes('semana')) {
            filtroDeTempo = 'this_week';
        } else if (mensagem.includes('mes')) {
            filtroDeTempo = 'this_month';
        }

        // Lógica de consulta ao banco de dados com base no filtro de tempo
        let queryDate;
        let resumo = '';

        try {
            // Lógica para filtrar por data (exemplo simplificado)
            const { data, error } = await supabase
                .from('transacoes')
                .select('*')
                .gte('data', new Date(new Date() - 86400000).toISOString()); // Exemplo de filtro (últimas 24h)

            const totalReceita = data.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0);
            const totalDespesa = data.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0);

            resumo = `Resumo de hoje:\nReceitas: R$ ${totalReceita.toFixed(2)}\nDespesas: R$ ${totalDespesa.toFixed(2)}`;
            twiml.message(resumo);

        } catch (err) {
            twiml.message('Não consegui gerar o relatório. Tente novamente mais tarde.');
            console.error(err);
        }

    } else {
        // Lógica para registrar transações
        const dados = extrairDados(mensagem);
        if (dados) {
            try {
                const { data, error } = await supabase
                    .from('transacoes')
                    .insert([{
                        valor: dados.valor,
                        categoria: dados.categoria,
                        tipo: dados.tipo,
                        descricao: dados.categoria
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
            twiml.message('Formato inválido. Use "despesa 50 mercado", "ganhei 500 freela", "dashboard" ou "relatorio".');
        }
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
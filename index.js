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
function extrairDados(texto) {
    // Exemplo de formato: "despesa 50 mercado" ou "receita 1000 salário"
    const partes = texto.toLowerCase().split(' ');
    if (partes.length < 3) {
        return null; // Mensagem inválida
    }

    const tipo = partes[0];
    const valor = parseFloat(partes[1]);
    const categoria = partes.slice(2).join(' ');

    if (!['despesa', 'receita'].includes(tipo) || isNaN(valor)) {
        return null;
    }

    return { tipo, valor, categoria };
}

// Rota para receber mensagens do Twilio
app.post('/whatsapp', async (req, res) => {
    const mensagem = req.body.Body;
    const dados = extrairDados(mensagem);
    const twiml = new MessagingResponse();
    
    if (dados) {
        try {
            const { data, error } = await supabase
                .from('transacoes')
                .insert([{
                    valor: dados.valor,
                    categoria: dados.categoria,
                    tipo: dados.tipo,
                    descricao: dados.categoria // Usando categoria como descrição por simplicidade
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
        twiml.message('Formato inválido. Use "tipo valor categoria" (ex: despesa 50 gasolina).');
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
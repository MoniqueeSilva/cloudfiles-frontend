const API_URL = "http://3.141.192.172:8081/api/arquivos";

// Função auxiliar para interpretar erros da API
async function interpretarResposta(resposta) {
    const texto = await resposta.text();
    if (!texto) return {};
    try {
        return JSON.parse(texto);
    } catch {
        return { message: texto };
    }
}

// GET /api/arquivos
export async function listarArquivos() {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) {
        const dados = await interpretarResposta(resposta);
        throw new Error(dados.erro || dados.message || "Não foi possível carregar os arquivos.");
    }
    const dados = await resposta.json();
    return Array.isArray(dados) ? dados : [];
}

// POST /api/arquivos
export async function enviarArquivo(arquivo) {
    const formulario = new FormData();
    formulario.append("arquivo", arquivo);

    const resposta = await fetch(API_URL, {
        method: "POST",
        body: formulario,
    });

    const dados = await interpretarResposta(resposta);

    if (!resposta.ok) {
        throw new Error(dados.erro || dados.message || "Não foi possível enviar o arquivo.");
    }

    return dados;
}
const API_URL = "http://3.141.192.172:8081/api/arquivos";

// Interpreta respostas da API, inclusive quando não existe corpo.
async function interpretarResposta(resposta) {
  const texto = await resposta.text();

  if (!texto) return {};

  try {
    return JSON.parse(texto);
  } catch {
    return { message: texto };
  }
}

// Trata erros HTTP de maneira padronizada.
async function verificarResposta(resposta, mensagemPadrao) {
  const dados = await interpretarResposta(resposta);

  if (!resposta.ok) {
    throw new Error(
      dados.erro ||
      dados.message ||
      dados.mensagem ||
      mensagemPadrao
    );
  }

  return dados;
}

// GET /api/arquivos
export async function listarArquivos() {
  const resposta = await fetch(API_URL);

  const dados = await verificarResposta(
    resposta,
    "Não foi possível carregar os arquivos."
  );

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

  return verificarResposta(
    resposta,
    "Não foi possível enviar o arquivo."
  );
}

// GET /api/arquivos/{id}
export async function buscarArquivo(id) {
  const resposta = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`
  );

  return verificarResposta(
    resposta,
    "Não foi possível encontrar o arquivo."
  );
}

// PUT /api/arquivos/{id}
export async function renomearArquivo(id, novoNome) {
  const resposta = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: novoNome,
      }),
    }
  );

  return verificarResposta(
    resposta,
    "Não foi possível renomear o arquivo."
  );
}

// DELETE /api/arquivos/{id}
export async function deletarArquivo(id) {
  const resposta = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  return verificarResposta(
    resposta,
    "Não foi possível excluir o arquivo."
  );
}

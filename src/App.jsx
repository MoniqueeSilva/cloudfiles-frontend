import { useEffect, useRef, useState } from "react";
import "./App.css";

// Importando o Hook, o Serviço de API e os Formatadores
import { useArquivos } from "./hooks/useArquivos";
import { enviarArquivo as enviarArquivoAPI } from "./services/api";
import { formatarTamanho, obterExtensao } from "./utils/formatadores";

function App() {
  const inputRef = useRef(null);

  // O Hook gerencia o estado da lista, carregamento, erro e a função de recarregar
  const { arquivos, carregando, erroListagem, carregarArquivos } = useArquivos();

  // Estados locais do componente (seleção e envio)
  const [arquivo, setArquivo] = useState(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  // O useEffect está aqui, no App.jsx. Ele apenas dispara a função.
  // Como a função é assíncrona e o setState dela acontece apenas após o await,
  // o React não dispara o aviso de "cascading render".
  useEffect(() => {
    carregarArquivos();
  }, [carregarArquivos]);

  function mostrarMensagem(texto, tipo) {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  function selecionarArquivo(file) {
    if (!file || enviando) return;

    setArquivo(file);
    setMensagem("");
    setTipoMensagem("");
  }

  function handleFileChange(event) {
    selecionarArquivo(event.target.files[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setArrastando(false);

    selecionarArquivo(event.dataTransfer.files[0]);
  }

  function removerArquivo() {
    if (enviando) return;

    setArquivo(null);
    setMensagem("");
    setTipoMensagem("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function enviarArquivo() {
    if (!arquivo || enviando) return;

    setEnviando(true);
    mostrarMensagem("Enviando arquivo...", "info");

    try {
      await enviarArquivoAPI(arquivo);

      setArquivo(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      mostrarMensagem("Arquivo enviado com sucesso!", "success");

      // Chama a função de recarregar fornecida pelo Hook
      await carregarArquivos();
    } catch (erro) {
      mostrarMensagem(
        erro.message || "Erro ao enviar o arquivo. Verifique sua conexão.",
        "error"
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <a href="/" className="logo">
            <span className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 18H17.5A4.5 4.5 0 0 0 18 9.03 6 6 0 0 0 6.2 8.5 4.75 4.75 0 0 0 7 18Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 14V20M9.5 16.5 12 14l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              Cloud<span className="logo-highlight">Files</span>
            </span>
          </a>
        </div>
      </header>

      <main className="main-container">
        <section className="intro">
          <span className="eyebrow">SEU ESPAÇO NA NUVEM</span>
          <h1>
            Seus arquivos, <span>em um só lugar.</span>
          </h1>
          <p>
            Envie e acesse seus arquivos de maneira simples e prática.
            Tudo organizado em um só lugar.
          </p>
        </section>

        <section className="upload-card">
          <div className="section-heading">
            <div>
              <h2>Enviar arquivo</h2>
              <p>Selecione um arquivo do seu dispositivo.</p>
            </div>
            <span className="heading-icon">↑</span>
          </div>

          <div
            className={`drop-area ${arrastando ? "dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();

              if (!enviando) {
                setArrastando(true);
              }
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!enviando) {
                inputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Selecionar arquivo para envio"
            aria-disabled={enviando}
            onKeyDown={(event) => {
              if (
                !enviando &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              hidden
              disabled={enviando}
            />

            <div className="upload-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 16V4M7.5 8.5 12 4l4.5 4.5M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h3>Arraste seu arquivo até aqui</h3>
            <p>
              ou <span>clique para selecionar</span> no seu dispositivo
            </p>
            <small>Selecione um arquivo por vez</small>
          </div>

          {arquivo && (
            <div className="selected-file">
              <div className="file-icon">
                {obterExtensao(arquivo.name)}
              </div>

              <div className="file-details">
                <strong>{arquivo.name}</strong>
                <span>
                  {arquivo.type || "Tipo não identificado"} ·{" "}
                  {formatarTamanho(arquivo.size)}
                </span>
              </div>

              <button
                className="remove-button"
                onClick={removerArquivo}
                aria-label="Remover arquivo selecionado"
                title="Remover arquivo"
                disabled={enviando}
              >
                ×
              </button>
            </div>
          )}

          <button
            className="upload-button"
            onClick={enviarArquivo}
            disabled={!arquivo || enviando}
          >
            <span>↑</span>
            {enviando ? "Enviando..." : "Enviar arquivo"}
          </button>

          {mensagem && (
            <div className={`status-message ${tipoMensagem}`}>
              {mensagem}
            </div>
          )}
        </section>

        <section className="files-section">
          <div className="files-heading">
            <div>
              <h2>Seus arquivos</h2>
              <p>Arquivos armazenados na sua nuvem.</p>
            </div>

            <span className="file-count">
              {arquivos.length}{" "}
              {arquivos.length === 1 ? "arquivo" : "arquivos"}
            </span>
          </div>

          {carregando ? (
            <div className="list-message">
              Carregando arquivos...
            </div>
          ) : erroListagem ? (
            <div className="list-message error">
              <p>{erroListagem}</p>
              <button onClick={carregarArquivos}>
                Tentar novamente
              </button>
            </div>
          ) : arquivos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 3.75h8l4 4V20.25H6V3.75Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 3.75v4h4M9 13h6M9 16.5h6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3>Nenhum arquivo por aqui ainda</h3>
              <p>Seus arquivos enviados aparecerão nesta área.</p>
            </div>
          ) : (
            <div className="files-list">
              {arquivos.map((item) => (
                <article className="file-item" key={item.id}>
                  <div className="file-icon">
                    {obterExtensao(item.nome)}
                  </div>

                  <div className="file-details">
                    <strong>{item.nome}</strong>
                    <span>
                      {item.tipo || "Tipo não informado"} ·{" "}
                      {formatarTamanho(item.tamanho || 0)}
                    </span>
                  </div>

                  <a
                    className="open-file-button"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir ${item.nome}`}
                  >
                    Abrir
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          CloudFiles © 2026 · Armazenamento simples e acessível.
        </p>
      </footer>
    </div>
  );
}

export default App;
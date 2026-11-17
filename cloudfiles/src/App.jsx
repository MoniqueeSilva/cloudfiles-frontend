import { useRef, useState } from "react";
import "./App.css";

function App() {
  const inputRef = useRef(null);

  const [arquivo, setArquivo] = useState(null);
  const [arrastando, setArrastando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  function formatarTamanho(bytes) {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function selecionarArquivo(file) {
    if (!file) return;

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
    setArquivo(null);
    setMensagem("");
    setTipoMensagem("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function enviarArquivo() {
    setMensagem(
      "A interface está pronta! O envio será habilitado após a integração com o backend."
    );
    setTipoMensagem("info");
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
            <span>Cloud<span className="logo-highlight">Files</span></span>
          </a>

          <span className="header-label">Armazenamento de arquivos</span>
        </div>
      </header>

      <main className="main-container">
        <section className="intro">
          <span className="eyebrow">SEU ESPAÇO NA NUVEM</span>
          <h1>Seus arquivos, <span>em um só lugar.</span></h1>
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
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current.click();
              }
            }}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              hidden
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
            <p>ou <span>clique para selecionar</span> no seu dispositivo</p>
            <small>Selecione um arquivo por vez</small>
          </div>

          {arquivo && (
            <div className="selected-file">
              <div className="file-icon">DOC</div>

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
              >
                ×
              </button>
            </div>
          )}

          <button
            className="upload-button"
            onClick={enviarArquivo}
            disabled={!arquivo}
          >
            <span>↑</span> Enviar arquivo
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
            <span className="file-count">0 arquivos</span>
          </div>

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
        </section>
      </main>

      <footer className="footer">
        <p>CloudFiles © 2026 · Armazenamento simples e acessível.</p>
      </footer>
    </div>
  );
}

export default App;

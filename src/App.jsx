
import { useEffect, useRef, useState } from "react";
import "./App.css";

import { useArquivos } from "./hooks/useArquivos";
import {
  enviarArquivo as enviarArquivoAPI,
  buscarArquivo,
  renomearArquivo,
  deletarArquivo,
} from "./services/api";

import {
  formatarTamanho,
  obterExtensao,
} from "./utils/formatadores";

function Icone({ nome, tamanho = 20 }) {
  const propriedades = {
    width: tamanho,
    height: tamanho,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icones = {
    nuvem: (
      <>
        <path d="M7 18h10.5a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 8.5 4.75 4.75 0 0 0 7 18Z" />
        <path d="M12 14v6m-2.5-3.5L12 14l2.5 2.5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m-4.5 4.5L12 4l4.5 4.5" />
        <path d="M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5" />
      </>
    ),
    arquivo: (
      <>
        <path d="M6 3.75h8l4 4v12.5H6V3.75Z" />
        <path d="M14 3.75v4h4M9 13h6M9 16.5h6" />
      </>
    ),
    olho: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    editar: (
      <>
        <path d="m15 5 4 4M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" />
      </>
    ),
    excluir: (
      <>
        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" />
        <path d="M10 11v5m4-5v5" />
      </>
    ),
    fechar: <path d="m18 6-12 12M6 6l12 12" />,
    check: <path d="m5 12 4 4L19 6" />,
    voltar: <path d="m15 18-6-6 6-6" />,
    atualizar: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" />
      </>
    ),
  };

  return <svg {...propriedades}>{icones[nome]}</svg>;
}

function App() {
  const inputRef = useRef(null);

  const {
    arquivos,
    carregando,
    erroListagem,
    carregarArquivos,
  } = useArquivos();

  const [arquivo, setArquivo] = useState(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  const [modal, setModal] = useState(null);
  const [novoNome, setNovoNome] = useState("");
  const [processandoId, setProcessandoId] = useState(null);

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
    selecionarArquivo(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setArrastando(false);
    selecionarArquivo(event.dataTransfer.files?.[0]);
  }

  function removerArquivoSelecionado() {
    if (enviando) return;

    setArquivo(null);

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
      await carregarArquivos();
    } catch (erro) {
      mostrarMensagem(
        erro.message || "Não foi possível enviar o arquivo.",
        "error"
      );
    } finally {
      setEnviando(false);
    }
  }

  async function visualizarDetalhes(item) {
    setModal({
      tipo: "detalhes",
      arquivo: null,
      carregando: true,
      erro: "",
    });

    try {
      const detalhes = await buscarArquivo(item.id);

      setModal((atual) => {
        if (!atual || atual.tipo !== "detalhes") return atual;

        return {
          ...atual,
          arquivo: detalhes,
          carregando: false,
        };
      });
    } catch (erro) {
      setModal((atual) => {
        if (!atual || atual.tipo !== "detalhes") return atual;

        return {
          ...atual,
          carregando: false,
          erro: erro.message || "Não foi possível carregar os detalhes.",
        };
      });
    }
  }

  function abrirRenomeacao(item) {
    setNovoNome(item.nome);
    setModal({
      tipo: "renomear",
      arquivo: item,
      erro: "",
    });
  }

  function fecharModal() {
    if (processandoId) return;

    setModal(null);
    setNovoNome("");
  }

  async function confirmarRenomeacao(event) {
    event.preventDefault();

    if (!modal?.arquivo || processandoId) return;

    const nome = novoNome.trim();

    if (!nome) {
      setModal((atual) => ({
        ...atual,
        erro: "Digite um nome válido para o arquivo.",
      }));
      return;
    }

    if (nome === modal.arquivo.nome) {
      fecharModal();
      return;
    }

    setProcessandoId(modal.arquivo.id);

    try {
      await renomearArquivo(modal.arquivo.id, nome);

      setModal(null);
      setNovoNome("");

      mostrarMensagem("Nome do arquivo atualizado com sucesso!", "success");
      await carregarArquivos();
    } catch (erro) {
      setModal((atual) => ({
        ...atual,
        erro: erro.message || "Não foi possível renomear o arquivo.",
      }));
    } finally {
      setProcessandoId(null);
    }
  }

  async function excluirArquivo(item) {
    if (processandoId) return;

    const confirmou = window.confirm(
      `Deseja realmente excluir "${item.nome}"? Essa ação não poderá ser desfeita.`
    );

    if (!confirmou) return;

    setProcessandoId(item.id);
    setMensagem("");

    try {
      await deletarArquivo(item.id);

      mostrarMensagem("Arquivo excluído com sucesso!", "success");
      await carregarArquivos();
    } catch (erro) {
      mostrarMensagem(
        erro.message || "Não foi possível excluir o arquivo.",
        "error"
      );
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <a href="/" className="logo" aria-label="CloudFiles - início">
            <span className="logo-icon">
              <Icone nome="nuvem" tamanho={25} />
            </span>
            <span className="logo-text">
              Cloud<span>Files</span>
            </span>
          </a>
        </div>
      </header>

      <main className="main-container">
        <section className="intro">
          <span className="eyebrow">
            <span className="eyebrow-line" />
            SEU ESPAÇO NA NUVEM
          </span>

          <h1>
            Seus arquivos,
            <br />
            <span>em um só lugar.</span>
          </h1>

          <p>
            Envie, organize e acesse seus arquivos de maneira simples e
            prática. Tudo o que você precisa, em um só lugar.
          </p>
        </section>

        <section className="upload-card">
          <div className="section-heading">
            <div className="heading-title-group">
              <span className="heading-icon">
                <Icone nome="upload" tamanho={21} />
              </span>
              <div>
                <h2>Enviar arquivo</h2>
                <p>Adicione um novo arquivo à sua nuvem.</p>
              </div>
            </div>
          </div>

          <div
            className={`drop-area ${arrastando ? "dragging" : ""} ${
              enviando ? "disabled" : ""
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              if (!enviando) setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!enviando) inputRef.current?.click();
            }}
            onKeyDown={(event) => {
              if (
                !enviando &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Selecionar arquivo para envio"
            aria-disabled={enviando}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              hidden
              disabled={enviando}
            />

            <div className="upload-illustration">
              <Icone nome="upload" tamanho={30} />
            </div>

            <h3>
              Arraste seu arquivo até aqui
            </h3>

            <p>
              ou <strong>clique para selecionar</strong> no seu dispositivo
            </p>

            <span className="upload-hint">
              Selecione um arquivo por vez
            </span>
          </div>

          {arquivo && (
            <div className="selected-file">
              <div className="file-type-icon">
                {obterExtensao(arquivo.name)}
              </div>

              <div className="file-info">
                <strong title={arquivo.name}>{arquivo.name}</strong>
                <span>
                  {arquivo.type || "Tipo não identificado"} ·{" "}
                  {formatarTamanho(arquivo.size)}
                </span>
              </div>

              <button
                className="icon-button remove-button"
                onClick={removerArquivoSelecionado}
                disabled={enviando}
                title="Remover arquivo selecionado"
                aria-label="Remover arquivo selecionado"
              >
                <Icone nome="fechar" tamanho={18} />
              </button>
            </div>
          )}

          <div className="upload-footer">
            <span className="upload-security">
              <Icone nome="check" tamanho={15} />
              Armazenamento na nuvem
            </span>

            <button
              className="upload-button"
              onClick={enviarArquivo}
              disabled={!arquivo || enviando}
            >
              {enviando ? (
                <>
                  <span className="spinner" />
                  Enviando...
                </>
              ) : (
                <>
                  <Icone nome="upload" tamanho={18} />
                  Enviar arquivo
                </>
              )}
            </button>
          </div>

          {mensagem && (
            <div className={`status-message ${tipoMensagem}`}>
              {tipoMensagem === "success" && <Icone nome="check" tamanho={17} />}
              <span>{mensagem}</span>
            </div>
          )}
        </section>

        <section className="files-section">
          <div className="files-heading">
            <div>
              <span className="section-overline">SUA BIBLIOTECA</span>
              <h2>Seus arquivos</h2>
              <p>Gerencie os arquivos armazenados na sua nuvem.</p>
            </div>

            <div className="files-heading-right">
              <span className="file-count">
                {arquivos.length}
                <small>
                  {arquivos.length === 1 ? "arquivo" : "arquivos"}
                </small>
              </span>

              <button
                className="refresh-button"
                onClick={carregarArquivos}
                disabled={carregando}
                title="Atualizar listagem"
                aria-label="Atualizar listagem"
              >
                <Icone nome="atualizar" tamanho={17} />
              </button>
            </div>
          </div>

          {carregando ? (
            <div className="state-card">
              <span className="spinner large" />
              <strong>Carregando seus arquivos</strong>
              <p>Aguarde enquanto buscamos seus documentos.</p>
            </div>
          ) : erroListagem ? (
            <div className="state-card error-state">
              <div className="state-icon">
                <Icone nome="arquivo" tamanho={27} />
              </div>
              <strong>Não foi possível carregar os arquivos</strong>
              <p>{erroListagem}</p>
              <button className="secondary-button" onClick={carregarArquivos}>
                Tentar novamente
              </button>
            </div>
          ) : arquivos.length === 0 ? (
            <div className="state-card">
              <div className="state-icon">
                <Icone nome="arquivo" tamanho={28} />
              </div>
              <strong>Sua nuvem ainda está vazia</strong>
              <p>
                Envie seu primeiro arquivo para ele aparecer nesta área.
              </p>
            </div>
          ) : (
            <div className="files-list">
              {arquivos.map((item) => (
                <article className="file-item" key={item.id}>
                  <div className="file-type-icon">
                    {obterExtensao(item.nome)}
                  </div>

                  <div className="file-info">
                    <strong title={item.nome}>{item.nome}</strong>
                    <span>
                      {item.tipo || "Tipo não informado"} ·{" "}
                      {formatarTamanho(item.tamanho || 0)}
                    </span>
                  </div>

                  <div className="file-actions">
                    <button
                      className="action-button details-action"
                      onClick={() => visualizarDetalhes(item)}
                      disabled={Boolean(processandoId)}
                      title="Ver detalhes"
                    >
                      <Icone nome="olho" tamanho={16} />
                      <span>Detalhes</span>
                    </button>

                    <button
                      className="action-button rename-action"
                      onClick={() => abrirRenomeacao(item)}
                      disabled={Boolean(processandoId)}
                      title="Renomear arquivo"
                    >
                      <Icone nome="editar" tamanho={16} />
                      <span>Renomear</span>
                    </button>

                    <button
                      className="action-button delete-action"
                      onClick={() => excluirArquivo(item)}
                      disabled={Boolean(processandoId)}
                      title="Excluir arquivo"
                    >
                      <Icone nome="excluir" tamanho={16} />
                      <span>
                        {processandoId === item.id ? "Excluindo..." : "Excluir"}
                      </span>
                    </button>

                    <a
                      className="open-file-button"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${item.nome}`}
                    >
                      Abrir arquivo
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <a href="/" className="footer-logo">
            Cloud<span>Files</span>
          </a>
          <p>Armazenamento simples e acessível.</p>
          <span>© 2026 CloudFiles</span>
        </div>
      </footer>

      {modal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) fecharModal();
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-heading">
              <div>
                <span className="modal-overline">CLOUDFILES</span>
                <h2 id="modal-title">
                  {modal.tipo === "detalhes"
                    ? "Detalhes do arquivo"
                    : "Renomear arquivo"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={fecharModal}
                disabled={Boolean(processandoId)}
                aria-label="Fechar janela"
              >
                <Icone nome="fechar" tamanho={19} />
              </button>
            </div>

            {modal.tipo === "detalhes" && (
              <div className="modal-body">
                {modal.carregando ? (
                  <div className="modal-loading">
                    <span className="spinner large" />
                    <p>Buscando informações do arquivo...</p>
                  </div>
                ) : modal.erro ? (
                  <div className="modal-error">
                    {modal.erro}
                  </div>
                ) : modal.arquivo ? (
                  <>
                    <div className="details-file-header">
                      <div className="file-type-icon large-icon">
                        {obterExtensao(modal.arquivo.nome)}
                      </div>
                      <div className="file-info">
                        <strong>{modal.arquivo.nome}</strong>
                        <span>
                          {formatarTamanho(modal.arquivo.tamanho || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="details-grid">
                      <div className="detail-row">
                        <span>Nome do arquivo</span>
                        <strong>{modal.arquivo.nome}</strong>
                      </div>

                      <div className="detail-row">
                        <span>Identificador</span>
                        <strong className="detail-id">{modal.arquivo.id}</strong>
                      </div>

                      <div className="detail-row">
                        <span>Tipo de arquivo</span>
                        <strong>{modal.arquivo.tipo || "Não informado"}</strong>
                      </div>

                      <div className="detail-row">
                        <span>Tamanho</span>
                        <strong>
                          {formatarTamanho(modal.arquivo.tamanho || 0)}
                        </strong>
                      </div>
                    </div>

                    <a
                      className="modal-primary-link"
                      href={modal.arquivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir arquivo
                    </a>
                  </>
                ) : null}
              </div>
            )}

            {modal.tipo === "renomear" && (
              <form className="modal-body" onSubmit={confirmarRenomeacao}>
                <p className="modal-description">
                  Digite abaixo o novo nome que deseja utilizar para este
                  arquivo.
                </p>

                <label className="rename-label" htmlFor="novo-nome">
                  Nome do arquivo
                </label>

                <input
                  id="novo-nome"
                  className="rename-input"
                  type="text"
                  value={novoNome}
                  onChange={(event) => setNovoNome(event.target.value)}
                  placeholder="Digite o novo nome"
                  maxLength={255}
                  autoFocus
                  disabled={Boolean(processandoId)}
                />

                {modal.erro && (
                  <div className="modal-error">{modal.erro}</div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={fecharModal}
                    disabled={Boolean(processandoId)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={Boolean(processandoId)}
                  >
                    {processandoId ? (
                      <>
                        <span className="spinner small" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Icone nome="check" tamanho={17} />
                        Salvar alteração
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;

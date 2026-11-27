import { useState, useCallback } from "react";
import { listarArquivos } from "../services/api";

export function useArquivos() {
  const [arquivos, setArquivos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erroListagem, setErroListagem] = useState("");

  const carregarArquivos = useCallback(async () => {
    setCarregando(true);
    setErroListagem("");
    try {
      const dados = await listarArquivos();
      setArquivos(dados);
    } catch (erro) {
      setErroListagem(erro.message || "Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }, []);

  // Retorna a função de carregar, mas NÃO a executa automaticamente.
  return { arquivos, carregando, erroListagem, carregarArquivos };
}
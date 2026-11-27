//funções de formatação

export function formatarTamanho(bytes) {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function obterExtensao(nome) {
    if (!nome || !nome.includes(".")) return "FILE";
    return nome.split(".").pop().slice(0, 5).toUpperCase();
}
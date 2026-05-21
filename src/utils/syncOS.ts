// syncOS desativado: tabela ordens_servico tem schema incompatível com esta função
// (numero_os é serial, user_id não existe, status values divergem)
// OS mestre é gerenciada via fluxo de orçamentos (migration 106)
export async function ensureOrdemServicoExists(
  _numero_os: number | string,
  _user_id: string,
  _paciente_id?: string | null,
  _dentista_id?: string | null,
  _protetico_id?: string | number | null
) {
  return;
}

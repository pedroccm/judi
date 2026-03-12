export function buildEsajUrl(numero: string): string {
  const match = numero.match(/^(\d{7}-\d{2}\.\d{4})\.8\.26\.(\d{4})$/);
  if (match) {
    const numAno = match[1];
    const foro = match[2];
    return `https://esaj.tjsp.jus.br/cpopg/search.do?conversationId=&dadosConsulta.localPesquisa.cdLocal=-1&cbPesquisa=NUMPROC&dadosConsulta.tipoNuProcesso=UNIFICADO&numeroDigitoAnoUnificado=${numAno}&foroNumeroUnificado=${foro}&dadosConsulta.valorConsultaNuUnificado=${numero}&dadosConsulta.valorConsulta=`;
  }
  return `https://esaj.tjsp.jus.br/cpopg/open.do`;
}

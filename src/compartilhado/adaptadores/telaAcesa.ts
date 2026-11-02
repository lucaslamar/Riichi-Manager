/**
 * Mantém a tela acesa com a Wake Lock API. Onde não existir, a tela só apaga como
 * sempre. No React Native basta trocar este arquivo.
 */
export function manterTelaAcesa(): () => void {
  if (!('wakeLock' in navigator)) return () => {}
  let trava: WakeLockSentinel | null = null
  let ativo = true

  const pedir = async () => {
    try {
      const nova = await navigator.wakeLock.request('screen')
      if (ativo) trava = nova
      else void nova.release()
    } catch {
      // Sem permissão ou bateria fraca: segue sem travar.
    }
  }
  // O navegador solta a trava ao sair da aba.
  const aoVoltar = () => {
    if (document.visibilityState === 'visible') void pedir()
  }

  void pedir()
  document.addEventListener('visibilitychange', aoVoltar)
  return () => {
    ativo = false
    document.removeEventListener('visibilitychange', aoVoltar)
    void trava?.release()
  }
}

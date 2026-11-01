/**
 * Alarme sem arquivo de som, com Web Audio. Os componentes só chamam `tocarAlarme`;
 * no React Native basta trocar este arquivo.
 */
let contexto: AudioContext | null = null

export function tocarAlarme() {
  const Contexto = window.AudioContext
  if (!Contexto) return
  contexto ??= new Contexto()
  void contexto.resume()

  // Três bipes curtos.
  for (const atraso of [0, 0.25, 0.5]) {
    const oscilador = contexto.createOscillator()
    const volume = contexto.createGain()
    const inicio = contexto.currentTime + atraso
    oscilador.type = 'square'
    oscilador.frequency.value = 880
    volume.gain.setValueAtTime(0.15, inicio)
    volume.gain.exponentialRampToValueAtTime(0.001, inicio + 0.18)
    oscilador.connect(volume).connect(contexto.destination)
    oscilador.start(inicio)
    oscilador.stop(inicio + 0.18)
  }
}

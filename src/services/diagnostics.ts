export function getDiagnostics(): string {
  const nav = navigator
  const scr = window.screen
  const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory
  const gb = (b: number) => (b / 1024 ** 3).toFixed(2) + ' GB'
  const isCapacitor = !!(window as unknown as { Capacitor?: unknown }).Capacitor

  const lines = [
    '## Diagnostics',
    '',
    `- App: Party Quips`,
    `- Version: 1.0.0`,
    `- Platform: ${isCapacitor ? 'Android (Capacitor)' : 'Web'}`,
    `- Screen: ${scr.width}×${scr.height} @ ${window.devicePixelRatio}×`,
    `- Language: ${nav.language}`,
    `- Online: ${nav.onLine}`,
    `- Time Zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    mem ? `- JS Heap: ${gb(mem.usedJSHeapSize)} used / ${gb(mem.jsHeapSizeLimit)} limit` : null,
    `- Timestamp: ${new Date().toISOString()}`,
    `- User Agent: ${nav.userAgent}`,
  ].filter(Boolean)

  return lines.join('\n')
}

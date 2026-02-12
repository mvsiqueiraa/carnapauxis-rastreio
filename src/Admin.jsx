import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Admin() {
  const [status, setStatus] = useState('Parado')
  const [coords, setCoords] = useState({ lat: 0, lng: 0 })

  const comecarTransmissao = async () => {
    
    // --- BLOQUEIO DE TELA (WAKE LOCK) ---
    if ('wakeLock' in navigator) {
      try {
        await navigator.wakeLock.request('screen');
        console.log('💡 Tela mantida acesa com sucesso!');
      } catch (err) {
        console.error('⚠️ Não consegui segurar a tela acesa:', err);
      }
    }
    // ------------------------------------------

    setStatus('Rastreando...')
    
    navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        setStatus(`Enviando: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)

        const { error } = await supabase
          .from('localizacao_bloco')
          .update({ 
            lat: latitude, 
            lng: longitude,
            updated_at: new Date()
          })
          .eq('id', 1)

        if (error) console.error('Erro ao enviar:', error)
      },
      (erro) => {
        console.error(erro)
        setStatus('Erro no GPS: ' + erro.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div style={{ padding: '20px', color: 'white', background: '#333', minHeight: '100vh' }}>
      <h1>Painel do Bloco 🚚💨</h1>
      <p>Status: <strong>{status}</strong></p>
      
      <div style={{ margin: '20px 0', fontSize: '1.2em' }}>
        📍 Lat: {coords.lat} <br />
        📍 Lng: {coords.lng}
      </div>

      <button 
        onClick={comecarTransmissao}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        INICIAR TRAJETO 🚀
      </button>
      
      <p style={{marginTop: '20px', fontSize: '0.8em', color: '#aaa'}}>
        ⚠️ Mantenha essa aba aberta e a tela desbloqueada.
      </p>
    </div>
  )
}
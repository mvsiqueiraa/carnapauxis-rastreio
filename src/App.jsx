import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { supabase } from './supabaseClient'
import Admin from './Admin'
import L from 'leaflet' // <--- 1. IMPORTANTE: Importar o Leaflet base
import 'leaflet/dist/leaflet.css'
import './App.css'

// --- 2. CRIANDO O ÍCONE PERSONALIZADO ---
const iconeCarnaPauxis = new L.Icon({
  // Coloque aqui o link da sua imagem (pode ser um arquivo na pasta public ou um link da web)
  // Estou usando um ícone de "Trio/Caminhão" roxo para combinar com a identidade
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1934/1934289.png', 
  
  iconSize: [50, 50], // Tamanho do ícone (largura, altura)
  iconAnchor: [25, 50], // Onde a "ponta" do ícone fica (metade da largura, altura total)
  popupAnchor: [0, -50], // Onde o balãozinho aparece em relação ao ícone
  className: 'icone-pulsante' // (Opcional) Classe CSS para dar efeito
});

function App() {
  // Se for admin, mostra o painel
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin')

  useEffect(() => {
    window.addEventListener('hashchange', () => setIsAdmin(window.location.hash === '#admin'))
  }, [])

  if (isAdmin) return <Admin />

  // --- CÓDIGO DO MAPA ---
  const [posicao, setPosicao] = useState([-1.900, -55.518]) // Óbidos/PA aprox.

  useEffect(() => {
    const getPosicaoInicial = async () => {
      const { data } = await supabase
        .from('localizacao_bloco')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (data && data.lat && data.lng) setPosicao([data.lat, data.lng])
    }
    getPosicaoInicial()

    const canal = supabase
      .channel('rastreio-bloco')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'localizacao_bloco' }, (payload) => {
        if(payload.new.lat && payload.new.lng) setPosicao([payload.new.lat, payload.new.lng])
      })
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [])

  return (
    <MapContainer 
      center={posicao} 
      zoom={16} 
      scrollWheelZoom={true} 
      style={{ height: '100vh', width: '100vw' }} 
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* 3. AQUI A GENTE APLICA O ÍCONE NOVO (icon={iconeCarnaPauxis}) */}
      <Marker position={posicao} icon={iconeCarnaPauxis}>
        <Popup className="popup-carnaval">
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#d9006c', margin: 0 }}>CarnaPauxis 2026 🎉</h3>
            <p>O Bloco tá passando aqui!</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default App
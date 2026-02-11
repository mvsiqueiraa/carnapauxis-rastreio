import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { supabase } from './supabaseClient'
import Admin from './Admin'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle, FaChevronRight, FaChevronLeft, FaRoute, FaChevronDown, FaChevronUp } from 'react-icons/fa'

// --- ÍCONES PERSONALIZADOS ---

// 1. O TRIO ELÉTRICO (Agora usa 'trio.png')
const iconeTrio = new L.Icon({
  iconUrl: '/trio.png',
  iconSize: [60, 60],   // Ajuste o tamanho se achar pequeno/grande
  iconAnchor: [30, 30], // Centraliza o ícone no ponto do GPS
  popupAnchor: [0, -30],
  className: 'icone-pulsante'
});

// 2. CONCENTRAÇÃO (Mantive o PIN padrão, se quiser mudar avise)
const iconeConcentracao = new L.Icon({
  iconUrl: '/saida.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

// 3. CHEGADA NO FOBÓDROMO (Agora usa 'mascarado.png')
const iconeChegada = new L.Icon({
  iconUrl: '/masacarado.png',
  iconSize: [50, 50],   // Tamanho do Mascarado
  iconAnchor: [25, 50], // O "pé" do mascarado fica no ponto exato
  popupAnchor: [0, -50]
});

const Fobodromo = [-1.914817, -55.516177];

// --- DADOS DOS BLOCOS ---
const agendaBlocos = [
  {
    id: 1,
    nome: "Bloco Vai ou Raxa",
    data: "11/02 - Quarta",
    horario: "18:00",
    local: "Praça de São Francisco",
    descricao: "'A Terra do Mascarado Fobó'. Abre alas para a folia oficial!",
    cor: "#6A0DAD", // Roxo
    inicio: [-1.898259, -55.514176],
    itinerario: [
      "Rua Belém", 
      "Av. Prefeito Nelson Souza", 
      "Rua Dr. Picanço Diniz", 
      "Av. Dom Floriano", 
      "Rua Justo Chermont", 
      "Chegada: Fobódromo"
    ]
  },
  {
    id: 2,
    nome: "Mirim Unidos do Umarizal",
    data: "12/02 - Quinta",
    horario: "A definir",
    local: "A definir",
    descricao: "Em breve mais informações...",
    cor: "#00CED1", // Azul Turquesa
    inicio: Fobodromo, // Ponto padrão para não quebrar o mapa
    itinerario: ["Aguardando divulgação oficial..."]
  },
  {
    id: 3,
    nome: "Serra da Escama",
    data: "13/02 - Sexta",
    horario: "A definir",
    local: "A definir",
    descricao: "Em breve mais informações...",
    cor: "#32CD32", // Verde Lima
    inicio: Fobodromo,
    itinerario: ["Aguardando divulgação oficial..."]
  },
  {
    id: 4,
    nome: "Águia Negra",
    data: "14/02 - Sábado",
    horario: "A definir",
    local: "A definir",
    descricao: "Em breve mais informações...",
    cor: "#000000", // Preto
    inicio: Fobodromo,
    itinerario: ["Aguardando divulgação oficial..."]
  },
  {
    id: 5,
    nome: "Xupa Osso",
    data: "15/02 - Domingo",
    horario: "A definir",
    local: "A definir",
    descricao: "Em breve mais informações...",
    cor: "#8B0000", // Vermelho Escuro
    inicio: Fobodromo,
    itinerario: ["Aguardando divulgação oficial..."]
  },
  {
    id: 6,
    nome: "Unidos do Morro",
    data: "16/02 - Segunda",
    horario: "A definir",
    local: "A definir",
    descricao: "Em breve mais informações...",
    cor: "#FFD700", // Dourado
    inicio: Fobodromo,
    itinerario: ["Aguardando divulgação oficial..."]
  },
  {
    id: 7,
    nome: "Bloco das Virgens",
    data: "17/02 - Terça",
    horario: "A definir",
    local: "A definir",
    descricao: "Em breve mais informações...",
    cor: "#FF69B4", // Rosa Choque
    inicio: Fobodromo,
    itinerario: ["Aguardando divulgação oficial..."]
  }
];

// Componente para mover o mapa suavemente
function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 15, { duration: 1.5 }); }, [center, map]);
  return null;
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin')
  const [blocoAtual, setBlocoAtual] = useState(agendaBlocos[0]) 
  const [posicaoTrio, setPosicaoTrio] = useState(Fobodromo)
  
  // Estado para controlar a "gaveta" (card)
  const [cardAberto, setCardAberto] = useState(true)

  useEffect(() => {
    window.addEventListener('hashchange', () => setIsAdmin(window.location.hash === '#admin'))
    const fetchGPS = async () => {
      const { data } = await supabase.from('localizacao_bloco').select('*').eq('id', 1).single()
      if (data) setPosicaoTrio([data.lat, data.lng])
    }
    fetchGPS()
    const canal = supabase.channel('rastreio').on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'localizacao_bloco' }, 
      (payload) => setPosicaoTrio([payload.new.lat, payload.new.lng])
    ).subscribe()
    return () => supabase.removeChannel(canal)
  }, [])

  const trocarBloco = (direcao) => {
    const indexAtual = agendaBlocos.findIndex(b => b.id === blocoAtual.id);
    let novoIndex = indexAtual + direcao;
    if (novoIndex < 0) novoIndex = agendaBlocos.length - 1; 
    if (novoIndex >= agendaBlocos.length) novoIndex = 0; 
    setBlocoAtual(agendaBlocos[novoIndex]);
    setCardAberto(true); // Abre o card ao trocar
  }

  // Função para abrir/fechar o card
  const toggleCard = () => {
    setCardAberto(!cardAberto);
  }

  if (isAdmin) return <Admin />

  return (
    <div className="app-container">
      {/* Sidebar Lateral */}
      <div className="sidebar-carnaval">
         <div className="footer-dev">Desenvolvido por <strong>mvsiqueira</strong></div>
      </div>

      {/* Header com Banner */}
      <header className="header-carnaval">
         <img src="/banner.png" alt="Banner CarnaPauxis" className="banner-img" />
      </header>

      {/* Etiqueta */}
      <div className="status-pill">
        <span className="live-indicator"></span>
        <span className="status-text">Onde o Bloco tá?</span>
      </div>

      {/* Mapa */}
      <MapContainer center={blocoAtual.inicio} zoom={15} zoomControl={false} className="mapa-layout">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyToLocation center={blocoAtual.inicio} />

        {/* Marcador Saída */}
        <Marker position={blocoAtual.inicio} icon={iconeConcentracao}>
          <Popup>Saída: {blocoAtual.local}</Popup>
        </Marker>

        {/* Marcador Chegada (MASCARADO) */}
        <Marker position={Fobodromo} icon={iconeChegada}>
          <Popup>Chegada: Fobódromo 🎉</Popup>
        </Marker>

        {/* Marcador Trio (CAMINHÃO) */}
        <Marker position={posicaoTrio} icon={iconeTrio}>
          <Popup>Trio Elétrico Aqui! 🚚🔊</Popup>
        </Marker>
      </MapContainer>

      {/* Card de Informações (Gaveta) */}
      <div className={`info-card ${!cardAberto ? 'card-fechado' : ''}`}>
        
        <div className="card-header" style={{ backgroundColor: blocoAtual.cor }}>
          <button onClick={(e) => { e.stopPropagation(); trocarBloco(-1); }} className="nav-btn"><FaChevronLeft /></button>
          
          <div className="header-title-container" onClick={toggleCard} style={{cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1}}>
             <h2 style={{margin: 0}}>{blocoAtual.nome}</h2>
             <div style={{fontSize: '0.8rem', opacity: 0.8, marginTop: '2px'}}>
                {cardAberto ? <FaChevronDown/> : <FaChevronUp/>}
             </div>
          </div>

          <button onClick={(e) => { e.stopPropagation(); trocarBloco(1); }} className="nav-btn"><FaChevronRight /></button>
        </div>

        <div className="card-body">
          <div className="info-row"><FaCalendarAlt className="icon" style={{color: blocoAtual.cor}} /><span><strong>Data:</strong> {blocoAtual.data}</span></div>
          <div className="info-row"><FaClock className="icon" style={{color: blocoAtual.cor}} /><span><strong>Horário:</strong> {blocoAtual.horario}</span></div>
          <div className="info-row"><FaMapMarkerAlt className="icon" style={{color: blocoAtual.cor}} /><span><strong>Saída:</strong> {blocoAtual.local}</span></div>
          <div className="divider"></div>
          <div className="itinerario-section">
            <h4 style={{color: blocoAtual.cor, marginBottom: '5px', display: 'flex', alignItems: 'center'}}><FaRoute style={{marginRight: '8px'}}/> Itinerário</h4>
            <ul style={{listStyle: 'none', paddingLeft: '5px'}}>
              {blocoAtual.itinerario.map((rua, index) => (
                <li key={index} style={{marginBottom: '5px', fontSize: '0.9rem', color: '#555', borderLeft: `3px solid ${blocoAtual.cor}`, paddingLeft: '10px'}}>{rua}</li>
              ))}
            </ul>
          </div>
          <div className="divider"></div>
          <div className="descricao" style={{borderLeftColor: blocoAtual.cor}}><FaInfoCircle className="icon-small" /> {blocoAtual.descricao}</div>
        </div>
      </div>
    </div>
  )
}
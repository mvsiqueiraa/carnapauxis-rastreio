import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import { supabase } from './supabaseClient'
import Admin from './Admin'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle, FaChevronRight, FaChevronLeft, FaRoute, FaChevronDown, FaChevronUp } from 'react-icons/fa'

// --- ÍCONES PERSONALIZADOS ---

// 1. O TRIO ELÉTRICO
const iconeTrio = new L.Icon({
  iconUrl: '/trio.png',
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  popupAnchor: [0, -30],
  className: 'icone-pulsante'
});

// 2. CONCENTRAÇÃO
const iconeConcentracao = new L.Icon({
  iconUrl: '/saida.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

// 3. CHEGADA NO FOBÓDROMO
const iconeChegada = new L.Icon({
  iconUrl: '/mascarado.png',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50]
});

const Fobodromo = [-1.914817, -55.516177];

// --- DADOS DOS BLOCOS (OFICIAIS) ---
const agendaBlocos = [
  {
    id: 1,
    nome: "Bloco Vai ou Raxa",
    data: "11/02 - Quarta",
    horario: "18:00 (Término: 00h)",
    local: "Praça do São Francisco",
    descricao: "Trio: Banda Lazer 🚚 | Palco: Banda 220 Wolts 🎸. Abertura oficial!",
    cor: "#6A0DAD", // Roxo
    inicio: [-1.897890, -55.514952],
    // Rota desenhada (Essa nós já temos!)
    rota: [
      [-1.897890051268547, -55.51495201409074],
      [-1.8963794653955972, -55.51759555520702],
      [-1.9020197553515317, -55.517658771347186],
      [-1.9055291295277215, -55.51765877379913],
      [-1.90871685676251, -55.51773348130409],
      [-1.9102102052954422, -55.5177794560187],
      [-1.9112670357820036, -55.516802493341444],
      [-1.9129212027463325, -55.51482557878221],
      [-1.9133284387226723, -55.51432719099701],
      [-1.9146837535434713, -55.515329475972806],
      [-1.9154938221696796, -55.51594498433202],
      [-1.9151278416501611, -55.51639425344561]
    ],
    itinerario: ["Rua Belém", "Av. Prefeito Nelson Souza", "Rua Dr. Picanço Diniz", "Av. Dom Floriano", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
  {
    id: 2,
    nome: "Mirim Unidos do Umarizal",
    data: "12/02 - Quinta",
    horario: "17:00 (Término: 00h)",
    local: "Canto do 'Seu Augusto' (Umarizal)",
    descricao: "Trio: Banda 220 Wolts 🚚 | Palco: Banda Brisa 🎸.",
    cor: "#00CED1", // Azul Turquesa
    inicio: Fobodromo, // (Ajustar GPS se tiver)
    rota: [],
    itinerario: ["Av. Dom Floriano", "Rua Marechal Rondon", "Trav. Rui Barbosa", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
  {
    id: 3,
    nome: "Serra da Escama",
    data: "13/02 - Sexta",
    horario: "18:00 (Término: 03h)",
    local: "Bar do 'Toca'",
    descricao: "Trio: Banda Show Energia 🚚 | Palco: Neto Moreno e Banda Elite 🎸.",
    cor: "#32CD32", // Verde Lima
    inicio: Fobodromo, // (Ajustar GPS se tiver)
    rota: [],
    itinerario: ["Trav. Rui Barbosa", "Rua Marechal Rondon", "Av. Dom Floriano", "Trav. Antônio Fernandes", "Av. Lauro Sodré", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
  {
    id: 4,
    nome: "Águia Negra",
    data: "14/02 - Sábado",
    horario: "17:00 (Término: 03h)",
    local: "Sede do Bloco (Cidade Nova)",
    descricao: "Trios: Banda Brisa e Banda Lazer 🚚 | Palcos: 220 Wolts e Neto Moreno 🎸.",
    cor: "#000000", // Preto
    inicio: Fobodromo, // (Ajustar GPS se tiver)
    rota: [],
    itinerario: ["Rua Pedro Álvares Cabral", "Trav. Lauro Sodré", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
  {
    id: 5,
    nome: "Xupa Osso",
    data: "15/02 - Domingo",
    horario: "16:00 (Término: 03h)",
    local: "Praça de Sant’Ana",
    descricao: "Trios: 220 Wolts e Show Energia 🚚 | Palcos: Banda Lazer e Neto Moreno 🎸.",
    cor: "#8B0000", // Vermelho
    inicio: Fobodromo, // (Ajustar GPS se tiver)
    rota: [],
    itinerario: ["Rua Marcos Rodrigues de Souza", "Trav. Bom Jesus", "Rua Dep. Raimundo Chaves 'Bacuri'", "Trav. Dr. Machado", "Rua Dr. Picanço Diniz", "Trav. Rui Barbosa", "Rua Marechal Rondon", "Av. Dom Floriano", "Trav. Antônio Fernandes", "Trav. Liberdade", "Rua Antônio Brito de Sousa", "Trav. Bom Jesus", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
  {
    id: 6,
    nome: "Unidos do Morro",
    data: "16/02 - Segunda",
    horario: "17:00 (Término: 03h)",
    local: "Sede do Bloco (Fátima)",
    descricao: "Trios: 220 Wolts e Banda Lazer 🚚 | Palcos: Show Energia e Banda Lazer 🎸.",
    cor: "#FFD700", // Dourado
    inicio: Fobodromo, // (Ajustar GPS se tiver)
    rota: [],
    itinerario: ["Rua Tiradentes", "Av. Prefeito Nelson Souza", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
  {
    id: 7,
    nome: "Bloco das Virgens",
    data: "17/02 - Terça",
    horario: "17:00 (Término: 03h)",
    local: "Praça de Santa Terezinha",
    descricao: "Trios: Neto Moreno e Banda Brisa 🚚 | Palcos: Banda Lazer e Show Energia 🎸.",
    cor: "#FF69B4", // Rosa
    inicio: Fobodromo, // (Ajustar GPS se tiver)
    rota: [],
    itinerario: ["Rua Antônio Brito de Souza", "Trav. Felipe Bentes", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  }
];

function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 15, { duration: 1.5 }); }, [center, map]);
  return null;
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin-mv')
  const [blocoAtual, setBlocoAtual] = useState(agendaBlocos[0]) 
  const [posicaoTrio, setPosicaoTrio] = useState(Fobodromo)
  const [cardAberto, setCardAberto] = useState(true)

  useEffect(() => {
    const checkAdmin = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        window.location.hash = '';
        setIsAdmin(false);
      } else if (hash === '#admin-mv') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
    window.addEventListener('hashchange', checkAdmin);

    const fetchGPS = async () => {
      const { data } = await supabase.from('localizacao_bloco').select('*').eq('id', 1).single()
      if (data) setPosicaoTrio([data.lat, data.lng])
    }
    fetchGPS()
    const canal = supabase.channel('rastreio').on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'localizacao_bloco' }, 
      (payload) => setPosicaoTrio([payload.new.lat, payload.new.lng])
    ).subscribe()
    
    return () => {
      window.removeEventListener('hashchange', checkAdmin);
      supabase.removeChannel(canal);
    }
  }, [])

  const trocarBloco = (direcao) => {
    const indexAtual = agendaBlocos.findIndex(b => b.id === blocoAtual.id);
    let novoIndex = indexAtual + direcao;
    if (novoIndex < 0) novoIndex = agendaBlocos.length - 1; 
    if (novoIndex >= agendaBlocos.length) novoIndex = 0; 
    setBlocoAtual(agendaBlocos[novoIndex]);
    setCardAberto(true);
  }

  const toggleCard = () => {
    setCardAberto(!cardAberto);
  }

  if (isAdmin) return <Admin />

  return (
    <div className="app-container">
      {/* Rodapé */}
      <div className="footer-dev">
        Desenvolvido por <strong>mvsiqueira</strong>
      </div>

      <header className="header-carnaval">
         <img src="/banner.png" alt="Banner CarnaPauxis" className="banner-img" />
      </header>

      <div className="status-pill">
        <span className="live-indicator"></span>
        <span className="status-text">Onde o Bloco tá?</span>
      </div>

      <MapContainer center={blocoAtual.inicio} zoom={15} zoomControl={false} className="mapa-layout">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToLocation center={blocoAtual.inicio} />

        <Marker position={blocoAtual.inicio} icon={iconeConcentracao}>
          <Popup>Saída: {blocoAtual.local}</Popup>
        </Marker>

        <Marker position={Fobodromo} icon={iconeChegada}>
          <Popup>Chegada: Fobódromo 🎉</Popup>
        </Marker>

        <Marker position={posicaoTrio} icon={iconeTrio}>
          <Popup>Trio Elétrico Aqui! 🚚🔊</Popup>
        </Marker>

        {blocoAtual.rota && blocoAtual.rota.length > 0 && (
          <Polyline 
            positions={blocoAtual.rota} 
            pathOptions={{ color: blocoAtual.cor, weight: 5, opacity: 0.8 }} 
          />
        )}
      </MapContainer>

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
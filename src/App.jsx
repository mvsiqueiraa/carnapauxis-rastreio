import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import { supabase } from './supabaseClient'
import Admin from './Admin'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle, FaChevronRight, FaChevronLeft, FaRoute, FaChevronDown, FaChevronUp } from 'react-icons/fa'

// --- ÍCONES PERSONALIZADOS ---
const iconeTrio = new L.Icon({
  iconUrl: '/trio.png',
  iconSize: [60, 60],
  iconAnchor: [30, 30],
  popupAnchor: [0, -30],
  className: 'icone-pulsante'
});

const iconeConcentracao = new L.Icon({
  iconUrl: '/saida.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

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
    cor: "#6A0DAD", 
    inicio: [-1.897890, -55.514952],
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
    horario: "18:00 (Término: 23h)",
    local: "Canto do 'Seu Augusto' (Umarizal)",
    descricao: "Trio: Banda 220 Wolts 🚚 | Palco: Banda Brisa 🎸.",
    cor: "#00CED1", 
    inicio: [-1.9104645301684684, -55.51221132768701], 
    rota: [
      [-1.9104645301684684, -55.51221132768701],
      [-1.9116737572955174, -55.51308291447795],
      [-1.9127454407317686, -55.51160924528918],
      [-1.9143833066432308, -55.51285808953665],
      [-1.914989435667124, -55.512108330155854],
      [-1.9172720090471103, -55.51367976622545],
      [-1.9151723562614507, -55.51632219086294],
      [-1.9150825435302608, -55.51625175775922]
    ],
    itinerario: ["Av. Dom Floriano", "Rua Marechal Rondon", "Trav. Rui Barbosa", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
{
    id: 3,
    nome: "Serra da Escama",
    data: "13/02 - Sexta",
    horario: "18:00 (Término: 03h)",
    local: "Bar do 'Toca'",
    descricao: "Trio: Banda Show Energia 🚚 | Palco: Neto Moreno e Banda Elite 🎸.",
    cor: "#32CD32", 
    // 👇 Início ajustado para o primeiro ponto da rota
    inicio: [-1.9132298099336538, -55.51197571663373], 
    // 👇 ROTA NOVA DO SERRA DA ESCAMA
    rota: [
      [-1.9132298099336538, -55.51197571663373],
      [-1.912756784500388, -55.511632731731],
      [-1.9127373249572912, -55.51161925188123],
      [-1.911583211796298, -55.513179887616005],
      [-1.9104214369931753, -55.512244948365435],
      [-1.910185395375862, -55.512113938722635],
      [-1.9090781087986386, -55.51314555883026],
      [-1.9123347967295388, -55.51568405849075],
      [-1.913270098335559, -55.514425625799376],
      [-1.9149500393611163, -55.512117171605695],
      [-1.9172884196418636, -55.5137207678996],
      [-1.9153167201315995, -55.51611168512518],
      [-1.9151813497934285, -55.5161175740823]
    ],
    itinerario: ["Trav. Rui Barbosa", "Rua Marechal Rondon", "Av. Dom Floriano", "Trav. Antônio Fernandes", "Av. Lauro Sodré", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
{
    id: 4,
    nome: "Águia Negra",
    data: "14/02 - Sábado",
    horario: "18:00 (Término: 03h)",
    local: "Sede do Bloco (Cidade Nova)",
    descricao: "Trios: Banda Brisa e Banda Lazer 🚚 | Palcos: 220 Wolts e Neto Moreno 🎸.",
    cor: "#000000", 
    // 👇 Início ajustado para o primeiro ponto da rota
    inicio: [-1.9054146730700836, -55.51071742589568], 
    // 👇 ROTA NOVA DO ÁGUIA NEGRA
    rota: [
      [-1.9054146730700836, -55.51071742589568],
      [-1.9057912542170925, -55.510270613540925],
      [-1.9065810745859295, -55.51103086142837],
      [-1.907358543255711, -55.51172324382037],
      [-1.9080498240446389, -55.51233749625146],
      [-1.9090662585272753, -55.51316109854535],
      [-1.9093961829071162, -55.513427852190205],
      [-1.9107262950719388, -55.51443838990977],
      [-1.9123310113074012, -55.51568230302945],
      [-1.9132881696618682, -55.514260641486004],
      [-1.9141001143898677, -55.513250818715264],
      [-1.9143990219406675, -55.51283396220829],
      [-1.9149725794012937, -55.512115194388244],
      [-1.9163502051591763, -55.513059997756926],
      [-1.9173306125625516, -55.51373441795744],
      [-1.915498804090177, -55.515936549080735],
      [-1.91499819456034, -55.51650271128895],
      [-1.9148661766000288, -55.51633585857989]
    ],
    itinerario: ["Rua Pedro Álvares Cabral", "Trav. Lauro Sodré", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
{
    id: 5,
    nome: "Xupa Osso",
    data: "15/02 - Domingo",
    horario: "18:00 (Término: 03h)",
    local: "Praça de Sant’Ana",
    descricao: "Trios: 220 Wolts e Show Energia 🚚 | Palcos: Banda Lazer e Neto Moreno 🎸.",
    cor: "#8B0000", 
    // 👇 Início ajustado para o primeiro ponto da rota
    inicio: [-1.9167796405276505, -55.517404850795444], 
    // 👇 ROTA NOVA DO XUPA OSSO
    rota: [
      [-1.9167796405276505, -55.517404850795444],
      [-1.9164133459990467, -55.51697237572402],
      [-1.9155093612930614, -55.517913774398565],
      [-1.9151836745841564, -55.517600681577505],
      [-1.9179386409859092, -55.514196505313535],
      [-1.9148979138531956, -55.51204466388273],
      [-1.9144002347614872, -55.512824958958745],
      [-1.9126701665346104, -55.511638502283304],
      [-1.9116341987394065, -55.51307971018498],
      [-1.910171036567192, -55.51213378492848],
      [-1.9090486262068822, -55.51318472824191],
      [-1.9086732028780062, -55.51381032035337],
      [-1.9124651854568242, -55.5175601203437],
      [-1.9134941706784474, -55.516509817721044],
      [-1.913942157217761, -55.51660754493163],
      [-1.9143343006090419, -55.51681716624651],
      [-1.9145789442743961, -55.51700249837616],
      [-1.9146818759146385, -55.516953677348354],
      [-1.9152101378721795, -55.51627754388302],
      [-1.9150353793088755, -55.51618342986448]
    ],
    itinerario: ["Rua Marcos Rodrigues de Souza", "Trav. Bom Jesus", "Rua Dep. Raimundo Chaves 'Bacuri'", "Trav. Dr. Machado", "Rua Dr. Picanço Diniz", "Trav. Rui Barbosa", "Rua Marechal Rondon", "Av. Dom Floriano", "Trav. Antônio Fernandes", "Trav. Liberdade", "Rua Antônio Brito de Sousa", "Trav. Bom Jesus", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
{
    id: 6,
    nome: "Unidos do Morro",
    data: "16/02 - Segunda",
    horario: "18:00 (Término: 03h)",
    local: "Sede do Bloco (Fátima)",
    descricao: "Trios: 220 Wolts e Banda Lazer 🚚 | Palcos: Show Energia e Banda Lazer 🎸.",
    cor: "#FFD700", 
    // 👇 Início ajustado para o primeiro ponto da rota
    inicio: [-1.9067101777983169, -55.515661973866045], 
    // 👇 ROTA NOVA DO UNIDOS DO MORRO
    rota: [
      [-1.9067101777983169, -55.515661973866045],
      [-1.9060551888524913, -55.51632643985212],
      [-1.905670811813124, -55.51676485396246],
      [-1.9049193361130676, -55.517644733250364],
      [-1.9052234694692771, -55.51765653499173],
      [-1.9071422078924343, -55.51765390561643],
      [-1.9082712566555955, -55.51769824312102],
      [-1.9098007763310392, -55.517789556324914],
      [-1.910171849431407, -55.51777938091935],
      [-1.9114395886773963, -55.51662764777468],
      [-1.9116923416233789, -55.51638502563594],
      [-1.9125335506690675, -55.515404176012254],
      [-1.91327011953031, -55.514393775097645],
      [-1.914212124035032, -55.513074709709514],
      [-1.915034188913424, -55.51209962010972],
      [-1.9172702228431149, -55.51365176488153],
      [-1.9165749642023684, -55.514610274848536],
      [-1.9153775154534998, -55.51607840132753],
      [-1.9151569844346028, -55.51631696369358],
      [-1.9149148936789828, -55.51613128706934]
    ],
    itinerario: ["Rua Tiradentes", "Av. Prefeito Nelson Souza", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  },
{
    id: 7,
    nome: "Bloco das Virgens",
    data: "17/02 - Terça",
    horario: "18:00 (Término: 03h)",
    local: "Praça de Santa Terezinha",
    descricao: "Trios: Neto Moreno e Banda Brisa 🚚 | Palcos: Banda Lazer e Show Energia 🎸.",
    cor: "#FF69B4", 
    // 👇 Início ajustado para o primeiro ponto da rota
    inicio: [-1.9086893197395511, -55.520906734685056], 
    // 👇 ROTA NOVA DO BLOCO DAS VIRGENS
    rota: [
      [-1.9086893197395511, -55.520906734685056],
      [-1.9112077909057774, -55.51867777790932],
      [-1.9106294777243562, -55.517948601157556],
      [-1.9103520193890517, -55.51763749373595],
      [-1.9108692291389815, -55.51716056630433],
      [-1.9115850334333686, -55.516509153855566],
      [-1.9123486181137963, -55.51565033632643],
      [-1.913294418005833, -55.51435468557517],
      [-1.9138550397954646, -55.513572807750975],
      [-1.9147868370341428, -55.51233274288525],
      [-1.9149859672599092, -55.51210902115173],
      [-1.916365539918715, -55.513063528128285],
      [-1.9173161185991887, -55.5137206627505],
      [-1.916264479650863, -55.51496631471754],
      [-1.915670697568359, -55.51575181763893],
      [-1.9151985355986483, -55.51630055506868],
      [-1.9149784232432268, -55.51616012165093]
    ],
    itinerario: ["Rua Antônio Brito de Souza", "Trav. Felipe Bentes", "Rua Dr. Picanço Diniz", "Trav. Dr. Machado", "Rua Justo Chermont", "Chegada: Fobódromo"]
  }
];

// --- FUNÇÃO PARA ACHAR O BLOCO DE HOJE ---
const encontrarBlocoDoDia = () => {
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1; // Janeiro é 0, Fevereiro é 1, então somamos +1

  // Mapeamento: Dia -> ID do Bloco
  const mapaDatas = {
    11: 1, // Vai ou Raxa
    12: 2, // Mirim
    13: 3, // Serra
    14: 4, // Águia
    15: 5, // Xupa Osso
    16: 6, // Morro
    17: 7  // Virgens
  };

  // Se for Fevereiro e o dia estiver no mapa, retorna o bloco certo
  if (mes === 2 && mapaDatas[dia]) {
    return agendaBlocos.find(b => b.id === mapaDatas[dia]) || agendaBlocos[0];
  }

  // Se não for dia de carnaval, retorna o primeiro (Vai ou Raxa)
  return agendaBlocos[0];
};

function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 15, { duration: 1.5 }); }, [center, map]);
  return null;
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin-mv')
  
  // 🆕 INICIA COM O BLOCO DO DIA (AUTOMÁTICO)
  const [blocoAtual, setBlocoAtual] = useState(encontrarBlocoDoDia()) 
  
  const [posicaoTrio, setPosicaoTrio] = useState(Fobodromo)
  const [cardAberto, setCardAberto] = useState(true)
  const [avisoAberto, setAvisoAberto] = useState(true)

  // Timer para fechar o aviso
  useEffect(() => {
    const timer = setTimeout(() => {
      setAvisoAberto(false);
    }, 4000); 
    return () => clearTimeout(timer);
  }, []);

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
      
      {avisoAberto && (
        <div className="popup-aviso">
          <button className="fechar-aviso" onClick={() => setAvisoAberto(false)}>✖</button>
          <p>🔄 Se o trio não mexer, <strong>atualize a página</strong> para ver em tempo real.</p>
          <p>🌐 Funciona melhor no navegador <strong>Google Chrome</strong>.</p>
        </div>
      )}

      <div className="footer-dev">
        Desenvolvido por <strong>mvsiqueira</strong>
      </div>

      <header className="header-carnaval">
         <img src="/banner.png" alt="Banner CarnaPauxis" className="banner-img" />
      </header>

      <div className="status-pill">
        <span className="live-indicator"></span>
        <span className="status-text">Onde tá o Bloco?</span>
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
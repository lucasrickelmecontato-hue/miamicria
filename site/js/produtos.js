/* ---------- Dados dos produtos (usado na home e na página de cada produto) ---------- */

const TAMANHOS = ['P', 'M', 'G', 'GG'];

const PRODUTOS = [
  {
    id: 'sunset-grid',
    nome: 'Vice City Stories',
    desc: 'Estampa gradiente pôr do sol com grid neon',
    preco: 79.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #ff2d95, #ff8a3d)',
    imagens: ['img/produto-1-frente.png', 'img/produto-1-costas.png'],
    midias: [
      { tipo: 'img', src: 'img/produto-1-frente.png' },
      { tipo: 'img', src: 'img/produto-1-costas.png' },
      { tipo: 'video', src: 'video/produto-1-frente.mp4', inicio: 0.6 },
      { tipo: 'video', src: 'video/produto-1-costas.mp4' }
    ]
  },
  {
    id: 'neon-skyline',
    nome: 'Vice Duo',
    desc: 'Silhueta de skyline com contorno turquesa',
    preco: 79.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #2dd9c7, #5a2a8f)',
    imagens: ['img/produto-2-frente.png', 'img/produto-2-costas.jpg'],
    midias: [
      { tipo: 'img', src: 'img/produto-2-frente.png' },
      { tipo: 'img', src: 'img/produto-2-costas.jpg' },
      { tipo: 'video', src: 'video/produto-2-frente.mp4', inicio: 0.6 },
      { tipo: 'video', src: 'video/produto-2-costas.mp4' }
    ]
  },
  {
    id: 'midnight-drive',
    nome: 'Vice Nights',
    desc: 'Tom escuro com detalhe magenta neon',
    preco: 79.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #1a0b2e, #ff2d95)',
    imagens: ['img/produto-4-frente.png', 'img/produto-4-costas.png'],
    midias: [
      { tipo: 'img', src: 'img/produto-4-frente.png' },
      { tipo: 'img', src: 'img/produto-4-costas.png' },
      { tipo: 'video', src: 'video/produto-4-frente.mp4' },
      { tipo: 'video', src: 'video/produto-4-costas.mp4' }
    ]
  },
  {
    id: 'coastal-heat',
    nome: 'Leonida Rex',
    desc: 'Amarelo dourado com respingo rosa',
    preco: 79.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #ffc35c, #ff2d95)',
    imagens: ['img/produto-5-frente.png', 'img/produto-5-costas.png'],
    midias: [
      { tipo: 'img', src: 'img/produto-5-frente.png' },
      { tipo: 'img', src: 'img/produto-5-costas.png' },
      { tipo: 'video', src: 'video/produto-5-frente.mp4', inicio: 0.6 },
      { tipo: 'video', src: 'video/produto-5-costas.mp4' }
    ]
  },
  {
    id: 'off-white-leonida',
    nome: 'Leonida Vacation',
    desc: 'Tom areia com estampa exclusiva nas costas',
    preco: 99.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #e8dcc8, #5a2a8f)',
    imagens: ['img/produto-6-frente.png', 'img/produto-6-costas.png'],
    midias: [
      { tipo: 'img', src: 'img/produto-6-frente.png' },
      { tipo: 'img', src: 'img/produto-6-costas.png' },
      { tipo: 'video', src: 'video/produto-6-frente.mp4' },
      { tipo: 'video', src: 'video/produto-6-costas.mp4' }
    ]
  },
  {
    id: 'preto-e-branco',
    nome: 'Disc Is Not Dead',
    desc: 'Estampa preto e branco com detalhe retro',
    preco: 89.90,
    tag: 'Novo',
    gradiente: 'linear-gradient(160deg, #1a0b2e, #24123f)',
    imagens: ['img/produto-7-frente.jpg', 'img/produto-7-costas.jpg'],
    midias: [
      { tipo: 'img', src: 'img/produto-7-frente.jpg' },
      { tipo: 'img', src: 'img/produto-7-costas.jpg' },
      { tipo: 'video', src: 'video/produto-7-frente.mp4', crop: { scale: 1.8, origin: '50% 12%' } },
      { tipo: 'video', src: 'video/produto-7-costas.mp4', crop: { scale: 1.3, origin: '50% 0%', position: 'center top' } }
    ]
  },
];

/* ---------- Dados dos produtos (usado na home e na página de cada produto) ---------- */

const TAMANHOS = ['P', 'M', 'G', 'GG', 'XG'];

const PRODUTOS = [
  {
    "id": "vice-city-stories",
    "nome": "Vice City Stories",
    "desc": "Estampa gradiente pôr do sol com grid neon",
    "preco": 79.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #ff2d95, #ff8a3d)",
    "imagens": [
      "/img/produto-1-frente.png",
      "/img/produto-1-costas.png"
    ],
    "midias": [
      {
        "tipo": "img",
        "src": "/img/produto-1-frente.png"
      },
      {
        "tipo": "img",
        "src": "/img/produto-1-costas.png"
      },
      {
        "tipo": "video",
        "src": "/video/produto-1-frente.mp4",
        "inicio": 0.6
      },
      {
        "tipo": "video",
        "src": "/video/produto-1-costas.mp4"
      }
    ]
  },
  {
    "id": "vice-duo",
    "nome": "Vice Duo",
    "desc": "Silhueta de skyline com contorno turquesa",
    "preco": 79.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #2dd9c7, #5a2a8f)",
    "imagens": [
      "/img/produto-2-frente.png",
      "/img/produto-2-costas.jpg"
    ],
    "midias": [
      {
        "tipo": "img",
        "src": "/img/produto-2-frente.png"
      },
      {
        "tipo": "img",
        "src": "/img/produto-2-costas.jpg"
      },
      {
        "tipo": "video",
        "src": "/video/produto-2-frente.mp4",
        "inicio": 0.6
      },
      {
        "tipo": "video",
        "src": "/video/produto-2-costas.mp4"
      }
    ]
  },
  {
    "id": "vice-nights",
    "nome": "Vice Nights",
    "desc": "Tom escuro com detalhe magenta neon",
    "preco": 79.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #1a0b2e, #ff2d95)",
    "imagens": [
      "/img/produto-4-frente.png",
      "/img/produto-4-costas.png"
    ],
    "midias": [
      {
        "tipo": "img",
        "src": "/img/produto-4-frente.png"
      },
      {
        "tipo": "img",
        "src": "/img/produto-4-costas.png"
      },
      {
        "tipo": "video",
        "src": "/video/produto-4-frente.mp4"
      },
      {
        "tipo": "video",
        "src": "/video/produto-4-costas.mp4"
      }
    ]
  },
  {
    "id": "leonida-rex",
    "nome": "Leonida Rex",
    "desc": "Amarelo dourado com respingo rosa",
    "preco": 79.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #ffc35c, #ff2d95)",
    "imagens": [
      "/img/produto-5-frente.png",
      "/img/produto-5-costas.png"
    ],
    "midias": [
      {
        "tipo": "img",
        "src": "/img/produto-5-frente.png"
      },
      {
        "tipo": "img",
        "src": "/img/produto-5-costas.png"
      },
      {
        "tipo": "video",
        "src": "/video/produto-5-frente.mp4",
        "inicio": 0.6
      },
      {
        "tipo": "video",
        "src": "/video/produto-5-costas.mp4"
      }
    ]
  },
  {
    "id": "leonida-vacation",
    "nome": "Leonida Vacation",
    "desc": "Tom areia com estampa exclusiva nas costas",
    "preco": 99.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #e8dcc8, #5a2a8f)",
    "imagens": [
      "/img/produto-6-frente.png",
      "/img/produto-6-costas.png"
    ],
    "midias": [
      {
        "tipo": "img",
        "src": "/img/produto-6-frente.png"
      },
      {
        "tipo": "img",
        "src": "/img/produto-6-costas.png"
      },
      {
        "tipo": "video",
        "src": "/video/produto-6-frente.mp4"
      },
      {
        "tipo": "video",
        "src": "/video/produto-6-costas.mp4"
      }
    ]
  },
  {
    "id": "disc-is-not-dead",
    "nome": "Disc Is Not Dead",
    "desc": "Estampa preto e branco com detalhe retro",
    "preco": 89.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #1a0b2e, #24123f)",
    "imagens": [
      "/img/produto-7-frente.jpg",
      "/img/produto-7-costas.jpg"
    ],
    "midias": [
      {
        "tipo": "img",
        "src": "/img/produto-7-frente.jpg"
      },
      {
        "tipo": "img",
        "src": "/img/produto-7-costas.jpg"
      },
      {
        "tipo": "video",
        "src": "/video/produto-7-frente.mp4",
        "crop": {
          "scale": 1.8,
          "origin": "50% 12%"
        }
      },
      {
        "tipo": "video",
        "src": "/video/produto-7-costas.mp4",
        "crop": {
          "scale": 1.3,
          "origin": "50% 0%",
          "position": "center top"
        }
      }
    ]
  },
  {
    "id": "vice-sunset",
    "nome": "Vice Sunset",
    "desc": "Estampa GTA VI com paleta quente de pôr do sol",
    "preco": 79.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #ff8a3d, #ff2d95)",
    "imagens": [
      "/img/produto-8-frente.png",
      "/img/produto-8-costas.png"
    ],
    "midias": [
      {
        "tipo": "img",
        "src": "/img/produto-8-frente.png"
      },
      {
        "tipo": "img",
        "src": "/img/produto-8-costas.png"
      },
      {
        "tipo": "video",
        "src": "/video/produto-8-frente.mp4",
        "inicio": 0.6,
        "crop": {
          "scale": 1.6,
          "origin": "50% 34%"
        }
      },
      {
        "tipo": "video",
        "src": "/video/produto-8-costas.mp4"
      }
    ]
  },
  {
    "id": "igor-brasil-x-mundo",
    "nome": "IGOR — BRASIL X MUNDO",
    "desc": "Collab oficial Miami Cria × Igor, inspirada no vídeo mais assistido dele",
    "preco": 94.9,
    "tag": "Collab",
    "gradiente": "linear-gradient(160deg, #2dd9c7, #ff2d95)",
    "imagens": [
      "/img/produto-9-frente.png",
      "/img/produto-9-costas.png"
    ],
    "midias": [
      {
        "tipo": "img",
        "src": "/img/produto-9-frente.png"
      },
      {
        "tipo": "img",
        "src": "/img/produto-9-costas.png"
      }
    ],
    "cores": [
      {
        "nome": "Preto",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/produto-9-frente.png"
          },
          {
            "tipo": "img",
            "src": "/img/produto-9-costas.png"
          }
        ]
      },
      {
        "nome": "Branco",
        "swatch": "#e9e2d0",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/produto-9-branca-frente.png"
          },
          {
            "tipo": "img",
            "src": "/img/produto-9-branca-costas.png"
          }
        ]
      }
    ],
    "lancamento": {
      "badge": "Edição Collab — Miami Cria × Igor",
      "paragrafos": [
        "Você provavelmente já viu o vídeo.",
        "Um dos momentos que mais rodaram nas redes do Igor agora saiu da tela e virou camiseta.",
        "A estampa eterniza um dos confrontos mais marcantes do brasileiro contra um dos grandes nomes gringos do basquete — aquele tipo de momento que você assiste, reassiste e manda para os amigos.",
        "Agora virou peça."
      ],
      "destaques": [
        "🔥 Collab oficial MIAMI CRIA × IGOR",
        "🏀 Inspirada no vídeo mais assistido do Igor",
        "👕 Modelagem Oversized",
        "☁️ 100% algodão",
        "🇧🇷 Produção nacional"
      ],
      "final": "De um vídeo viral para uma camiseta."
    }
  },
  {
    "id": "caixa-leonida",
    "nome": "CAIXA LEONIDA 📦🌴",
    "desc": "Uma experiência criada para quem realmente vive a estética de Vice City e do universo GTA.\n\nPor R$ 249,90, você recebe um kit exclusivo e cheio de detalhes:\n\n📦 Caixa Leonida\nUma caixa exclusiva inspirada na estética de Vice City / Leonida, feita para você guardar, colecionar e até usar como decoração.\n\n👊 Soco-inglês\nUm item inspirado na estética urbana e clássica do universo GTA.\n\n☕ Caneca GTA VI\nCaneca personalizada com a capa de GTA VI, perfeita para completar a coleção.\n\n🔑 Chaveiro GTA VI personalizado\nUm detalhe exclusivo para levar a estética do jogo com você.\n\n✨ Adesivo holográfico Miami Cria — Edição Limitada\nPersonalizado especialmente para essa edição do press kit.\n\n🚨Emblema da RockStar de decoração.\n\n👕 Camiseta Rex Leonida\nA camiseta exclusiva da coleção Caixa Leonida, criada especialmente para acompanhar esse kit.\n\n🔥 Tudo isso em uma única caixa por R$ 249,90.\n\nNão é só um press kit.\nÉ uma peça da Miami Cria feita para quem é fã, coleciona e vive essa estética.\n\nMiami Cria — de fã pra fã.",
    "preco": 249.9,
    "tag": "Uma experiência criada para quem realmente vive a estética de Vice City e do universo GTA.  Por R$ 249,90, você recebe um kit exclusivo e cheio de detalhes:  📦 Caixa Leonida Uma caixa exclusiva inspirada na estética de Vice City / Leonida, feita para você guardar, colecionar e até usar como decoração.  👊 Soco-inglês Um item inspirado na estética urbana e clássica do universo GTA.  ☕ Caneca GTA VI Caneca personalizada com a capa de GTA VI, perfeita para completar a coleção.  🔑 Chaveiro GTA VI personalizado Um detalhe exclusivo para levar a estética do jogo com você.  ✨ Adesivo holográfico Miami Cria — Edição Limitada Personalizado especialmente para essa edição do press kit.  🚨Emblema da RockStar de decoração.  👕 Camiseta Rex Leonida A camiseta exclusiva da coleção Caixa Leonida, criada especialmente para acompanhar esse kit.  🔥 Tudo isso em uma única caixa por R$ 249,90.  Não é só um press kit. É uma peça da Miami Cria feita para quem é fã, coleciona e vive essa estética.  Miami Cria — de fã pra fã.",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/caixa-leonida-frente-1790270845594.jpg",
      "/img/caixa-leonida-costas-1790300038928.png"
    ],
    "esgotado": false
  }
];

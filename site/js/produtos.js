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
      "/img/vice-city-stories-preta-frente-1791927948945.png",
      "/img/vice-city-stories-preta-costas-1791928138352.png"
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
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-city-stories-preta-frente-1791927948945.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-city-stories-preta-costas-1791928138352.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-city-stories-off-white-frente-1791929968523.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-city-stories-off-white-costas-1791930066056.png"
          }
        ]
      }
    ],
    "ordem": 8
  },
  {
    "id": "vice-nights",
    "nome": "Vice Nights",
    "desc": "Tom escuro com detalhe magenta neon",
    "preco": 79.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #1a0b2e, #ff2d95)",
    "imagens": [
      "/img/vice-nights-off-white-frente-1791927801490.png",
      "/img/vice-nights-off-white-costas-1791927803527.png"
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
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-nights-off-white-frente-1791927801490.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-nights-off-white-costas-1791927803527.png"
          }
        ]
      },
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-nights-preta-frente-1791928352432.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-nights-preta-costas-1791928420974.png"
          }
        ]
      }
    ],
    "ordem": 9
  },
  {
    "id": "leonida-rex",
    "nome": "Leonida Rex",
    "desc": "",
    "preco": 79.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #ffc35c, #ff2d95)",
    "imagens": [
      "/img/leonida-rex-preta-frente-1791928468952.png",
      "/img/leonida-rex-preta-costas-1791928494883.png"
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
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/leonida-rex-preta-frente-1791928468952.png"
          },
          {
            "tipo": "img",
            "src": "/img/leonida-rex-preta-costas-1791928494883.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/leonida-rex-off-white-frente-1791930113435.png"
          },
          {
            "tipo": "img",
            "src": "/img/leonida-rex-off-white-costas-1791930119439.png"
          }
        ]
      }
    ],
    "ordem": 10
  },
  {
    "id": "leonida-vacation",
    "nome": "Leonida Vacation",
    "desc": "Tom areia com estampa exclusiva nas costas",
    "preco": 94.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #e8dcc8, #5a2a8f)",
    "imagens": [
      "/img/leonida-vacation-frente-1790518185438.png",
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
    ],
    "esgotado": false,
    "ordem": 13
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
    ],
    "ordem": 12
  },
  {
    "id": "vice-sunset",
    "nome": "Vice Sunset",
    "desc": "Estampa GTA VI com paleta quente de pôr do sol",
    "preco": 79.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #ff8a3d, #ff2d95)",
    "imagens": [
      "/img/vice-sunset-preta-frente-1791928625207.png",
      "/img/vice-sunset-preta-costas-1791928635433.png"
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
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-sunset-preta-frente-1791928625207.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-sunset-preta-costas-1791928635433.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-sunset-off-white-frente-1791928639856.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-sunset-off-white-costas-1791928644971.png"
          }
        ]
      }
    ],
    "ordem": 11
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
    },
    "ordem": 14
  },
  {
    "id": "caixa-leonida",
    "nome": "CAIXA LEONIDA 📦🌴",
    "desc": "",
    "preco": 249.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/caixa-leonida-frente-1790270845594.jpg",
      "/img/caixa-leonida-costas-1790914190040.png"
    ],
    "esgotado": false,
    "ordem": 1
  },
  {
    "id": "vice-leonida-off",
    "nome": "VICE CITY LEONIDA",
    "desc": "",
    "preco": 94.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/vice-leonida-off-off-white-frente-1791928214170.png",
      "/img/vice-leonida-off-off-white-costas-1791928217966.png"
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-leonida-off-off-white-frente-1791928214170.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-leonida-off-off-white-costas-1791928217966.png"
          }
        ]
      },
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-leonida-off-preta-frente-1791928223920.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-leonida-off-preta-costas-1791928227765.png"
          }
        ]
      }
    ],
    "ordem": 7
  },
  {
    "id": "collab-makauli-off",
    "nome": "COLLAB x MAKAULI",
    "desc": "",
    "preco": 94.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/collab-makauli-off-preta-frente-1791928693102.png",
      "/img/collab-makauli-off-preta-costas-1791929349900.png"
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/collab-makauli-off-preta-frente-1791928693102.png"
          },
          {
            "tipo": "img",
            "src": "/img/collab-makauli-off-preta-costas-1791929349900.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/collab-makauli-off-off-white-frente-1791929280740.png"
          },
          {
            "tipo": "img",
            "src": "/img/collab-makauli-off-off-white-costas-1791929347601.png"
          }
        ]
      }
    ],
    "ordem": 16
  },
  {
    "id": "caneca-gta6",
    "nome": "Caneca GTA VI",
    "desc": "Caneca de cerâmica com arte exclusiva de GTA VI",
    "preco": 39.9,
    "tag": "Novo",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/produto-10-frente.jpg"
    ],
    "tamanhos": [
      "Único"
    ],
    "ordem": 17
  },
  {
    "id": "boneco",
    "nome": "JACARÉ BONECO",
    "desc": "",
    "preco": 109.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/boneco-frente-1791579829263.jpg",
      "/img/boneco-costas-1791579964514.jpg"
    ],
    "esgotado": true,
    "tamanhos": [
      "Único"
    ],
    "ordem": 18,
    "tipo": "objeto"
  },
  {
    "id": "gabriel-street",
    "nome": "COLLAB x GABRIEL STREET",
    "desc": "",
    "preco": 94.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/gabriel-street-preta-frente-1791929871403.png",
      "/img/gabriel-street-preta-costas-1791929876676.png"
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/gabriel-street-preta-frente-1791929871403.png"
          },
          {
            "tipo": "img",
            "src": "/img/gabriel-street-preta-costas-1791929876676.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/gabriel-street-off-white-frente-1791929881963.png"
          },
          {
            "tipo": "img",
            "src": "/img/gabriel-street-off-white-costas-1791929886799.png"
          }
        ]
      }
    ],
    "ordem": 15
  },
  {
    "id": "vice-flamingo",
    "nome": "VICE FLAMINGO",
    "desc": "",
    "preco": 94.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/vice-flamingo-preta-frente-1791946050212.png",
      "/img/vice-flamingo-preta-costas-1791946052257.png"
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-flamingo-preta-frente-1791946050212.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-flamingo-preta-costas-1791946052257.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-flamingo-off-white-frente-1791946058494.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-flamingo-off-white-costas-1791946060496.png"
          }
        ]
      }
    ],
    "drop": 2,
    "ordem": 4
  },
  {
    "id": "vice-neon",
    "nome": "VICE NEON",
    "desc": "",
    "preco": 94.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/vice-neon-preta-frente-1791946190891.png",
      "/img/vice-neon-preta-costas-1791946193205.png"
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-neon-preta-frente-1791946190891.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-neon-preta-costas-1791946193205.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-neon-off-white-frente-1791946198150.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-neon-off-white-costas-1791946200716.png"
          }
        ]
      }
    ],
    "drop": 2,
    "ordem": 3
  },
  {
    "id": "vice-heat",
    "nome": "VICE HEAT",
    "desc": "",
    "preco": 94.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/heat-vice-preta-frente-1791946697496.png",
      "/img/heat-vice-preta-costas-1791946701981.png"
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/heat-vice-preta-frente-1791946697496.png"
          },
          {
            "tipo": "img",
            "src": "/img/heat-vice-preta-costas-1791946701981.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/heat-vice-off-white-frente-1791946706624.png"
          },
          {
            "tipo": "img",
            "src": "/img/heat-vice-off-white-costas-1791946710053.png"
          }
        ]
      }
    ],
    "drop": 2,
    "ordem": 2
  },
  {
    "id": "vice-stickers",
    "nome": "VICE STICKERS (ESTAMPA BIG)",
    "desc": "",
    "preco": 139.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/vice-stickers-preta-frente-1791946967172.png",
      "/img/vice-stickers-preta-costas-1791946969201.png"
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-stickers-preta-frente-1791946967172.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-stickers-preta-costas-1791946969201.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-stickers-off-white-frente-1791946971252.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-stickers-off-white-costas-1791946974295.png"
          }
        ]
      }
    ],
    "drop": 2,
    "ordem": 5
  },
  {
    "id": "vice-duo",
    "nome": "VICE DUO (ESTAMPA BIG)",
    "desc": "",
    "preco": 139.9,
    "tag": "",
    "gradiente": "linear-gradient(160deg, #5a2a8f, #ff2d95)",
    "imagens": [
      "/img/vice-duo-preta-frente-1791947103134.png",
      "/img/vice-duo-preta-costas-1791947106778.png"
    ],
    "esgotado": false,
    "cores": [
      {
        "nome": "Preta",
        "swatch": "#0d0616",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-duo-preta-frente-1791947103134.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-duo-preta-costas-1791947106778.png"
          }
        ]
      },
      {
        "nome": "Off-white",
        "swatch": "#ece6d6",
        "midias": [
          {
            "tipo": "img",
            "src": "/img/vice-duo-off-white-frente-1791947114092.png"
          },
          {
            "tipo": "img",
            "src": "/img/vice-duo-off-white-costas-1791947117352.png"
          }
        ]
      }
    ],
    "drop": 2,
    "ordem": 6
  }
];

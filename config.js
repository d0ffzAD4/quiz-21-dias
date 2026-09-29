// Configuração da oferta. Edite aqui — não precisa mexer em funnel.js/app.js.
// Qualquer chave abaixo pode ser usada nos textos como {{chave}}.
window.QUIZ_CONFIG = {
  produto: 'Calistenia das 30+',     // nome da oferta (topo, textos, preço e resultado)
  logo: '',                          // URL da logo; vazio = nome da oferta em texto
  corTema: '#f59e0b',                // cor principal

  checkout: '',                      // link do checkout (Hotmart, Kiwify...). UTMs da página são repassadas.
  preco: 'R$ 47,00',
  preco_de: 'R$ 197,00',
  parcelas: 'OU 6x R$ 8,82',
  acesso: 'ACESSO POR UM ANO INTEIRO',

  cnpj: '',                          // preenchido = aparece no rodapé da primeira tela

  gtm: '',                           // ID do Google Tag Manager (ex.: GTM-XXXXXXX); opcional
  rodape: '',                        // texto pequeno no rodapé de todas as etapas; opcional

  // Trocar uma imagem ou pôr um vídeo: a chave é o ID da camada/opção em funnel.js
  mostrarPlaceholders: false,        // true = mostra as caixas "Sua imagem aqui" onde falta imagem
  imagens: {
    // 'sopjkw': 'img/minha-foto.webp',
  },
  videos: {
    // 'ID': 'https://www.youtube.com/embed/XXXXXXXX',
  },
};

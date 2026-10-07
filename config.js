// Configuração da oferta. Edite aqui — não precisa mexer em funnel.js/app.js.
// Qualquer chave abaixo pode ser usada nos textos como {{chave}}.
window.QUIZ_CONFIG = {
  produto: 'Calistenia das 30+',     // nome da oferta (topo, textos, preço e resultado)
  logo: 'img/logo.webp',             // URL da logo; vazio = nome da oferta em texto
  corTema: '#f97316',                // cor principal (laranja da logo)

  checkout: 'https://go.perfectpay.com.br/PPU38CQGO4U', // PerfectPay; UTMs da página são repassadas
  preco: 'R$ 27,90',
  preco_de: 'R$ 197,00',
  parcelas: 'OU EM ATÉ 5x NO CARTÃO',  // checkout aceita até 5x; troque pelo valor exato da parcela se quiser (ex.: 'OU 5x DE R$ X,XX')
  acesso: 'ACESSO POR UM ANO INTEIRO',

  // Bônus em destaque na página de venda. valor (opcional) aparece riscado: 'R$ 47,00'
  bonus: [
    { emoji: '🥗', titulo: 'Plano Antiflacidez com receitas', texto: 'Receitas simples para acompanhar o desafio e deixar o corpo mais firme.', valor: '' },
    { emoji: '🧘‍♀️', titulo: 'Rotina de mobilidade e alongamento', texto: 'Exercícios para proteger joelhos e coluna e reduzir as dores do dia a dia.', valor: '' },
    { emoji: '⚡', titulo: 'Treinos Express de 10 minutos', texto: 'Para os dias corridos: circuitos curtos de calistenia para não perder o ritmo do desafio.', valor: '' },
  ],

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

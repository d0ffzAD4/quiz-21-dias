// Configuração da oferta. Edite aqui — não precisa mexer em funnel.js/app.js.
// Qualquer chave abaixo pode ser usada nos textos como {{chave}}.
window.QUIZ_CONFIG = {
  produto: 'Desafio 21 Dias',        // nome do produto (aparece no topo, no preço e no resultado)
  logo: '',                          // URL da logo; vazio = mostra o nome do produto em texto
  corTema: '#f59e0b',                // cor principal

  checkout: '',                      // link do checkout (Hotmart, Kiwify...). UTMs da página são repassadas.
  preco: 'R$ 47,00',
  preco_de: 'R$ 197,00',
  parcelas: 'OU 6x R$ 8,82',

  cnpj: '00.000.000/0000-00',
  prova_social: '+X mil',            // etapa 2: "+X mil mulheres depois dos 40 anos..."
  bio: 'Escreva aqui a apresentação de quem conduz o desafio.',

  gtm: '',                           // ID do Google Tag Manager (ex.: GTM-XXXXXXX); opcional
  rodape: '',                        // texto pequeno no rodapé de todas as etapas; opcional

  // Imagens e vídeos: a chave é o id que aparece em quiz/IMAGENS.md
  mostrarPlaceholders: true,         // false = esconde as caixas "Sua imagem aqui" sem imagem definida
  imagens: {
    // 'sopjkw': 'https://.../35-45-anos.jpg',
  },
  videos: {
    // 't6hkxs': 'https://www.youtube.com/embed/XXXXXXXX',
  },
};

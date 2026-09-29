# Calistenia das 30+ · Quiz

Quiz de 42 etapas que leva ao desafio de 21 dias de calistenia. Site estático (HTML/CSS/JS puro), sem build, publicado na Vercel a cada envio para a `main`.

- `config.js`: nome da oferta, checkout, preços, acesso, CNPJ, GTM e troca de imagens
- `funnel.js`: as etapas, textos, opções e navegação
- `app.js` / `style.css`: funcionamento e visual
- `img/`: imagens em WebP, já no tamanho em que aparecem

## Trocar uma imagem

Suba o arquivo em `img/` e aponte o ID em `config.js`:

```js
imagens: { 'sopjkw': 'img/minha-foto.webp' },
```

O ID é o `id` da camada (ou da opção) em `funnel.js`. Para abrir direto uma etapa: `/?etapa=N` (N começa em 0).

Prefira WebP com no máximo 900 px de largura (imagens de opção: 240 px).

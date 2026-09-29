# Quiz 21 dias

Site estático (HTML/CSS/JS puro), sem build. Na Vercel: Add New → Project → importar este repositório → Deploy (Framework: Other).

- `config.js`: produto, checkout, preços, CNPJ, logo, imagens extras
- `funnel.js`: as 42 etapas
- `img/`: imagens

As imagens ilustrativas estão em `img/`. Os espaços abaixo ficaram vazios (eram fotos de pessoas reais, depoimentos, antes/depois ou peças com a marca original). Para preencher um espaço, use o ID em `config.js`:

```js
imagens: { 'ID': 'https://.../arquivo.jpg' },
videos:  { 'ID': 'https://www.youtube.com/embed/...' },
```

Para abrir direto uma etapa: `/quiz?etapa=N` (N começa em 0 = etapa 1).

| Etapa | Tela | ID | Onde |
|---|---|---|---|
| 2 | {{prova_social}} mulheres depois dos 40 anos já transformara | `Ywa1MR` | imagem |
| 3 | Você já experimentou treinos de Reativação Muscular em casa  | `6c15XE` | imagem |
| 4 | O treino de Reativação Muscular é uma opção de condicionamen | `R51tvA` | imagem |
| 5 | Você vai amar! Nosso desafio ajuda você a ficar com o corpo  | `0euVmx` | imagem |
| 15 | Nós iremos te ajudar! 😃 Você encontrará no desafio, exercíc | `CXxy9T` | imagem |
| 16 | Nós iremos te ajudar! 😃 Você encontrará no desafio, exercíc | `nkKJhK` | imagem |
| 17 | Nós iremos te ajudar! 😃 Você encontrará no desafio, exercíc | `MKfUZX` | imagem |
| 18 | Você já faz alguma atividade física? 🏃‍♀️ | `xcpfGm` | imagem |
| 20 | Como você descreveria seu dia normalmente? | `arXrXb` | opção: Faço pausas regularmente |
| 22 | O Desafio ajudará você a recuperar massa muscular, dando mai | `wJHclw` | imagem |
| 37 | Mulheres que transformaram seus corpos depois dos 40 anos 😍 | `eiaHV4` | carrossel, slide 1 |
| 37 | Mulheres que transformaram seus corpos depois dos 40 anos 😍 | `FEYmcR` | carrossel, slide 2 |
| 40 | Milhares de mulheres transformadas | `eiaHV4` | carrossel, slide 1 |
| 40 | Milhares de mulheres transformadas | `FEYmcR` | carrossel, slide 2 |
| 40 | Milhares de mulheres transformadas | `wuWve1` | carrossel, slide 3 |
| 40 | Milhares de mulheres transformadas | `Heouy5` | carrossel, slide 4 |
| 41 | {{nome}}, O seu {{produto}} está pronto! | `KTNYmo` | imagem |
| 42 | {{nome}}, O seu {{produto}} está pronto! | `5u9knP` | imagem |
| 42 | {{nome}}, O seu {{produto}} está pronto! | `cazmCj` | imagem |
| 42 | {{nome}}, O seu {{produto}} está pronto! | `t6hkxs` | vídeo (URL de embed) |
| 42 | {{nome}}, O seu {{produto}} está pronto! | `GKJo09` | vídeo (URL de embed) |
| 42 | {{nome}}, O seu {{produto}} está pronto! | `Gx4JRq` | imagem |
| 42 | {{nome}}, O seu {{produto}} está pronto! | `mhzye7` | imagem |

# Zephýr Café

Site responsivo em HTML, CSS e JavaScript, pronto para o GitHub Pages. Não precisa instalar dependências nem executar build.

## Publicar no GitHub Pages

1. Crie um repositório e envie **o conteúdo desta pasta**, incluindo a pasta `assets`. O arquivo `index.html` deve ficar na raiz do repositório.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch que contém os arquivos (normalmente `main`) e a pasta **/ (root)**. Clique em **Save**.
5. Quando a publicação terminar, o GitHub mostrará o link do site nessa mesma tela.

## Arquivos

- `index.html`: conteúdo e estrutura.
- `styles.css`: visual, responsividade e animações.
- `app.js`: filtros, scroll, galeria, sugestões de café e cópia do endereço.
- `assets/`: 13 fotos originais selecionadas e ícone do site.
- `.nojekyll`: mantém a publicação como um site estático simples.

## Editar e visualizar

Abra `index.html` no navegador. Mantenha os três arquivos e a pasta `assets` juntos. Os caminhos são relativos e funcionam também quando o GitHub Pages publica o site dentro do caminho do repositório.

Para alterar textos, endereço e links, edite `index.html`. As sugestões de café e o horário regular de funcionamento estão em `app.js`. O status usa o fuso `America/Sao_Paulo`; feriados devem ser confirmados com a cafeteria.

As fotos, os estilos e as interações são locais. As fontes web são opcionais, com fontes do sistema como alternativa. Cardápio, WhatsApp, Instagram, iFood e rotas abrem os serviços oficiais e precisam de conexão à internet.

## Conteúdo

Fachada na abertura, seis destaques do cardápio, três momentos de scroll e galeria com fotos exclusivas, sem repetição entre seções. Animações respeitam a preferência de movimento reduzido.

Dados de referência: https://www.zephyrcafe.com.br/ (27/10/2026). Fotografias fornecidas pelo usuário, preservadas sem alteração.

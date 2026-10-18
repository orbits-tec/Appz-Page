# Appz — Site

Site estático em português brasileiro e inglês americano, com apresentação do Appz, carrossel, Recursos e Política de Privacidade.

## Executar localmente

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Abra http://127.0.0.1:4173. Sem dependências ou build; também é possível abrir `index.html` diretamente.

O cabeçalho mostra o ícone e a marca Appz em negrito, com a navegação à direita e o link Download para a App Store. A seção Recursos reúne galerias por função. Cada miniatura abre um sheet com navegação restrita ao respectivo conjunto de imagens.

O tema inicial acompanha o sistema. O botão no cabeçalho alterna entre claro e escuro e salva a escolha neste navegador quando o armazenamento local está disponível.

A apresentação percorre `01.png`, `02.png`, `03.png`, `04.png` e `05.png` a cada cinco segundos. Permite arrastar, usar as setas do teclado, selecionar pelos indicadores e pausar. O avanço pausa ao interagir com o componente ou sair da aba. A preferência do sistema por movimento reduzido desativa o avanço automático inicialmente.

## Idiomas

O botão English/Português antes do tema alterna entre português brasileiro e inglês americano, preservando a posição da página e salvando a escolha neste navegador. As traduções estão em `i18n.js`; imagens e âncoras são compartilhadas. Textos de acessibilidade, controles, metadados e conteúdo dos sheets também acompanham o idioma.

# Em formação · Fisioterapeutas do Sono

Página responsiva da campanha Black Friday 2026, identificada como **Em formação** para diferenciá-la de outras duas páginas previstas, inspiradas neste site. Nome do repositório: `em-formacao`.

## Conteúdo

- Abertura com três momentos de rolagem no desktop e apresentação direta no celular.
- Curso E se for o Sono? e assinatura anual do Clube de Estudos.
- Galeria de especialistas, depoimentos em vídeo, bônus e cursos avulsos.
- Atendimento pelo WhatsApp a partir do FAQ, sem formulário.
- Oferta para fisioterapeutas e multiprofissionais do sono, com a marca oficial e a arte da campanha.
- Conteúdo do combo detalhado na oferta e FAQ com 11 perguntas.
- Compatibilidade com a preferência por movimento reduzido.

## Visualizar localmente

Abra `index.html` no navegador. Para visualizar os depoimentos dentro da página, use um servidor estático:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Depois acesse `http://127.0.0.1:4173/`.

## GitHub Pages

A página não exige instalação de dependências nem etapa de compilação. O arquivo `index.html` e os recursos estão na raiz do repositório.

Em **Settings → Pages**, selecione **Deploy from a branch**, a branch **main** e a pasta **/(root)**. O GitHub mostrará o endereço do site nessa tela depois da publicação.

O arquivo `.nojekyll` mantém a publicação como site estático.

## Configuração

Edite `config.js` para adicionar os links de compra e atualizar o link de atendimento em `whatsappLink`.

O checkout do combo já usa o link Hotmart informado em 14/11/2026. Os demais CTAs da campanha levam ao bloco da oferta. Os 7 cursos avulsos aguardam seus links e apresentam “Inscrições em breve”; cada botão é ativado automaticamente quando seu link HTTPS é preenchido.

O formulário foi removido. O botão final e o botão flutuante usam `https://wa.link/qekp5g`. O flutuante aparece quando o visitante chega ao FAQ e se oculta novamente se retornar para antes dele.

O prazo de retirada do bônus é configurado em `bonusDeadline`, com fuso horário explícito. O conteúdo com prazo é removido da oferta, da seção de bônus e do FAQ simultaneamente. A alteração equivalente no checkout deve ser feita na própria plataforma de venda.

Os valores, os prazos, os profissionais e os depoimentos foram preservados do material fornecido. As imagens e marcas pertencem aos respectivos titulares.

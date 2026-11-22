window.SITE = {
  nome: "Clube de Estudos do Sono",

  whatsapp: {
    numero: "5531983988282", // atendimento (mesmo número do wa.link/ckaxg3)
    mensagem: "Olá! Quero saber mais sobre o Clube de Estudos do Sono.",
  },

  // Formulário removido a pedido (22/11/2026): o contato é só pelo WhatsApp.
  contato: null,

  // VSL: cole aqui o endereço do vídeo. Aceita arquivo .mp4 (ex.: "assets/vsl.mp4"),
  // link do YouTube, do Vimeo ou o link de incorporação (embed) do Panda Video.
  // Vazio = o bloco do vídeo fica escondido no site publicado (no localhost aparece a moldura).
  vsl: {
    url: "",
    capa: "", // opcional: imagem de capa para .mp4 (ex.: "assets/vsl-capa.webp")
  },

  frames: {
    total: 160, // valor impresso pelo fatiar_frames.sh
    desktop: "assets/frames/desktop/f_{n}.webp",
    mobile: "assets/frames/mobile/f_{n}.webp",
  },
};

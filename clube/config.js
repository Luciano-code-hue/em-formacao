window.SITE = {
  nome: "Clube de Estudos do Sono",

  whatsapp: {
    numero: "5531983988282", // atendimento (mesmo número do wa.link/ckaxg3)
    mensagem: "Olá! Quero saber mais sobre o Clube de Estudos do Sono.",
  },

  // Formulário removido a pedido (22/11/2026): o contato é só pelo WhatsApp.
  contato: null,

  // VSL do 1º bloco (vídeo vertical 9:16, versão de 27/11/2026 comprimida para a web).
  // Para trocar o vídeo, substitua assets/vsl/vsl-clube.mp4 (e a capa) mantendo os nomes.
  vsl: {
    url: "assets/vsl/vsl-clube.mp4",
    capa: "assets/vsl/vsl-capa.webp",
  },

  frames: {
    total: 160, // valor impresso pelo fatiar_frames.sh
    desktop: "assets/frames/desktop/f_{n}.webp",
    mobile: "assets/frames/mobile/f_{n}.webp",
  },
};

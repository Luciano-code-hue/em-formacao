(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = matchMedia("(max-width: 760px)").matches;


  /* ── Rolagem que toca o vídeo ─────────────────────────────────────────── */
  const cine = document.querySelector(".cine");
  const canvas = cine && cine.querySelector(".cine-canvas");
  if (cine && canvas && S.frames && S.frames.total) {
    const ctx = canvas.getContext("2d");
    const total = S.frames.total;
    const padrao = celular ? S.frames.mobile : S.frames.desktop;
    const src = (i) => padrao.replace("{n}", String(i + 1).padStart(4, "0"));
    const quadros = new Array(total);
    const momentos = [...cine.querySelectorAll(".momento")];
    let alvo = 0, atual = 0, desenhado = -1;

    const carregar = (i) => {
      if (quadros[i]) return quadros[i];
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      img.onload = () => { if (Math.round(atual) === i || desenhado === -1) desenhar(i, true); };
      return (quadros[i] = img);
    };

    // Carrega em passadas (1 a cada 8, depois 1 a cada 4…) para cobrir o filme inteiro cedo
    carregar(0);
    if (!reduzir) {
      const fila = [];
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0;
      const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 40); };
      lote();
    }

    const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const maisProximo = (i) => {
      for (let d = 0; d < total; d++) {
        if (pronto(i - d)) return i - d;
        if (pronto(i + d)) return i + d;
      }
      return -1;
    };

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      desenhado = -1;
      desenhar(Math.round(atual), true);
    };

    function desenhar(i, forcar) {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j];
      const cw = canvas.width, ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    }

    const progresso = () => {
      const r = cine.getBoundingClientRect();
      const curso = cine.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };

    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        m.classList.toggle("ativo", p >= de && (p < ate || (ate >= 1 && p >= 1)));
      }
      cine.classList.toggle("andou", p > 0.02);
    };

    const quadro = () => {
      alvo = progresso() * (total - 1);
      atual += (alvo - atual) * 0.18; // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      desenhar(Math.round(atual));
      atualizarMomentos(atual / (total - 1));
      requestAnimationFrame(quadro);
    };

    addEventListener("resize", ajustar);
    ajustar();
    if (reduzir) atualizarMomentos(0);
    else requestAnimationFrame(quadro);
  }

  /* ── Parallax leve nas artes ──────────────────────────────────────────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    const mover = () => {
      for (const a of artes) {
        const r = a.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        a.style.transform = `translate3d(0, ${(c * -60).toFixed(1)}px, 0) scale(1.08)`;
      }
    };
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    mover();
  }

  /* ── Topo, revelar e ano ──────────────────────────────────────────────── */
  const topo = document.querySelector(".topo");
  const whats = document.querySelector(".whats");
  // Fecha as outras perguntas do FAQ quando uma é aberta
  document.querySelectorAll(".faq details").forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) document.querySelectorAll(".faq details[open]").forEach((o) => o !== d && (o.open = false));
  }));
  // WhatsApp flutuante: aparece a partir do 2º bloco (o 1º fica só com a VSL)
  const vslEl = document.getElementById("vsl");
  const aoRolar = () => {
    const passouDaVsl = !vslEl || vslEl.getBoundingClientRect().bottom < innerHeight * 0.45;
    whats && whats.classList.toggle("visivel", passouDaVsl);
  };
  addEventListener("scroll", aoRolar, { passive: true });
  addEventListener("resize", aoRolar);
  aoRolar();

  /* ── VSL do 1º bloco: começa sem som; o clique recomeça do início com som ── */
  const vslSecao = document.getElementById("vsl");
  const v = vslSecao && vslSecao.querySelector(".vsl-player");
  if (v) {
    const somBtn = vslSecao.querySelector(".vsl-som");
    const enviar = (acao, extra) => { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: "clube_vsl", acao }, extra || {})); };
    const url = (S.vsl && S.vsl.url) || "assets/vsl/vsl-clube.mp4";
    if (S.vsl && S.vsl.capa) v.poster = S.vsl.capa;
    v.src = url;
    v.muted = true;
    const tentar = v.play();
    // Se o navegador bloquear o início automático (ex.: modo economia do iPhone), o convite muda.
    const parado = () => {
      vslSecao.classList.add("vsl--parado");
      somBtn.querySelector(".vsl-som-texto").innerHTML = "<strong>Assista ao vídeo</strong>Toque para começar com som";
    };
    if (tentar) tentar.catch(parado);
    const comSom = () => {
      v.muted = false; v.currentTime = 0; v.controls = true;
      v.play().catch(() => {});
      somBtn.hidden = true;
      vslSecao.classList.remove("vsl--parado");
      enviar("play_com_som");
    };
    somBtn.addEventListener("click", comSom);
    v.addEventListener("volumechange", () => { if (!v.muted && !somBtn.hidden) { somBtn.hidden = true; v.controls = true; } });
    // Sem som, repete só o comecinho (gancho) para não "gastar" o vídeo antes do clique.
    v.addEventListener("timeupdate", () => { if (v.muted && !somBtn.hidden && v.currentTime > 28) v.currentTime = 0; });
    // Retenção: 25, 50, 75 e 100% (só conta quem está ouvindo).
    const marcos = [25, 50, 75, 95]; const vistos = new Set();
    v.addEventListener("timeupdate", () => {
      if (v.muted || !v.duration) return;
      const pct = (v.currentTime / v.duration) * 100;
      marcos.forEach((m) => { if (pct >= m && !vistos.has(m)) { vistos.add(m); enviar("assistiu", { percentual: m === 95 ? 100 : m }); } });
    });
    v.addEventListener("ended", () => { vslSecao.classList.add("vsl--fim"); });
    const cta = vslSecao.querySelector("[data-vsl-cta]");
    cta && cta.addEventListener("click", () => enviar("clique_cta", { segundo: Math.round(v.currentTime || 0) }));
    // Pausa sozinho se a pessoa rolar a página e o vídeo sair da tela (volta se estava ouvindo).
    let estavaTocando = false;
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { estavaTocando = !v.paused && !v.muted; v.pause(); }
      else if (v.muted && !somBtn.hidden) v.play().catch(() => {});
      else if (estavaTocando) v.play().catch(() => {});
    }, { threshold: 0.25 }).observe(v);
  }

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
  }), { threshold: 0.18 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── WhatsApp ─────────────────────────────────────────────────────────── */
  if (S.whatsapp) {
    const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
    const link = `https://wa.me/${num}?text=${encodeURIComponent(S.whatsapp.mensagem || "")}`;
    document.querySelectorAll("[data-whats]").forEach((a) => (a.href = link));
  }

  /* ── Formulário → e-mail ──────────────────────────────────────────────── */
  const form = document.querySelector(".form");
  if (form && S.contato) {
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const avisar = (txt, tipo) => { status.textContent = txt; status.className = `form-status campo--inteiro ${tipo || ""}`; };

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (form.elements._honey.value) return; // robô
      let valido = true;
      form.querySelectorAll("[required]").forEach((c) => {
        const ok = c.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value) : c.value.trim().length > 1;
        c.closest(".campo").classList.toggle("erro", !ok);
        if (!ok) valido = false;
      });
      if (!valido) return avisar("Confira os campos destacados.", "falha");

      const dados = Object.fromEntries(new FormData(form));
      delete dados._honey;
      const assunto = S.contato.assunto || `Novo contato pelo site ${S.nome || ""}`;
      let url, corpo;
      if (S.contato.web3formsChave) {
        url = "https://api.web3forms.com/submit";
        corpo = { access_key: S.contato.web3formsChave, subject: assunto, from_name: S.nome, ...dados };
      } else {
        url = `https://formsubmit.co/ajax/${encodeURIComponent(S.contato.email)}`;
        corpo = { _subject: assunto, _template: "table", _captcha: "false", ...dados };
      }

      botao.disabled = true;
      avisar("Enviando…");
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(corpo),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j.success === false || j.success === "false") throw new Error(j.message || r.status);
        form.reset();
        avisar("Recebemos seu contato. Em breve falamos com você.", "ok");
      } catch (e) {
        console.warn("Falha no envio do formulário:", e);
        avisar("Não foi possível enviar agora. Chame a gente no WhatsApp.", "falha");
      } finally {
        botao.disabled = false;
      }
    });
  }
})();

(() => {
  const $ = id => document.getElementById(id);
  const DEFAULT_DESC = "has completed **Web Development** Internship at **Business Booster.** During this internship, the intern has demonstrated dedication, knowledge, and a strong willingness to learn.";
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const W = 1600, H = 1131;
  const images = { qr: null, sig1: null, sig2: null };

  const esc = s => s.replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
  const fmtDate = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); return m ? `${m[3]} ${MONTHS[+m[2]-1]} ${m[1]}` : ""; };

  // Shrink text until it fits its box (keeps long names / descriptions inside the design)
  function fitWidth(box, inner, max, min) {
    let s = max; box.style.fontSize = s + "px";
    while (inner.scrollWidth > box.clientWidth && s > min) box.style.fontSize = (s -= 1) + "px";
  }
  function fitHeight(box, inner, max, min) {
    let s = max; box.style.fontSize = s + "px"; box.style.lineHeight = (s * 1.23) + "px";
    while (inner.offsetHeight > box.clientHeight && s > min) { s -= 0.5; box.style.fontSize = s + "px"; box.style.lineHeight = (s * 1.23) + "px"; }
  }

  function render(root = document) {
    const q = id => root.querySelector("#" + id);
    const name = q("pName"), nameSpan = name.firstElementChild;
    nameSpan.textContent = $("name").value.trim();
    fitWidth(name, nameSpan, 62, 28);

    const desc = q("pDesc"), p = desc.firstElementChild;
    p.innerHTML = esc($("desc").value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    fitHeight(desc, p, 26, 14);

    q("pDuration").textContent = $("duration").value.trim();
    q("pPeriod").textContent = $("period").value.trim();
    q("pIssue").textContent = fmtDate($("issueDate").value);
    q("pCertNo").textContent = $("certNo").value.trim();
    for (const k of ["qr", "sig1", "sig2"]) {
      const el = q("p" + k[0].toUpperCase() + k.slice(1));
      el.innerHTML = images[k] ? `<img alt="" src="${images[k]}">` : "";
    }
  }

  function scale() {
    const st = $("stage");
    $("scaler").style.transform = `scale(${st.clientWidth / W})`;
  }

  const readFile = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });

  // Make near-white pixels transparent so scanned signatures blend into the paper
  function stripWhite(src) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const x = c.getContext("2d"); x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
        for (let i = 0; i < a.length; i += 4) {
          const m = Math.min(a[i], a[i+1], a[i+2]);
          if (m > 235) a[i+3] = 0; else if (m > 190) a[i+3] = Math.min(a[i+3], Math.round((235 - m) / 45 * 255));
        }
        x.putImageData(d, 0, 0); res(c.toDataURL("image/png"));
      };
      img.onerror = () => res(src); img.src = src;
    });
  }

  function bindFile(inputId, key, clean) {
    $(inputId).addEventListener("change", async e => {
      const f = e.target.files[0];
      if (!f) { images[key] = null; return render(); }
      if (!f.type.startsWith("image/")) { note("Please choose an image file.", true); e.target.value = ""; return; }
      let url = await readFile(f);
      if (clean) url = await stripWhite(url);
      images[key] = url; note(""); render();
    });
  }

  function note(msg, err) { $("note").textContent = msg; $("note").className = "note" + (err ? " err" : ""); }
  function status(text, busy) { $("statusText").textContent = text; $("status").classList.toggle("busy", !!busy); }

  async function download() {
    const btn = $("download"); btn.disabled = true; status("Generating PDF…", true); note("");
    let holder;
    try {
      await document.fonts.ready;
      holder = document.createElement("div");
      holder.style.cssText = `position:fixed;left:-10000px;top:0;width:${W}px;height:${H}px;`;
      const clone = $("cert").cloneNode(true);
      clone.querySelectorAll("[id]").forEach(n => n.id = n.id); // keep ids for render()
      holder.appendChild(clone); document.body.appendChild(holder);
      render(holder);
      const canvas = await html2canvas(clone, { scale: 3, useCORS: true, backgroundColor: null, width: W, height: H, logging: false });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [297, +(297 * H / W).toFixed(2)], compress: true });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.97), "JPEG", 0, 0, 297, 297 * H / W);
      const nm = ($("name").value.trim() || "certificate").replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_");
      pdf.save(`${nm}_Certificate.pdf`);
      note("PDF downloaded.");
    } catch (err) {
      console.error(err); note("Could not create the PDF. Open the page with Live Server and try again.", true);
    } finally {
      if (holder) holder.remove();
      btn.disabled = false; status("Ready to create");
    }
  }

  $("desc").value = DEFAULT_DESC;
  ["name","certNo","issueDate","duration","period","desc"].forEach(id => $(id).addEventListener("input", () => render()));
  bindFile("qr", "qr", false); bindFile("sig1", "sig1", true); bindFile("sig2", "sig2", true);
  $("download").addEventListener("click", download);
  window.addEventListener("resize", scale);
  new ResizeObserver(scale).observe($("stage"));
  scale(); render();
  document.fonts.ready.then(() => render());
})();

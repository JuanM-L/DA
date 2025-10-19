// Utilidad para obtener tasa de cambio actual
async function obtenerTasas() {
  const resp = await fetch("https://dolarapi.com/v1/dolares");
  if (!resp.ok) throw new Error("No se pudo obtener la tasa");
  const data = await resp.json();

  const oficial = data.find(d => d.casa === "oficial");
  const euroResp = await fetch("https://dolarapi.com/v1/cotizaciones/eur");
  const euroData = await euroResp.json();

  if (!oficial || !euroData?.venta) throw new Error("No se pudo obtener la cotización");

  return {
    usd: oficial.venta,
    eur: euroData.venta
  };
}

// Reemplaza texto con conversión
function convertirTexto(texto, tasas) {
  return texto.replace(/(\$|USD|US\$|€|EUR)\s?([\d.,]+)/gi, (match, simbolo, valor) => {
    const limpio = parseFloat(valor.replace(/\./g, "").replace(",", "."));
    if (isNaN(limpio)) return match;

    let convertido;
    if (/€|EUR/i.test(simbolo)) {
      convertido = limpio * tasas.eur;
    } else {
      convertido = limpio * tasas.usd;
    }

    return `${match} (~AR$ ${convertido.toFixed(2)})`;
  });
}

// Aplica conversión a nodos de texto
function convertirNodos(tasas) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.parentNode) continue;

    const tag = node.parentNode.tagName;
    if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(tag)) continue;

    const nuevoTexto = convertirTexto(node.textContent, tasas);
    if (nuevoTexto !== node.textContent) node.textContent = nuevoTexto;
  }
}

// Observa cambios dinámicos
function observarDOM(tasas) {
  const observer = new MutationObserver(() => convertirNodos(tasas));
  observer.observe(document.body, { childList: true, subtree: true });
}

// Inicializa script
(async () => {
  try {
    const tasas = await obtenerTasas();
    convertirNodos(tasas);
    observarDOM(tasas);
    console.log("💱 Conversor activo. Tasa USD:", tasas.usd, "EUR:", tasas.eur);
  } catch (e) {
    console.error("❌ Error en conversor de moneda:", e);
  }
})();




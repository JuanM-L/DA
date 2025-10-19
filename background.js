let tasaUSD = null;

async function fetchTasaUSD() {
  try {
    const resp = await fetch("https://dolarapi.com/v1/dolares/oficial");
    const data = await resp.json();

    if (!data.venta) throw new Error("No se encontró la cotización oficial");

    const valor = parseFloat(data.venta);
    if (isNaN(valor)) throw new Error("Valor inválido");

    tasaUSD = valor;
    return { success: true, valor };
  } catch (e) {
    console.error("Error en background al obtener tasa:", e);
    return { success: false, error: e.message || "Error desconocido" };
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getTasa") {
    if (tasaUSD !== null) {
      sendResponse({ success: true, valor: tasaUSD });
    } else {
      fetchTasaUSD().then(sendResponse);
    }
    return true;
  }
});




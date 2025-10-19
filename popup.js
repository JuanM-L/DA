window.addEventListener("DOMContentLoaded", () => {
  const tasaEl = document.getElementById("tasa");

  chrome.runtime.sendMessage({ action: "getTasa" }, response => {
    if (!response || !response.success) {
      tasaEl.textContent = "⚠️ Error al obtener la tasa";
      console.error("popup.js error:", response?.error);
      return;
    }

    tasaEl.textContent = `1 USD ≈ AR$ ${response.valor.toFixed(2)}`;
  });
});

/* V4.2.1 — Purely presentational weather banner; no business state. */
function rendreBandeauMeteoV421(markup) {
  if (typeof markup !== "string") return "";
  return markup.replace(
    /(<small>)Météo-France forecast for city\s+(.+?)\s+-\s+(.+?)\s+-\s+FR\s+\d{2,3}\s+Weather alert(<\/small>)/i,
    (_, open, city, department, close) => open + city + " — " + department + close
  );
}

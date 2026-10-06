const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard, FakeElement } = require("./bundle_harness.cjs");

const CONTROL_KEY = "ha-pool-dashboard:rc27-control";

test("le verrou PAC neutralise une configuration locale falsifiée write_enabled=true", () => {
  const runtime = loadBundle();
  runtime.sandbox.localStorage.setItem(CONTROL_KEY, JSON.stringify({
    coordination: { role: "satellite" },
    pac: {
      write_enabled: true,
      command_entity: "switch.piscine_pac_commande",
      setpoint_entity: "number.piscine_pac_consigne",
      mode_entity: "select.piscine_pac_mode",
    },
  }));

  const card = buildCard(runtime);
  assert.equal(card._rc27Control.pac.write_enabled, false);
  assert.equal(card._rc27Control.pac.command_entity, "switch.piscine_pac_commande");
  assert.equal(card._rc27Control.pac.setpoint_entity, "number.piscine_pac_consigne");
});

test("aucun callService n'est émis par Marche ou validation consigne tant que le verrou PAC est actif", async () => {
  const runtime = loadBundle();
  runtime.sandbox.localStorage.setItem(CONTROL_KEY, JSON.stringify({
    coordination: { role: "satellite" },
    pac: {
      write_enabled: true,
      command_entity: "switch.piscine_pac_commande",
      setpoint_entity: "number.piscine_pac_consigne",
      mode_entity: "select.piscine_pac_mode",
      communication_entity: "binary_sensor.piscine_pac_communication",
    },
  }));

  const card = buildCard(runtime);
  const calls = [];
  card._hass.callService = async (...args) => { calls.push(args); };

  const startButton = new FakeElement();
  startButton.dataset.rc30PacSim = "on";
  const confirmButton = new FakeElement();

  card.shadowRoot.register("[data-rc30-pac-sim]", [startButton]);
  card.shadowRoot.register("[data-rc30-pac-confirm]", [confirmButton]);

  card._rc30PacDraftSetpoint = 28.5;
  card.bindRc27Controls();

  await startButton.click();
  await confirmButton.click();

  assert.equal(card._rc27Control.pac.write_enabled, false);
  assert.deepEqual(calls, []);
});

test("PAC-001 piège tout accès à callService sur marche, consigne et mode quand le verrou est actif", async () => {
  const runtime = loadBundle();
  runtime.sandbox.localStorage.setItem(CONTROL_KEY, JSON.stringify({
    coordination: { role: "satellite" },
    pac: {
      write_enabled: true,
      command_entity: "switch.piscine_pac_commande",
      setpoint_entity: "number.piscine_pac_consigne",
      mode_entity: "select.piscine_pac_mode",
      communication_entity: "binary_sensor.piscine_pac_communication",
    },
  }));

  const card = buildCard(runtime);
  Object.defineProperty(card._hass, "callService", {
    configurable: true,
    get() { throw new Error("callService ne doit même pas être lu tant que PAC-001 verrouille les écritures"); },
  });

  const startButton = new FakeElement();
  startButton.dataset.rc30PacSim = "on";
  const confirmButton = new FakeElement();
  const operation = new FakeElement();
  operation.value = "heating";
  const regulation = new FakeElement();
  regulation.value = "smart";

  card.shadowRoot.register("[data-rc30-pac-sim]", [startButton]);
  card.shadowRoot.register("[data-rc30-pac-confirm]", [confirmButton]);
  card.shadowRoot.register("[data-rc30-pac-operation]", [operation]);
  card.shadowRoot.register("[data-rc30-pac-regulation]", [regulation]);
  card.shadowRoot.register("[data-rc30-pac-operation],[data-rc30-pac-regulation]", [operation, regulation]);

  card._rc30PacDraftSetpoint = 28.5;
  card.bindRc27Controls();

  await assert.doesNotReject(async () => {
    await startButton.click();
    await operation.dispatch("change");
    await confirmButton.click();
  });

  assert.equal(card._rc27Control.pac.write_enabled, false);
});

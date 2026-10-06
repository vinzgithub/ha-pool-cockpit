const test = require("node:test");
const assert = require("node:assert/strict");
const { loadBundle, buildCard, FakeElement, state } = require("./bundle_harness.cjs");

function installerControlesPac(card) {
  const start = new FakeElement(); start.dataset.rc30PacSim = "on";
  const stop = new FakeElement(); stop.dataset.rc30PacSim = "off";
  const confirm = new FakeElement();
  const operation = new FakeElement(); operation.value = "heating";
  const regulation = new FakeElement(); regulation.value = "smart";
  card.shadowRoot.register("[data-rc30-pac-sim]", [start, stop]);
  card.shadowRoot.register("[data-rc30-pac-confirm]", [confirm]);
  card.shadowRoot.register("[data-rc30-pac-operation]", [operation]);
  card.shadowRoot.register("[data-rc30-pac-regulation]", [regulation]);
  card.shadowRoot.register("[data-rc30-pac-operation],[data-rc30-pac-regulation]", [operation, regulation]);
  return { start, stop, confirm, operation, regulation };
}

test("les quatre interactions PAC restent sans service derrière PAC-001", async () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination = { ...card._rc27Control.coordination, role: "satellite" };
  card._rc27Control.pac = {
    ...card._rc27Control.pac,
    write_enabled: false,
    command_entity: "switch.pac",
    setpoint_entity: "number.pac_consigne",
    mode_entity: "select.pac_mode",
  };
  const controls = installerControlesPac(card);
  card._rc30PacDraftSetpoint = 29;
  Object.defineProperty(card._hass, "callService", {
    configurable: true,
    get() { throw new Error("PAC-001 : callService ne doit pas être lu"); },
  });
  card.bindRc27Controls();
  await assert.doesNotReject(async () => {
    await controls.start.click();
    await controls.stop.click();
    await controls.confirm.click();
    await controls.operation.dispatch("change");
  });
});

test("les chemins historiques de service restent inchangés si le verrou est ouvert artificiellement après normalisation", async () => {
  const runtime = loadBundle();
  const card = buildCard(runtime, {
    states: {
      "select.pac_mode": state("Heating + Eco", { attributes: { options: ["Heating + Eco", "Heating + Smart", "Auto (heat & cool)"] } }),
    },
  });
  card._rc27Control.coordination = { ...card._rc27Control.coordination, role: "master" };
  card._rc27Control.pac = {
    ...card._rc27Control.pac,
    write_enabled: true,
    command_entity: "switch.pac",
    setpoint_entity: "number.pac_consigne",
    mode_entity: "select.pac_mode",
  };
  const controls = installerControlesPac(card);
  const calls = [];
  card._hass.callService = async (...args) => { calls.push(args); };
  card.render = () => {};
  card._rc30PacDraftSetpoint = 29.5;
  card.bindRc27Controls();
  await controls.start.click();
  await controls.stop.click();
  await controls.confirm.click();
  await controls.operation.dispatch("change");
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ["switch", "turn_on", { entity_id: "switch.pac" }],
    ["switch", "turn_off", { entity_id: "switch.pac" }],
    ["number", "set_value", { entity_id: "number.pac_consigne", value: 29.5 }],
    ["select", "select_option", { entity_id: "select.pac_mode", option: "Heating + Smart" }],
  ]);
});

test("la coche de consigne n'est plus capturée par le drag du cadran", async () => {
  const runtime = loadBundle();
  const card = buildCard(runtime);
  card._rc27Control.coordination = { ...card._rc27Control.coordination, role: "master" };
  card._rc27Control.pac = {
    ...card._rc27Control.pac,
    write_enabled: true,
    setpoint_entity: "number.piscine_pac_consigne",
  };

  const ring = new FakeElement();
  const confirm = new FakeElement();
  confirm.closest = selector => selector === "[data-rc30-pac-confirm]" ? confirm : null;
  card.shadowRoot.register("[data-rc30-pac-gauge]", [ring]);
  card.shadowRoot.register("[data-rc30-pac-confirm]", [confirm]);
  card.shadowRoot.register("[data-rc30-pac-sim]", []);
  card.shadowRoot.register("[data-rc30-pac-operation]", []);
  card.shadowRoot.register("[data-rc30-pac-regulation]", []);
  card.shadowRoot.register("[data-rc30-pac-operation],[data-rc30-pac-regulation]", []);

  card.bindRc27Controls();

  let prevented = false;
  await ring.dispatch("pointerdown", {
    target: confirm,
    pointerId: 7,
    preventDefault() { prevented = true; },
  });

  assert.equal(prevented, false);
  assert.notEqual(card._rc30PacGaugeDragging, true);
});

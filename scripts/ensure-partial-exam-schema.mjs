const PB = "https://pocketbase-mobile.epixum.com";

const authBody = JSON.stringify({
  identity: "carlos@acostaparra.com",
  password: "Carlos1234$",
});

const dateField = (name) => ({
  name,
  type: "date",
  system: false,
  hidden: false,
  required: false,
  presentable: false,
  min: "",
  max: "",
});

const numberField = (name) => ({
  name,
  type: "number",
  system: false,
  hidden: false,
  required: false,
  presentable: false,
  min: null,
  max: null,
  onlyInt: true,
});

const jsonField = (name) => ({
  name,
  type: "json",
  system: false,
  hidden: false,
  required: false,
  presentable: false,
  maxSize: 0,
});

const selectField = (name, values) => ({
  name,
  type: "select",
  system: false,
  hidden: false,
  required: false,
  presentable: false,
  values,
  maxSelect: 1,
});

const relationField = (name, collectionId, maxSelect = 1, required = false, cascadeDelete = false) => ({
  name,
  type: "relation",
  system: false,
  hidden: false,
  required,
  presentable: false,
  collectionId,
  cascadeDelete,
  minSelect: 0,
  maxSelect,
});

const autoDateField = (name, onCreate, onUpdate) => ({
  name,
  type: "autodate",
  system: false,
  hidden: false,
  presentable: false,
  onCreate,
  onUpdate,
});

function hasField(collection, name) {
  return (collection.fields ?? []).some((field) => field.name === name);
}

async function main() {
  const authResponse = await fetch(`${PB}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: authBody,
  });
  const auth = await authResponse.json();
  if (!authResponse.ok) {
    throw new Error(`Auth failed: ${authResponse.status} ${JSON.stringify(auth)}`);
  }

  const headers = {
    Authorization: `Bearer ${auth.token}`,
    "Content-Type": "application/json",
  };

  async function getCollection(name) {
    const response = await fetch(`${PB}/api/collections/${name}`, { headers });
    if (!response.ok) {
      throw new Error(`${name}: ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  async function patchCollection(collection, data) {
    const response = await fetch(`${PB}/api/collections/${collection.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`${collection.name}: ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  async function createCollection(schema) {
    const response = await fetch(`${PB}/api/collections`, {
      method: "POST",
      headers,
      body: JSON.stringify(schema),
    });
    if (!response.ok) {
      throw new Error(`${schema.name}: ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  const units = await getCollection("partial_exam_units");
  const users = await getCollection("users");
  let exams = await getCollection("partial_exams");
  let examFields = exams.fields ?? [];

  if (!hasField(exams, "startAt")) examFields.push(dateField("startAt"));
  if (!hasField(exams, "endAt")) examFields.push(dateField("endAt"));
  if (!hasField(exams, "banks")) examFields.push(relationField("banks", units.id, 999, true));
  if (!hasField(exams, "questionCount")) examFields.push(numberField("questionCount"));

  const statusField = examFields.find((field) => field.name === "status");
  if (statusField?.type === "select") {
    statusField.values = ["Planificado", "Publicado", "Finalizado"];
  }

  exams = await patchCollection(exams, { fields: examFields });

  let simulations = await getCollection("partial_exam_simulations");
  let simulationFields = simulations.fields ?? [];
  if (!hasField(simulations, "payload")) simulationFields.push(jsonField("payload"));
  if (!hasField(simulations, "createdBy")) simulationFields.push(relationField("createdBy", users.id));
  simulations = await patchCollection(simulations, { fields: simulationFields });

  try {
    await getCollection("partial_exam_results");
    console.log("partial_exam_results exists");
  } catch {
    const teacherRule = '@request.auth.role = "docente" || @request.auth.role = "admin"';
    await createCollection({
      name: "partial_exam_results",
      type: "base",
      system: false,
      listRule: 'student = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"',
      viewRule: 'student = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"',
      createRule: '@request.auth.id != ""',
      updateRule: teacherRule,
      deleteRule: teacherRule,
      fields: [
        relationField("exam", exams.id, 1, true),
        relationField("simulation", simulations.id),
        relationField("student", users.id, 1, true),
        jsonField("answers"),
        numberField("score"),
        numberField("total"),
        selectField("status", ["Iniciado", "Entregado", "Corregido"]),
        dateField("startedAt"),
        dateField("submittedAt"),
        autoDateField("created", true, false),
        autoDateField("updated", true, true),
      ],
      indexes: [],
    });
    console.log("created partial_exam_results");
  }

  console.log("partial exam schema ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

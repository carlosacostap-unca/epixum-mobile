const PB = "https://pocketbase-mobile.epixum.com";

async function main() {
  const auth = await fetch(`${PB}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: "carlos@acostaparra.com",
      password: "Carlos1234$",
    }),
  });
  const authData = await auth.json();
  if (!auth.ok) throw new Error(JSON.stringify(authData));

  const headers = {
    Authorization: `Bearer ${authData.token}`,
    "Content-Type": "application/json",
  };
  const collection = await (await fetch(`${PB}/api/collections/partial_exam_results`, { headers })).json();
  const update = await fetch(`${PB}/api/collections/${collection.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      updateRule: 'student = @request.auth.id || @request.auth.role = "docente" || @request.auth.role = "admin"',
    }),
  });
  console.log(update.status);
  console.log(await update.text());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

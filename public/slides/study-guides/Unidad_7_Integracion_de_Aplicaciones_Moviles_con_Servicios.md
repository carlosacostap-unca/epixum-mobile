# Apuntes Unidad 7: Integracion de aplicaciones moviles con servicios

## Proposito de la unidad

En esta unidad se estudia como una aplicacion movil se comunica con sistemas externos para autenticar usuarios, consultar informacion, guardar datos, subir archivos y mantener una experiencia segura y confiable. La aplicacion deja de ser una pieza aislada y pasa a formar parte de un ecosistema compuesto por front-end movil, servicios back-end, bases de datos, almacenamiento en la nube y herramientas de monitoreo.

El objetivo principal es que el estudiante pueda disenar e implementar integraciones simples pero correctas, comprendiendo no solo como consumir una API, sino tambien que decisiones afectan la seguridad, la disponibilidad, el rendimiento y la experiencia del usuario.

## 1. Arquitectura general de integracion

Una app movil suele comunicarse con servicios remotos mediante una red publica o privada. En el esquema mas comun intervienen:

- Aplicacion movil: interfaz, navegacion, estado local y validaciones iniciales.
- API o servicio back-end: expone operaciones para consultar, crear, modificar o eliminar informacion.
- Base de datos: almacena datos persistentes.
- Servicio de autenticacion: identifica usuarios y emite credenciales de acceso.
- Almacenamiento de archivos: guarda imagenes, documentos, audios u otros recursos.
- Servicios externos: mapas, pagos, notificaciones, correo, inteligencia artificial, analitica o geolocalizacion.

La app no deberia conectarse directamente a la base de datos si eso expone credenciales o reglas internas. Lo recomendable es pasar por una API o por una plataforma BaaS que aplique permisos, validaciones y reglas de seguridad.

## 2. APIs REST

REST es un estilo muy utilizado para construir servicios web. Organiza la informacion como recursos y utiliza metodos HTTP para operar sobre ellos.

Metodos frecuentes:

- GET: obtener informacion.
- POST: crear un recurso o ejecutar una accion.
- PUT/PATCH: actualizar informacion existente.
- DELETE: eliminar un recurso.

Ejemplo conceptual:

```text
GET /api/productos
POST /api/productos
GET /api/productos/15
PATCH /api/productos/15
DELETE /api/productos/15
```

Buenas practicas al consumir REST desde una app movil:

- Manejar estados de carga, exito y error.
- Validar si el dispositivo tiene conectividad.
- No bloquear la interfaz mientras se espera la respuesta.
- Mostrar mensajes claros cuando falla una operacion.
- Evitar guardar tokens o claves sensibles en texto plano.
- Separar la capa visual de la capa de acceso a datos.

## 3. APIs GraphQL

GraphQL permite consultar solo los campos necesarios mediante una consulta declarativa. En lugar de tener muchos endpoints, normalmente existe un endpoint unico al que se envian queries y mutations.

Ventajas:

- Reduce sobrecarga cuando la app necesita pocos campos.
- Permite combinar datos relacionados en una sola consulta.
- Define un esquema tipado que documenta las operaciones disponibles.

Riesgos o cuidados:

- Requiere controlar permisos a nivel de consulta y datos.
- Una consulta demasiado profunda puede impactar en rendimiento.
- Los errores pueden venir mezclados con respuestas parciales.

REST y GraphQL no son enemigos. Son alternativas que conviene evaluar segun el tipo de proyecto, el equipo, la infraestructura y las necesidades de evolucion.

## 4. Autenticacion y autorizacion

Autenticacion significa comprobar quien es el usuario. Autorizacion significa decidir que puede hacer ese usuario.

Flujo tipico:

1. El usuario ingresa credenciales o usa un proveedor externo.
2. El servidor valida la identidad.
3. El servidor emite una sesion o token.
4. La app guarda la credencial de forma segura.
5. Cada solicitud protegida incluye esa credencial.
6. El servidor verifica permisos antes de responder.

Conceptos importantes:

- Token de acceso: credencial temporal para usar la API.
- Token de refresco: credencial para renovar la sesion.
- Roles: perfiles como estudiante, docente, admin o cliente.
- Reglas de acceso: condiciones que definen lectura, escritura y eliminacion.
- Cierre de sesion: debe limpiar credenciales locales.

En aplicaciones moviles es importante considerar que el dispositivo puede perderse, compartirse o quedar desbloqueado. Por eso no basta con "recordar usuario"; hay que pensar en almacenamiento seguro y expiracion de sesiones.

## 5. Almacenamiento local y remoto

Una app puede trabajar con varios tipos de almacenamiento:

- Estado en memoria: datos temporales de la pantalla actual.
- Almacenamiento local: preferencias, cache, borradores o datos offline.
- Base de datos remota: informacion compartida entre usuarios y dispositivos.
- Almacenamiento de archivos: imagenes, PDFs, audios o documentos.

No todo dato debe guardarse localmente. Conviene distinguir:

- Datos publicos o de baja sensibilidad.
- Datos personales.
- Datos academicos, financieros o de salud.
- Credenciales y secretos.

Cuanto mas sensible es un dato, mayor debe ser el cuidado sobre permisos, cifrado, expiracion, auditoria y eliminacion.

## 6. Manejo de archivos

Muchas aplicaciones moviles permiten tomar fotos, adjuntar comprobantes, subir documentos o descargar recursos.

Aspectos a revisar:

- Tipo de archivo permitido.
- Tamano maximo.
- Nombre seguro del archivo.
- Vista previa antes de subir.
- Progreso de carga.
- Reintento si falla la conexion.
- Permisos para ver o descargar el archivo.

Nunca debe confiarse solo en la validacion de la app. El servidor tambien debe validar extension, tipo MIME, tamano y permisos.

## 7. Seguridad en la integracion

Principios basicos:

- Usar HTTPS.
- No incluir claves privadas en la app.
- Validar entradas del usuario.
- Aplicar permisos en el servidor.
- Registrar errores sin exponer datos sensibles.
- Mantener dependencias actualizadas.
- Revocar sesiones comprometidas.

Errores frecuentes:

- Guardar un token en un lugar inseguro.
- Creer que ocultar un boton equivale a proteger una accion.
- Permitir que cualquier usuario lea registros de otros usuarios.
- Exponer mensajes de error con informacion interna.
- Subir archivos sin restricciones.

La seguridad debe estar en el diseno, no solo al final del proyecto.

## 8. Experiencia de usuario durante la integracion

La integracion tecnica impacta directamente en la experiencia. Una app que depende de servicios externos debe responder con claridad ante demoras o fallas.

Buenas practicas:

- Mostrar indicadores de carga.
- Deshabilitar acciones duplicadas mientras se procesa una solicitud.
- Informar errores con lenguaje comprensible.
- Permitir reintentar.
- Guardar borradores cuando tenga sentido.
- Usar cache para evitar esperas innecesarias.
- Disenar estados vacios utiles.

El usuario no necesita conocer el detalle tecnico del fallo, pero si necesita entender que paso y que puede hacer.

## 9. Actividad sugerida

Integrar en el proyecto una funcionalidad que consuma un servicio externo o propio. Puede ser:

- Registro e inicio de sesion.
- Consulta de datos desde una API REST.
- Consulta o mutation GraphQL.
- Subida de archivos.
- Almacenamiento de favoritos o configuracion de usuario.
- Integracion con mapas, notificaciones o analitica.

Entregable:

- Documento tecnico breve que explique el servicio utilizado, endpoints u operaciones, datos enviados y recibidos, estrategia de autenticacion y decisiones de seguridad.
- Video demo mostrando la funcionalidad desde la app.

## 10. Checklist de revision

- La app maneja carga, exito y error.
- Las acciones protegidas verifican permisos en el servidor.
- No hay claves privadas incluidas en el cliente.
- Los datos sensibles se guardan de forma adecuada.
- Las respuestas de error no exponen informacion interna.
- La interfaz informa al usuario que esta ocurriendo.
- La integracion esta documentada y puede ser probada por otra persona.

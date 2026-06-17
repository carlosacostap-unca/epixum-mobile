# Apuntes Unidad 8: Publicacion y distribucion de aplicaciones moviles

## Proposito de la unidad

Esta unidad aborda el paso final del ciclo de vida de una aplicacion movil: preparar, publicar, distribuir, medir y mejorar el producto despues del lanzamiento. Publicar una app no consiste solamente en subir un archivo a una tienda. Implica cumplir requisitos tecnicos, cuidar la presentacion comercial, proteger datos de usuarios, planificar versiones y responder a la retroalimentacion real.

El objetivo es que el estudiante comprenda el proceso de publicacion en Google Play y App Store, pueda preparar una ficha tecnica de lanzamiento y piense el mantenimiento posterior como parte natural del desarrollo.

## 1. Del prototipo al producto publicable

Antes de publicar, la aplicacion debe superar una revision interna.

Aspectos tecnicos:

- La app instala y abre correctamente.
- No hay pantallas rotas ni flujos incompletos.
- Los permisos solicitados tienen justificacion.
- Los formularios validan datos.
- La app maneja errores de red.
- El rendimiento es aceptable en dispositivos reales.
- No hay claves privadas dentro del cliente.

Aspectos de producto:

- El problema que resuelve esta claro.
- Las funciones principales estan completas.
- La interfaz es coherente.
- El usuario puede entender que hacer sin explicaciones externas.
- Existen textos, iconos, capturas y descripcion de tienda.

Una app publicable no necesita tener todas las funciones imaginadas, pero si debe cumplir de manera confiable su propuesta central.

## 2. Google Play

Google Play distribuye aplicaciones Android. El proceso general incluye:

1. Crear o usar una cuenta de desarrollador.
2. Configurar la ficha de la app.
3. Cargar el paquete de la aplicacion.
4. Definir contenido, privacidad y clasificacion.
5. Configurar paises, precios y canales de prueba.
6. Enviar a revision.
7. Publicar y monitorear.

Formato habitual de entrega:

- AAB: Android App Bundle, formato recomendado para publicacion.
- APK: formato tradicional usado tambien para pruebas o distribucion directa.

Elementos de la ficha:

- Nombre de la app.
- Descripcion breve.
- Descripcion completa.
- Icono.
- Capturas de pantalla.
- Categoria.
- Datos de contacto.
- Politica de privacidad cuando corresponda.
- Declaracion de permisos y datos recolectados.

## 3. App Store

La App Store distribuye aplicaciones iOS. El proceso suele incluir:

1. Cuenta en Apple Developer Program.
2. Configuracion del identificador de la app.
3. Certificados, perfiles y firma.
4. Carga del build mediante herramientas de Apple.
5. Configuracion en App Store Connect.
6. Pruebas con TestFlight.
7. Envio a revision.
8. Publicacion.

Apple suele ser estricta con calidad, privacidad, uso de permisos, pagos dentro de la app y valor real para el usuario. Por eso es importante revisar las guias antes de enviar.

## 4. Canales de prueba

Antes del lanzamiento publico conviene usar canales controlados:

- Prueba interna: equipo de desarrollo o docentes.
- Prueba cerrada: grupo reducido de usuarios.
- Prueba abierta: usuarios externos con acceso limitado.
- TestFlight: canal de prueba para iOS.

Las pruebas permiten detectar problemas que no aparecen en el entorno de desarrollo:

- Diferencias entre dispositivos.
- Fallos de permisos.
- Lentitud en redes moviles.
- Problemas de instalacion.
- Textos que no entran en pantalla.
- Errores de autenticacion.

## 5. ASO: optimizacion para tiendas

ASO significa App Store Optimization. Es el conjunto de decisiones para que la app sea comprensible, atractiva y encontrable dentro de una tienda.

Elementos clave:

- Nombre claro y memorable.
- Subtitulo o descripcion breve orientada al valor.
- Palabras clave relacionadas con el problema.
- Capturas que muestren funciones reales.
- Icono reconocible.
- Descripcion completa sin exageraciones.
- Categoria adecuada.

Una buena ficha no debe prometer mas de lo que la app entrega. La confianza del usuario se construye desde el primer contacto.

## 6. Privacidad y permisos

Las tiendas solicitan informacion sobre los datos que la aplicacion recopila y para que los usa.

Preguntas necesarias:

- Que datos personales se recolectan?
- Se comparte informacion con terceros?
- Se usan servicios de analitica?
- Se requiere ubicacion?
- Se solicitan camara, microfono o archivos?
- Existe una politica de privacidad?
- El usuario puede cerrar sesion o eliminar datos?

Buenas practicas:

- Solicitar solo permisos necesarios.
- Explicar por que se necesita un permiso.
- Evitar recopilar datos sin finalidad clara.
- Proteger datos sensibles.
- Mantener actualizada la politica de privacidad.

## 7. Versionado y actualizaciones

Toda app publicada necesita una estrategia de versionado.

Conceptos:

- Version visible: numero que ve el usuario, por ejemplo 1.2.0.
- Build interno: numero incremental usado por la tienda.
- Changelog: resumen de cambios.
- Compatibilidad: versiones de sistema operativo soportadas.

Tipos de actualizacion:

- Correccion: soluciona errores.
- Mejora menor: ajusta una funcion existente.
- Nueva funcionalidad: agrega capacidad visible.
- Cambio mayor: modifica flujos o arquitectura.

El versionado ayuda a comunicar avances, diagnosticar errores y mantener ordenado el ciclo de vida del producto.

## 8. Monitoreo post-lanzamiento

Despues de publicar comienza una etapa critica: observar el uso real.

Metricas utiles:

- Instalaciones.
- Usuarios activos.
- Retencion.
- Pantallas mas usadas.
- Errores o cierres inesperados.
- Tiempo de carga.
- Calificaciones y comentarios.
- Conversion en acciones clave.

Herramientas posibles:

- Consolas de las tiendas.
- Analitica de eventos.
- Monitoreo de errores.
- Logs del servidor.
- Encuestas o entrevistas a usuarios.

Las metricas deben interpretarse junto con feedback cualitativo. Un numero indica que algo ocurre; hablar con usuarios ayuda a entender por que.

## 9. Plan de mejora post-lanzamiento

Una publicacion responsable incluye un plan de mejora.

Contenido minimo:

- Objetivos de la version inicial.
- Riesgos conocidos.
- Funciones pendientes.
- Indicadores a observar.
- Prioridades para la siguiente version.
- Responsable de seguimiento.
- Criterios para corregir errores criticos.

Ejemplo de prioridades:

- Alta: errores que impiden iniciar sesion o completar la tarea principal.
- Media: problemas que dificultan el uso pero tienen alternativa.
- Baja: mejoras visuales, textos o ajustes secundarios.

## 10. Actividad sugerida

Simular la publicacion de la aplicacion desarrollada durante la cursada.

Entregable:

- Ficha tecnica de publicacion con nombre, descripcion breve, descripcion completa, categoria, publico objetivo, capturas propuestas, keywords y permisos requeridos.
- Plan de mejora post-lanzamiento con metricas a observar, posibles problemas, primera actualizacion planificada y criterios de prioridad.

## 11. Checklist de publicacion

- La app cumple su funcion principal.
- Se probaron pantallas principales en dispositivo real o emulador.
- La ficha de tienda tiene nombre, descripcion, capturas e icono.
- Los permisos estan justificados.
- La privacidad esta documentada.
- Existe un numero de version.
- Se definio un canal de prueba.
- Hay un plan de seguimiento despues de publicar.
- El equipo sabe como responder ante errores criticos.

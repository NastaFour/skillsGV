# Runbook de recuperación de git (corrupción de `.git`)

Documenta el procedimiento de recuperación ejecutado el 2026-08-24 sobre la raíz de este catálogo, cuando el directorio `.git` quedó corrupto. Sirve como referencia para regenerar el repositorio si el problema se repite en este u otro proyecto.

## Cuándo usar este runbook

Aplicar cuando `git` reporte que el directorio no es un repositorio válido, o cuando aparezcan los síntomas de la sección Diagnóstico. La recuperación se hace UNA vez; no repetir `git init` sobre un repositorio sano.

## Síntomas de corrupción (diagnóstico verificado)

Los siguientes síntomas se confirmaron antes de recuperar:

- `git status` y `git log` fallan con `fatal: not a git repository` (o equivalente).
- `HEAD` y `config` contienen solo espacios en blanco.
- `refs/heads` y `refs/tags` están vacíos.
- Existe un `index.lock` de 0 bytes (huérfano) dentro de `.git`.

## Procedimiento ejecutado

> Los comandos mutantes de este runbook se ejecutan SOLO tras confirmación explícita del responsable y SOLO sobre metadatos nuevos. Nunca se ejecutan comandos que modifiquen el respaldo `.git.corrupt-*`.

1. **Respaldar el `.git` corrupto sin borrarlo.**

   ```bash
   git -C <raiz-del-catalogo> status   # confirmar el diagnóstico
   mv .git .git.corrupt-20260824      # Windows: Rename-Item .git .git.corrupt-20260824
   ```

   El respaldo conserva `HEAD`, `config`, `refs/`, `objects/` y el `index.lock` huérfano. Nunca se elimina in-place: es la única evidencia del estado previo.

2. **Inicializar un repositorio nuevo en la raíz del catálogo.**

   ```bash
   git init
   ```

   El `git init` crea metadatos limpios sobre el árbol de trabajo existente. No altera ningún archivo de contenido.

3. **Evaluar rescate de objetos (solo si hay packs en el respaldo).**

   Si `objects/` del respaldo contiene packs con historial útil, copiar los objetos al repositorio nuevo y ejecutar:

   ```bash
   git fsck --lost-found
   ```

   En la ejecución de 2026-08-24 no había packs recuperables: se procedió sin rescate y se inició historial nuevo.

4. **Commit inicial del árbol de trabajo.**

   ```bash
   git add -A
   git commit -m "chore: restore repository after .git corruption"
   ```

   El commit raíz de esta recuperación es `c62bcac` e incluye 388 archivos (el árbol de trabajo completo).

5. **Confirmar la recuperación.**

   ```bash
   git status        # debe quedar limpio
   git fsck --full   # sin errores
   ```

   Con `git status` limpio y `git fsck` sin errores, el repositorio queda operativo.

## Verificaciones posteriores

- `git status` limpio (sin archivos sin seguimiento ni cambios pendientes).
- `git fsck --full` sin errores.
- El respaldo `.git.corrupt-*` permanece sin mutación (solo lectura).

## Alternativa si existe remoto

Si el proyecto tiene un remoto configurado, la alternativa C es más simple: re-clonar el remoto y copiar encima el árbol de trabajo (preservando `.gitignore` y archivos ignorados). En esta recuperación no había remoto, por lo que se optó por historial nuevo.

## Precauciones

- No ejecutar `commit -a` ni comandos mutantes sobre el índice del respaldo corrupto.
- No borrar el respaldo `.git.corrupt-*` hasta confirmar que el repositorio nuevo es estable (recomendado: conservarlo como referencia).
- El `index.lock` huérfano queda dentro del respaldo; nunca se borra en el directorio original antes de respaldar.
- Los directorios `.git.corrupt-*` están ignorados por `.gitignore` y no forman parte del historial.
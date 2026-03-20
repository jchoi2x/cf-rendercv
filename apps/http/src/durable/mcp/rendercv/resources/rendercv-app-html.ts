/**
 * Single-page MCP App (text/html;profile=mcp-app) for the `rendercv` tool.
 * Uses the browser build from esm.sh; CSP allowlists are set on the resource.
 */
export const RENDERCV_APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RenderCV</title>
  <style>
    :root {
      font-family: var(--font-sans, system-ui, sans-serif);
      color: var(--color-text-primary, #111);
      background: var(--color-background-primary, #fff);
      line-height: 1.45;
    }
    body { margin: 0; padding: 12px; box-sizing: border-box; min-height: 100vh; }
    h1 {
      font-size: var(--font-heading-md-size, 1.15rem);
      margin: 0 0 4px;
    }
    .muted {
      color: var(--color-text-secondary, #555);
      font-size: var(--font-text-sm-size, 0.9rem);
      margin: 0 0 12px;
    }
    .panel {
      border: 1px solid var(--color-border-primary, #ddd);
      border-radius: var(--border-radius-md, 8px);
      padding: 12px;
      background: var(--color-background-secondary, #f8f8f8);
    }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button {
      font: inherit;
      padding: 8px 14px;
      border-radius: var(--border-radius-sm, 6px);
      border: 1px solid var(--color-border-secondary, #ccc);
      background: var(--color-background-primary, #fff);
      color: var(--color-text-primary, #111);
      cursor: pointer;
    }
    button:hover { filter: brightness(0.97); }
    #viewer {
      margin-top: 12px;
      width: 100%;
      min-height: 420px;
      border: none;
      border-radius: var(--border-radius-md, 8px);
      background: var(--color-background-tertiary, #eee);
    }
    .status { margin: 8px 0 0; font-size: var(--font-text-sm-size, 0.9rem); }
    pre.err {
      white-space: pre-wrap;
      color: var(--color-text-danger, #b00020);
      margin: 8px 0 0;
    }
  </style>
</head>
<body>
  <h1>RenderCV</h1>
  <p class="muted">Generated resume PDF from your RenderCV JSON.</p>
  <div class="panel">
    <p id="status" class="status">Connecting…</p>
    <div id="actions" class="actions" hidden></div>
    <iframe id="viewer" title="PDF preview" hidden></iframe>
    <pre id="error" class="err" hidden></pre>
  </div>
  <script type="module">
    import {
      App,
      PostMessageTransport,
      applyDocumentTheme,
      applyHostStyleVariables,
      applyHostFonts,
    } from "https://esm.sh/@modelcontextprotocol/ext-apps@1.2.2";

    const statusEl = document.getElementById("status");
    const actionsEl = document.getElementById("actions");
    const viewerEl = document.getElementById("viewer");
    const errorEl = document.getElementById("error");

    function showError(msg) {
      errorEl.hidden = false;
      errorEl.textContent = msg;
    }

    function clearError() {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    function renderPdfFromBase64(b64) {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    }

    function resetViewer() {
      if (viewerEl.dataset.blobUrl) {
        URL.revokeObjectURL(viewerEl.dataset.blobUrl);
        delete viewerEl.dataset.blobUrl;
      }
      viewerEl.hidden = true;
      viewerEl.removeAttribute("src");
      actionsEl.innerHTML = "";
      actionsEl.hidden = true;
    }

    const app = new App({ name: "RenderCV", version: "1.0.0" });

    app.onhostcontextchanged = (ctx) => {
      if (ctx.theme) applyDocumentTheme(ctx.theme);
      if (ctx.styles && ctx.styles.variables)
        applyHostStyleVariables(ctx.styles.variables);
      if (ctx.styles && ctx.styles.css && ctx.styles.css.fonts)
        applyHostFonts(ctx.styles.css.fonts);
      const pad = ctx.safeAreaInsets;
      if (pad)
        document.body.style.padding =
          pad.top + "px " + pad.right + "px " + pad.bottom + "px " + pad.left + "px";
    };

    app.ontoolinput = () => {
      clearError();
      resetViewer();
      statusEl.textContent = "Rendering CV…";
    };

    app.ontoolresult = async (result) => {
      clearError();
      resetViewer();

      if (result.isError) {
        const parts =
          (result.content || []).filter(function (b) {
            return b.type === "text";
          });
        const nl = String.fromCharCode(10);
        const t = parts.map(function (b) {
          return b.text;
        }).join(nl);
        statusEl.textContent = "Tool reported an error.";
        showError(t || "Unknown error.");
        return;
      }

      const sc = result.structuredContent;
      if (!sc || typeof sc !== "object") {
        statusEl.textContent = "Done (no preview data).";
        const txt = (result.content || [])
          .filter(function (b) {
            return b.type === "text";
          })
          .map(function (b) {
            return b.text;
          })
          .join(String.fromCharCode(10));
        if (txt) showError(txt);
        return;
      }

      const fmt = sc.format;
      if (fmt === "url" && typeof sc.pdfUrl === "string") {
        statusEl.textContent = "PDF ready.";
        viewerEl.src = sc.pdfUrl;
        viewerEl.hidden = false;

        const openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.textContent = "Open in new tab";
        openBtn.addEventListener("click", function () {
          app.openLink({ url: sc.pdfUrl });
        });
        actionsEl.appendChild(openBtn);
        actionsEl.hidden = false;
        return;
      }

      if (fmt === "base64" && typeof sc.pdfBase64 === "string") {
        statusEl.textContent = "PDF ready (inline).";
        try {
          const blobUrl = renderPdfFromBase64(sc.pdfBase64);
          viewerEl.dataset.blobUrl = blobUrl;
          viewerEl.src = blobUrl;
          viewerEl.hidden = false;
        } catch (e) {
          showError("Could not decode PDF: " + (e && e.message ? e.message : String(e)));
        }
        return;
      }

      statusEl.textContent = "Done.";
      showError("Unexpected result shape.");
    };

    app.onteardown = async function () {
      resetViewer();
      return {};
    };

    try {
      await app.connect(new PostMessageTransport());
      statusEl.textContent = "Waiting for tool result…";
    } catch (e) {
      statusEl.textContent = "Could not connect to host.";
      showError(e && e.message ? e.message : String(e));
    }
  </script>
</body>
</html>`;

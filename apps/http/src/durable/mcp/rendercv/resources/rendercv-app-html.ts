/**
 * Single-page MCP App (text/html;profile=mcp-app) for the `rendercv` tool.
 * Uses the browser build from esm.sh; CSP allowlists are set on the resource.
 */
import { env } from "cloudflare:workers";

export const RENDERCV_APP_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RenderCV</title>
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@19.2.0",
        "react-dom/client": "https://esm.sh/react-dom@19.2.0/client"
      }
    }
  </script>
</head>
<body class='min-w-2xl min-h-screen'>

  <div class="panel flex flex-col gap-4">
    <p id="status" class="status">Connecting…</p>
    <div id="actions" class="actions" hidden></div>
    <pre id="error" class="err" hidden></pre>
  </div>
  <div id="viewer" hidden style="margin-top:12px;height:560px;min-width:100%;"></div>

  <script type="module">
    import "https://esm.sh/@tailwindcss/browser@4.0.6";
    import {
      App,
      PostMessageTransport,
      applyDocumentTheme,
      applyHostStyleVariables,
      applyHostFonts,
    } from "https://esm.sh/@modelcontextprotocol/ext-apps@1.2.2?deps=@modelcontextprotocol/sdk@1.25.2,zod@3";

    import WebViewer from "https://esm.sh/@pdftron/webviewer";

    const APRYSE_LICENSE = "${env.APRYSE_LICENSE}";
    const WEBVIEWER_CDN = "${env.WEBVIEWER_CDN}";
 
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
      if (viewerEl.dataset.blobUrl) URL.revokeObjectURL(viewerEl.dataset.blobUrl);
      delete viewerEl.dataset.blobUrl;
      delete viewerEl.dataset.ready;
      viewerEl.hidden = true;
      viewerEl.innerHTML = "";
      actionsEl.innerHTML = "";
      actionsEl.hidden = true;
    }

    async function loadPdfIntoViewer(url) {
      if (viewerEl.dataset.ready !== "1") {
        await WebViewer(
          {
            path: WEBVIEWER_CDN,
            licenseKey: APRYSE_LICENSE,
            initialDoc: url,
          },
          viewerEl,
        );
        viewerEl.dataset.ready = "1";
        return;
      }

      const instance = viewerEl.querySelector("iframe")?.contentWindow?.instance;
      if (instance?.UI?.loadDocument) {
        await instance.UI.loadDocument(url);
      } else {
        // Fallback for environments where instance isn't exposed from the iframe.
        await WebViewer(
          {
            path: WEBVIEWER_CDN,
            licenseKey: APRYSE_LICENSE,
            initialDoc: url,
          },
          viewerEl,
        );
      }
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

      console.log('result', result);

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
        console.log('sc is not an object');
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
        await loadPdfIntoViewer(sc.pdfUrl);
        viewerEl.hidden = false;

        const openBtn = document.createElement("button");
        const btnClasses = ['bg-blue-500', 'hover:bg-blue-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded'];
        openBtn.classList.add(...btnClasses);
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
          // Prefer URL when available to avoid decoding very large payloads.
          if (typeof sc.pdfUrl === "string") {
            await loadPdfIntoViewer(sc.pdfUrl);
          } else {
            const blobUrl = renderPdfFromBase64(sc.pdfBase64);
            viewerEl.dataset.blobUrl = blobUrl;
            await loadPdfIntoViewer(blobUrl);
          }
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

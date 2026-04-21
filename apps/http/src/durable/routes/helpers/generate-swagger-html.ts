import type { swaggerUI } from "@hono/swagger-ui";
import { env } from "cloudflare:workers";

type Opts = Parameters<typeof swaggerUI>[0];
type ManuallySwaggerUIHtml = Opts["manuallySwaggerUIHtml"];

export const generateSwaggerHtml: ManuallySwaggerUIHtml = (asset) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>API Docs</title>
      ${asset.css.map((url) => `<link rel="stylesheet" href="${url}" />`).join("\n")}
      <style>
        .pdf-response {
          margin-top: 0.75rem;
        }

        .pdf-response__actions {
          margin-bottom: 0.75rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .pdf-response__frame {
          width: 100%;
          min-height: 70vh;
          height: 70vh;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          background: white;
        }
      </style>
      <script type="importmap">
        {
          "imports": {
            "react": "https://esm.sh/react@19.2.0",
            "react-dom/client": "https://esm.sh/react-dom@19.2.0/client"
          }
        }
      </script>
      <script type="module" src="https://esm.sh/tsx"></script>
    </head>
    <body>
      <div id="swagger-ui"></div>

      ${asset.js.map((url) => `<script src="${url}" crossorigin="anonymous"></script>`).join("\n")}

      <script type="module">
        import WebViewer from 'https://esm.sh/@pdftron/webviewer@11.11.0';
        import "https://esm.sh/@tailwindcss/browser@4.0.6";
        const WEBVIEWER_CDN = "${env.WEBVIEWER_CDN}";

        const PdfPlugin = function () {
          return {
            wrapComponents: {
              responseBody: function (Original, system) {
                function PdfWebViewerResponse(props) {
                  const React = system.React
                  const { useEffect, useMemo, useRef, createElement: h } = React

                  const blob = useMemo(() => {
                    if (props.content instanceof Blob) {
                      return props.content
                    }
                    return new Blob([props.content], { type: 'application/pdf' })
                  }, [props.content])

                  const objectUrl = useMemo(
                    () => window.URL.createObjectURL(blob),
                    [blob]
                  )

                  const disposition =
                    props.headers?.['content-disposition'] ||
                    props.headers?.['Content-Disposition']

                  const filename = useMemo(() => {
                    let name = 'document.pdf'
                    if (typeof disposition === 'string') {
                      const quoted = disposition.match(/filename\\*?=(?:UTF-8''|")?([^";]+)/i)
                      if (quoted && quoted[1]) {
                        name = decodeURIComponent(quoted[1].replace(/"/g, ''))
                      }
                    }
                    return name
                  }, [disposition])

                  const viewerHostRef = useRef(null)
                  const instanceRef = useRef(null)
                  const mountGenerationRef = useRef(0)

                  useEffect(() => {
                    const el = viewerHostRef.current
                    if (!el) {
                      return
                    }

                    const myGeneration = ++mountGenerationRef.current

                    const teardown = () => {
                      try {
                        instanceRef.current?.UI?.dispose?.()
                      } catch (_) {
                        /* ignore */
                      }
                      instanceRef.current = null
                      el.replaceChildren()
                    }

                    teardown()

                    WebViewer(
                      {
                        path: WEBVIEWER_CDN,
                        licenseKey: "${env.APRYSE_LICENSE}",
                      },
                      el
                    ).then((instance) => {
                      if (myGeneration !== mountGenerationRef.current) {
                        try {
                          instance?.UI?.dispose?.()
                        } catch (_) {
                          /* ignore */
                        }
                        return
                      }
                      instanceRef.current = instance

                      const runFit = () => {
                        if (myGeneration !== mountGenerationRef.current) {
                          return
                        }
                        requestAnimationFrame(() => {
                          if (myGeneration !== mountGenerationRef.current) {
                            return
                          }
                          try {
                            instance.UI.setFitMode(instance.UI.FitMode.FitWidth)
                          } catch (_) {
                            try {
                              instance.UI.setZoomLevel(1)
                            } catch (_) {
                              /* ignore */
                            }
                          }
                        })
                      }

                      const { documentViewer } = instance.Core
                      documentViewer.addEventListener('documentLoaded', runFit, {
                        once: true,
                      })

                      void instance.UI.loadDocument(blob, { filename }).catch(() => {
                        /* errors are shown inside WebViewer */
                      })
                    })

                    return () => {
                      mountGenerationRef.current++
                      teardown()
                      window.URL.revokeObjectURL(objectUrl)
                    }
                  }, [blob, objectUrl, filename])

                  return h(
                    'div',
                    { className: 'pdf-response' },
                    h(
                      'div',
                      { className: 'pdf-response__actions' },
                      h(
                        'a',
                        {
                          href: objectUrl,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        },
                        'Open PDF in new tab'
                      ),
                      h(
                        'a',
                        {
                          href: objectUrl,
                          download: filename,
                        },
                        'Download PDF'
                      )
                    ),
                    h('div', {
                      ref: viewerHostRef,
                      className: 'pdf-response__frame',
                      title: 'PDF preview',
                    })
                  )
                }

                return function PdfResponseBody(props) {
                  const React = system.React
                  if (!props) {
                    return;
                  }

                  const contentType = String(props.contentType || '').toLowerCase()
                  const isPdf = contentType.includes('application/pdf')

                  if (!isPdf) {
                    return React.createElement(Original, props)
                  }

                  return React.createElement(PdfWebViewerResponse, props)
                }
              },
            },
          }
        }

        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis],
            plugins: [PdfPlugin]
          })
        }
      </script>
    </body>
  </html>
`;

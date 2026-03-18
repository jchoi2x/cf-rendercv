import type { swaggerUI } from '@hono/swagger-ui';


type Opts = Parameters<typeof swaggerUI>[0];
type ManuallySwaggerUIHtml = Opts['manuallySwaggerUIHtml'];



export const generateSwaggerHtml: ManuallySwaggerUIHtml = (asset) => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>API Docs</title>
      ${asset.css.map((url) => `<link rel="stylesheet" href="${url}" />`).join('\n')}
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
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          background: white;
        }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>

      ${asset.js.map((url) => `<script src="${url}" crossorigin="anonymous"></script>`).join('\n')}

      <script>
      
        const PdfPlugin = function () {
          return {
            wrapComponents: {
              responseBody: function (Original, system) {
                return function PdfResponseBody(props) {
                  const React = system.React

                  const contentType = String(props.contentType || '').toLowerCase()
                  const isPdf = contentType.includes('application/pdf')

                  if (!isPdf) {
                    return React.createElement(Original, props)
                  }

                  let blob
                  if (props.content instanceof Blob) {
                    blob = props.content
                  } else {
                    blob = new Blob([props.content], { type: 'application/pdf' })
                  }

                  const objectUrl = window.URL.createObjectURL(blob)

                  const disposition =
                    props.headers?.['content-disposition'] ||
                    props.headers?.['Content-Disposition']

                  let filename = 'document.pdf'
                  if (typeof disposition === 'string') {
                    const quoted = disposition.match(/filename\\*?=(?:UTF-8''|")?([^";]+)/i)
                    if (quoted && quoted[1]) {
                      filename = decodeURIComponent(quoted[1].replace(/"/g, ''))
                    }
                  }

                  return React.createElement(
                    'div',
                    { className: 'pdf-response' },
                    React.createElement(
                      'div',
                      { className: 'pdf-response__actions' },
                      React.createElement(
                        'a',
                        {
                          href: objectUrl,
                          target: '_blank',
                          rel: 'noopener noreferrer'
                        },
                        'Open PDF in new tab'
                      ),
                      React.createElement(
                        'a',
                        {
                          href: objectUrl,
                          download: filename
                        },
                        'Download PDF'
                      )
                    ),
                    React.createElement('iframe', {
                      className: 'pdf-response__frame',
                      src: objectUrl,
                      title: 'PDF preview'
                    })
                  )
                }
              }
            }
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
`
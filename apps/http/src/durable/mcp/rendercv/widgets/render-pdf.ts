import { createUIResource } from "@mcp-ui/server";
// https://block.github.io/goose/blog/2025/09/08/turn-any-mcp-server-mcp-ui-compatible/#2-import-it
export const renderPdf = (url: string) =>
  createUIResource({
    uri: "ui://rendercv/pdf",
    content: {
      type: "rawHtml",
      htmlString: `
      <div id="root">
        <embed src="${url}" width="100%" height="100%"></embed>
      </div>
      <script>
        console.log('widgetUI script loaded', window);
        window.addEventListener('message', (event) => {
          console.log('message received', event.data);
          const { type, payload } = event.data;
          if (type === 'MCP_DATA') {
            document.getElementById('root').innerHTML = 
              '<pre>' + JSON.stringify(payload, null, 2) + '</pre>';
          }
        });
      </script>
    `,
    },
    encoding: "text",
  });

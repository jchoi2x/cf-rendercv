import { createUIResource } from "@mcp-ui/server";

export const widgetUI = createUIResource({
  uri: "ui://my-server/widget",
  content: {
    type: "rawHtml",
    htmlString: `
      <div id="root"><p>Waiting for data...</p></div>
      <script>
        window.addEventListener('message', (event) => {
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

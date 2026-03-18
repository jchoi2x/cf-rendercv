import { createUIResource } from "@mcp-ui/server";

export const formUI = createUIResource({
  uri: 'ui://my-server/form',
  content: { 
    type: 'rawHtml', 
    htmlString: `
      <div id="root"><p>Form UI</p></div>
      <form id="form">
        <input type="text" name="name" placeholder="Name" />
        <input type="email" name="email" placeholder="Email" />
        <input type="text" name="phone" placeholder="Phone" />
        <input type="text" name="address" placeholder="Address" />
        <input type="text" name="city" placeholder="City" />
        <input type="text" name="state" placeholder="State" />
        <input type="text" name="zip" placeholder="Zip" />
      </form>
      <script>
        window.addEventListener('message', (event) => {
          const { type, payload } = event.data;
          if (type === 'MCP_DATA') {
            document.getElementById('root').innerHTML = 
              '<pre>' + JSON.stringify(payload, null, 2) + '</pre>';
          }
        });
      </script>
    `
  },
  encoding: 'text',
});


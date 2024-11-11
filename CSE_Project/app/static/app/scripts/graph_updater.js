// Constants
const UPDATE_INTERVAL = 300000; // 5 minutes in milliseconds
const LOADING_TEXT = 'Updating...';

/**
* Updates the exchange rate graph with latest data
* @async
* @function updateGraph
*/
async function updateGraph() {
   const graphSpace = document.querySelector('.graph-space');
   if (!graphSpace) return;

   // Show loading state
   const loadingDiv = document.createElement('div');
   loadingDiv.id = 'loading';
   loadingDiv.textContent = LOADING_TEXT;
   graphSpace.appendChild(loadingDiv);

   try {
       // Fetch updated graph data
       const response = await fetch('/get_updated_graph/');
       const data = await response.json();

       if (data.error) {
           throw new Error(data.error);
       }

       // Update graph with new data
       graphSpace.innerHTML = `
           <img alt="Exchange Rate Plot" 
                border="5" 
                src="data:image/png;base64,${data.graph_data}" 
                loading="lazy"
                style="max-width: 100%; height: auto;"/>
       `;
   } catch (error) {
       console.error('Failed to update graph:', error);
       // Optionally show error to user
   } finally {
       // Remove loading indicator
       document.getElementById('loading')?.remove();
   }
}

// Initialize graph updates
document.addEventListener('DOMContentLoaded', () => {
   updateGraph();
   setInterval(updateGraph, UPDATE_INTERVAL);
});
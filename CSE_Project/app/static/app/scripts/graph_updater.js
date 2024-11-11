// グラフ更新の関数
function updateGraph() {
    // グラフ更新開始時にローディング表示
    const graphSpace = document.querySelector('.graph-space');
    if (graphSpace) {
        graphSpace.innerHTML += '<div id="loading">更新中...</div>';
    }

    // サーバーからデータを取得
    fetch('/get_updated_graph/')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error updating graph:', data.error);
                return;
            }
            
            // グラフを新しいデータで更新
            if (graphSpace) {
                graphSpace.innerHTML = `
                    <img alt="Exchange Rate Plot" 
                         border="5" 
                         src="data:image/png;base64,${data.graph_data}" 
                         style="max-width: 100%; height: auto;"/>
                `;
            }
        })
        .catch(error => console.error('Error fetching graph data:', error))
        .finally(() => {
            // ローディング表示を削除
            const loading = document.getElementById('loading');
            if (loading) {
                loading.remove();
            }
        });
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', function() {
    // 初回更新
    updateGraph();
    
    // 5分（300000ミリ秒）ごとに更新
    setInterval(updateGraph, 300000);
});
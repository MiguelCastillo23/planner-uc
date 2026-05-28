import EnvironmentalMetric from '../models/EnvironmentalMetric.js';

export const getEnvironmentalDashboard = async (req, res) => {
    try {
        const metrics = await EnvironmentalMetric.find().sort({ timestamp: -1 }).lean();
        
        const totalRequests = metrics.length;
        let totalCO2 = 0;
        const endpointStats = {}; 
        
        metrics.forEach(m => {
            totalCO2 += m.co2Emissions;
            if (!endpointStats[m.path]) {
                endpointStats[m.path] = { count: 0, co2: 0 };
            }
            endpointStats[m.path].count += 1;
            endpointStats[m.path].co2 += m.co2Emissions;
        });

        const avgCO2 = totalRequests > 0 ? (totalCO2 / totalRequests) : 0;
        
        let mostPolluting = { path: '-', co2: 0 };
        let mostUsed = { path: '-', count: 0 };
        
        for (const [path, stats] of Object.entries(endpointStats)) {
            if (stats.co2 > mostPolluting.co2) mostPolluting = { path, co2: stats.co2 };
            if (stats.count > mostUsed.count) mostUsed = { path, count: stats.count };
        }

        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="icon" href="data:,">
            <title>Dashboard de Impacto Ambiental</title>
            <style>
                :root {
                    --bg: #0f172a;
                    --card-bg: #1e293b;
                    --text: #f8fafc;
                    --text-muted: #94a3b8;
                    --accent: #10b981;
                    --accent-hover: #059669;
                    --border: #334155;
                }
                body { 
                    font-family: 'Inter', system-ui, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background-color: var(--bg); 
                    color: var(--text); 
                }
                h1 { 
                    color: var(--accent); 
                    margin-bottom: 30px; 
                    font-weight: 600;
                    letter-spacing: -0.5px;
                }
                .kpis { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
                    gap: 20px; 
                    margin-bottom: 30px; 
                }
                .kpi-card { 
                    background: var(--card-bg); 
                    padding: 24px; 
                    border-radius: 12px; 
                    border: 1px solid var(--border);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                }
                .kpi-card h3 { 
                    margin: 0 0 12px 0; 
                    font-size: 13px; 
                    color: var(--text-muted); 
                    text-transform: uppercase; 
                    letter-spacing: 0.5px;
                }
                .kpi-card p { 
                    margin: 0; 
                    font-size: 28px; 
                    font-weight: 700; 
                    color: var(--accent); 
                }
                .kpi-card .subtext {
                    font-size: 13px;
                    color: var(--text-muted);
                    font-weight: 400;
                    margin-top: 4px;
                    display: block;
                }
                .table-container { 
                    background: var(--card-bg); 
                    border-radius: 12px; 
                    border: 1px solid var(--border);
                    overflow-x: auto; 
                    max-height: 600px; 
                    overflow-y: auto; 
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    min-width: 800px; 
                }
                th, td { 
                    padding: 16px; 
                    text-align: left; 
                    border-bottom: 1px solid var(--border); 
                    font-size: 14px;
                }
                th { 
                    background-color: #1e293b; 
                    position: sticky; 
                    top: 0; 
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 12px;
                    letter-spacing: 0.5px;
                    z-index: 10;
                }
                tr:hover td { 
                    background-color: rgba(255,255,255,0.02); 
                }
                .badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    background: #334155;
                }
                .badge.get { color: #38bdf8; }
                .badge.post { color: #4ade80; }
                .badge.put { color: #fbbf24; }
                .badge.delete { color: #f87171; }
            </style>
        </head>
        <body>
            <h1>🌱 Green MERN Dashboard</h1>
            <div class="kpis">
                <div class="kpi-card">
                    <h3>Total Solicitudes</h3>
                    <p>${totalRequests}</p>
                </div>
                <div class="kpi-card">
                    <h3>CO2 Total Generado</h3>
                    <p>${totalCO2.toFixed(6)} <span class="subtext">gramos</span></p>
                </div>
                <div class="kpi-card">
                    <h3>CO2 Promedio</h3>
                    <p>${avgCO2.toFixed(6)} <span class="subtext">gramos/req</span></p>
                </div>
                <div class="kpi-card">
                    <h3>Endpoint + Contaminante</h3>
                    <p title="${mostPolluting.path}">${mostPolluting.path.length > 20 ? mostPolluting.path.substring(0,20)+'...' : mostPolluting.path} 
                    <span class="subtext">${mostPolluting.co2.toFixed(6)} g total</span></p>
                </div>
                <div class="kpi-card">
                    <h3>Endpoint + Utilizado</h3>
                    <p title="${mostUsed.path}">${mostUsed.path.length > 20 ? mostUsed.path.substring(0,20)+'...' : mostUsed.path} 
                    <span class="subtext">${mostUsed.count} solicitudes</span></p>
                </div>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha y Hora</th>
                            <th>Método</th>
                            <th>Ruta</th>
                            <th>Estado HTTP</th>
                            <th>Tiempo (ms)</th>
                            <th>Bytes Transferidos</th>
                            <th>CO2 Estimado (g)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${metrics.map(m => `
                        <tr>
                            <td style="color: var(--text-muted)">${new Date(m.timestamp).toLocaleString()}</td>
                            <td><span class="badge ${m.method.toLowerCase()}">${m.method}</span></td>
                            <td>${m.path}</td>
                            <td>${m.status >= 400 ? `<span style="color:#f87171">${m.status}</span>` : `<span style="color:#4ade80">${m.status}</span>`}</td>
                            <td>${m.responseTime}</td>
                            <td>${m.bytesTransferred} B</td>
                            <td style="color: var(--accent); font-weight: 600;">${m.co2Emissions.toFixed(6)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        console.error("Error al renderizar el dashboard:", error);
        res.status(500).send("Error interno del servidor al cargar el dashboard.");
    }
};

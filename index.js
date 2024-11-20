const express = require('express');
const bodyParser = require('body-parser');
const { saveToma, getAnalysisByPaciente, getGlobalAnalysis } = require('./services/analysisService');

const app = express();
app.use(bodyParser.json());

// Endpoint para registrar una toma
app.post('/record', async (req, res) => {
    try {
        const result = await saveToma(req.body);
        res.status(201).json({ message: 'Registro guardado', result });
    } catch (err) {
        res.status(500).json({ message: 'Error registrando la toma', error: err.message });
    }
});

// Endpoint para obtener análisis por paciente
app.get('/analysis/:id_paciente', async (req, res) => {
    try {
        const stats = await getAnalysisByPaciente(req.params.id_paciente);
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo análisis', error: err.message });
    }
});

// Endpoint para obtener análisis global
app.get('/analysis/global', async (req, res) => {
    try {
        const stats = await getGlobalAnalysis();
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo análisis global', error: err.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Microservicio de análisis corriendo en el puerto ${PORT}`);
});

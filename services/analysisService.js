const db = require('../database/database');

exports.saveToma = async ({ id_paciente, id_medicamento, hora_programada, hora_real }) => {
    const cumplimiento = Math.abs(new Date(hora_real) - new Date(hora_programada)) <= 15 * 60 * 1000 ? 1 : 0; // 15 minutos de margen
    const query = `
        INSERT INTO Medicamento_Tomas (id_paciente, id_medicamento, hora_programada, hora_real, cumplimiento)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [id_paciente, id_medicamento, hora_programada, hora_real, cumplimiento];
    await db.execute(query, values);
    return { id_paciente, id_medicamento, hora_programada, hora_real, cumplimiento };
};

exports.getAnalysisByPaciente = async (id_paciente) => {
    const query = `
        SELECT 
            AVG(cumplimiento) AS porcentaje_cumplimiento,
            AVG(TIMESTAMPDIFF(MINUTE, hora_programada, hora_real)) AS retraso_promedio,
            COUNT(*) AS total_tomas
        FROM Medicamento_Tomas
        WHERE id_paciente = ?
    `;
    const [rows] = await db.execute(query, [id_paciente]);
    return rows[0];
};

exports.getNextMedications = async (id_paciente) => {
    const query = `
        SELECT 
            m.id_medicamento, 
            m.nombre_medicamento, 
            m.horario_medicamento, 
            m.dosis 
        FROM Medicamento m
        LEFT JOIN Medicamento_Tomas t
        ON m.id_medicamento = t.id_medicamento 
           AND DATE(m.horario_medicamento) = CURDATE()
        WHERE m.id_paciente = ?
          AND t.id IS NULL
        ORDER BY m.horario_medicamento ASC
        LIMIT 5
    `;
    const [rows] = await db.execute(query, [id_paciente]);
    return rows;
};

exports.getNextMedications = async (req, res) => {
    try {
        const { id_paciente } = req.params;
        const nextMedications = await getNextMedications(id_paciente);

        if (nextMedications.length === 0) {
            return res.status(404).json({ message: 'No hay medicamentos pendientes para hoy' });
        }

        res.status(200).json(nextMedications);
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo próximos medicamentos', error: err.message });
    }
};


exports.getGlobalAnalysis = async () => {
    const query = `
        SELECT 
            AVG(cumplimiento) AS porcentaje_cumplimiento,
            AVG(TIMESTAMPDIFF(MINUTE, hora_programada, hora_real)) AS retraso_promedio
        FROM Medicamento_Tomas
    `;
    const [rows] = await db.execute(query);
    return rows[0];
};

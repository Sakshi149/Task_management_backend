// const db = require("../config/db")

import {mySqlPool} from "../config/db.js"

// Pagination, date and status filter
// Get all task list
export const getTasks = async (req, res) => {
    try {
        const id = req.query.id || null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        let query = `SELECT * FROM tasks`;
        let countQuery = `SELECT COUNT(*) AS count FROM tasks`;
        let whereClauses = [];
        let params = [];
        let { from, to, status, title } = req.query;

        if (from && to) {
            whereClauses.push(`created_at BETWEEN ? AND ?`);
            params.push(from, to);
        } else if (from) {
            whereClauses.push(`created_at >= ?`);
            params.push(from);
        } else if (to) {
            whereClauses.push(`created_at <= ?`);
            params.push(to);
        }

        if (status) {
            let statusArray = status.split(',').map(s => s.trim());
            let placeholders = statusArray.map(() => '?').join(', ');
            whereClauses.push(`status IN (${placeholders})`);
            params.push(...statusArray);
        }

        if (id) {
            whereClauses.push(`id = ?`);
            params.push(id);
        }

        if(title){
            whereClauses.push(`title LIKE ?`)
            params.push(`%${title}%`)
        }

        let whereClause = whereClauses.length ? ` WHERE ` + whereClauses.join(' AND ') : '';

        query += whereClause;
        countQuery += whereClause;


        if (!id) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
        }

        console.log('Query:', query, 'Params:', params);

        const [result] = await mySqlPool.execute(query, params);
        
        let totalTasks = 1;
        let totalPages = 1;

        if (!id) {
            const [totalTasksResult] = await mySqlPool.execute(countQuery, params.slice(0, params.length - 2));
            totalTasks = totalTasksResult[0].count;
            totalPages = Math.ceil(totalTasks / limit);
        }

        res.status(200).send({
            success: true,
            tasks: result,
            pagination: id ? undefined : { page, limit, totalPages, totalTasks }
        });

    } catch (error) {
        console.log("ERROR encountered", error.message);
        res.status(500).send({
            success: false,
            message: 'Error in fetching tasks',
            error
        });
    }
};

// GET TASKS BY ID
// export const getTaskByID = async (req, res) => {
//     try {
//         const taskId = req.params.id
//         if (!taskId) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Invalid or Provide task id'
//             })
//         }
//         // const data = await mySqlPool.query(`SELECT * FROM tasks where id=` +taskId)
//         const data = await mySqlPool.query(`SELECT * FROM tasks WHERE id=?`, [taskId])
//         if (!data || data.length == 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'No records found'
//             })
//         }
//         res.status(200).json({
//             success: true,
//             taskDetails: data[0],
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             success: false,
//             message: 'Error in get task id in task api',
//             error
//         })
//     }
// }

export const getTaskByID = async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        if (isNaN(taskId) || taskId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing task ID',
            });
        }

        const [data] = await mySqlPool.query(`SELECT * FROM tasks WHERE id = ?`, [taskId]);

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        res.status(200).json({
            success: true,
            taskDetails: data[0], 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving task',
            error,
        });
    }
};


// To add single task at a time
// CREATE TASK
export const createTask = async (req, res) => {
    try {
        console.log('body=', JSON.stringify(req.body));

        const { title, description, status } = req.body;
        if (!title || !description || !status) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all fields: title, description, and status'
            });
        }
        const data = await mySqlPool.query(`INSERT INTO tasks (title, description, status) VALUES(?, ?, ?)`, [title, description, status]);
        if (!data) {
            return res.status(500).send({
                success: false,
                message: 'Error in insert query'
            });
        }

        const [result, error] = data;

        res.status(200).send({
            success: true,
            message: 'New task added successfully',
            task_id: result.insertId
        });

    } catch (error) {
        console.log("ERROR encountered", error.message);
        res.status(500).send({
            success: false,
            message: 'Error in creating task API',
            error
        });
    
    }
}

// Update task
export const updateTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        if (isNaN(taskId) || taskId <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid task ID' 
            });
        }

        const { title, description, status } = req.body;

        const [updateResult] = await mySqlPool.query(
            `UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?`,
            [title, description, status, taskId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Task details updated' });
    } catch (error) {
        console.error('Update Task Error:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Error updating task' 
        });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        if (!taskId) {
            return res.status(400).send({
                success: false,
                message: 'Please provide a valid task ID',
            });
        }

        const [rows] = await mySqlPool.query(`SELECT id FROM tasks WHERE id = ?`, [taskId]);

        if (rows.length == 0) {
            return res.status(404).send({
                success: false,
                message: 'Task not found',
            });
        }

        await mySqlPool.query(`DELETE FROM tasks WHERE id = ? LIMIT 1`, [taskId]);

        return res.status(200).send({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: 'Error deleting task',
            error,
        });
    }
};

// module.exports = {getTasks, getTaskByID, createTask, updateTask, deleteTask}

const db = require("../config/db")

// // Get all task list
// const getTasks = async (req, res) => {
//     try {
//         const data = await db.query('SELECT * FROM tasks')
//         if (!data) {
//             return res.status(404).send({
//                 success: false,
//                 message: 'No records found'
//             })
//         }
//         res.status(200).send({
//             success: true,
//             message: 'All tasks',
//             totalTasks: data[0].length,
//             data: data[0],
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(500).send({
//             success: false,
//             message: 'Error in get all task api',
//             error
//         })
//     }
// }

// Get all task list
const getTasks = async (req, res) => {
    try {
        const id = req.query.id || null;
        const page = parseInt(req.query.page) || 1;  
        const limit = parseInt(req.query.limit) || 10;  
        const offset = (page - 1) * limit;
        
        let query = `SELECT * FROM tasks`;
        let countQuery = `SELECT COUNT (*) AS count FROM tasks`;
        let whereClause = '';
        let params = [];

        if(id) {
            whereClause += `WHERE id=?`;
            params.push(id);
        }

        // if(whereClause){
        //     query = query + ' WHERE ' + whereClause;
        // }

        if(!id){
        query += whereClause + ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        }

        console.log('query=', query, 'params=', params);

        const [result] = await db.execute(query + whereClause, params);

        let totalTasks = 1;
        let totalPages = 1;

        if(!id){
        const [totalTasksResult] = await db.execute(countQuery + whereClause, params.slice(0, whereClause ? 1 : undefined)); 
        totalTasks = totalTasksResult[0].count;
        totalPages = Math.ceil(totalTasks / limit);
    }

        res.status(200).send({
            success: true,
            tasks: result,
            pagination: id
                ? undefined
                : { page, limit, totalPages, totalTasks }
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
const getTaskByID = async (req, res) => {
    try {
        const taskId = req.params.id
        if (!taskId) {
            return res.status(404).send({
                success: false,
                message: 'Invalid or Provide task id'
            })
        }
        // const data = await db.query(`SELECT * FROM tasks where id=` +taskId)
        const data = await db.query(`SELECT * FROM tasks WHERE id=?`, [taskId])
        if (!data) {
            return res.status(404).send({
                success: false,
                message: 'No records found'
            })
        }
        res.status(200).send({
            success: true,
            taskDetails: data[0],
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in get task id in task api',
            error
        })
    }
}


// const createTask = async (req, res) => {
//     try {

//         // [{},{}]
//     console.log('body=',JSON.stringify(req.body));
//         // const { title, description, status} = req.body
//         const body = req.body

//         for (const task of body) {
//             const { title, description, status} = task;

//             console.log({ title, description, status});
//             if (!title || !description || !status) {
//                 return res.status(500).send({
//                     success: false,
//                     message: 'Please provide all fields'
//                 })
//             }
        
//             const data = await db.query(`INSERT INTO tasks (title, description, status) VALUES(?, ?, ?)`, [title, description, status])
//             if(!data) {
//                 return res.status(404).send({
//                     success: false,
//                     message: 'Error in insert query'
//                 })
//             }
//         }
        
//         res.status(200).send({
//             success: true,
//             message: 'New task added',
//         })
//     } catch (error) {
//         console.log("ERROR encountered", error.message)
//         res.status(500).send({
//             success: false,
//             message: 'Error in creating task api',
//             error
//         })
        
//     }
// }


// CREATE TASK
const createTask = async (req, res) => {
    try {
        console.log('body=', JSON.stringify(req.body));

        const { title, description, status } = req.body;
        if (!title || !description || !status) {
            return res.status(400).send({
                success: false,
                message: 'Please provide all fields: title, description, and status'
            });
        }
        const data = await db.query(`INSERT INTO tasks (title, description, status) VALUES(?, ?, ?)`, [title, description, status]);
        if (!data) {
            return res.status(500).send({
                success: false,
                message: 'Error in insert query'
            });
        }
        res.status(200).send({
            success: true,
            message: 'New task added successfully',
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
const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id 
        if(!taskId){
            return res.status(404).send({
                success: false,
                message: 'Invalid ID or provide Id'
            })
        }
        const {title, description, status} = req.body
        const data = await db.query(`UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?`, [title, description, status, taskId])
        if(!data){
            return res.status(500).send({
                success: false,
                message: 'Error in update data'
            })
        }
        res.status(200).send({
            success: true,
            message: 'Tasks details updated'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in update Api',
            error
        })
        
    }
}

// DELETE TASK
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id 
        if(!taskId){
            return res.status(404).send({
                success: false,
                message: 'Please provide task Id or valid task id',
            })
        }
        await db.query(`DELETE FROM tasks WHERE id = ?`, [taskId])
        res.status(200).send({
            success: true,
            message: 'Task deleted successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in delete task api',
            error
        })
        
    }
}

module.exports = {getTasks, getTaskByID, createTask, updateTask, deleteTask}
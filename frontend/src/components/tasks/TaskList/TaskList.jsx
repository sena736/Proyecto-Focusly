import { useEffect, useState } from "react";
import TaskItem from "../TaskItem/TaskItem";
import "./TaskList.css";

function TaskList() {
	const [tasks, setTasks] = useState([]);

	useEffect(() => {
		const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
		setTasks(savedTasks);
	}, []);

	return (
		<div className="task-list-container">
			<h2>Lista de tareas</h2>

			{tasks.length === 0 ? (
				<p className="empty-message">No hay tareas registradas.</p>
			) : (
				<ul className="task-list">
					{tasks.map((task, index) => (
						<TaskItem key={index} task={task} />
					))}
				</ul>
			)}
		</div>
	);
}

export default TaskList;
0;

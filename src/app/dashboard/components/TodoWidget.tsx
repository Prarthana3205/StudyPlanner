"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import Confetti to avoid SSR issues
const Confetti = dynamic(() => import("react-confetti"), { 
	ssr: false 
});

interface TodoItem {
	_id: string;
	text: string;
	completed: boolean;
	priority?: "low" | "medium" | "high";
	createdAt: string;
	updatedAt: string;
}

export default function TodoWidget({ onStatsUpdate }: { onStatsUpdate?: () => void }) {
	const [todos, setTodos] = useState<TodoItem[]>([]);
	const [inputText, setInputText] = useState("");
	const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
	const [showConfetti, setShowConfetti] = useState(false);
	const [lastCompletionState, setLastCompletionState] = useState(false);
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
	const [clearing, setClearing] = useState(false);
	const [showClearConfirm, setShowClearConfirm] = useState(false);

	// Set window size on client
	useEffect(() => {
		const updateWindowSize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		
		updateWindowSize();
		window.addEventListener('resize', updateWindowSize);
		
		return () => window.removeEventListener('resize', updateWindowSize);
	}, []);

	// Fetch todos on component mount
	useEffect(() => {
		fetchTodos();
	}, []);

	// Check for completion and trigger confetti
	useEffect(() => {
		const completedCount = todos.filter(todo => todo.completed).length;
		const totalCount = todos.length;
		const isAllCompleted = totalCount > 0 && completedCount === totalCount;
		
		// Only trigger confetti if we just reached 100% completion (state changed from incomplete to complete)
		if (isAllCompleted && !lastCompletionState && totalCount > 0) {
			setShowConfetti(true);
			// Hide confetti after 5 seconds for a more celebratory effect
			setTimeout(() => {
				setShowConfetti(false);
			}, 5000);
		}
		
		setLastCompletionState(isAllCompleted);
	}, [todos, lastCompletionState]);

	const fetchTodos = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/todos", {
				credentials: "include",
			});
			
			if (response.ok) {
				const data = await response.json();
				setTodos(data.todos || []);
				onStatsUpdate?.();
			} else {
				console.error("Failed to fetch todos:", response.status);
			}
		} catch (error) {
			console.error("Error fetching todos:", error);
		} finally {
			setLoading(false);
		}
	};

	const addTodo = async () => {
		if (inputText.trim() === "" || saving) return;
		
		try {
			setSaving(true);
			const response = await fetch("/api/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ 
					text: inputText.trim(), 
					priority: selectedPriority 
				}),
			});

			if (response.ok) {
				const data = await response.json();
				setTodos([data.todo, ...todos]);
				setInputText("");
				onStatsUpdate?.();
			} else {
				console.error("Failed to add todo:", response.status);
			}
		} catch (error) {
			console.error("Error adding todo:", error);
		} finally {
			setSaving(false);
		}
	};

	const toggleTodo = async (id: string) => {
		const todo = todos.find(t => t._id === id);
		if (!todo) return;

		try {
			const response = await fetch("/api/todos", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ 
					todoId: id, 
					completed: !todo.completed 
				}),
			});

			if (response.ok) {
				setTodos(todos.map(t => 
					t._id === id ? { ...t, completed: !t.completed } : t
				));
				onStatsUpdate?.();
			} else {
				console.error("Failed to toggle todo:", response.status);
			}
		} catch (error) {
			console.error("Error toggling todo:", error);
		}
	};

	const deleteTodo = async (id: string) => {
		try {
			const response = await fetch(`/api/todos?id=${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (response.ok) {
				setTodos(todos.filter(t => t._id !== id));
				onStatsUpdate?.();
			} else {
				console.error("Failed to delete todo:", response.status);
			}
		} catch (error) {
			console.error("Error deleting todo:", error);
		}
	};

	const clearAllTodos = async () => {
		if (todos.length === 0) return;
		setShowClearConfirm(true);
	};

	const confirmClearAll = async () => {
		try {
			setClearing(true);
			setShowClearConfirm(false);
			const response = await fetch("/api/todos?clearAll=true", {
				method: "DELETE",
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				setTodos([]);
				onStatsUpdate?.();
				console.log(data.message);
			} else {
				console.error("Failed to clear all todos:", response.status);
			}
		} catch (error) {
			console.error("Error clearing all todos:", error);
		} finally {
			setClearing(false);
		}
	};

	const cancelClearAll = () => {
		setShowClearConfirm(false);
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high": return "text-red-700 dark:text-red-300";
			case "medium": return "text-amber-700 dark:text-amber-300";
			case "low": return "text-emerald-700 dark:text-emerald-300";
			default: return "text-gray-700 dark:text-gray-700";
		}
	};

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "high": return "🔴";
			case "medium": return "🟡";
			case "low": return "🟢";
			default: return "⚪";
		}
	};

	const filteredTodos = todos.filter(todo => {
		if (filter === "pending") return !todo.completed;
		if (filter === "completed") return todo.completed;
		return true;
	});

	const completedCount = todos.filter(todo => todo.completed).length;
	const totalCount = todos.length;

	return (
		<>
			<div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl p-6 border-2 border-purple-300 dark:border-purple-500">
				{/* Confetti Animation - Made much more prominent and celebratory */}
				{showConfetti && windowSize.width > 0 && (
					<Confetti
						width={windowSize.width}
						height={windowSize.height}
						recycle={false}
						numberOfPieces={500}
						gravity={0.15}
						initialVelocityY={25}
						initialVelocityX={15}
						wind={0.02}
						friction={0.99}
						opacity={0.8}
						colors={['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#EDE9FE', '#F3E8FF', '#7C3AED', '#6D28D9', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']}
					/>
				)}
			
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
					📋 To-Do List
				</h2>
				<div className="bg-purple-100 dark:bg-purple-800/50 px-3 py-1 rounded-full">
					<span className="text-sm font-semibold text-purple-800 dark:text-purple-200">
						{completedCount}/{totalCount} completed
						{completedCount === totalCount && totalCount > 0 && (
							<span className="ml-1">🎉</span>
						)}
					</span>
				</div>
			</div>

			{/* Filter Buttons */}
			<div className="flex gap-2 mb-4 flex-wrap">
				<button
					onClick={() => setFilter("all")}
					className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
						filter === "all"
							? "bg-purple-600 text-white shadow-md"
							: "bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-700/70 border border-purple-300 dark:border-purple-600"
					}`}
				>
					All ({totalCount})
				</button>
				<button
					onClick={() => setFilter("pending")}
					className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
						filter === "pending"
							? "bg-amber-600 text-white shadow-md"
							: "bg-amber-100 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700/70 border border-amber-300 dark:border-amber-600"
					}`}
				>
					Pending ({totalCount - completedCount})
				</button>
				<button
					onClick={() => setFilter("completed")}
					className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
						filter === "completed"
							? "bg-emerald-600 text-white shadow-md"
							: "bg-emerald-100 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-700/70 border border-emerald-300 dark:border-emerald-600"
					}`}
				>
					Done ({completedCount})
				</button>
				
				{/* Clear All Button - Always visible but disabled when no tasks */}
				<button
					onClick={clearAllTodos}
					disabled={clearing || totalCount === 0}
					className={`px-3 py-1 rounded-full text-sm font-semibold transition-all border ${
						totalCount === 0 
							? "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-200 border-red-300 dark:border-gray-600 cursor-not-allowed"
							: "bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700/70 border-red-300 dark:border-red-600"
					} ${clearing ? "opacity-50 cursor-not-allowed" : ""}`}
					title={totalCount === 0 ? "No tasks to clear" : `Clear all ${totalCount} tasks`}
				>
					{clearing ? "Clearing..." : `Clear All ${totalCount > 0 ? `(${totalCount})` : ""}`}
				</button>
			</div>

			{/* Add Todo Input */}
			<div className="space-y-3 mb-6">
				<div className="flex gap-2">
					<input
						type="text"
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyPress={(e) => e.key === "Enter" && addTodo()}
						placeholder="Add a new task..."
						disabled={saving || loading}
						className="flex-1 px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-purple-300 disabled:opacity-50"
					/>
					<button
						onClick={addTodo}
						disabled={saving || loading || inputText.trim() === ""}
						className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{saving ? "Adding..." : "Add"}
					</button>
				</div>
				
				{/* Priority Selector */}
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-sm font-medium text-gray-700 dark:text-purple-700">Priority:</span>
					<div className="flex gap-1">
						{(["low", "medium", "high"] as const).map((priority) => (
							<button
								key={priority}
								onClick={() => setSelectedPriority(priority)}
								className={`px-3 py-1 rounded text-sm font-semibold transition-all capitalize ${
									selectedPriority === priority
										? priority === "high"
											? "bg-red-600 text-white shadow-md"
											: priority === "medium"
											? "bg-amber-600 text-white shadow-md"
											: "bg-emerald-600 text-white shadow-md"
										: priority === "high"
										? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800/50 border border-red-300 dark:border-red-600"
										: priority === "medium"
										? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/50 border border-amber-300 dark:border-amber-600"
										: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 border border-emerald-300 dark:border-emerald-600"
								}`}
							>
								{getPriorityIcon(priority)} {priority}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Todo List */}
			<div className="space-y-2 max-h-96 overflow-y-auto">
				{loading ? (
					<div className="text-center py-12 text-gray-500 dark:text-gray-400">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
						<div className="mt-2 font-medium">Loading todos...</div>
					</div>
				) : filteredTodos.length === 0 ? (
					<div className="text-center py-12 text-gray-500 dark:text-gray-400">
						<div className="text-6xl mb-4">📝</div>
						<div className="font-medium text-lg">
							{filter === "all" ? "No tasks yet!" : `No ${filter} tasks.`}
						</div>
						<div className="text-sm mt-2">
							{filter === "all" ? "Add your first task above to get started." : `Switch to "All" to see other tasks.`}
						</div>
					</div>
				) : (
					filteredTodos.map((todo) => (
						<div
							key={todo._id}
							className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
								todo.completed
									? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600/50"
									: todo.priority === "high"
									? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600/50"
									: todo.priority === "medium"
									? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-600/50"
									: "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600/50"
							}`}
						>
							<input
								type="checkbox"
								checked={todo.completed}
								onChange={() => toggleTodo(todo._id)}
								className="w-5 h-5 text-purple-600 focus:ring-purple-500 focus:ring-2 rounded border-2 border-gray-300 dark:border-gray-600"
							/>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span
										className={`font-medium ${
											todo.completed
												? "line-through text-gray-700 dark:text-gray-400"
												: "text-black dark:text-gray-100"
										}`}
									>
										{todo.text}
									</span>
									{todo.priority && (
										<span className={`text-sm font-semibold ${getPriorityColor(todo.priority)}`}>
											{getPriorityIcon(todo.priority)}
										</span>
									)}
								</div>
								<div className="text-sm text-gray-700 dark:text-gray-400 mt-1 font-medium">
									{new Date(todo.createdAt).toLocaleDateString()}
								</div>
							</div>
							<button
								onClick={() => deleteTodo(todo._id)}
								className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
								title="Delete task"
							>
								🗑️
							</button>
						</div>
					))
				)}
			</div>

			{/* Custom Clear All Confirmation Popup */}
			{showClearConfirm && (
				<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-8 border-4 border-red-400 dark:border-red-500 max-w-lg w-full animate-scale-in">
						<div className="text-center">
							<div className="text-8xl mb-6">⚠️</div>
							<h3 className="text-3xl font-bold text-red-300 dark:text-red-200 mb-4">
								Clear All Tasks?
							</h3>
							<p className="text-red-300 dark:text-red-200 mb-3 text-xl font-medium">
								You are about to delete <span className="font-bold text-2xl">{todos.length}</span> task{todos.length !== 1 ? 's' : ''}.
							</p>
							<p className="text-red-800 dark:text-red-300 mb-8 text-lg font-medium">
								⚡ This action cannot be undone.
							</p>
							<div className="flex gap-4 justify-center">
								<button
									onClick={cancelClearAll}
									className="px-8 py-4 bg-gray-300 dark:bg-gray-500 text-gray-800 dark:text-gray-100 rounded-xl hover:bg-gray-400 dark:hover:bg-gray-400 font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
								>
									Cancel
								</button>
								<button
									onClick={confirmClearAll}
									disabled={clearing}
									className="px-8 py-4 bg-red-600 dark:bg-red-700 text-white rounded-xl hover:bg-red-700 dark:hover:bg-red-800 font-bold text-lg shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								>
									{clearing ? "🔄 Clearing..." : "Yes, Clear All"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>

		<style jsx>{`
			@keyframes scale-in {
				from {
					opacity: 0;
					transform: scale(0.9);
				}
				to {
					opacity: 1;
					transform: scale(1);
				}
			}
			.animate-scale-in {
				animation: scale-in 0.2s ease-out;
			}
		`}</style>
		</>
	);
}


import React, { useState } from 'react';
import { TodoItem } from '../../types';
import { IconPlus, IconMoreHorizontal } from '../../constants';

const cardBaseStyle = "bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5";

const initialTodos: TodoItem[] = [
    { id: 't1', text: 'Beställa fönster till Villa Ekhagen', completed: false },
    { id: 't2', text: 'Skicka in KMA-plan för BRF Utsikten', completed: false },
    { id: 't3', text: 'Följa upp offert med Erik Johansson', completed: true },
    { id: 't4', text: 'Fakturera takbytet på sommarstugan', completed: false },
];

const TodoWidget: React.FC = () => {
    const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
    const [newTodo, setNewTodo] = useState('');

    const handleToggle = (id: string) => {
        setTodos(
            todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
        );
    };

    const handleAddTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTodo.trim() === '') return;
        setTodos([
            ...todos,
            { id: `t${Date.now()}`, text: newTodo, completed: false },
        ]);
        setNewTodo('');
    };

    return (
        <div className={cardBaseStyle}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-100 text-lg">Att Göra (Google Tasks)</h3>
                 <button className="text-gray-500 hover:text-white">
                    <IconMoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                {todos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggle(todo.id)}
                            className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-600"
                        />
                        <span className={`text-sm ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                            {todo.text}
                        </span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddTodo} className="flex items-center gap-2 border-t border-gray-700 pt-4">
                <input
                    type="text"
                    value={newTodo}
                    onChange={e => setNewTodo(e.target.value)}
                    placeholder="Lägg till ny uppgift..."
                    className="w-full bg-gray-700/80 border border-gray-600 rounded-md py-2 px-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button type="submit" className="p-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors">
                    <IconPlus className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default TodoWidget;

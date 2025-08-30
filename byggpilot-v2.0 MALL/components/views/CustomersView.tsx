
import React from 'react';
import { Customer, Project, Contact } from '../../types';
import { IconMail, IconProjects, IconCustomers } from '../../constants';

interface CustomersViewProps {
    customers: Customer[];
    projects: Project[];
}

const CustomersView: React.FC<CustomersViewProps> = ({ customers, projects }) => {
    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Kunder & Kontakter</h2>
            
            <div className="space-y-8">
                {customers.map(customer => {
                    const customerProjects = projects.filter(p => p.customer.id === customer.id);
                    const allContacts = customerProjects.flatMap(p => p.contacts);
                    const uniqueContacts = Array.from(new Map(allContacts.map(c => [c.id, c])).values());

                    return (
                        <div key={customer.id} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                            <div className="p-5 bg-gray-900/50">
                                <h3 className="text-xl font-bold text-white">{customer.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                    <span>{customer.contactPerson}</span>
                                    <span>&middot;</span>
                                    <span>{customer.email}</span>
                                    <span>&middot;</span>
                                    <span>{customer.phone}</span>
                                </div>
                            </div>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-200 mb-3 flex items-center gap-2"><IconProjects className="w-5 h-5 text-cyan-400"/>Projekt</h4>
                                    <div className="space-y-2">
                                        {customerProjects.length > 0 ? customerProjects.map(p => (
                                            <div key={p.id} className="p-2 bg-gray-700/50 rounded-md text-sm text-gray-300">{p.name}</div>
                                        )) : <p className="text-sm text-gray-500">Inga aktiva projekt.</p>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-200 mb-3 flex items-center gap-2"><IconCustomers className="w-5 h-5 text-yellow-400"/>Inblandade Kontakter</h4>
                                    <div className="space-y-2">
                                        {uniqueContacts.length > 0 ? uniqueContacts.map(c => (
                                            <div key={c.id} className="p-2 bg-gray-700/50 rounded-md text-sm">
                                                <p className="font-medium text-gray-300">{c.name} <span className="text-xs text-gray-500">({c.role})</span></p>
                                                <p className="text-xs text-gray-400">{c.email}</p>
                                            </div>
                                        )): <p className="text-sm text-gray-500">Inga externa kontakter kopplade.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomersView;

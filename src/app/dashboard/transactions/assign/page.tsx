"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { agentsApi, propertiesApi, transactionsApi, Agent, Property } from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

export default function AssignCommissionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        agentId: "",
        propertyId: "",
        totalCommissionAmount: "",
        plotSize: ""
    });

    const [agents, setAgents] = useState<Agent[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [agentsRes, propertiesRes] = await Promise.all([
                    agentsApi.getAgents(1, 100),
                    propertiesApi.getProperties(1, 100)
                ]);
                setAgents(agentsRes.data);
                setProperties(propertiesRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.agentId || !formData.propertyId || !formData.totalCommissionAmount || !formData.plotSize) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await transactionsApi.createCommission({
                agentId: formData.agentId,
                propertyId: formData.propertyId,
                totalCommissionAmount: Number(formData.totalCommissionAmount),
                plotSize: formData.plotSize
            });
            alert("Commission assigned successfully!");
            router.push("/dashboard/transactions");
        } catch (error) {
            console.error("Error assigning commission:", error);
            alert("Failed to assign commission.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 pb-4 bg-white font-sans min-h-full flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-xl font-bold text-gray-900">
                        Assign Commission New Agent
                    </h1>
                </div>
                <p className="text-gray-500 italic text-sm">
                    Add commision notification to new agent
                </p>
            </div>

            {/* Form Card */}
            <div className="border border-gray-200 rounded-xl p-6 md:p-8 bg-white max-w-5xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                    Assign Commission
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Name of Agent */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            Name of Agent
                        </label>
                        <div className="relative">
                            <select
                              onFocus={scrollSelectIntoView}
                                name="agentId"
                                value={formData.agentId}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm text-gray-500 focus:ring-1 focus:ring-[#1e2667] outline-none appearance-none cursor-pointer"
                            >
                                <option value="" disabled>
                                    Choose Agent
                                </option>
                                {agents.map((agent) => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.fullName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Commission Assigned */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            Total Commission Assigned:
                        </label>
                        <input
                            type="number"
                            name="totalCommissionAmount"
                            value={formData.totalCommissionAmount}
                            onChange={handleChange}
                            placeholder="Enter Commission Amount"
                            className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400"
                        />
                    </div>

                    {/* Property */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            Property
                        </label>
                        <div className="relative">
                            <select
                              onFocus={scrollSelectIntoView}
                                name="propertyId"
                                value={formData.propertyId}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm text-gray-500 focus:ring-1 focus:ring-[#1e2667] outline-none appearance-none cursor-pointer"
                            >
                                <option value="" disabled>
                                    Choose Property
                                </option>
                                {properties.map((property) => (
                                    <option key={property.id} value={property.id}>
                                        {property.title}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Plot Size */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">
                            Plot Size
                        </label>
                        <input
                            type="text"
                            name="plotSize"
                            value={formData.plotSize}
                            onChange={handleChange}
                            placeholder="Enter Size (e.g. 1200 sqft)"
                            className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-8 max-w-5xl">
                <Link href="/dashboard/transactions">
                    <button className="px-10 py-2.5 rounded-lg text-white font-medium bg-[#ce1313] hover:bg-opacity-90 transition-opacity cursor-pointer">
                        Cancel
                    </button>
                </Link>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-10 py-2.5 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                    {loading ? "Assigning..." : "Assign"}
                </button>
            </div>
        </div>
    );
}

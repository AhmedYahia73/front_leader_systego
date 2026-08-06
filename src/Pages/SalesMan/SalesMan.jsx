import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGet } from "@/hooks/useGet";
import { Search, Mail, Phone, Target, User, BarChart, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const SalesMan = () => {
    const navigate = useNavigate();

    // ---- Filter, Search & Pagination States ----
    const [selectedLeaderFilter, setSelectedLeaderFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // ---- Debounce Search Logic ----
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); 
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // ---- Build Query Parameters for Backend ----
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", "10");

    if (selectedLeaderFilter) {
        queryParams.append("leader_id", selectedLeaderFilter);
    }

    if (debouncedSearch.trim()) {
        queryParams.append("search", debouncedSearch.trim());
    }

    const salesApiUrl = `/api/admin/sales?${queryParams.toString()}`;

    // ---- Fetch Data ----
    const { data: response, loading: isLoading } = useGet(salesApiUrl);
    const sales = response?.data?.sales || [];
    const paginationData = response?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    // ---- Get Lists for Leader Filter ----
    const { data: listsResponse } = useGet("/api/admin/sales/lists");
    const leadersList = listsResponse?.leaders || listsResponse?.data?.leaders || [];

    const handleFilterChange = (e) => {
        setSelectedLeaderFilter(e.target.value);
        setPage(1);
    };

    // ---- Dialog States ----
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSalesman, setSelectedSalesman] = useState(null);

    const openSalesmanDetails = (salesman) => {
        setSelectedSalesman(salesman);
        setIsDialogOpen(true);
    };

    return (
        <div className="container mx-auto py-10">
            {/* Header section with add button */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Sales Management</h1>
                <Button onClick={() => navigate("/sales-man/add")}>Add Sales Man</Button>
            </div>

            {/* Controls Section: Filter & Search */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                
                {/* Leader Filter */}
                <div className="flex items-center gap-3">
                    <label htmlFor="leader-filter" className="text-sm font-semibold text-gray-700">
                        Filter by Leader:
                    </label>
                    <select
                        id="leader-filter"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                        value={selectedLeaderFilter}
                        onChange={handleFilterChange}
                    >
                        <option value="">All (Show All)</option>
                        {leadersList.map((leader) => (
                            <option key={leader.id} value={leader.id}>
                                {leader.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search Input (Backend Search) */}
                <div className="flex items-center gap-2 relative min-w-[250px]">
                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search sales by name, email, or phone..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            ) : sales.length === 0 ? (
                <div className="flex justify-center items-center h-40 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-gray-500 font-medium">No sales men found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sales.map((salesman) => (
                        <Card 
                            key={salesman.id} 
                            className="flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden bg-white cursor-pointer hover:border-blue-300"
                            onClick={() => openSalesmanDetails(salesman)}
                        >
                            <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-gray-800">{salesman.name}</CardTitle>
                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span>{salesman.email}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                        salesman.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-700"
                                    }`}>
                                        {salesman.status || "-"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 flex-grow space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{salesman.phone || "No phone"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>Leader: <strong>{salesman.leader_name || "-"}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Target className="w-4 h-4 text-gray-400" />
                                    <span>Target: <strong>{salesman.target_name || "-"}</strong></span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {sales.length > 0 && (
                <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-600">
                        Showing page <span className="font-semibold">{paginationData.page}</span> of{" "}
                        <span className="font-semibold">{paginationData.totalPages || 1}</span> (Total: {paginationData.total})
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((old) => Math.max(old - 1, 1))}
                            disabled={page === 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((old) => Math.min(old + 1, paginationData.totalPages))}
                            disabled={page >= paginationData.totalPages || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialog for Salesman Details */}
            <SalesmanDetailsDialog 
                isOpen={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
                salesman={selectedSalesman} 
            />
        </div>
    );
};

const SalesmanDetailsDialog = ({ isOpen, onClose, salesman }) => {
    const [activeView, setActiveView] = useState('menu'); // 'menu', 'visits', 'sales'

    // Reset view when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setActiveView('menu');
        }
    }, [isOpen]);

    // Fetch totals
    const visitsUrl = salesman ? `/api/admin/visits?sales_id=${salesman.id}&limit=1` : null;
    const salesUrl = salesman ? `/api/admin/visits/sales?sales_id=${salesman.id}&limit=1` : null;

    const { data: visitsResponse } = useGet(visitsUrl);
    const { data: salesResponse } = useGet(salesUrl);

    const totalVisits = visitsResponse?.data?.pagination?.total || 0;
    const totalSales = salesResponse?.data?.pagination?.total || 0;

    if (!isOpen || !salesman) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center gap-3">
                        {activeView !== 'menu' && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 -ml-2 rounded-full hover:bg-gray-100"
                                onClick={() => setActiveView('menu')}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <DialogTitle className="text-xl font-bold text-gray-800">
                            {activeView === 'menu' ? `${salesman.name} - Details` : 
                             activeView === 'visits' ? `${salesman.name} - Visits` : 
                             `${salesman.name} - Sales`}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="mt-4 flex-grow">
                    {activeView === 'menu' && (
                        <div className="space-y-6">
                            {/* Salesman Details Card */}
                            <Card className="bg-gray-50 border-gray-200">
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium text-gray-800">{salesman.email || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium text-gray-800">{salesman.phone || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Leader</p>
                                                <p className="font-medium text-gray-800">{salesman.leader_name || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Target className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Target</p>
                                                <p className="font-medium text-gray-800">{salesman.target_name || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Two Cards for Visits and Sales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card 
                                    className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors border-2"
                                    onClick={() => setActiveView('visits')}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
                                        <div className="p-4 rounded-full bg-blue-100 text-blue-600">
                                            <MapPin className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Visits</h3>
                                        <div className="text-2xl font-bold text-blue-600">{totalVisits}</div>
                                        <p className="text-sm text-gray-500 text-center">View and manage all visits for this sales man.</p>
                                    </CardContent>
                                </Card>

                                <Card 
                                    className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors border-2"
                                    onClick={() => setActiveView('sales')}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
                                        <div className="p-4 rounded-full bg-purple-100 text-purple-600">
                                            <BarChart className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Sales</h3>
                                        <div className="text-2xl font-bold text-purple-600">{totalSales}</div>
                                        <p className="text-sm text-gray-500 text-center">View and manage all sales records for this sales man.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeView === 'visits' && <ListView type="visits" salesman={salesman} />}
                    {activeView === 'sales' && <ListView type="sales" salesman={salesman} />}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Sub-component to fetch and render the paginated list
const ListView = ({ type, salesman }) => {
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);

    const apiUrl = type === 'visits' 
        ? `/api/admin/visits?sales_id=${salesman.id}&page=${page}&limit=10`
        : `/api/admin/visits/sales?sales_id=${salesman.id}&page=${page}&limit=10`;

    const { data: response, loading } = useGet(apiUrl);
    const paginationData = response?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    React.useEffect(() => {
        const newItems = response?.data?.allVisits || [];
        if (page === 1) {
            setItems(newItems);
        } else {
            setItems(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewItems = newItems.filter(n => !existingIds.has(n.id));
                return [...prev, ...uniqueNewItems];
            });
        }
    }, [response, page]);

    const observer = React.useRef();
    const lastItemRef = React.useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && page < paginationData.totalPages) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, page, paginationData.totalPages]);

    if (loading && page === 1 && items.length === 0) {
        return <div className="flex justify-center p-8 text-gray-500 font-medium">Loading...</div>;
    }

    if (items.length === 0 && !loading) {
        return (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                No {type} found for this salesman.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-4">
            <div className="grid grid-cols-1 gap-4 mt-2">
                {items.map((item, index) => {
                    const isLast = items.length === index + 1;
                    return (
                        <div 
                            key={item.id} 
                            ref={isLast ? lastItemRef : null}
                            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 group-hover:w-1.5 transition-all" />
                            <div className="flex justify-between items-start mb-2 pl-2">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
                                    {item.phone && (
                                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                                            <Phone className="w-3.5 h-3.5"/> 
                                            {item.phone}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                        type === 'visits' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                    }`}>
                                        {type === 'visits' ? (item.visit_status || "N/A") : (item.status || "N/A")}
                                    </span>
                                </div>
                            </div>
                            {item.address && (
                                <div className="mt-3 ml-2 bg-gray-50 p-3 rounded-lg text-sm text-gray-600 flex items-start gap-2 border border-gray-100">
                                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                    <span>{item.address}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {loading && page > 1 && (
                <div className="flex justify-center p-4">
                    <span className="text-gray-500 font-medium animate-pulse">Loading more...</span>
                </div>
            )}
        </div>
    );
};

export default SalesMan;
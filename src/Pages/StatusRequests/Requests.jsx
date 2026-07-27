import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const statusColors = {
    "pending": "bg-yellow-100 text-yellow-800",
    "approved": "bg-green-100 text-green-800",
    "rejected": "bg-red-100 text-red-800",
};

const Requests = () => {
    const navigate = useNavigate();

    // ---- Search & Pagination States ----
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // ---- Debounce Search Logic ----
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // إعادة التعيين للصفحة الأولى عند كل بحث جديد
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // ---- Build Query Parameters for Backend ----
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", "10");

    if (debouncedSearch.trim()) {
        queryParams.append("search", debouncedSearch.trim());
    }

    const requestsApiUrl = `/api/admin/status_requests/pending?${queryParams.toString()}`;

    // ---- Fetch Data ----
    const { data: response, loading: isLoading, refresh } = useGet(requestsApiUrl);
    const requests = response?.data?.pendingRequests || [];
    
    // استخراج بيانات الـ Pagination بناءً على الـ Response الخاصة بالـ Endpoint
    const paginationData = response?.data?.pagination || {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: 10,
    };

    // ---- Mutations ----
    const { mutate: updateRequest } = useMutation();

    // ---- Update Status flow ----
    const handleStatusChange = async (request, status) => {
        const payload = { status: status };
        const result = await updateRequest({
            method: "PUT",
            url: `/api/admin/status_requests/status/${request.id}`,
            data: payload,
        });

        if (result.success) {
            toast?.success?.("Status updated successfully");
            refresh?.();
        } else {
            toast?.error?.("Failed to update status");
        }
    };

    const columns = [
        { accessorKey: "user_name", header: "Sales Name" },
        { accessorKey: "user_phone", header: "Sales Phone" },
        { accessorKey: "visit_name", header: "Visit" },
        { accessorKey: "from", header: "From Status" },
        { accessorKey: "to", header: "To Status" },
        {
            accessorKey: "status",
            header: "Action / Status",
            render: (row) => {
                return (
                    <select
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-colors ${
                            statusColors[row.status] || "bg-gray-100 text-gray-800"
                        }`}
                        value={row.status || "pending"}
                        onChange={(e) => {
                            if (e.target.value) handleStatusChange(row, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="pending" disabled>Pending</option>
                        <option value="approve" className="bg-white text-black">
                            Approve
                        </option>
                        <option value="reject" className="bg-white text-black">
                            Reject
                        </option>
                    </select>
                );
            },
        },
    ];

    return (
        <div className="container mx-auto py-10">
            {/* Controls Section: Search Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 relative min-w-[280px]">
                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search requests by sales name, phone, or visit..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <DataTable
                title="Requests Management"
                columns={columns}
                data={requests}
                isLoading={isLoading}
                search_auto={false} // إيقاف الفلترة المحلية
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-sm text-gray-600">
                    Showing page <span className="font-semibold">{paginationData.currentPage}</span> of{" "}
                    <span className="font-semibold">{paginationData.totalPages || 1}</span> (Total: {paginationData.totalItems})
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
        </div>
    );
};

export default Requests;
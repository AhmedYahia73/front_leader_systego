import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useGet } from "@/hooks/useGet";
import { useMutation } from "@/hooks/useMutation";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

const statusColors = {
    "Negotiation": "bg-yellow-100 text-yellow-800",
    "Sales": "bg-gray-100 text-gray-800",
    "Deliverd": "bg-green-100 text-green-800",
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const Visits = () => {
    const navigate = useNavigate();

    // ---- Filter State ----
    const [selectedSalesFilter, setSelectedSalesFilter] = useState("");

    // ---- Get Visits Data (Dynamic based on filter) ----
    // لو في فلتر هنستخدم الـ API المخصص للسيلز، ولو مفيش هنجيب كل الزيارات
    const visitsApiUrl = selectedSalesFilter
        ? `/api/admin/visits?sales_id=${selectedSalesFilter}`
        : "/api/admin/visits";

    const { data: response, loading: isLoading, refresh } = useGet(visitsApiUrl);
    // تأكدي إن الاستجابة للـ API المفلتر بترجع برضه بـ allVisits أو عدليها حسب استجابة الباك إند
    const visits = response?.data?.allVisits || [];

    // ---- Get Status & Sales Lists ----
    const { data: listsResponse } = useGet("/api/admin/visits/lists");
    const statusList = listsResponse?.visit_status || listsResponse?.data?.visit_status || [];
    const salesList = listsResponse?.sales || listsResponse?.data?.sales || [];

    // ---- Mutations ----
    const { mutate: deleteVisit, loading: isDeleting } = useMutation();
    const { mutate: updateVisit } = useMutation();

    // ---- Delete flow ----
    const [visitToDelete, setVisitToDelete] = useState(null);

    const handleDeleteClick = (visit) => {
        setVisitToDelete(visit);
    };

    const handleDeleteConfirm = async () => {
        if (!visitToDelete) return;

        const result = await deleteVisit({
            method: "DELETE",
            url: `/api/admin/visits/${visitToDelete.id}`,
        });

        if (result.success) {
            toast?.success?.("Visit deleted successfully");
            setVisitToDelete(null);
            refresh?.();
        } else {
            toast?.error?.("Failed to delete visit");
        }
    };

    // ---- Update Status flow ----
    const handleStatusChange = async (visit, newStatusId) => {
        const payload = {
            status_id: newStatusId,
            status: "visit"
        };

        const result = await updateVisit({
            method: "PUT",
            url: `/api/admin/visits/${visit.id}`,
            data: payload
        });

        if (result.success) {
            toast?.success?.("Status updated successfully");
            refresh?.();
        } else {
            toast?.error?.("Failed to update status");
        }
    };

    // ---- Update Sales flow ----
    const handleSalesChange = async (visit, newSalesId) => {
        const payload = {
            sales_id: newSalesId,
            status: "visit"
        };

        const result = await updateVisit({
            method: "PUT",
            url: `/api/admin/visits/${visit.id}`,
            data: payload
        });

        if (result.success) {
            toast?.success?.("Sales updated successfully");
            refresh?.();
        } else {
            toast?.error?.("Failed to update sales");
        }
    };

    const columns = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "address", header: "Address" },
        { accessorKey: "phone", header: "Phone" },
        {
            accessorKey: "visit_status",
            header: "Status",
            render: (row) => {
                const currentStatus = statusList.find(s => s.name === row.visit_status);
                const currentStatusId = currentStatus ? currentStatus.id : (row.status_id || "");

                return (
                    <select
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-colors ${statusColors[row.visit_status] || "bg-gray-100 text-gray-800"
                            }`}
                        value={currentStatusId}
                        onChange={(e) => {
                            if (e.target.value) handleStatusChange(row, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="" disabled>Select Status</option>
                        {statusList.map((s) => (
                            <option key={s.id} value={s.id} className="bg-white text-black">
                                {s.name}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            accessorKey: "sales",
            header: "Sales",
            render: (row) => {
                const currentSales = salesList.find(s => s.name === row.sales);
                const currentSalesId = currentSales ? currentSales.id : (row.sales_id || "");

                return (
                    <select
                        className="px-2 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white cursor-pointer focus:ring-2 focus:ring-offset-1 transition-colors text-gray-800"
                        value={currentSalesId}
                        onChange={(e) => {
                            if (e.target.value) handleSalesChange(row, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="" disabled>Select Sales</option>
                        {salesList.map((s) => (
                            <option key={s.id} value={s.id} className="bg-white text-black">
                                {s.name}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            accessorKey: "notes",
            header: "Notes",
            render: (row) => (
                <span className="block max-w-[200px] truncate" title={row.notes}>
                    {row.notes || "-"}
                </span>
            ),
        },
        {
            accessorKey: "map_link",
            header: "Map",
            render: (row) => (
                <a
                    href={row.map_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                >
                    <MapPin className="h-4 w-4" /> View
                </a>
            ),
        },
    ];

    return (
        <div className="container mx-auto py-10">
            {/* Sales Filter Section */}
            <div className="mb-4 flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label htmlFor="sales-filter" className="text-sm font-semibold text-gray-700">
                    Filter by Sales:
                </label>
                <select
                    id="sales-filter"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                    value={selectedSalesFilter}
                    onChange={(e) => setSelectedSalesFilter(e.target.value)}
                >
                    <option value="">All Sales (Show All)</option>
                    {salesList.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>

            <DataTable
                title="Visits Management"
                onAdd={() => navigate("/visits/add")}
                onDelete={handleDeleteClick}
                onEdit={(row) => navigate(`/visits/edit/${row.id}`)}
                columns={columns}
                data={visits}
                isLoading={isLoading}
            />

            <DeleteDialog
                isOpen={!!visitToDelete}
                onClose={() => setVisitToDelete(null)}
                onConfirm={handleDeleteConfirm}
                loading={isDeleting}
            />
        </div>
    );
};

export default Visits;
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

export const DataTable = ({ 
  title, 
  onAdd, 
  showAdd = true, 
  columns, 
  data = [], 
  onEdit, 
  onDelete, 
  searchPlaceholder = "Search...",
  search_auto = true, // إذا كانت true يعمل الفلتر المحلي، إذا false يعتمد كلياً على الـ Backend
  showSearchInput = true // 👈 خيار لإخفاء/إظهار حقل البحث الداخلي
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // تطبيق الفلترة المحلية فقط إذا كان search_auto مفعل ورقم الصفحة ليس حائلاً
  let filteredData = data;
  if (search_auto && searchTerm.trim() !== "") {
    filteredData = data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* العنوان وزر الإضافة */}
      {(title || (showAdd && onAdd)) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          {showAdd && onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add
            </Button>
          )}
        </div>
      )}

      {/* يظهر حقل البحث الداخلي فقط إذا كان مفعلاً ومطلوباً للفلترة المحلية */}
      {showSearchInput && search_auto && (
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
      )}

      {/* الجدول */}
      <div className="rounded-xl border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index}>{col.header}</TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <TableRow key={row.id || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessorKey]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex justify-center items-center gap-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            aria-label="Edit"
                            onClick={() => onEdit(row)}
                            className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            aria-label="Delete"
                            onClick={() => onDelete(row)}
                            className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-6 text-gray-500">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
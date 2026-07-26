import React from "react";
import AddPage from "@/components/AddPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

// دالة تحويل الملف إلى Base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const SalesManAdd = () => {
    return (
        <AddPage
            title="Add Sales"
            apiUrl="/api/admin/sales"
            initialData={{
                name: "",
                email: "",
                phone: "",
                password: "",
                image: "", // هذا الحقل سنستخدمه فقط لرفع الملف
                imageBase64: "", // 💡 حقل جديد لتخزين الصورة كنص
                status: "active",
            }}
            // 💡 رجعنا الدالة عادية جداً (بدون async)
            transformPayload={(data) => {
                // نأخذ البيانات كلها ما عدا حقل الـ File الأصلي
                const { image, imageBase64, ...rest } = data;
                return {
                    ...rest,
                    image: imageBase64, // نرسل الـ Base64 للباك إند
                };
            }}
            onSuccessAction={() => window.history.back()}
        >
            {(methods) => {
                const {
                    register,
                    control,
                    setValue, // 💡 نحتاج هذه الدالة لتحديث قيمة الـ Form برمجياً
                    formState: { errors },
                } = methods;

                return (
                    <div className="mt-2 space-y-6">
                        <div className="space-y-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                                Sales Account Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Name, Email, Phone, Password, Status (نفس الكود السابق بدون تغيير) */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Name *</Label>
                                    <Input
                                        {...register("name", { required: "Name is required" })}
                                        placeholder="e.g. Mohamed Hassan"
                                        className="h-10 text-sm rounded-md"
                                    />
                                    {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Email *</Label>
                                    <Input
                                        type="email"
                                        {...register("email", { required: "Email is required" })}
                                        placeholder="e.g. mohamed@example.com"
                                        className="h-10 text-sm rounded-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Phone *</Label>
                                    <Input
                                        type="tel"
                                        {...register("phone", { required: "Phone number is required" })}
                                        placeholder="e.g. 01098765432"
                                        className="h-10 text-sm rounded-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Password *</Label>
                                    <Input
                                        type="password"
                                        {...register("password", { required: "Password is required" })}
                                        placeholder="Enter secret password"
                                        className="h-10 text-sm rounded-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        defaultValue="active"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value || "active"}>
                                                <SelectTrigger className="h-10 text-sm rounded-md">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                {/* 6. Image Field */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Image</Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="h-10 text-sm rounded-md cursor-pointer"
                                        // 💡 بمجرد أن يختار المستخدم صورة، نحولها ونخزنها
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const base64 = await fileToBase64(file);
                                                setValue("imageBase64", base64); // حفظ النص في الـ Form
                                            } else {
                                                setValue("imageBase64", ""); // مسح النص لو ألغى الاختيار
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        </AddPage>
    );
};

export default SalesManAdd;
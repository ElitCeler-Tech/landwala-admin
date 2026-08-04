"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft,
    Upload,
    Loader2,
    CheckCircle,
    Plus,
    X,
} from "lucide-react";
import clsx from "clsx";
import { propertiesApi } from "@/lib/api";
import { scrollSelectIntoView } from "@/hooks/useScrollIntoViewOnFocus";

const steps = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Pricing & Location" },
    { id: 3, label: "Description & Overview" },
    { id: 4, label: "Images & Documents" },
];

interface OverviewField {
    label: string;
    value: string;
}

interface PropertyFormData {
    // Basic Info
    title: string;
    subtitle: string;
    // Pricing
    minPrice: string;
    maxPrice: string;
    priceUnit: string;
    // Location
    locationAddress: string;
    city: string;
    state: string;
    pincode: string;
    latitude: string;
    longitude: string;
    // Description
    description: string;
    descriptionTitle: string;
    descriptionContent: string;
    landLayoutTitle: string;
}

export default function EditPlotPage() {
    const router = useRouter();
    const params = useParams();
    const propertyId = params.id as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const imagesInputRef = useRef<HTMLInputElement>(null);
    const brochureInputRef = useRef<HTMLInputElement>(null);
    const layoutInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<PropertyFormData>({
        title: "",
        subtitle: "",
        minPrice: "",
        maxPrice: "",
        priceUnit: "Cr",
        locationAddress: "",
        city: "",
        state: "",
        pincode: "",
        latitude: "",
        longitude: "",
        description: "",
        descriptionTitle: "",
        descriptionContent: "",
        landLayoutTitle: "",
    });

    const [overviewFields, setOverviewFields] = useState<OverviewField[]>([
        { label: "Sizes", value: "" },
        { label: "Type", value: "" },
    ]);

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [existingBrochure, setExistingBrochure] = useState<string | null>(null);
    const [existingLayoutImage, setExistingLayoutImage] = useState<string | null>(null);

    const [files, setFiles] = useState<{
        images: File[];
        brochure: File | null;
        landLayoutImage: File | null;
    }>({
        images: [],
        brochure: null,
        landLayoutImage: null,
    });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const data = await propertiesApi.getPropertyById(propertyId);

                // Parse and populate form data
                setFormData({
                    title: data.title || "",
                    subtitle: data.subtitle || "",
                    minPrice: data.minPrice.toString() || "",
                    maxPrice: data.maxPrice.toString() || "",
                    priceUnit: data.priceUnit || "Cr",
                    locationAddress: data.locationAddress || "",
                    city: data.city || "",
                    state: data.state || "",
                    pincode: data.pincode || "",
                    latitude: data.latitude?.toString() || "",
                    longitude: data.longitude?.toString() || "",
                    description: data.description || "",
                    descriptionTitle: data.descriptionTitle || "",
                    descriptionContent: data.descriptionContent || "",
                    landLayoutTitle: data.landLayoutTitle || "",
                });

                // Parse overview fields
                if (data.overviewFields && data.overviewFields.length > 0) {
                    setOverviewFields(data.overviewFields.map(field => ({
                        label: field.label,
                        value: field.value
                    })));
                }

                // Set existing files
                setExistingImages(data.images || []);
                setExistingBrochure(data.brochureUrl || null);
                setExistingLayoutImage(data.landLayoutImageUrl || null);

            } catch (error) {
                console.error("Failed to fetch property:", error);
                setError("Failed to load property details");
            } finally {
                setIsLoading(false);
            }
        };

        if (propertyId) {
            fetchProperty();
        }
    }, [propertyId]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOverviewChange = (
        index: number,
        field: "label" | "value",
        value: string
    ) => {
        setOverviewFields((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const addOverviewField = () => {
        setOverviewFields((prev) => [...prev, { label: "", value: "" }]);
    };

    const removeOverviewField = (index: number) => {
        setOverviewFields((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            setFiles((prev) => ({
                ...prev,
                images: [...prev.images, ...Array.from(selectedFiles)],
            }));
        }
    };

    const removeImage = (index: number) => {
        setFiles((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "brochure" | "landLayoutImage"
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles((prev) => ({ ...prev, [type]: file }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError("");

        try {
            const submitData = new FormData();

            // Add all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value) {
                    submitData.append(key, value);
                }
            });

            // Add overview fields as JSON
            const validOverviewFields = overviewFields.filter(
                (f) => f.label && f.value
            );
            if (validOverviewFields.length > 0) {
                submitData.append(
                    "overviewFields",
                    JSON.stringify(validOverviewFields)
                );
            }

            // Add new images
            // Note: This logic depends on how backend handles images (append vs replace)
            // Assuming append or replace based on API. 
            // If the API replaces all images with sent ones, we might need to handle keeping existing ones if no new ones are sent, 
            // or if the API allows partial updates.
            // Based on curl: it sends images=@file. 
            files.images.forEach((image) => {
                submitData.append("images", image);
            });

            // Add brochure
            if (files.brochure) {
                submitData.append("brochure", files.brochure);
            }

            // Add land layout image
            if (files.landLayoutImage) {
                submitData.append("landLayoutImage", files.landLayoutImage);
            }

            await propertiesApi.updateProperty(propertyId, submitData);
            setSuccess(true);

            // Redirect after success
            setTimeout(() => {
                router.push(`/dashboard/plots/${propertyId}`);
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to update property");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleSubmit();
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 bg-white font-sans min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e2667]" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="p-8 bg-white font-sans min-h-full flex flex-col items-center justify-center">
                <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Property Updated Successfully!
                    </h2>
                    <p className="text-gray-500">Redirecting to details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto pb-12 bg-white font-sans min-h-full flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link
                        href={`/dashboard/plots/${propertyId}`}
                        className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-900" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Edit Plot</h1>
                </div>
                <p className="text-gray-500 italic ml-8">
                    Update the details of the property
                </p>
            </div>

            {/* Stepper */}
            <div className="mb-20">
                <div className="flex items-center justify-center">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center relative">
                            <div className="relative flex flex-col items-center">
                                <div
                                    className={clsx(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 relative transition-colors duration-200",
                                        currentStep >= step.id
                                            ? "border-[#1e2667]"
                                            : "border-gray-200"
                                    )}
                                >
                                    {currentStep >= step.id && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#1e2667]" />
                                    )}
                                </div>
                                <div
                                    className={clsx(
                                        "absolute top-8 left-1/2 -translate-x-1/2 w-32 md:w-40 text-center text-xs font-medium transition-colors duration-200",
                                        currentStep >= step.id ? "text-[#1e2667]" : "text-gray-400"
                                    )}
                                >
                                    {step.label}
                                </div>
                            </div>
                            {index !== steps.length - 1 && (
                                <div
                                    className={clsx(
                                        "h-0.5 w-24 md:w-48 mx-2 transition-colors duration-200",
                                        currentStep > step.id ? "bg-[#1e2667]" : "bg-gray-100"
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="space-y-6">
                {currentStep === 1 && (
                    <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                            Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-900">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Family House 3A, Preston Avenue"
                                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-900">
                                    Subtitle
                                </label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Marketed by FORTUNE BUTTERFLY CITY"
                                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-900">
                                    Short Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief description of the property"
                                    rows={3}
                                    className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <>
                        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                Pricing
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Min Price *
                                    </label>
                                    <input
                                        type="number"
                                        name="minPrice"
                                        value={formData.minPrice}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 3.19"
                                        step="0.01"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Max Price *
                                    </label>
                                    <input
                                        type="number"
                                        name="maxPrice"
                                        value={formData.maxPrice}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 3.82"
                                        step="0.01"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Price Unit
                                    </label>
                                    <select
                                      onFocus={scrollSelectIntoView}
                                        name="priceUnit"
                                        value={formData.priceUnit}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none text-gray-900"
                                    >
                                        <option value="Cr">Crore (Cr)</option>
                                        <option value="L">Lakh (L)</option>
                                        <option value="K">Thousand (K)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                Location
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="locationAddress"
                                        value={formData.locationAddress}
                                        onChange={handleInputChange}
                                        placeholder="Full address"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="City"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="State"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="Pincode"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Latitude
                                    </label>
                                    <input
                                        type="text"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 17.3850"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Longitude
                                    </label>
                                    <input
                                        type="text"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 78.4867"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {currentStep === 3 && (
                    <>
                        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                Detailed Description
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Description Title
                                    </label>
                                    <input
                                        type="text"
                                        name="descriptionTitle"
                                        value={formData.descriptionTitle}
                                        onChange={handleInputChange}
                                        placeholder="e.g., More about FORTUNE BUTTERFLY CITY"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Description Content
                                    </label>
                                    <textarea
                                        name="descriptionContent"
                                        value={formData.descriptionContent}
                                        onChange={handleInputChange}
                                        placeholder="Detailed description of the property..."
                                        rows={5}
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900 resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Land Layout Title
                                    </label>
                                    <input
                                        type="text"
                                        name="landLayoutTitle"
                                        value={formData.landLayoutTitle}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Land Layout and Pricing"
                                        className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Overview Fields
                                </h2>
                                <button
                                    onClick={addOverviewField}
                                    className="flex items-center gap-2 text-sm text-[#1e2667] hover:underline cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add Field
                                </button>
                            </div>
                            <div className="space-y-4">
                                {overviewFields.map((field, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-sm font-medium text-gray-900">
                                                Label
                                            </label>
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) =>
                                                    handleOverviewChange(index, "label", e.target.value)
                                                }
                                                placeholder="e.g., Sizes"
                                                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <label className="text-sm font-medium text-gray-900">
                                                Value
                                            </label>
                                            <input
                                                type="text"
                                                value={field.value}
                                                onChange={(e) =>
                                                    handleOverviewChange(index, "value", e.target.value)
                                                }
                                                placeholder="e.g., 165 - 500 sq.yd."
                                                className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#1e2667] outline-none placeholder:text-gray-400 text-gray-900"
                                            />
                                        </div>
                                        {overviewFields.length > 1 && (
                                            <button
                                                onClick={() => removeOverviewField(index)}
                                                className="mt-8 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {currentStep === 4 && (
                    <>
                        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                Property Images
                            </h2>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Current Images</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {existingImages.map((img, idx) => (
                                            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                                                <img src={img} alt="Existing" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={imagesInputRef}
                                onChange={handleImagesChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                            <div
                                onClick={() => imagesInputRef.current?.click()}
                                className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-4 py-8 text-sm cursor-pointer hover:border-[#1e2667] transition-colors flex flex-col items-center justify-center gap-2 mb-4"
                            >
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="text-gray-500">Click to upload new images</span>
                                <span className="text-gray-400 text-xs">
                                    You can select multiple images
                                </span>
                            </div>
                            {files.images.length > 0 && (
                                <div className="flex flex-wrap gap-4">
                                    {files.images.map((file, index) => (
                                        <div
                                            key={index}
                                            className="relative w-24 h-24 rounded-lg overflow-hidden group"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                Documents
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Brochure
                                    </label>
                                    {existingBrochure && (
                                        <div className="text-xs text-gray-500 mb-2">
                                            Current: <a href={existingBrochure} target="_blank" className="text-[#1e2667] hover:underline">View Brochure</a>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={brochureInputRef}
                                        onChange={(e) => handleFileChange(e, "brochure")}
                                        accept="image/*,.pdf"
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => brochureInputRef.current?.click()}
                                        className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-sm cursor-pointer hover:border-[#1e2667] transition-colors flex flex-col items-center justify-center gap-2"
                                    >
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        {files.brochure ? (
                                            <span className="text-gray-900 font-medium">
                                                {files.brochure.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Upload New Brochure</span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">
                                        Land Layout Image
                                    </label>
                                    {existingLayoutImage && (
                                        <div className="text-xs text-gray-500 mb-2">
                                            Current: <a href={existingLayoutImage} target="_blank" className="text-[#1e2667] hover:underline">View Layout</a>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={layoutInputRef}
                                        onChange={(e) => handleFileChange(e, "landLayoutImage")}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => layoutInputRef.current?.click()}
                                        className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-sm cursor-pointer hover:border-[#1e2667] transition-colors flex flex-col items-center justify-center gap-2"
                                    >
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        {files.landLayoutImage ? (
                                            <span className="text-gray-900 font-medium">
                                                {files.landLayoutImage.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Upload New Land Layout</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {error && (
                    <div className="p-4 rounded-lg bg-red-50 text-red-500 text-sm font-medium">
                        {error}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-4 mt-8">
                {currentStep > 1 && (
                    <button
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="px-8 py-2 rounded-lg text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Previous
                    </button>
                )}
                <Link href={`/dashboard/plots/${propertyId}`}>
                    <button className="px-8 py-2 rounded-lg text-white font-medium bg-[#ce1313] hover:bg-opacity-90 transition-opacity cursor-pointer">
                        Cancel
                    </button>
                </Link>
                <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-8 py-2 rounded-lg text-white font-medium bg-[#1e2667] hover:bg-opacity-90 transition-opacity cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {currentStep === 4
                        ? isSubmitting
                            ? "Updating..."
                            : "Update"
                        : "Next"}
                </button>
            </div>
        </div>
    );
}

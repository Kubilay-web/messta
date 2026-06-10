"use client";
import { Button } from "../../../components/ui/button";
import * as XLSX from "xlsx";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  Check,
  CloudUpload,
  X,
  PlusCircle
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { RiFileExcel2Line } from "react-icons/ri";
import { AiFillFileExcel } from "react-icons/ai";
import Select from "react-tailwindcss-select";
import {
  Options,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";

import toast from "react-hot-toast";
import exportDataToExcel from "../../../lib/exportDataToExcel";
import { createBulkCategories } from "../../../actions/categories";
import { generateSlug } from "../../../lib/generateSlug";
import { formatBytes } from "../../../lib/formatBytes";

type TableHeaderProps = {
  title: string;
  href: string;
  linkTitle: string;
  data: any;
  model: string;
  showImport?: boolean;
  agencyId?: string;
};

export default function TableHeader({
  title,
  href,
  linkTitle,
  data,
  model,
  showImport = true,
  agencyId,
}: TableHeaderProps) {
  const [status, setStatus] = useState<SelectValue>(null);
  const [date, setDate] = useState<SelectValue>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  let excelDownload = "#";
  if (model === "category") excelDownload = "/Categories.xlsx";
  else if (model === "brand") excelDownload = "/Brands.xlsx";
  else if (model === "warehouse") excelDownload = "/Warehouses.xlsx";
  else if (model === "supplier") excelDownload = "/Suppliers.xlsx";
  else if (model === "unit") excelDownload = "/Units.xlsx";
  else if (model === "product") excelDownload = "/Products.xlsx";

  const options: Options = [
    { value: "true", label: "Active" },
    { value: "false", label: "Disabled" },
  ];
  const dateOptions: Options = [
    { value: "lastMonth", label: "Last Month" },
    { value: "thisMonth", label: "This Month" },
  ];

  const handleStatusChange = (item: SelectValue) => setStatus(item);
  const handleDateChange = (item: SelectValue) => setDate(item);

  function previewData() {
    setPreview(true);
    if (!excelFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const workSheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(workSheet);
        setJsonData(JSON.stringify(json, null, 2));
      }
    };
    reader.readAsBinaryString(excelFile);
  }

  async function saveData() {
    setPreview(false);
    if (!excelFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const workSheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(workSheet);
        setJsonData(JSON.stringify(json, null, 2));

        try {
          setLoading(true);
          if (model === "category") {
            const categories = json.map((item: any) => ({
              title: item.Title,
              slug: generateSlug(item.Title),
              description: item.Description ?? "",
              imageUrl: item.Image ?? "",
              // ERP: kategoriyi mülk tipine bağla (APARTMENT, VILLA, LAND ...)
              propertyType: item.PropertyType
                ? String(item.PropertyType).toUpperCase()
                : undefined,
              // ERP: ilan tipi (SALE, RENT, SHORT_RENT) — opsiyonel
              listingType: item.ListingType
                ? String(item.ListingType).toUpperCase()
                : undefined,
              // ERP: acente bazlı kapsamla
              agencyId,
            }));
            await createBulkCategories(categories);
          }
          setLoading(false);
          setUploadSuccess(true);
        } catch (error) {
          setUploadSuccess(false);
          setLoading(false);
          toast.error("Something went wrong, Please Try again 😢");
          console.log(error);
        }
      }
    };
    reader.readAsBinaryString(excelFile);
  }

  function handleExportData() {
    const today = new Date();
    const filename = `Exported ${title} ${today.toDateString()}`;
    exportDataToExcel(data, filename);
  }

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center border-b border-gray-200 p-4 bg-white text-black">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 mr-2">
          {title} ({data.length})
        </h2>
        <div className="ml-auto flex items-center gap-4">
          <Button
            onClick={handleExportData}
            size="sm"
            variant="outline"
            className="h-8 gap-1 bg-white text-black border-gray-300"
          >
            <AiFillFileExcel className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>

          {showImport && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setUploadSuccess(false)}
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 bg-white text-black border-gray-300"
                >
                  <RiFileExcel2Line className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Import
                  </span>
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px] bg-white text-black">
                <DialogHeader>
                  <DialogTitle className="text-black">Excel Upload</DialogTitle>
                  <DialogDescription className="text-gray-600 text-xs">
                    You can bring all your Data from Excel. Please download the
                    sample file first to make sure you have correct column names.
                  </DialogDescription>
                </DialogHeader>

                {loading ? (
                  <div className="h-60 w-full rounded-md border flex items-center justify-center">
                    <Button disabled className="items-center">
                      <span className="mr-2 h-4 w-4 animate-spin inline-block bg-black rounded-full"></span>
                      Syncing Data Please wait ...
                    </Button>
                  </div>
                ) : preview && jsonData ? (
                  <ScrollArea className="h-72 w-full rounded-md border p-4">
                    <pre>{jsonData}</pre>
                  </ScrollArea>
                ) : (
                  <div className="grid gap-4 py-4">
                    {/* <Button asChild variant="outline" className="bg-white text-black border-gray-300">
                      <Link href={excelDownload} download>
                        Download {model} Sample Data
                      </Link>
                    </Button> */}

                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex lg:flex-col flex-row items-center justify-center w-full h-16 lg:h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-row lg:flex-col items-center justify-center pt-5 pb-6 gap-4 lg:gap-0">
                          <CloudUpload className="w-8 h-8 mb-4 text-gray-600" />
                          <p className="lg:mb-2 text-sm text-gray-700">
                            <span className="font-semibold">Click to upload</span>
                            <span className="hidden lg:inline"> or drag and drop</span>
                          </p>
                          <p className="text-xs text-gray-500">Only Excel Files (.xlsx)</p>
                        </div>
                        <input
                          id="dropzone-file"
                          accept=".xls,.xlsx"
                          type="file"
                          className="hidden"
                          onChange={(e) => setExcelFile(e.target.files ? e.target.files[0] : null)}
                        />
                      </label>
                    </div>

                    {excelFile && (
                      <div className="flex items-center shadow-lg rounded-md lg:py-3 py-2 px-6 bg-gray-100 justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 lg:w-14 lg:h-14 p-2 lg:p-4 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            <RiFileExcel2Line className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{excelFile.name}</p>
                            <span className="text-xs">{formatBytes(excelFile.size)}</span>
                          </div>
                        </div>
                        <button onClick={() => setExcelFile(null)}>
                          <X className="text-gray-600 w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter className="justify-between">
                  {preview ? (
                    <Button onClick={() => setPreview(false)} variant="outline" type="button">
                      Stop Preview
                    </Button>
                  ) : (
                    <Button onClick={previewData} variant="outline" type="button">
                      Preview
                    </Button>
                  )}
                  <Button onClick={saveData} type="button">
                    Save Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button size="sm" asChild className="h-8 gap-1 bg-white text-black border-gray-300">
            <Link href={href}>
              <span className="flex items-center gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">{linkTitle}</span>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

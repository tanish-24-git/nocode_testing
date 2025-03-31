/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useML } from "@/context/MLContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { preprocessData, getDownloadPreprocessedUrl } from "@/services/api";
import { motion } from "motion/react";
import { FileDown, X, Tag, Layers } from "lucide-react";

export function PreProcessStep() {
  const {
    files,
    summaries,
    missingStrategy,
    setMissingStrategy,
    scaling,
    setScaling,
    encoding,
    setEncoding,
    setPreprocessedFiles,
    setActiveStep,
    setError,
    isLoading,
    setIsLoading,
    setProgress,
    encodingColumns,
    setEncodingColumns,
    scalingColumns,
    setScalingColumns,
  } = useML();

  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  useEffect(() => {
    if (Object.keys(summaries).length > 0) {
      const cols = Object.values(summaries)
        .flatMap((s: any) => s.summary.columns)
        .filter((v: any, i: any, a: any) => a.indexOf(v) === i);
      setAvailableColumns(cols);
    }
  }, [summaries]);

  const isCategoricalColumn = (column: string) => {
    return Object.values(summaries).some((s: any) =>
      s.summary.data_types[column]?.includes("object") ||
      s.summary.data_types[column]?.includes("category")
    );
  };

  const toggleScalingColumn = (column: string) => {
    setScalingColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const toggleEncodingColumn = (column: string) => {
    setEncodingColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handlePreprocess = async () => {
    setIsLoading(true);
    setProgress(10);
    try {
      const scalingColumnsStr = scalingColumns.join(",");
      const encodingColumnsStr = encodingColumns.join(",");
      const data = await preprocessData(
        files,
        missingStrategy,
        scaling,
        scalingColumnsStr,
        encoding,
        encodingColumnsStr,
        "", // targetColumn not needed here unless required
        setProgress
      );
      setPreprocessedFiles(
        Object.fromEntries(
          Object.entries(data).map(([k, v]: [string, any]) => [k, v.preprocessed_file])
        )
      );
      setActiveStep("train");
    } catch (error: any) {
      console.error("Error preprocessing data:", error.message);
      setError(`Preprocessing failed: ${error.message}. Ensure backend is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPreprocessed = (filename: string) => {
    window.location.href = getDownloadPreprocessedUrl(filename);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-white/10 bg-secondary-50 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-secondary-100 to-secondary-50 border-b border-white/10">
          <CardTitle className="text-2xl text-white">Preprocess Data</CardTitle>
          <CardDescription className="text-white/70">
            Prepare your data by handling missing values, scaling, and encoding
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-secondary-100 p-5 rounded-lg border border-white/10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-white">Missing Values</h3>
              </div>
              <select
                value={missingStrategy}
                onChange={(e) => setMissingStrategy(e.target.value)}
                className="w-full p-3 rounded-md border border-white/10 bg-secondary-200 text-white focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                disabled={isLoading}
              >
                <option value="mean">Mean</option>
                <option value="median">Median</option>
                <option value="mode">Mode</option>
                <option value="drop">Drop</option>
              </select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-secondary-100 p-5 rounded-lg border border-white/10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-white">Scaling</h3>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="scaling"
                  checked={scaling}
                  onCheckedChange={(checked) => setScaling(checked as boolean)}
                  disabled={isLoading}
                />
                <label htmlFor="scaling" className="text-sm text-white">
                  Enable Scaling
                </label>
              </div>
            </motion.div>
          </div>

          {scaling && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-secondary-100 p-5 rounded-lg border border-white/10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-medium text-white">Scaling Columns</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScalingColumns([])}
                  className="ml-auto text-xs border-primary text-primary"
                  disabled={isLoading}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2">
                {availableColumns.map((column) => (
                  <div
                    key={`scale-${column}`}
                    className={`flex items-center p-2 rounded ${
                      !isCategoricalColumn(column)
                        ? "bg-secondary-200"
                        : "bg-secondary-200/50 text-white/50"
                    }`}
                  >
                    <Checkbox
                      id={`scale-${column}`}
                      checked={scalingColumns.includes(column)}
                      onCheckedChange={() => toggleScalingColumn(column)}
                      disabled={isCategoricalColumn(column) || isLoading}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`scale-${column}`}
                      className="text-sm cursor-pointer truncate"
                    >
                      {column}
                    </label>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/50">
                Numeric columns are recommended for scaling. Selected:{" "}
                {scalingColumns.length} columns
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-secondary-100 p-5 rounded-lg border border-white/10 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-white">Encoding</h3>
            </div>
            <div className="space-y-4">
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="w-full p-3 rounded-md border border-white/10 bg-secondary-200 text-white focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                disabled={isLoading}
              >
                <option value="onehot">One-Hot Encoding</option>
                <option value="label">Label Encoding</option>
                <option value="target">Target Encoding</option>
                <option value="kfold">K-Fold Target Encoding</option>
              </select>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h4 className="font-medium text-white">Encoding Columns</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEncodingColumns([])}
                    className="ml-auto text-xs border-primary text-primary"
                    disabled={isLoading}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2">
                  {availableColumns.map((column) => (
                    <div
                      key={`encode-${column}`}
                      className={`flex items-center p-2 rounded ${
                        isCategoricalColumn(column)
                          ? "bg-secondary-200"
                          : "bg-secondary-200/50 text-white/50"
                      }`}
                    >
                      <Checkbox
                        id={`encode-${column}`}
                        checked={encodingColumns.includes(column)}
                        onCheckedChange={() => toggleEncodingColumn(column)}
                        disabled={!isCategoricalColumn(column) || isLoading}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`encode-${column}`}
                        className="text-sm cursor-pointer truncate"
                      >
                        {column}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/50">
                  Categorical columns are recommended for encoding. Selected:{" "}
                  {encodingColumns.length} columns
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
        <CardFooter className="px-6 py-4 bg-secondary-200 border-t border-white/10 flex flex-col gap-4">
          <Button
            onClick={handlePreprocess}
            className="w-full bg-primary hover:bg-secondary/90 hover:text-white text-black font-semibold h-12 text-base border-2"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Preprocess Data"}
          </Button>

          {files.map((file: File) => (
            <Button
              key={file.name}
              variant="outline"
              onClick={() => handleDownloadPreprocessed(file.name)}
              className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary-foreground font-medium"
              disabled={isLoading}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download Preprocessed {file.name}
            </Button>
          ))}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
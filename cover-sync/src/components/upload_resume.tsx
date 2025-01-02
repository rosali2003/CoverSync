"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as pdfjsLib from "pdfjs-dist";
import { truncateWords } from "../utils/truncate";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ResumeUploaderProps {
  onResumeProcessed: (text: string) => void;
}

export const ResumeUploader = ({ onResumeProcessed }: ResumeUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [resumeText, setResumeText] = useState<string>("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setStatus("");
      await handlePdfParse(selectedFile);
    } else {
      setFile(null);
      setStatus("Please select a PDF file");
    }
  };

  const handlePdfParse = async (pdfFile: File) => {
    setIsProcessing(true);
    setStatus("Processing PDF...");

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      // Truncate the text
      const truncatedText = truncateWords(fullText, 4000);
      console.log("Extracted and truncated text:", truncatedText);

      setResumeText(truncatedText);
      onResumeProcessed(truncatedText);
      setStatus("Resume processed successfully!");
    } catch (error) {
      setStatus("Failed to process PDF. Please try again.");
      console.error("PDF parsing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
        <CardDescription>Upload your resume in PDF format</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
          {status && (
            <p
              className={`text-sm ${
                status.includes("success")
                  ? "text-green-600"
                  : status.includes("Failed")
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {status}
            </p>
          )}
          {resumeText && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Extracted Text:</h3>
              <div className="max-h-60 overflow-y-auto bg-gray-50 p-4 rounded text-sm">
                {resumeText}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
